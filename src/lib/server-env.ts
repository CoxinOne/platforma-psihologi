import "server-only";

/**
 * Configurare exclusiv server-side. Cheia de serviciu nu trebuie să ajungă
 * niciodată în bundle-ul client sau în răspunsuri HTTP.
 */
export function getServerConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
    serviceRoleKey,
    siteUrl,
    timezone: process.env.PLATFORM_TIMEZONE ?? "Europe/Bucharest",
    email: {
      resendApiKey: process.env.RESEND_API_KEY ?? "",
      from: process.env.EMAIL_FROM ?? "",
      contactInbox: process.env.CONTACT_INBOX_EMAIL ?? "",
      configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    },
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@exemplu.ro",
  } as const;
}

export function assertServerConfig(): void {
  const config = getServerConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      "Configurare incompletă: NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY sunt obligatorii.",
    );
  }
}
