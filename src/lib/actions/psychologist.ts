"use server";

import { revalidatePath } from "next/cache";
import { requirePsychologist } from "@/lib/auth";
import { actionFailure, actionSuccess, humanizeError, logServerError, type ActionResult } from "@/lib/errors";
import {
  collectFieldErrors,
  psychologistProfileSchema,
} from "@/lib/validation";
import { getMyPsychologistProfile } from "@/lib/data/user";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function savePsychologistProfileAction(
  _previous: ActionResult<{ submitted: boolean }> | null,
  formData: FormData,
): Promise<ActionResult<{ submitted: boolean }>> {
  const session = await requirePsychologist();
  const submitForReview = formData.get("submitForReview") === "on";

  const parsed = psychologistProfileSchema.safeParse({
    displayName: formString(formData, "displayName"),
    slug: formString(formData, "slug"),
    professionalTitle: formString(formData, "professionalTitle"),
    bio: formString(formData, "bio"),
    education: formString(formData, "education"),
    experience: formString(formData, "experience"),
    languages: formData.getAll("languages").map(String),
    modes: formData.getAll("modes").map(String),
    sessionDuration: formString(formData, "sessionDuration"),
    timezone: formString(formData, "timezone") || "Europe/Bucharest",
    registryNumber: formString(formData, "registryNumber"),
    isAcceptingNewClients: formData.get("isAcceptingNewClients") === "on",
    specialtyIds: formData.getAll("specialtyIds").map(String),
    cabinetIds: formData.getAll("cabinetIds").map(String),
    photoPath: formString(formData, "photoPath") || undefined,
  });

  if (!parsed.success) {
    return actionFailure("Verifică datele profilului.", collectFieldErrors(parsed.error));
  }

  if (parsed.data.photoPath && !parsed.data.photoPath.startsWith(`${session.user.id}/`)) {
    return actionFailure("Fotografia selectată nu îți aparține.");
  }

  const existing = await getMyPsychologistProfile(session.supabase, session.user.id);

  const record = {
    slug: parsed.data.slug,
    display_name: parsed.data.displayName,
    professional_title: parsed.data.professionalTitle,
    bio: parsed.data.bio ?? null,
    education: parsed.data.education ?? null,
    experience: parsed.data.experience ?? null,
    languages: parsed.data.languages,
    consultation_modes: parsed.data.modes,
    session_duration_minutes: parsed.data.sessionDuration,
    price_ron: null,
    timezone: parsed.data.timezone,
    professional_registry_number: parsed.data.registryNumber ?? null,
    is_accepting_new_clients: parsed.data.isAcceptingNewClients,
    photo_path: parsed.data.photoPath ?? null,
  };

  if (!existing) {
    const { error } = await session.supabase.from("psychologist_profiles").insert({
      ...record,
      user_id: session.user.id,
      status: "draft",
    });
    if (error) {
      logServerError("psychologist.profile.insert", error);
      return actionFailure(
        error.code === "23505"
          ? "Adresa profilului este deja folosită. Alege alt slug."
          : humanizeError(error),
      );
    }
  } else {
    const { error } = await session.supabase
      .from("psychologist_profiles")
      .update(record)
      .eq("user_id", session.user.id);
    if (error) {
      logServerError("psychologist.profile.update", error);
      return actionFailure(error.code === "23505" ? "Adresa profilului este deja folosită." : humanizeError(error));
    }
  }

  const { error: deleteSpecialtiesError } = await session.supabase
    .from("psychologist_specialties")
    .delete()
    .eq("psychologist_id", session.user.id);
  if (deleteSpecialtiesError) {
    logServerError("psychologist.specialties.delete", deleteSpecialtiesError);
    return actionFailure("Specializările nu au putut fi actualizate.");
  }

  if (parsed.data.specialtyIds.length > 0) {
    const { error } = await session.supabase.from("psychologist_specialties").insert(
      parsed.data.specialtyIds.map((specialtyId) => ({
        psychologist_id: session.user.id,
        specialty_id: specialtyId,
      })),
    );
    if (error) {
      logServerError("psychologist.specialties.insert", error);
      return actionFailure("Specializările nu au putut fi salvate.");
    }
  }

  const { error: deleteCabinetsError } = await session.supabase
    .from("psychologist_cabinets")
    .delete()
    .eq("psychologist_id", session.user.id);
  if (deleteCabinetsError) {
    logServerError("psychologist.cabinets.delete", deleteCabinetsError);
    return actionFailure("Cabinetele nu au putut fi actualizate.");
  }

  if (parsed.data.cabinetIds.length > 0) {
    const { error } = await session.supabase.from("psychologist_cabinets").insert(
      parsed.data.cabinetIds.map((cabinetId, index) => ({
        psychologist_id: session.user.id,
        cabinet_id: cabinetId,
        is_primary: index === 0,
      })),
    );
    if (error) {
      logServerError("psychologist.cabinets.insert", error);
      return actionFailure("Cabinetele nu au putut fi salvate.");
    }
  }

  if (submitForReview) {
    const { error } = await session.supabase
      .from("psychologist_profiles")
      .update({ status: "pending" })
      .eq("user_id", session.user.id);

    if (error) {
      logServerError("psychologist.profile.submit", error);
      return actionFailure(humanizeError(error));
    }
  }

  revalidatePath("/cabinet/profil");
  revalidatePath("/cabinet");
  revalidatePath("/psihologi");
  revalidatePath("/");

  return actionSuccess({ submitted: submitForReview });
}
