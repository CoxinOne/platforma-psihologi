import type { PublicPsychologist } from "@/lib/types";
import { slugify } from "@/lib/utils";

export interface DirectoryCity {
  slug: string;
  name: string;
  psychologists: PublicPsychologist[];
}

export interface DirectorySpecialty {
  slug: string;
  name: string;
}

/** Orașele care au cel puțin un psiholog cu profil public, sortate alfabetic. */
export function getDirectoryCities(psychologists: PublicPsychologist[]): DirectoryCity[] {
  const bySlug = new Map<string, DirectoryCity>();

  for (const psychologist of psychologists) {
    for (const cityName of psychologist.cabinet_cities) {
      const slug = slugify(cityName);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) {
        existing.psychologists.push(psychologist);
      } else {
        bySlug.set(slug, { slug, name: cityName, psychologists: [psychologist] });
      }
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "ro"));
}

/** Specializările reprezentate de psihologii dintr-un oraș. */
export function getSpecialtiesInCity(city: DirectoryCity): DirectorySpecialty[] {
  const bySlug = new Map<string, string>();
  for (const psychologist of city.psychologists) {
    for (const specialty of psychologist.specialties) {
      bySlug.set(specialty.slug, specialty.name);
    }
  }
  return [...bySlug.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ro"));
}

/** Toate specializările reprezentate de o listă de psihologi. */
export function getDirectorySpecialties(
  psychologists: PublicPsychologist[],
): DirectorySpecialty[] {
  const bySlug = new Map<string, string>();
  for (const psychologist of psychologists) {
    for (const specialty of psychologist.specialties) {
      bySlug.set(specialty.slug, specialty.name);
    }
  }
  return [...bySlug.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ro"));
}

/** Orașele în care există cel puțin un psiholog pentru o specializare dată. */
export function getCitiesForSpecialty(
  psychologists: PublicPsychologist[],
  specialtySlug: string,
): DirectoryCity[] {
  return getDirectoryCities(psychologists)
    .map((city) => ({
      ...city,
      psychologists: city.psychologists.filter((psychologist) =>
        psychologist.specialty_slugs.includes(specialtySlug),
      ),
    }))
    .filter((city) => city.psychologists.length > 0);
}

export interface CitySpecialtyCombo {
  city: DirectoryCity;
  specialty: DirectorySpecialty;
  psychologists: PublicPsychologist[];
}

/**
 * Toate combinațiile oraș × specializare care au cel puțin un profil public.
 * Sunt folosite pentru paginile de tip „Psihologi {specializare} în {oraș}”.
 */
export function getCitySpecialtyCombos(
  psychologists: PublicPsychologist[],
): CitySpecialtyCombo[] {
  const combos: CitySpecialtyCombo[] = [];

  for (const city of getDirectoryCities(psychologists)) {
    const specialties = new Map<string, DirectorySpecialty>();
    for (const psychologist of city.psychologists) {
      for (const specialty of psychologist.specialties) {
        if (psychologist.specialty_slugs.includes(specialty.slug)) {
          specialties.set(specialty.slug, specialty);
        }
      }
    }

    for (const specialty of [...specialties.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "ro"),
    )) {
      const matching = city.psychologists.filter((psychologist) =>
        psychologist.specialty_slugs.includes(specialty.slug),
      );
      if (matching.length > 0) {
        combos.push({ city, specialty, psychologists: matching });
      }
    }
  }

  return combos;
}
