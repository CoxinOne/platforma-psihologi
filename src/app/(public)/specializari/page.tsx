import type { Metadata } from "next";
import Link from "next/link";
import { listSpecialties } from "@/lib/data/public";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Specializări — psihologi verificați pe arii de lucru",
  description:
    "Ariile de lucru disponibile pe platformă, cu numărul de profiluri aprobate pentru fiecare specializare: psihologie clinică, terapie de cuplu, parenting și altele.",
  alternates: { canonical: "/specializari" },
  openGraph: pageOpenGraph({
    title: "Specializări — psihologi verificați pe arii de lucru",
    description:
      "Ariile de lucru disponibile pe platformă, cu numărul de profiluri aprobate pentru fiecare specializare.",
    path: "/specializari",
  }),
};

export default async function SpecialtiesPage() {
  const specialties = await listSpecialties();
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${baseUrl}/specializari`,
              name: "Specializări",
              url: `${baseUrl}/specializari`,
              inLanguage: "ro-RO",
              isPartOf: { "@id": `${baseUrl}/#website` },
            },
            {
              "@type": "ItemList",
              numberOfItems: specialties.length,
              itemListElement: specialties.map((specialty, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: absoluteUrl(`/specializari/${specialty.slug}`),
                name: specialty.name,
              })),
            },
          ],
        }}
      />

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
