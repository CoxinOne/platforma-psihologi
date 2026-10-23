import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ConsultationMode,
  PublicCabinet,
  PublicPsychologist,
  PublicSpecialty,
} from "@/lib/types";

export interface DirectoryFilters {
  q?: string;
  specialty?: string;
  city?: string;
  mode?: ConsultationMode;
  language?: string;
}

export interface SlotDay {
  day: string;
  slots: { startsAt: string; endsAt: string }[];
}

async function getClient(): Promise<SupabaseClient | null> {
  try {
    return await createSupabaseServerClient();
  } catch {
    return null;
  }
}

function clean(value: string | undefined, max = 80): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeSearch(value: string): string {
  return value
    .replace(/[%_,()*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export async function listPublicPsychologists(
  filters: DirectoryFilters = {},
): Promise<PublicPsychologist[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  let query = supabase
    .from("public_psychologists")
    .select("*")
    .order("display_name", { ascending: true });

  const q = clean(filters.q);
  if (q) {
    const safe = sanitizeSearch(q);
    if (safe) {
      query = query.or(
        `display_name.ilike.%${safe}%,professional_title.ilike.%${safe}%,bio.ilike.%${safe}%`,
      );
    }
  }
  if (filters.specialty) query = query.contains("specialty_slugs", [filters.specialty]);
  if (filters.city) query = query.contains("cabinet_cities", [filters.city]);
  if (filters.mode) query = query.contains("consultation_modes", [filters.mode]);
  if (filters.language) query = query.contains("languages", [filters.language]);

  const { data, error } = await query;
  if (error) {
    console.error("[public.listPsychologists]", error.code);
    return [];
  }
  return (data ?? []) as PublicPsychologist[];
}

export async function getPsychologistBySlug(slug: string): Promise<PublicPsychologist | null> {
  const supabase = await getClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_psychologists")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[public.getPsychologist]", error.code);
    return null;
  }
  return (data as PublicPsychologist | null) ?? null;
}

export async function listSpecialties(): Promise<PublicSpecialty[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("public_specialties")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[public.listSpecialties]", error.code);
    return [];
  }
  return (data ?? []) as PublicSpecialty[];
}

export async function getSpecialtyBySlug(slug: string): Promise<PublicSpecialty | null> {
  const supabase = await getClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_specialties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicSpecialty;
}

export async function listCabinets(): Promise<PublicCabinet[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("public_cabinets")
    .select("*")
    .order("city", { ascending: true });

  if (error) {
    console.error("[public.listCabinets]", error.code);
    return [];
  }
  return (data ?? []) as PublicCabinet[];
}

export async function getCabinetBySlug(slug: string): Promise<PublicCabinet | null> {
  const supabase = await getClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_cabinets")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicCabinet;
}

export async function getAvailableSlots(
  psychologistId: string,
  mode: ConsultationMode,
  from: string,
  days: number,
): Promise<SlotDay[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("available_slots_range", {
    p_psychologist: psychologistId,
    p_from: from,
    p_days: days,
    p_mode: mode,
  });

  if (error) {
    console.error("[public.getAvailableSlots]", error.code);
    return [];
  }

  const grouped = new Map<string, SlotDay>();
  for (const row of (data ?? []) as { day: string; starts_at: string; ends_at: string }[]) {
    const key = row.day;
    const existing = grouped.get(key) ?? { day: key, slots: [] };
    existing.slots.push({ startsAt: row.starts_at, endsAt: row.ends_at });
    grouped.set(key, existing);
  }

  return Array.from(grouped.values());
}

export async function listCabinetsForFilter(): Promise<string[]> {
  const cabinets = await listCabinets();
  return Array.from(new Set(cabinets.map((cabinet) => cabinet.city))).sort((a, b) =>
    a.localeCompare(b, "ro"),
  );
}
