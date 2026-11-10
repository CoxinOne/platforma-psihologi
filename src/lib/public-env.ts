/**
 * Variabile publice. Sunt incorporate la build de Next.js și pot fi citite
 * în browser. Nu adăuga aici chei secrete.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  platformName: process.env.NEXT_PUBLIC_PLATFORM_NAME ?? "Platformă Psihologi",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  minAge: Number(process.env.NEXT_PUBLIC_MIN_AGE ?? "16"),
} as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function requirePublicSupabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase nu este configurat. Completează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY în .env.local.",
    );
  }
  return { url: publicEnv.supabaseUrl, anonKey: publicEnv.supabaseAnonKey };
}
