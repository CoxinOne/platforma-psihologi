import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Appointment,
  AppointmentWithNames,
  AvailabilityException,
  AvailabilityRule,
  CabinetSummary,
  ConversationListItem,
  DataRequest,
  Message,
  NotificationItem,
  NotificationPreferences,
  PsychologistProfile,
  AbuseReport,
  Specialty,
} from "@/lib/types";

type AppointmentRow = Appointment & {
  cabinet: { name: string; city: string; address_line: string } | null;
};

async function attachNames(
  supabase: SupabaseClient,
  rows: AppointmentRow[],
): Promise<AppointmentWithNames[]> {
  const ids = Array.from(
    new Set(rows.flatMap((row) => [row.client_id, row.psychologist_id])),
  );
  if (ids.length === 0) return [];

  const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const names = new Map<string, string>();
  for (const profile of (data ?? []) as { id: string; full_name: string }[]) {
    names.set(profile.id, profile.full_name);
  }

  return rows.map((row) => ({
    ...row,
    client: names.has(row.client_id) ? { full_name: names.get(row.client_id)! } : null,
    psychologist: names.has(row.psychologist_id)
      ? { full_name: names.get(row.psychologist_id)! }
      : null,
    cabinet: row.cabinet ?? null,
  }));
}

export async function listAppointmentsForClient(
  supabase: SupabaseClient,
  clientId: string,
): Promise<AppointmentWithNames[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, cabinet:cabinets(name, city, address_line)")
    .eq("client_id", clientId)
    .order("starts_at", { ascending: false });

  if (error) {
    console.error("[data.listAppointmentsForClient]", error.code);
    return [];
  }
  return attachNames(supabase, (data ?? []) as AppointmentRow[]);
}

export async function listAppointmentsForPsychologist(
  supabase: SupabaseClient,
  psychologistId: string,
): Promise<AppointmentWithNames[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, cabinet:cabinets(name, city, address_line)")
    .eq("psychologist_id", psychologistId)
    .order("starts_at", { ascending: false });

  if (error) {
    console.error("[data.listAppointmentsForPsychologist]", error.code);
    return [];
  }
  return attachNames(supabase, (data ?? []) as AppointmentRow[]);
}

export async function getAppointmentById(
  supabase: SupabaseClient,
  appointmentId: string,
): Promise<AppointmentWithNames | null> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, cabinet:cabinets(name, city, address_line)")
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !data) return null;
  const enriched = await attachNames(supabase, [data as AppointmentRow]);
  return enriched[0] ?? null;
}

export async function listConversations(supabase: SupabaseClient): Promise<ConversationListItem[]> {
  const { data, error } = await supabase.rpc("list_conversations");
  if (error) {
    console.error("[data.listConversations]", error.code);
    return [];
  }
  return (data ?? []) as ConversationListItem[];
}

export async function getConversation(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<{
  id: string;
  client_id: string;
  psychologist_id: string;
  closed_at: string | null;
  last_message_at: string;
} | null> {
  const { data } = await supabase
    .from("conversations")
    .select("id, client_id, psychologist_id, closed_at, last_message_at")
    .eq("id", conversationId)
    .maybeSingle();

  return data ?? null;
}

export async function listMessages(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    console.error("[data.listMessages]", error.code);
    return [];
  }
  return (data ?? []) as Message[];
}

export async function getCounterpart(
  supabase: SupabaseClient,
  conversation: { client_id: string; psychologist_id: string },
  viewerId: string,
): Promise<{
  id: string;
  name: string;
  photoPath: string | null;
  role: "client" | "psychologist";
} | null> {
  const isClient = conversation.client_id === viewerId;
  const counterpartId = isClient ? conversation.psychologist_id : conversation.client_id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", counterpartId)
    .maybeSingle();

  if (!profile) return null;

  let photoPath: string | null = null;
  if (isClient) {
    const { data: psychologist } = await supabase
      .from("public_psychologists")
      .select("photo_path")
      .eq("user_id", counterpartId)
      .maybeSingle();
    photoPath = (psychologist?.photo_path as string | null) ?? null;
  }

  return {
    id: counterpartId,
    name: String(profile.full_name),
    photoPath,
    role: isClient ? "psychologist" : "client",
  };
}

