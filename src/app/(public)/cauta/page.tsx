import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  listCabinetsForFilter,
  listPublicPsychologists,
  listSpecialties,
} from "@/lib/data/public";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, EmptyState, Field, inputClasses, PageHeader } from "@/components/ui";
import { LANGUAGE_OPTIONS } from "@/lib/constants";
import type { ConsultationMode } from "@/lib/types";

export const metadata: Metadata = {
  title: "Caută un psiholog",
  description:
    "Filtrează psihologii după specializare, oraș, limbă vorbită și tipul consultației.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = readParam(params.q).slice(0, 80);
  const specialty = readParam(params.specialitate).slice(0, 80);
  const city = readParam(params.oras).slice(0, 80);
  const language = readParam(params.limba).slice(0, 40);
  const rawMode = readParam(params.mod);
  const mode: ConsultationMode | undefined =
    rawMode === "online" || rawMode === "in_person" ? rawMode : undefined;

  const [results, specialties, cities] = await Promise.all([
    listPublicPsychologists({ q, specialty, city, mode, language }),
    listSpecialties(),
    listCabinetsForFilter(),
  ]);

  const hasFilters = Boolean(q || specialty || city || language || mode);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Căutare"
        title="Găsește psihologul potrivit"
        description="Filtrează după specializare, oraș, limbă și modul de consultație. Toate filtrele sunt aplicate pe server."
      />

      <form
        method="get"
        action="/cauta"
        className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Field label="Caută după nume sau temă" htmlFor="q">
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="ex. anxietate, traumatologie, Ana"
                className={inputClasses()}
              />
            </Field>
          </div>
          <div className="lg:col-span-3">
            <Field label="Specializare" htmlFor="specialitate">
              <select id="specialitate" name="specialitate" defaultValue={specialty} className={inputClasses()}>
                <option value="">Toate specializările</option>
                {specialties.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Oraș" htmlFor="oras">
              <select id="oras" name="oras" defaultValue={city} className={inputClasses()}>
                <option value="">Toate orașele</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Consultație" htmlFor="mod">
              <select id="mod" name="mod" defaultValue={mode ?? ""} className={inputClasses()}>
                <option value="">Toate tipurile</option>
                <option value="online">Online</option>
                <option value="in_person">În cabinet</option>
              </select>
            </Field>
          </div>
          <div className="lg:col-span-1">
            <Field label="Limba" htmlFor="limba">
              <select id="limba" name="limba" defaultValue={language} className={inputClasses()}>
                <option value="">Toate</option>
                {LANGUAGE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className={buttonClasses("primary")}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Aplică filtrele
          </button>
          {hasFilters ? (
            <Link href="/cauta" className={buttonClasses("ghost")}>
              Șterge filtrele
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" role="status">
          {results.length === 0
            ? "Niciun profil nu corespunde filtrelor."
            : `${results.length} ${
                results.length === 1 ? "profil găsit" : "profiluri găsite"
              }${hasFilters ? " pentru filtrele selectate" : ""}.`}
        </p>
        <Link href="/psihologi" className="text-sm font-semibold text-brand underline underline-offset-4">
          Vezi lista completă
        </Link>
      </div>

      <div className="mt-6">
        {results.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.map((psychologist) => (
              <PsychologistCard key={psychologist.user_id} psychologist={psychologist} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasFilters ? "Nicio potrivire pentru filtrele alese" : "Momentan nu există profiluri publicate"}
            description={
              hasFilters
                ? "Încearcă să elimini un filtru sau să cauți un termen mai general. Directoriul crește pe măsură ce profilurile sunt aprobate."
                : "Profilurile apar aici după verificarea și aprobarea lor de către administrator."
            }
            action={
              hasFilters ? (
                <Link href="/cauta" className={buttonClasses("secondary")}>
                  Resetează căutarea
                </Link>
              ) : (
                <Link href="/inregistrare?tip=psiholog" className={buttonClasses("primary")}>
                  Solicită cont de psiholog
                </Link>
              )
            }
          />
        )}
      </div>
    </div>
  );
}
