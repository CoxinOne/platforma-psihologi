import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { getSpecialtyBySlug, listPublicPsychologists } from "@/lib/data/public";
import {
  getCitiesForSpecialty,
  getDirectoryCities,
  getSpecialtiesInCity,
} from "@/lib/directory";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, Card, EmptyState, PageHeader } from "@/components/ui";

type ComboParams = Promise<{ city: string; specialitate: string }>;

async function getCombo(citySlug: string, specialtySlug: string) {
  const psychologists = await listPublicPsychologists();
  const city = getDirectoryCities(psychologists).find((item) => item.slug === citySlug) ?? null;
  const specialty = await getSpecialtyBySlug(specialtySlug);
  const matching =
    city?.psychologists.filter((psychologist) =>
      psychologist.specialty_slugs.includes(specialtySlug),
    ) ?? [];
  return { psychologists, city, specialty, matching };
}

export async function generateMetadata({ params }: { params: ComboParams }): Promise<Metadata> {
  const { city: citySlug, specialitate } = await params;
  const { city, specialty, matching } = await getCombo(citySlug, specialitate);
  if (!city || !specialty || matching.length === 0) return { title: "Pagină inexistentă" };

  const title = `Psihologi în ${city.name} — ${specialty.name} — profiluri verificate`;
  const description = `Psihologi cu profil public în ${city.name} pentru ${specialty.name.toLowerCase()}. Vezi experiența, modalitățile de consultație și trimite un mesaj privat.`;
  const path = `/psihologi/oras/${city.slug}/${specialty.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function CitySpecialtyPage({ params }: { params: ComboParams }) {
  const { city: citySlug, specialitate } = await params;
  const { psychologists, city, specialty, matching } = await getCombo(citySlug, specialitate);
  if (!city || !specialty || matching.length === 0) notFound();

  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl(`/psihologi/oras/${city.slug}/${specialty.slug}`);
  const cityPath = `/psihologi/oras/${city.slug}`;
  const specialtyPath = `/specializari/${specialty.slug}`;
  const otherSpecialties = getSpecialtiesInCity(city).filter((item) => item.slug !== specialty.slug);
  const otherCities = getCitiesForSpecialty(psychologists, specialty.slug).filter(
    (item) => item.slug !== city.slug,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": pageUrl,
              name: `Psihologi în ${city.name} — ${specialty.name}`,
              url: pageUrl,
              inLanguage: "ro-RO",
              isPartOf: { "@id": `${baseUrl}/#website` },
            },
            {
              "@type": "ItemList",
              numberOfItems: matching.length,
              itemListElement: matching.map((psychologist, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${baseUrl}/psihologi/${psychologist.slug}`,
                name: psychologist.display_name,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Psihologi", item: `${baseUrl}/psihologi` },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: `Psihologi în ${city.name}`,
                  item: `${baseUrl}${cityPath}`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: specialty.name,
                  item: pageUrl,
                },
              ],
            },
          ],
        }}
      />

      <nav aria-label="Firimituri" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/psihologi" className="hover:text-brand">
              Psihologi
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={cityPath} className="hover:text-brand">
              {city.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            {specialty.name}
          </li>
        </ol>
      </nav>

      <PageHeader
        eyebrow={`Psihologi în ${city.name}`}
        title={`Psihologi în ${city.name} — ${specialty.name}`}
        description={`Profiluri profesionale aprobate pentru ${specialty.name.toLowerCase()} în ${city.name}. Datele sunt verificate înainte de publicare, iar tariful se discută direct cu psihologul.`}
        action={
          <Link
            href={`/cauta?specialitate=${encodeURIComponent(specialty.slug)}&oras=${encodeURIComponent(city.name)}`}
            className={buttonClasses("secondary")}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Caută cu filtre
          </Link>
        }
      />

      <p className="mt-6 flex items-center gap-2 text-sm text-muted" role="status">
        <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
        {matching.length} {matching.length === 1 ? "profil publicat" : "profiluri publicate"} în {city.name}
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {matching.map((psychologist) => (
          <PsychologistCard key={psychologist.user_id} psychologist={psychologist} />
        ))}
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        {otherSpecialties.length > 0 ? (
          <Card>
            <h2 className="text-xl font-semibold text-ink">
              Alte specializări disponibile în {city.name}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherSpecialties.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/psihologi/oras/${city.slug}/${item.slug}`}
                    className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                  >
                    {item.name} în {city.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={cityPath}
              className="mt-5 inline-block text-sm font-semibold text-brand underline underline-offset-4"
            >
              Toți psihologii din {city.name}
            </Link>
          </Card>
        ) : null}

        {otherCities.length > 0 ? (
          <Card>
            <h2 className="text-xl font-semibold text-ink">
              {specialty.name} în alte orașe
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherCities.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/psihologi/oras/${item.slug}/${specialty.slug}`}
                    className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={specialtyPath}
              className="mt-5 inline-block text-sm font-semibold text-brand underline underline-offset-4"
            >
              Despre {specialty.name}
            </Link>
          </Card>
        ) : null}
      </section>

      <div className="mt-8">
        <EmptyState
          title="Nu găsești psihologul potrivit?"
          description="Poți lărgi căutarea la toate specializările sau la alte orașe din platformă."
          action={
            <Link href="/psihologi" className={buttonClasses("secondary")}>
              Vezi toate profilurile
            </Link>
          }
        />
      </div>
    </div>
  );
}
