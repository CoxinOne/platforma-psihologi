import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerConfig } from "@/lib/server-env";

let adminClient: SupabaseClient | undefined;

/**
 * Client cu cheie de serviciu. Ignoră RLS, deci trebuie folosit EXCLUSIV pe
 * server, după verificarea explicită a rolului administratorului.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;
  const config = getServerConfig();

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase nu este configurat.");
  }
  if (!config.serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY lipsește. Operațiunile administrative nu pot fi efectuate.",
    );
  }

  adminClient = createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return adminClient;
}

export function isAdminClientConfigured(): boolean {
  const config = getServerConfig();
  return Boolean(config.supabaseUrl && config.serviceRoleKey);
}
