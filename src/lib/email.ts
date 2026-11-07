import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerConfig } from "@/lib/server-env";

export type EmailResult = {
  configured: boolean;
  sent: boolean;
  skipped?: "preference" | "missing-email";
  error?: string;
};

export function isEmailConfigured(): boolean {
  return getServerConfig().email.configured;
}

export async function sendTransactionalEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  const config = getServerConfig();
  if (!config.email.configured) {
    return { configured: false, sent: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.email.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.email.from,
        to: [options.to],
        subject: options.subject,
        text: `${options.text}\n\n— ${config.siteUrl}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("[email] Furnizorul a răspuns cu status", response.status);
      return { configured: true, sent: false, error: "provider_error" };
    }

    return { configured: true, sent: true };
  } catch (error) {
    console.error("[email] Trimiterea a eșuat:", error instanceof Error ? error.name : "unknown");
    return { configured: true, sent: false, error: "network_error" };
  }
}

/**
 * Trimite un e-mail generic. Nu include niciodată conținutul mesajelor private,
 * note clinice sau alte date sensibile.
 */
export async function notifyUserByEmail(options: {
  userId: string;
  subject: string;
  intro: string;
}): Promise<EmailResult> {
  const config = getServerConfig();
  if (!config.email.configured) {
    return { configured: false, sent: false };
  }

  try {
    const admin = createSupabaseAdminClient();

    const [{ data: userData }, { data: preferences }] = await Promise.all([
      admin.auth.admin.getUserById(options.userId),
      admin
        .from("notification_preferences")
        .select("email_messages")
        .eq("user_id", options.userId)
        .maybeSingle(),
    ]);

    const email = userData?.user?.email;
    if (!email) {
      return { configured: true, sent: false, skipped: "missing-email" };
    }

    if (!preferences || preferences.email_messages !== true) {
      return { configured: true, sent: false, skipped: "preference" };
    }

    return await sendTransactionalEmail({
      to: email,
      subject: options.subject,
      text: `${options.intro}\n\nDin motive de confidențialitate, detaliile nu sunt incluse în e-mail. Autentifică-te în cont pentru a le consulta.`,
    });
  } catch (error) {
    console.error("[email] Notificarea nu a putut fi pregătită:", error instanceof Error ? error.name : "unknown");
    return { configured: true, sent: false, error: "internal_error" };
  }
}
