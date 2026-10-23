import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { roleHome, safeNext } from "@/lib/permissions";
import type { Profile, PsychologistProfile, UserRole } from "@/lib/types";

export interface SessionContext {
  supabase: SupabaseClient;
  user: User;
  profile: Profile;
}

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase.rpc("get_my_profile");
    const profile = Array.isArray(data) ? data[0] : data;
    if (error || !profile) return null;

    return { supabase, user, profile: profile as Profile };
  } catch {
    // Configurare lipsă sau serviciu indisponibil: aplicația afișează starea publică.
    return null;
  }
});

export async function requireUser(nextPath?: string): Promise<SessionContext> {
  const session = await getSessionContext();

  if (!session) {
    const target = nextPath ?? "/dashboard";
    redirect(`/autentificare?next=${encodeURIComponent(target)}`);
  }
  if (!session.user.email_confirmed_at) {
    redirect("/verifica-email");
  }
  if (session.profile.status === "suspended" || session.profile.status === "deleted") {
    redirect("/acces-interzis?motiv=cont-suspendat");
  }

  return session;
}

export async function requireRole(role: UserRole, nextPath?: string): Promise<SessionContext> {
  const session = await requireUser(nextPath);
  if (session.profile.role !== role) {
    redirect(roleHome(session.profile.role));
  }
  return session;
}

export async function requireAdmin(): Promise<SessionContext> {
  return requireRole("admin", "/admin");
}

export async function requirePsychologist(): Promise<SessionContext> {
  return requireRole("psychologist", "/cabinet");
}

export async function requireClient(): Promise<SessionContext> {
  const session = await requireUser("/dashboard");
  if (session.profile.role === "admin") redirect("/admin");
  if (session.profile.role === "psychologist") redirect("/cabinet");
  return session;
}

export function nextAfterLogin(role: UserRole, requested: string | null | undefined): string {
  return safeNext(requested, roleHome(role));
}

export async function getPsychologistProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<PsychologistProfile | null> {
  const { data, error } = await supabase
    .from("psychologist_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as PsychologistProfile;
}
