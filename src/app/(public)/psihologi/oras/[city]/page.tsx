import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { listPublicPsychologists } from "@/lib/data/public";
import { getDirectoryCities, getSpecialtiesInCity } from "@/lib/directory";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, Card, EmptyState, PageHeader } from "@/components/ui";

type CityParams = Promise<{ city: string }>;

async function getCity(citySlug: string) {
  const psychologists = await listPublicPsychologists();
  const city = getDirectoryCities(psychologists).find((item) => item.slug === citySlug) ?? null;
  const specialties = city ? getSpecialtiesInCity(city) : [];
  return { city, specialties };
}

export async function generateMetadata({ params }: { params: CityParams }): Promise<Metadata> {
  const { city: citySlug } = await params;
  const { city } = await getCity(citySlug);
  if (!city) return { title: "Oraș inexistent" };

  const path = `/psihologi/oras/${city.slug}`;
  const title = `Psihologi în ${city.name} — profiluri profesionale verificate`;
  const description = `Psihologi cu profil public în ${city.name}: specializări, experiență, cabinete și consultații online. Datele profesionale sunt verificate înainte de publicare.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function CityPsychologistsPage({ params }: { params: CityParams }) {
  const { city: citySlug } = await params;
  const { city, specialties } = await getCity(citySlug);
  if (!city) notFound();

  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl(`/psihologi/oras/${city.slug}`);
  const cityPath = `/psihologi/oras/${city.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": pageUrl,
              name: `Psihologi în ${city.name}`,
              url: pageUrl,
              inLanguage: "ro-RO",
              isPartOf: { "@id": `${baseUrl}/#website` },
            },
            {
              "@type": "ItemList",
              numberOfItems: city.psychologists.length,
              itemListElement: city.psychologists.map((psychologist, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${baseUrl}/psihologi/${psychologist.slug}`,
                name: psychologist.display_name,
              })),
            },
            {
              "@type": "ProfessionalService",
              "@id": `${pageUrl}#service`,
              name: `Psihologi în ${city.name}`,
              url: pageUrl,
              areaServed: {
                "@type": "City",
                name: city.name,
                containedInPlace: { "@type": "Country", name: "România" },
              },
              parentOrganization: { "@id": `${baseUrl}/#organization` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Psihologi", item: `${baseUrl}/psihologi` },
                { "@type": "ListItem", position: 3, name: `Psihologi în ${city.name}`, item: pageUrl },
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
          <li aria-current="page" className="font-medium text-ink">
            {city.name}
          </li>
        </ol>
      </nav>

      <PageHeader
        eyebrow="Psihologi pe oraș"
        title={`Psihologi în ${city.name}`}
        description={`Profiluri profesionale publice pentru psihologi care lucrează în ${city.name}, la cabinet sau online. Datele profesionale sunt verificate înainte de publicare.`}
        action={
          <Link
            href={`/cauta?oras=${encodeURIComponent(city.name)}`}
            className={buttonClasses("secondary")}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Caută în {city.name}
          </Link>
        }
      />

      <p className="mt-6 flex items-center gap-2 text-sm text-muted" role="status">
        <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
        {city.psychologists.length}{" "}
        {city.psychologists.length === 1 ? "profil publicat" : "profiluri publicate"} în {city.name}
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {city.psychologists.map((psychologist) => (
          <PsychologistCard key={psychologist.user_id} psychologist={psychologist} />
        ))}
      </div>

      {specialties.length > 0 ? (
        <section aria-labelledby="specializari-oras" className="mt-12">
          <h2 id="specializari-oras" className="text-2xl font-semibold text-ink">
            Specializări disponibile în {city.name}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Psihologii din {city.name} acoperă următoarele arii de lucru. Poți deschide o pagină
            dedicată fiecărei specializări pentru a vedea doar profilele relevante.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <li key={specialty.slug}>
                <Link
                  href={`${cityPath}/${specialty.slug}`}
                  className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                >
                  {specialty.name} în {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 grid gap-6 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Cum alegi un psiholog în {city.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Începe cu specializarea potrivită dificultății tale, verifică experiența și modalitatea
            de lucru (la cabinet sau online) și trimite un mesaj privat pentru a stabili detaliile.
            Tariful se discută direct cu psihologul, în funcție de complexitate.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Un profil aprobat înseamnă că administratorul a verificat datele profesionale înainte de
            publicare. Pentru situații critice, apelează 112 — platforma nu oferă servicii de
            urgență.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Poți citi și{" "}
            <Link href="/resurse/cum-alegi-un-psiholog" className="font-semibold text-brand underline underline-offset-4">
              ghidul despre alegerea unui psiholog
            </Link>{" "}
            sau{" "}
            <Link href="/resurse/psiholog-online-sau-cabinet" className="font-semibold text-brand underline underline-offset-4">
              comparația dintre online și cabinet
            </Link>
            , ca să știi la ce să te uiți înainte de prima ședință.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3">
          <Link href="/psihologi" className={buttonClasses("primary")}>
            Vezi toți psihologii
          </Link>
          <Link href="/specializari" className={buttonClasses("secondary")}>
            Caută după specializare
          </Link>
          <Link href="/cabinete" className={buttonClasses("secondary")}>
            Vezi cabinetele din România
          </Link>
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
