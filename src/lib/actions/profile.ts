"use server";

import { revalidatePath } from "next/cache";
import { requirePsychologist, requireUser } from "@/lib/auth";
import { actionFailure, actionSuccess, humanizeError, logServerError, type ActionResult } from "@/lib/errors";
import {
  collectFieldErrors,
  notificationPreferencesSchema,
  profileSchema,
} from "@/lib/validation";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateProfileAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/profil");
  const parsed = profileSchema.safeParse({
    fullName: formString(formData, "fullName"),
    phone: formString(formData, "phone"),
    marketingConsent: formData.get("marketingConsent") === "on",
  });

  if (!parsed.success) {
    return actionFailure("Verifică datele introduse.", collectFieldErrors(parsed.error));
  }

  const { error } = await session.supabase.rpc("update_my_profile", {
    p_full_name: parsed.data.fullName,
    p_phone: parsed.data.phone ?? null,
    p_marketing_consent: parsed.data.marketingConsent,
  });

  if (error) {
    logServerError("profile.update", error);
    return actionFailure(humanizeError(error));
  }

  revalidatePath("/dashboard/profil");
  revalidatePath("/cabinet/profil");
  revalidatePath("/", "layout");
  return actionSuccess();
}

export async function requestPsychologistAccountAction(
  _previous: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/profil");

  if (session.profile.role !== "client") {
    return actionFailure("Cererea este disponibilă doar conturilor de client.");
  }

  const { error } = await session.supabase.rpc("request_psychologist_account");
  if (error) {
    logServerError("profile.request-psychologist", error);
    return actionFailure(humanizeError(error));
  }

  revalidatePath("/dashboard/profil");
  return actionSuccess();
}

export async function updateNotificationPreferencesAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/notificari");
  const parsed = notificationPreferencesSchema.safeParse({
    inApp: formData.get("inApp") === "on",
    emailMessages: formData.get("emailMessages") === "on",
  });

  if (!parsed.success) {
    return actionFailure("Verifică preferințele selectate.", collectFieldErrors(parsed.error));
  }

  const { error } = await session.supabase.rpc("update_notification_preferences", {
    p_in_app: parsed.data.inApp,
    p_email_messages: parsed.data.emailMessages,
    p_email_appointments: false,
  });

  if (error) {
    logServerError("notifications.preferences", error);
    return actionFailure(humanizeError(error));
  }

  revalidatePath("/dashboard/notificari");
  return actionSuccess();
}

export async function updatePsychologistPhotoAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requirePsychologist();
  const photoPath = formString(formData, "photoPath");

  if (photoPath && !photoPath.startsWith(`${session.user.id}/`)) {
    return actionFailure("Calea fotografiei nu este validă.");
  }
  if (photoPath.length > 300) {
    return actionFailure("Calea fotografiei este prea lungă.");
  }

  const { error } = await session.supabase
    .from("psychologist_profiles")
    .update({ photo_path: photoPath || null })
    .eq("user_id", session.user.id);

  if (error) {
    logServerError("profile.photo", error);
    return actionFailure(humanizeError(error));
  }

  revalidatePath("/cabinet/profil");
  return actionSuccess();
}
