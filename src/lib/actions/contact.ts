"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { actionFailure, actionSuccess, humanizeError, logServerError, type ActionResult } from "@/lib/errors";
import { collectFieldErrors, contactSchema } from "@/lib/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerConfig } from "@/lib/server-env";
import { sendTransactionalEmail } from "@/lib/email";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitContactFormAction(
  _previous: ActionResult<{ emailSent: boolean; emailConfigured: boolean }> | null,
  formData: FormData,
): Promise<ActionResult<{ emailSent: boolean; emailConfigured: boolean }>> {
  const parsed = contactSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    subject: formString(formData, "subject"),
    message: formString(formData, "message"),
    website: formString(formData, "website"),
  });

  if (!parsed.success) {
    return actionFailure("Verifică datele introduse.", collectFieldErrors(parsed.error));
  }

  if (parsed.data.website) {
    return actionFailure("Cererea a fost respinsă.");
  }

  const config = getServerConfig();
  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return actionFailure(
      "Formularul nu este configurat pe server. Scrie direct la adresa de contact afișată.",
    );
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const ipBucket = ip.replace(/[^a-fA-F0-9:.]/g, "").slice(0, 60) || "unknown";

  const { error: rateError } = await admin.rpc("check_rate_limit", {
    p_bucket: `contact:${ipBucket}`,
    p_max: 5,
    p_window_seconds: 3600,
  });

  if (rateError) {
    return actionFailure(humanizeError(rateError));
  }

  const { error } = await admin.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    logServerError("contact.insert", error);
    return actionFailure("Mesajul nu a putut fi înregistrat. Încearcă din nou.");
  }

  let emailSent = false;
  if (config.email.configured) {
    const result = await sendTransactionalEmail({
      to: config.email.contactInbox || config.contactEmail,
      subject: `[Contact platformă] ${parsed.data.subject}`,
      text: `Mesaj nou din formularul public.\n\nNume: ${parsed.data.name}\nE-mail: ${parsed.data.email}\n\n${parsed.data.message}`,
    });
    emailSent = result.sent;
  }

  revalidatePath("/admin/mesaje");

  return actionSuccess({ emailSent, emailConfigured: config.email.configured });
}
