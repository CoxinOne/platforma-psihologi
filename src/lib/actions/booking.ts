"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { actionFailure, actionSuccess, humanizeError, logServerError, type ActionResult } from "@/lib/errors";
import { appointmentRequestSchema, collectFieldErrors } from "@/lib/validation";
import { notifyUserByEmail } from "@/lib/email";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function requestAppointmentAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/programari");

  if (session.profile.role !== "client") {
    return actionFailure("Doar conturile de client pot face programări.");
  }

  const parsed = appointmentRequestSchema.safeParse({
    psychologistId: formString(formData, "psychologistId"),
    startsAt: formString(formData, "startsAt"),
    mode: formString(formData, "mode"),
    cabinetId: formString(formData, "cabinetId") || undefined,
    note: formString(formData, "note") || undefined,
  });

  if (!parsed.success) {
    return actionFailure("Verifică intervalul selectat.", collectFieldErrors(parsed.error));
  }

  const { data, error } = await session.supabase.rpc("book_appointment", {
    p_psychologist: parsed.data.psychologistId,
    p_start: parsed.data.startsAt,
    p_mode: parsed.data.mode,
    p_cabinet: parsed.data.cabinetId ?? null,
    p_note: parsed.data.note ?? null,
  });

  if (error) {
    logServerError("booking.request", error);
    return actionFailure(humanizeError(error));
  }

  const appointmentId = data as string;

  await notifyUserByEmail({
    userId: parsed.data.psychologistId,
    category: "appointment",
    subject: "Solicitare nouă de programare",
    intro: "Ai o solicitare nouă de programare în contul tău.",
  });

  revalidatePath("/dashboard/programari");
  revalidatePath("/cabinet/programari");
  redirect(`/dashboard/programari/${appointmentId}?status=solicitata`);
}

export async function cancelAppointmentAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/programari");
  const appointmentId = formString(formData, "appointmentId");
  const reason = formString(formData, "reason");
  const redirectTo = formString(formData, "redirectTo") || "/dashboard/programari";

  if (!appointmentId) {
    return actionFailure("Programarea nu a fost identificată.");
  }

  const { data: appointment } = await session.supabase
    .from("appointments")
    .select("id, client_id, psychologist_id")
    .eq("id", appointmentId)
    .maybeSingle();

  const { error } = await session.supabase.rpc("cancel_appointment", {
    p_appointment: appointmentId,
    p_reason: reason || null,
  });

  if (error) {
    logServerError("booking.cancel", error);
    return actionFailure(humanizeError(error));
  }

  if (appointment) {
    const counterpart =
      appointment.client_id === session.user.id
        ? appointment.psychologist_id
        : appointment.client_id;
    await notifyUserByEmail({
      userId: counterpart,
      category: "appointment",
      subject: "Programare anulată",
      intro: "O programare a fost anulată. Verifică detaliile în cont.",
    });
  }

  revalidatePath("/dashboard/programari");
  revalidatePath(`/dashboard/programari/${appointmentId}`);
  revalidatePath("/cabinet/programari");
  redirect(`${redirectTo}?status=anulata`);
}

export async function rescheduleAppointmentAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/programari");
  const appointmentId = formString(formData, "appointmentId");
  const startsAt = formString(formData, "startsAt");

  if (!appointmentId || !startsAt || Number.isNaN(Date.parse(startsAt))) {
    return actionFailure("Selectează un interval valid.");
  }

  const { data: appointment } = await session.supabase
    .from("appointments")
    .select("psychologist_id")
    .eq("id", appointmentId)
    .maybeSingle();

  const { error } = await session.supabase.rpc("reschedule_appointment", {
    p_appointment: appointmentId,
    p_new_start: startsAt,
  });

  if (error) {
    logServerError("booking.reschedule", error);
    return actionFailure(humanizeError(error));
  }

  if (appointment) {
    await notifyUserByEmail({
      userId: appointment.psychologist_id as string,
      category: "appointment",
      subject: "Programare reprogramată",
      intro: "Un client a propus un interval nou pentru o programare.",
    });
  }

  revalidatePath("/dashboard/programari");
  revalidatePath(`/dashboard/programari/${appointmentId}`);
  revalidatePath("/cabinet/programari");
  redirect(`/dashboard/programari/${appointmentId}?status=reprogramata`);
}

async function psychologistAppointmentAction(
  formData: FormData,
  rpc: "confirm_appointment" | "reject_appointment" | "complete_appointment",
  options: { reasonField?: boolean; successStatus: string } = { successStatus: "actualizata" },
): Promise<ActionResult> {
  const session = await requireUser("/cabinet/programari");
  if (session.profile.role !== "psychologist") {
    return actionFailure("Această acțiune este disponibilă doar psihologilor.");
  }

  const appointmentId = formString(formData, "appointmentId");
  if (!appointmentId) return actionFailure("Programarea nu a fost identificată.");

  const reason = options.reasonField ? formString(formData, "reason") : "";

  const { error } = await session.supabase.rpc(rpc, {
    p_appointment: appointmentId,
    ...(rpc === "reject_appointment" ? { p_reason: reason || null } : {}),
  });

  if (error) {
    logServerError(`booking.${rpc}`, error);
    return actionFailure(humanizeError(error));
  }

  const { data: appointment } = await session.supabase
    .from("appointments")
    .select("client_id")
    .eq("id", appointmentId)
    .maybeSingle();

  if (appointment) {
    await notifyUserByEmail({
      userId: appointment.client_id as string,
      category: "appointment",
      subject: rpc === "confirm_appointment" ? "Programare confirmată" : "Programare actualizată",
      intro: "Statusul programării tale a fost actualizat.",
    });
  }

  revalidatePath("/cabinet/programari");
  revalidatePath("/cabinet");
  revalidatePath("/dashboard/programari");
  redirect(`/cabinet/programari?status=${options.successStatus}`);
}

export async function confirmAppointmentAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return psychologistAppointmentAction(formData, "confirm_appointment", {
    successStatus: "confirmata",
  });
}

export async function rejectAppointmentAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return psychologistAppointmentAction(formData, "reject_appointment", {
    reasonField: true,
    successStatus: "respinsa",
  });
}

export async function completeAppointmentAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return psychologistAppointmentAction(formData, "complete_appointment", {
    successStatus: "finalizata",
  });
}

export async function saveAppointmentNoteAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/cabinet/programari");
  const appointmentId = formString(formData, "appointmentId");
  const note = formString(formData, "note");

  if (!appointmentId) return actionFailure("Programarea nu a fost identificată.");

  const { error } = await session.supabase.rpc("set_appointment_note", {
    p_appointment: appointmentId,
    p_note: note,
  });

  if (error) {
    logServerError("booking.note", error);
    return actionFailure(humanizeError(error));
  }

  revalidatePath("/cabinet/programari");
  return actionSuccess();
}
