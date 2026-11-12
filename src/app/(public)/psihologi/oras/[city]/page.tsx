import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { listPublicPsychologists } from "@/lib/data/public";
import { publicEnv } from "@/lib/public-env";
import { slugify } from "@/lib/utils";
import { JsonLd } from "@/components/json-ld";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, EmptyState, PageHeader } from "@/components/ui";

type CityParams = Promise<{ city: string }>;

async function getCity(citySlug: string) {
  const psychologists = await listPublicPsychologists();
  const matching = psychologists.filter((psychologist) =>
    psychologist.cabinet_cities.some((city) => slugify(city) === citySlug),
  );
  const cityName =
    matching
      .flatMap((psychologist) => psychologist.cabinet_cities)
      .find((city) => slugify(city) === citySlug) ?? null;
  return { psychologists: matching, cityName };
}

export async function generateMetadata({ params }: { params: CityParams }): Promise<Metadata> {
  const { city } = await params;
  const { psychologists, cityName } = await getCity(city);
  if (!cityName || psychologists.length === 0) return { title: "Oraș inexistent" };

  return {
    title: `Psihologi în ${cityName} — profiluri profesionale verificate`,
    description: `Psihologi cu profil public în ${cityName}. Vezi specializările, experiența, cabinetele și trimite un mesaj privat.`,
    alternates: { canonical: `/psihologi/oras/${city}` },
    openGraph: {
      title: `Psihologi în ${cityName}`,
      description: `Profiluri profesionale de psihologi în ${cityName}, cu date verificate înainte de publicare.`,
      type: "website",
    },
  };
}

export default async function CityPsychologistsPage({ params }: { params: CityParams }) {
  const { city } = await params;
  const { psychologists, cityName } = await getCity(city);
  if (!cityName || psychologists.length === 0) notFound();

  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = `${baseUrl}/psihologi/oras/${city}`;
  const cityLabel = cityName as string;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": pageUrl,
              name: `Psihologi în ${cityLabel}`,
              url: pageUrl,
              inLanguage: "ro-RO",
            },
            {
              "@type": "ItemList",
              numberOfItems: psychologists.length,
              itemListElement: psychologists.map((psychologist, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${baseUrl}/psihologi/${psychologist.slug}`,
                name: psychologist.display_name,
              })),
            },
          ],
        }}
      />

      <PageHeader
        eyebrow="Psihologi pe oraș"
        title={`Psihologi în ${cityLabel}`}
        description={`Profiluri profesionale publice pentru psihologi care lucrează în ${cityLabel}. Datele profesionale sunt verificate înainte de publicare.`}
        action={
          <Link href={`/cauta?oras=${encodeURIComponent(cityLabel)}`} className={buttonClasses("secondary")}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Caută în {cityLabel}
          </Link>
        }
      />

      <p className="mt-6 flex items-center gap-2 text-sm text-muted" role="status">
        <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
        {psychologists.length} {psychologists.length === 1 ? "profil publicat" : "profiluri publicate"} în{" "}
        {cityLabel}
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {psychologists.map((psychologist) => (
          <PsychologistCard key={psychologist.user_id} psychologist={psychologist} />
        ))}
      </div>

      <section className="mt-12 grid gap-6 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Cum alegi un psiholog în {cityLabel}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Începe cu specializarea potrivită dificultății tale, verifică experiența și modalitatea
            de lucru (la cabinet sau online) și trimite un mesaj privat pentru a stabili detaliile.
            Tariful se discută direct cu psihologul, în funcție de complexitate.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3">
          <Link href="/psihologi" className={buttonClasses("primary")}>
            Vezi toți psihologii
          </Link>
          <Link href="/specializari" className={buttonClasses("secondary")}>
            Caută după specializare
          </Link>
          <p className="text-xs leading-relaxed text-muted">
            Platforma nu oferă servicii de urgență. Pentru situații critice, apelează 112.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <EmptyState
          title="Nu găsești profilul potrivit?"
          description="Poți folosi căutarea cu filtre după specializare, limbă și modalitate de consultație."
          action={
            <Link href="/cauta" className={buttonClasses("secondary")}>
              Deschide căutarea
            </Link>
          }
        />
      </div>
    </div>
  );
}
