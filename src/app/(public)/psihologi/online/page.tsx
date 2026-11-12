import type { Metadata } from "next";
import Link from "next/link";
import { Monitor, Search } from "lucide-react";
import { listPublicPsychologists } from "@/lib/data/public";
import { getDirectoryCities, getDirectorySpecialties } from "@/lib/directory";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Psihologi online în România — ședințe online cu psihologi verificați",
  description:
    "Psihologi verificați care oferă ședințe online: consiliere psihologică, psihoterapie de cuplu și familie, evaluări și terapie pentru copii. Vezi profilurile și trimite un mesaj privat.",
  alternates: { canonical: "/psihologi/online" },
  openGraph: pageOpenGraph({
    title: "Psihologi online în România — ședințe online cu psihologi verificați",
    description:
      "Psihologi verificați care oferă ședințe online: consiliere, psihoterapie de cuplu și familie, evaluări și terapie pentru copii.",
    path: "/psihologi/online",
  }),
};

export default async function OnlinePsychologistsPage() {
  const psychologists = await listPublicPsychologists({ mode: "online" });
  const cities = getDirectoryCities(psychologists).sort((a, b) => a.name.localeCompare(b.name, "ro"));
  const specialties = getDirectorySpecialties(psychologists).slice(0, 12);
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/psihologi/online");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": pageUrl,
              name: "Psihologi online în România",
              url: pageUrl,
              inLanguage: "ro-RO",
              isPartOf: { "@id": `${baseUrl}/#website` },
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
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Psihologi", item: `${baseUrl}/psihologi` },
                { "@type": "ListItem", position: 3, name: "Psihologi online", item: pageUrl },
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
            Online
          </li>
        </ol>
      </nav>

      <PageHeader
        eyebrow="Ședințe la distanță"
        title="Psihologi online în România"
        description="Psihologi cu profil aprobat care oferă ședințe online. Consiliere și psihoterapie de la distanță, cu aceleași reguli de confidențialitate ca la cabinet."
        action={
          <Link href="/cauta?mod=online" className={buttonClasses("secondary")}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Caută cu filtre
          </Link>
        }
      />

      <p className="mt-6 flex items-center gap-2 text-sm text-muted" role="status">
        <Monitor className="h-4 w-4 text-brand" aria-hidden="true" />
        {psychologists.length}{" "}
        {psychologists.length === 1 ? "profil cu ședințe online" : "profiluri cu ședințe online"}.
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
            title="Momentan nu există profiluri cu ședințe online"
            description="Directoriul se completează pe măsură ce psihologii își publică profilurile."
            action={
              <Link href="/psihologi" className={buttonClasses("primary")}>
                Vezi toți psihologii
              </Link>
            }
          />
        )}
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold text-ink">Cum alegi un psiholog online</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>Verifică specializarea potrivită situației tale și modalitatea online în profil.</li>
            <li>Asigură-te că ai un spațiu privat și o conexiune stabilă pentru ședință.</li>
            <li>Stabilește din start durata, tariful și politica de anulare.</li>
            <li>Trimite un mesaj privat și clarifică detaliile înainte de prima ședință.</li>
          </ul>
          <p className="mt-4 text-sm text-muted">
            Citește ghidul{" "}
            <Link
              href="/resurse/psiholog-online-sau-cabinet"
              className="font-semibold text-brand underline underline-offset-4"
            >
              psiholog online sau la cabinet
            </Link>{" "}
            pentru diferențele dintre cele două variante.
          </p>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold text-ink">Psihologi online pe orașe și specializări</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Mulți dintre psihologii cu ședințe online lucrează și la cabinet în orașul lor. Poți
            filtra după oraș sau specializare.
          </p>
          {cities.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/psihologi/oras/${city.slug}`}
                    className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                  >
                    Psihologi în {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {specialties.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <li key={specialty.slug}>
                  <Link
                    href={`/specializari/${specialty.slug}`}
                    className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                  >
                    {specialty.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </section>

      <div className="mt-8">
        <EmptyState
          title="Nu găsești psihologul potrivit?"
          description="Poți vedea toate profilurile aprobate sau căuta după specializare, oraș și limbă."
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
