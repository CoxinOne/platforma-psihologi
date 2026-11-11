"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Send, Upload } from "lucide-react";
import type { CabinetSummary, PsychologistProfile, Specialty } from "@/lib/types";
import { savePsychologistProfileAction } from "@/lib/actions/psychologist";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/public-env";
import { LANGUAGE_OPTIONS, MODE_LABELS } from "@/lib/constants";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Avatar, Field, inputClasses } from "@/components/ui";
import { firstError } from "@/lib/validation";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PsychologistProfileForm({
  userId,
  profile,
  specialties,
  selectedSpecialtyIds,
  cabinets,
  selectedCabinetIds,
}: {
  userId: string;
  profile: PsychologistProfile | null;
  specialties: Specialty[];
  selectedSpecialtyIds: string[];
  cabinets: CabinetSummary[];
  selectedCabinetIds: string[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(savePsychologistProfileAction, null);
  const [photoPath, setPhotoPath] = useState(profile?.photo_path ?? "");
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedModes, setSelectedModes] = useState<string[]>(profile?.consultation_modes ?? ["online"]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(profile?.languages ?? ["română"]);

  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  const handleUpload = async (file: File | undefined) => {
    setPhotoError(null);
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("Sunt acceptate doar imagini JPEG, PNG sau WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Fotografia poate avea cel mult 2 MB.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setPhotoError("Storage-ul nu este configurat.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/avatar-${Date.now()}.${extension}`;
      const { data, error } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (error) {
        setPhotoError("Fotografia nu a putut fi încărcată. Verifică bucket-ul „avatars” și politicile Storage.");
        return;
      }
      setPhotoPath(data.path);
    } catch {
      setPhotoError("Fotografia nu a putut fi încărcată.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.ok ? (
        <Alert tone="success">Profilul a fost salvat.</Alert>
      ) : null}
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      {profile?.status === "rejected" && profile.rejection_reason ? (
        <Alert tone="warning" title="Profil respins">
          {profile.rejection_reason}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-canvas p-4 sm:flex-row sm:items-center">
        <Avatar name={profile?.display_name ?? "Profil nou"} photoPath={photoPath || null} size={80} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">Fotografie de profil</p>
          <p className="text-xs text-muted">JPEG, PNG sau WebP, maximum 2 MB. Este publică.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-line bg-surface px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {uploading ? "Se încarcă…" : "Alege fotografia"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => void handleUpload(event.target.files?.[0])}
                disabled={uploading}
              />
            </label>
            {photoPath ? (
              <button
                type="button"
                onClick={() => setPhotoPath("")}
                className="text-sm font-semibold text-danger underline underline-offset-4"
              >
                Elimină fotografia
              </button>
            ) : null}
            <Camera className="h-4 w-4 text-muted" aria-hidden="true" />
          </div>
          {photoError ? <p className="mt-2 text-sm text-danger">{photoError}</p> : null}
        </div>
        <input type="hidden" name="photoPath" value={photoPath} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nume profesional afișat" htmlFor="displayName" required error={firstError(errors, "displayName")}>
          <input
            id="displayName"
            name="displayName"
            defaultValue={profile?.display_name ?? ""}
            required
            maxLength={120}
            className={inputClasses(Boolean(firstError(errors, "displayName")))}
          />
        </Field>
        <Field
          label="Titlu profesional"
          htmlFor="professionalTitle"
          required
          error={firstError(errors, "professionalTitle")}
        >
          <input
            id="professionalTitle"
            name="professionalTitle"
            defaultValue={profile?.professional_title ?? ""}
            required
            maxLength={160}
            placeholder="ex. Psiholog clinician, psihoterapeut"
            className={inputClasses(Boolean(firstError(errors, "professionalTitle")))}
          />
        </Field>
      </div>

      <Field
        label="Adresa profilului public"
        htmlFor="slug"
        required
        hint="Litere mici, cifre și cratime. Ex: ana-popescu"
        error={firstError(errors, "slug")}
      >
        <input
          id="slug"
          name="slug"
          defaultValue={profile?.slug ?? ""}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={100}
          className={inputClasses(Boolean(firstError(errors, "slug")))}
        />
      </Field>

      <Field
        label="Prezentare personală"
        htmlFor="bio"
        required
        hint="Minimum 80 de caractere pentru trimiterea spre verificare. Fără promisiuni de vindecare."
        error={firstError(errors, "bio")}
      >
        <textarea
          id="bio"
          name="bio"
          rows={6}
          maxLength={6000}
          defaultValue={profile?.bio ?? ""}
          className={inputClasses(Boolean(firstError(errors, "bio")))}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Studii și calificări"
          htmlFor="education"
          hint="Minimum 20 de caractere. Aceste date sunt verificate înainte de publicare."
          error={firstError(errors, "education")}
        >
          <textarea
            id="education"
            name="education"
            rows={5}
            maxLength={4000}
            defaultValue={profile?.education ?? ""}
            className={inputClasses(Boolean(firstError(errors, "education")))}
          />
        </Field>
        <Field label="Experiență profesională" htmlFor="experience" error={firstError(errors, "experience")}>
          <textarea
            id="experience"
            name="experience"
            rows={5}
            maxLength={4000}
            defaultValue={profile?.experience ?? ""}
            className={inputClasses(Boolean(firstError(errors, "experience")))}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Limbi vorbite *</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((language) => (
            <label
              key={language}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
            >
              <input
                type="checkbox"
                name="languages"
                value={language}
                defaultChecked={selectedLanguages.includes(language)}
                className="accent-brand"
              />
              {language}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Tipuri de consultație *</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["online", "in_person"] as const).map((mode) => (
            <label
              key={mode}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
            >
              <input
                type="checkbox"
                name="modes"
                value={mode}
                defaultChecked={selectedModes.includes(mode)}
                onChange={(event) =>
                  setSelectedModes((previous) =>
                    event.target.checked ? [...previous, mode] : previous.filter((item) => item !== mode),
                  )
                }
                className="accent-brand"
              />
              {MODE_LABELS[mode]}
            </label>
          ))}
        </div>
        {firstError(errors, "modes") ? (
          <p className="mt-1 text-sm text-danger">{firstError(errors, "modes")}</p>
        ) : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Durata ședinței (minute)" htmlFor="sessionDuration" required error={firstError(errors, "sessionDuration")}>
          <input
            id="sessionDuration"
            name="sessionDuration"
            type="number"
            min={20}
            max={120}
            defaultValue={profile?.session_duration_minutes ?? 50}
            required
            className={inputClasses(Boolean(firstError(errors, "sessionDuration")))}
          />
        </Field>
        <Field label="Fus orar" htmlFor="timezone" required error={firstError(errors, "timezone")}>
          <select
            id="timezone"
            name="timezone"
            defaultValue={profile?.timezone ?? "Europe/Bucharest"}
            className={inputClasses(Boolean(firstError(errors, "timezone")))}
          >
            <option value="Europe/Bucharest">Europe/Bucharest (ora României)</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="UTC">UTC</option>
          </select>
        </Field>
      </div>

      <Field
        label="Site web"
        htmlFor="websiteUrl"
        hint="Opțional. Apare ca link public pe profilul tău."
        error={firstError(errors, "websiteUrl")}
      >
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          defaultValue={profile?.website_url ?? ""}
          placeholder="https://exemplu.ro"
          className={inputClasses(Boolean(firstError(errors, "websiteUrl")))}
        />
      </Field>

      <Field
        label="Motto personal"
        htmlFor="motto"
        hint="Opțional. Apare ca citat pe profilul public."
        error={firstError(errors, "motto")}
      >
        <textarea
          id="motto"
          name="motto"
          rows={3}
          maxLength={600}
          defaultValue={profile?.motto ?? ""}
          className={inputClasses(Boolean(firstError(errors, "motto")))}
        />
      </Field>

      <Field
        label="Servicii oferite"
        htmlFor="services"
        hint="Opțional. Un serviciu pe fiecare linie, de exemplu „Terapie de cuplu — 60 de minute”."
        error={firstError(errors, "services")}
      >
        <textarea
          id="services"
          name="services"
          rows={4}
          maxLength={1200}
          defaultValue={(profile?.services ?? []).join("\n")}
          className={inputClasses(Boolean(firstError(errors, "services")))}
        />
      </Field>

      <div className="rounded-xl border border-brand-line bg-brand-soft/40 p-4 text-sm text-brand-strong">
        <p className="font-semibold">Prețul este în funcție de complexitate.</p>
        <p className="mt-1 text-brand-strong/80">
          Platforma nu afișează tarife fixe și nu procesează plăți. Detaliile se discută direct cu
          clientul, prin mesagerie.
        </p>
      </div>

      <Field
        label="Număr de înregistrare profesională"
        htmlFor="registryNumber"
        hint="Vizibil doar pentru administrator, la verificare. Nu apare public."
      >
        <input
          id="registryNumber"
          name="registryNumber"
          defaultValue={profile?.professional_registry_number ?? ""}
          maxLength={80}
          className={inputClasses()}
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Specializări *</legend>
        <p className="mt-1 text-xs text-muted">Selectează cel puțin una.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {specialties.map((specialty) => (
            <label key={specialty.id} className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3 text-sm">
              <input
                type="checkbox"
                name="specialtyIds"
                value={specialty.id}
                defaultChecked={selectedSpecialtyIds.includes(specialty.id)}
                className="mt-1 accent-brand"
              />
              <span>
                <span className="block font-medium text-ink">{specialty.name}</span>
                {specialty.description ? <span className="block text-xs text-muted">{specialty.description}</span> : null}
              </span>
            </label>
          ))}
        </div>
        {firstError(errors, "specialtyIds") ? (
          <p className="mt-1 text-sm text-danger">{firstError(errors, "specialtyIds")}</p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Cabinete</legend>
        <p className="mt-1 text-xs text-muted">
          Necesare pentru consultațiile în persoană. Administratorul gestionează lista de cabinete.
        </p>
        {cabinets.length > 0 ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {cabinets.map((cabinet) => (
              <label key={cabinet.id} className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3 text-sm">
                <input
                  type="checkbox"
                  name="cabinetIds"
                  value={cabinet.id}
                  defaultChecked={selectedCabinetIds.includes(cabinet.id)}
                  className="mt-1 accent-brand"
                />
                <span>
                  <span className="block font-medium text-ink">{cabinet.name}</span>
                  <span className="block text-xs text-muted">
                    {cabinet.address_line}, {cabinet.city}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Nu există cabinete active. Contactează administratorul pentru adăugarea unuia.
          </p>
        )}
        {firstError(errors, "cabinetIds") ? (
          <p className="mt-1 text-sm text-danger">{firstError(errors, "cabinetIds")}</p>
        ) : null}
      </fieldset>

      <label className="flex items-start gap-2 rounded-xl border border-line bg-canvas p-4 text-sm">
        <input
          type="checkbox"
          name="isAcceptingNewClients"
          defaultChecked={profile?.is_accepting_new_clients ?? true}
          className="mt-1 accent-brand"
        />
        <span>
          <span className="block font-semibold text-ink">Accept solicitări noi</span>
          <span className="text-muted">Poți dezactiva temporar fără a șterge profilul.</span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <SubmitButton pendingLabel="Se salvează…">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Salvează profilul
        </SubmitButton>
        {profile?.status !== "pending" ? (
          <button
            type="submit"
            name="submitForReview"
            value="on"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-line bg-surface px-5 py-2.5 text-[0.95rem] font-semibold text-brand hover:bg-brand-soft"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Trimite spre verificare
          </button>
        ) : (
          <span className="text-sm text-muted">Profilul este în verificare.</span>
        )}
      </div>
      <p className="text-xs text-muted">
        Trimiterea spre verificare necesită prezentare de minimum 80 de caractere, studii completate,
        cel puțin o specializare și un cabinet dacă oferi ședințe în persoană.
      </p>
    </form>
  );
}
