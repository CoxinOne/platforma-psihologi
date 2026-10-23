import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AbuseReport,
  AuditLog,
  ContactMessage,
  DataRequest,
  Profile,
  ProfessionalStatus,
  PsychologistProfile,
  Specialty,
} from "@/lib/types";

export interface AdminAccount {
  profile: Profile;
  professionalStatus: ProfessionalStatus | null;
}

export interface AdminProfessional {
  profile: PsychologistProfile;
  fullName: string;
  email: string;
  specialties: string[];
}

export interface AdminCabinet {
  id: string;
  slug: string;
  name: string;
  address_line: string;
  city: string;
  county: string | null;
  postal_code: string | null;
  phone: string | null;
  description: string | null;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface AdminSpecialty extends Specialty {
  is_active: boolean;
}

export interface AdminReport extends AbuseReport {
  reporter_name: string;
  reported_name: string;
}

export interface AdminAuditLog extends AuditLog {
  actor_name: string | null;
}

export interface AdminDataRequest extends DataRequest {
  user_name: string;
  user_email: string;
}

export async function listAdminAccounts(): Promise<AdminAccount[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: profiles }, { data: professionals }] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("psychologist_profiles").select("user_id, status"),
  ]);

  const statuses = new Map<string, ProfessionalStatus>();
  for (const row of (professionals ?? []) as { user_id: string; status: ProfessionalStatus }[]) {
    statuses.set(row.user_id, row.status);
  }

  return ((profiles ?? []) as Profile[]).map((profile) => ({
    profile,
    professionalStatus: statuses.get(profile.id) ?? null,
  }));
}

export async function listAdminProfessionals(): Promise<AdminProfessional[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: professionals }, { data: profiles }, { data: links }, { data: specialties }] =
    await Promise.all([
      admin.from("psychologist_profiles").select("*").order("created_at", { ascending: false }),
      admin.from("profiles").select("id, full_name, email"),
      admin.from("psychologist_specialties").select("psychologist_id, specialty_id"),
      admin.from("specialties").select("id, name"),
    ]);

  const profileMap = new Map(
    ((profiles ?? []) as { id: string; full_name: string; email: string }[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const specialtyNames = new Map(
    ((specialties ?? []) as { id: string; name: string }[]).map((specialty) => [
      specialty.id,
      specialty.name,
    ]),
  );
  const byPsychologist = new Map<string, string[]>();
  for (const link of (links ?? []) as { psychologist_id: string; specialty_id: string }[]) {
    const list = byPsychologist.get(link.psychologist_id) ?? [];
    const name = specialtyNames.get(link.specialty_id);
    if (name) list.push(name);
    byPsychologist.set(link.psychologist_id, list);
  }

  return ((professionals ?? []) as PsychologistProfile[]).map((profile) => {
    const account = profileMap.get(profile.user_id);
    return {
      profile,
      fullName: account?.full_name ?? "—",
      email: account?.email ?? "—",
      specialties: byPsychologist.get(profile.user_id) ?? [],
    };
  });
}

export async function listAdminSpecialties(): Promise<AdminSpecialty[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("specialties").select("*").order("sort_order");
  return (data ?? []) as AdminSpecialty[];
}

export async function listAdminCabinets(): Promise<AdminCabinet[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("cabinets").select("*").order("city").order("name");
  return (data ?? []) as AdminCabinet[];
}

export async function listAdminReports(): Promise<AdminReport[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: reports }, { data: profiles }] = await Promise.all([
    admin.from("abuse_reports").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("id, full_name"),
  ]);

  const names = new Map(
    ((profiles ?? []) as { id: string; full_name: string }[]).map((profile) => [
      profile.id,
      profile.full_name,
    ]),
  );

  return ((reports ?? []) as AbuseReport[]).map((report) => ({
    ...report,
    reporter_name: names.get(report.reporter_id) ?? "—",
    reported_name: names.get(report.reported_user_id) ?? "—",
  }));
}

export async function listAdminDataRequests(): Promise<AdminDataRequest[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: requests }, { data: profiles }] = await Promise.all([
    admin.from("data_requests").select("*").order("requested_at", { ascending: false }),
    admin.from("profiles").select("id, full_name, email"),
  ]);

  const people = new Map(
    ((profiles ?? []) as { id: string; full_name: string; email: string }[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return ((requests ?? []) as DataRequest[]).map((request) => {
    const person = people.get(request.user_id);
    return {
      ...request,
      user_name: person?.full_name ?? "—",
      user_email: person?.email ?? "—",
    };
  });
}

export async function listAdminAuditLogs(limit = 100): Promise<AdminAuditLog[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: logs }, { data: profiles }] = await Promise.all([
    admin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit),
    admin.from("profiles").select("id, full_name"),
  ]);

  const names = new Map(
    ((profiles ?? []) as { id: string; full_name: string }[]).map((profile) => [
      profile.id,
      profile.full_name,
    ]),
  );

  return ((logs ?? []) as AuditLog[]).map((log) => ({
    ...log,
    actor_name: log.actor_id ? names.get(log.actor_id) ?? null : null,
  }));
}

export async function listAdminContactMessages(): Promise<ContactMessage[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as ContactMessage[];
}

export async function getAdminSystemStatus() {
  const started = Date.now();

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);

    return {
      database: error ? ("error" as const) : ("ok" as const),
      latencyMs: Date.now() - started,
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
      timezone: process.env.PLATFORM_TIMEZONE ?? "Europe/Bucharest",
    };
  } catch {
    return {
      database: "error" as const,
      latencyMs: Date.now() - started,
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      serviceRoleConfigured: false,
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
      timezone: process.env.PLATFORM_TIMEZONE ?? "Europe/Bucharest",
    };
  }
}
