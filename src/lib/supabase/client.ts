"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requirePublicSupabaseEnv } from "@/lib/public-env";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const { url, anonKey } = requirePublicSupabaseEnv();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
