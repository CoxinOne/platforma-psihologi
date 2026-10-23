import type { Metadata } from "next";
import Link from "next/link";
import { listSpecialties } from "@/lib/data/public";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Specializări",
  description:
    "Ariile de lucru disponibile pe platformă, cu numărul de profiluri aprobate pentru fiecare specializare.",
};

export default async function SpecialtiesPage() {
  const specialties = await listSpecialties();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Arii de lucru"
        title="Specializări"
        description="Denumirile sunt administrate central. Selectează o specializare pentru a vedea profilurile aprobate."
      />

      {specialties.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((specialty) => (
            <li key={specialty.slug}>
              <Card className="flex h-full flex-col">
                <h2 className="text-lg font-semibold text-ink">
                  <Link href={`/specializari/${specialty.slug}`} className="hover:text-brand">
                    {specialty.name}
                  </Link>
                </h2>
                {specialty.description ? (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{specialty.description}</p>
                ) : (
                  <div className="flex-1" />
                )}
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                  {specialty.psychologist_count === 0
                    ? "În curs de completare"
                    : `${specialty.psychologist_count} ${
                        specialty.psychologist_count === 1 ? "profil aprobat" : "profiluri aprobate"
                      }`}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Specializările nu au putut fi încărcate"
            description="Verifică conexiunea la baza de date sau revino mai târziu."
          />
        </div>
      )}
    </div>
  );
}
