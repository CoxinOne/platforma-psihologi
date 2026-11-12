import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { listPublicPsychologists } from "@/lib/data/public";
import { slugify } from "@/lib/utils";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Psihologi în România — directoriu de profiluri verificate",
  description:
    "Lista profilurilor profesionale aprobate pe platformă, cu specializări, limbi vorbite și tipuri de consultație.",
  alternates: { canonical: "/psihologi" },
};

export default async function PsychologistsPage() {
  const psychologists = await listPublicPsychologists();
  const cities = Array.from(
    new Map(
      psychologists
        .flatMap((psychologist) => psychologist.cabinet_cities)
        .map((city) => [slugify(city), city] as const),
    ).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1], "ro"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Directoriu"
        title="Psihologi în România"
        description="Profilurile de mai jos au fost aprobate de administrator."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/cauta" className={buttonClasses("secondary")}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Caută cu filtre
            </Link>
            <Link href="/psihologi/online" className={buttonClasses("secondary")}>
              Psihologi online
            </Link>
          </div>
        }
      />

      <p className="mt-6 text-sm text-muted" role="status">
        {psychologists.length === 0
          ? "Niciun profil publicat momentan."
          : `${psychologists.length} ${
              psychologists.length === 1 ? "profil publicat" : "profiluri publicate"
            }.`}
      </p>

      <div className="mt-8">
        {psychologists.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {psychologists.map((psychologist) => (
              <PsychologistCard key={psychologist.user_id} psychologist={psychologist} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Directoriul este în pregătire"
            description="Profilurile devin publice după verificarea calificărilor. Revino în curând sau creează un cont pentru a fi notificat la publicarea unui profil."
            action={
              <Link href="/inregistrare" className={buttonClasses("primary")}>
                Creează cont
              </Link>
            }
          />
        )}
      </div>

      {cities.length > 0 ? (
        <section aria-labelledby="orase" className="mt-10 rounded-2xl border border-line bg-surface p-5">
          <h2 id="orase" className="flex items-center gap-2 text-lg font-semibold text-ink">
            <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
            Psihologi pe orașe
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {cities.map(([slug, city]) => (
              <li key={slug}>
                <Link
                  href={`/psihologi/oras/${slug}`}
                  className="inline-flex rounded-full border border-brand-line bg-canvas px-3 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                >
                  Psihologi în {city}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
        <p className="font-semibold text-ink">Despre insigna „Verificat”</p>
        <p className="mt-1">
          Insigna apare doar după ce administratorul a verificat studiile și calificările declarate.
          Absența insignei înseamnă că verificarea nu a fost finalizată.
        </p>
      </div>
    </div>
  );
}
