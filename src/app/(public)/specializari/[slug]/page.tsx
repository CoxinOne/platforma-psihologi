import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublicPsychologists, getSpecialtyBySlug } from "@/lib/data/public";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, EmptyState, PageHeader } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const specialty = await getSpecialtyBySlug(slug);
  return specialty
    ? { title: specialty.name, description: specialty.description ?? undefined }
    : { title: "Specializare inexistentă" };
}

export default async function SpecialtyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const specialty = await getSpecialtyBySlug(slug);
  if (!specialty) notFound();

  const psychologists = await listPublicPsychologists({ specialty: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Firimituri" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/specializari" className="hover:text-brand">Specializări</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">{specialty.name}</li>
        </ol>
      </nav>

      <PageHeader
        eyebrow="Specializare"
        title={specialty.name}
        description={specialty.description ?? "Profiluri aprobate pentru această specializare."}
      />

      <p className="mt-6 text-sm text-muted">
        {psychologists.length === 0
          ? "Niciun profil aprobat pentru această specializare."
          : `${psychologists.length} ${
              psychologists.length === 1 ? "profil aprobat" : "profiluri aprobate"
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
            title="Încă nu există profiluri pentru această specializare"
            description="Specializarea este disponibilă în taxonomie, dar niciun psiholog aprobat nu a selectat-o momentan."
            action={
              <Link href="/cauta" className={buttonClasses("secondary")}>
                Caută în toate specializările
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