export async function listNotifications(
  supabase: SupabaseClient,
  limit = 60,
): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[data.listNotifications]", error.code);
    return [];
  }
  return (data ?? []) as NotificationItem[];
}

export async function getUnreadBadge(
  supabase: SupabaseClient,
): Promise<{ notifications: number; messages: number }> {
  const { data, error } = await supabase.rpc("unread_badge");
  if (error || !data) return { notifications: 0, messages: 0 };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    notifications: Number(row?.unread_notifications ?? 0),
    messages: Number(row?.unread_messages ?? 0),
  };
}

export async function getNotificationPreferences(
  supabase: SupabaseClient,
): Promise<NotificationPreferences | null> {
  const { data } = await supabase.rpc("get_notification_preferences");
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row as NotificationPreferences;
}

export async function listMySpecialties(
  supabase: SupabaseClient,
  psychologistId: string,
): Promise<Specialty[]> {
  const { data } = await supabase
    .from("psychologist_specialties")
    .select("specialty:specialties(id, slug, name, description, sort_order)")
    .eq("psychologist_id", psychologistId);

  return ((data ?? []) as unknown as { specialty: Specialty | null }[])
    .map((row) => row.specialty)
    .filter((value): value is Specialty => Boolean(value));
}

export async function listAllSpecialties(supabase: SupabaseClient): Promise<Specialty[]> {
  const { data } = await supabase
    .from("specialties")
    .select("id, slug, name, description, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as Specialty[];
}

export async function listMyCabinets(
  supabase: SupabaseClient,
  psychologistId: string,
): Promise<CabinetSummary[]> {
  const { data } = await supabase
    .from("psychologist_cabinets")
    .select("cabinet:cabinets(id, slug, name, address_line, city, county, phone)")
    .eq("psychologist_id", psychologistId);

  return ((data ?? []) as unknown as { cabinet: CabinetSummary | null }[])
    .map((row) => row.cabinet)
    .filter((value): value is CabinetSummary => Boolean(value));
}

export async function listSelectableCabinets(supabase: SupabaseClient): Promise<CabinetSummary[]> {
  const { data } = await supabase
    .from("cabinets")
    .select("id, slug, name, address_line, city, county, phone")
    .eq("is_active", true)
    .order("city");
  return (data ?? []) as CabinetSummary[];
}

export async function listAvailabilityRules(
  supabase: SupabaseClient,
  psychologistId: string,
): Promise<AvailabilityRule[]> {
  const { data } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .order("weekday")
    .order("start_time");
  return (data ?? []) as AvailabilityRule[];
}

export async function listAvailabilityExceptions(
  supabase: SupabaseClient,
  psychologistId: string,
): Promise<AvailabilityException[]> {
  const { data } = await supabase
    .from("availability_exceptions")
    .select("*")
    .eq("psychologist_id", psychologistId)
    .gte("exception_date", new Date().toISOString().slice(0, 10))
    .order("exception_date");
  return (data ?? []) as AvailabilityException[];
}

export async function listMyReports(
  supabase: SupabaseClient,
  reporterId: string,
): Promise<AbuseReport[]> {
  const { data } = await supabase
    .from("abuse_reports")
    .select("*")
    .eq("reporter_id", reporterId)
    .order("created_at", { ascending: false });
  return (data ?? []) as AbuseReport[];
}

export async function listMyDataRequests(
  supabase: SupabaseClient,
  userId: string,
): Promise<DataRequest[]> {
  const { data } = await supabase
    .from("data_requests")
    .select("*")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false });
  return (data ?? []) as DataRequest[];
}

export async function getMyPsychologistProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<PsychologistProfile | null> {
  const { data } = await supabase
    .from("psychologist_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as PsychologistProfile | null) ?? null;
}
