"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient, requireUser } from "@/lib/auth";
import { actionFailure, actionSuccess, humanizeError, logServerError, type ActionResult } from "@/lib/errors";
import {
  collectFieldErrors,
  messageSchema,
  reportAbuseSchema,
  startConversationSchema,
} from "@/lib/validation";
import { notifyUserByEmail } from "@/lib/email";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function startConversationAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireClient();
  const parsed = startConversationSchema.safeParse({
    psychologistId: formString(formData, "psychologistId"),
    body: formString(formData, "body") || undefined,
  });

  if (!parsed.success) {
    return actionFailure("Verifică mesajul introdus.", collectFieldErrors(parsed.error));
  }

  const { data, error } = await session.supabase.rpc("start_conversation", {
    p_psychologist: parsed.data.psychologistId,
    p_message: parsed.data.body ?? null,
  });

  if (error) {
    logServerError("messaging.start", error);
    return actionFailure(humanizeError(error));
  }

  const conversationId = data as string;

  if (parsed.data.body) {
    await notifyUserByEmail({
      userId: parsed.data.psychologistId,
      category: "message",
      subject: "Mesaj nou în platformă",
      intro: "Ai primit un mesaj privat nou. Conținutul nu este inclus în e-mail.",
    });
  }

  revalidatePath("/dashboard/mesaje");
  revalidatePath("/cabinet/mesaje");
  redirect(`/dashboard/mesaje/${conversationId}`);
}

export async function sendMessageAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/mesaje");
  const parsed = messageSchema.safeParse({
    conversationId: formString(formData, "conversationId"),
    body: formString(formData, "body"),
  });

  if (!parsed.success) {
    return actionFailure("Mesajul nu poate fi trimis.", collectFieldErrors(parsed.error));
  }

  const { data: conversation } = await session.supabase
    .from("conversations")
    .select("id, client_id, psychologist_id")
    .eq("id", parsed.data.conversationId)
    .maybeSingle();

  if (!conversation) {
    return actionFailure("Conversația nu a fost găsită.");
  }

  const { error } = await session.supabase.rpc("send_message", {
    p_conversation: parsed.data.conversationId,
    p_body: parsed.data.body,
  });

  if (error) {
    logServerError("messaging.send", error);
    return actionFailure(humanizeError(error));
  }

  const recipient =
    conversation.client_id === session.user.id
      ? conversation.psychologist_id
      : conversation.client_id;

  await notifyUserByEmail({
    userId: recipient as string,
    category: "message",
    subject: "Mesaj nou în platformă",
    intro: "Ai primit un mesaj privat nou. Conținutul nu este inclus în e-mail.",
  });

  revalidatePath(`/dashboard/mesaje/${parsed.data.conversationId}`);
  revalidatePath(`/cabinet/mesaje/${parsed.data.conversationId}`);
  revalidatePath("/dashboard/mesaje");
  revalidatePath("/cabinet/mesaje");

  return actionSuccess();
}

export async function markConversationReadAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser();
  const conversationId = formString(formData, "conversationId");
  if (!conversationId) return actionFailure("Conversația nu a fost identificată.");

  const { error } = await session.supabase.rpc("mark_conversation_read", {
    p_conversation: conversationId,
  });

  if (error) {
    return actionFailure(humanizeError(error));
  }
  return actionSuccess();
}

export async function notifyMessageEmailAction(conversationId: string): Promise<void> {
  const session = await requireUser();
  const { data: conversation } = await session.supabase
    .from("conversations")
    .select("client_id, psychologist_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) return;

  const recipient =
    conversation.client_id === session.user.id
      ? (conversation.psychologist_id as string)
      : (conversation.client_id as string);

  await notifyUserByEmail({
    userId: recipient,
    category: "message",
    subject: "Mesaj nou în platformă",
    intro: "Ai primit un mesaj privat nou. Conținutul nu este inclus în e-mail.",
  });
}

export async function reportAbuseAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser();
  const parsed = reportAbuseSchema.safeParse({
    reportedUserId: formString(formData, "reportedUserId"),
    conversationId: formString(formData, "conversationId") || undefined,
    category: formString(formData, "category"),
    details: formString(formData, "details") || undefined,
  });

  if (!parsed.success) {
    return actionFailure("Verifică datele raportării.", collectFieldErrors(parsed.error));
  }

  const { error } = await session.supabase.rpc("report_abuse", {
    p_reported_user: parsed.data.reportedUserId,
    p_conversation: parsed.data.conversationId ?? null,
    p_category: parsed.data.category,
    p_details: parsed.data.details ?? null,
  });

  if (error) {
    logServerError("abuse.report", error);
    return actionFailure(humanizeError(error));
  }

  return actionSuccess();
}
