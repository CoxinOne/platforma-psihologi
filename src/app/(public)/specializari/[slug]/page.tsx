import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublicPsychologists, getSpecialtyBySlug } from "@/lib/data/public";
import { getCitiesForSpecialty } from "@/lib/directory";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, Card, EmptyState, PageHeader } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const specialty = await getSpecialtyBySlug(slug);
  if (!specialty) return { title: "Specializare inexistentă" };

  const path = `/specializari/${specialty.slug}`;
  const title = `Psihologi specializați în ${specialty.name} — profiluri verificate`;
  const description =
    specialty.description ??
    `Psihologi cu profil aprobat pentru ${specialty.name}. Vezi experiența, modalitățile de consultație și trimite un mesaj privat.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
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
  const cities = getCitiesForSpecialty(psychologists, slug).sort((a, b) =>
    a.name.localeCompare(b.name, "ro"),
  );

  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl(`/specializari/${specialty.slug}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": pageUrl,
              name: `Psihologi specializați în ${specialty.name}`,
              url: pageUrl,
              inLanguage: "ro-RO",
              isPartOf: { "@id": `${baseUrl}/#website` },
            },
            ...(psychologists.length > 0
              ? [
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
                ]
              : []),
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Specializări",
                  item: `${baseUrl}/specializari`,
                },
                { "@type": "ListItem", position: 3, name: specialty.name, item: pageUrl },
              ],
            },
          ],
        }}
      />

      <nav aria-label="Firimituri" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/specializari" className="hover:text-brand">
              Specializări
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            {specialty.name}
          </li>
        </ol>
      </nav>

      <PageHeader
        eyebrow="Specializare"
        title={specialty.name}
        description={
          specialty.description ??
          "Profiluri aprobate pentru această specializare, cu date profesionale verificate."
        }
      />

      <p className="mt-6 text-sm text-muted">
        {psychologists.length === 0
          ? "Niciun profil aprobat pentru această specializare momentan."
          : `${psychologists.length} ${
              psychologists.length === 1 ? "profil aprobat" : "profiluri aprobate"
            } pentru această specializare.`}
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

      {cities.length > 0 ? (
        <section aria-labelledby="specializare-orase" className="mt-12">
          <h2 id="specializare-orase" className="text-2xl font-semibold text-ink">
            Orașe cu psihologi specializați în {specialty.name}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Alege orașul în care cauți un psiholog specializat în {specialty.name}, la cabinet sau
            online.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/psihologi/oras/${city.slug}/${specialty.slug}`}
                  className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                >
                  Psihologi în {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-ink">Cum folosești această specializare</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Citește profilurile aprobate, verifică dacă modalitatea de lucru (cabinet sau online) ți
            se potrivește și trimite un mesaj privat psihologului ales. Tariful se discută direct,
            în funcție de complexitatea situației.
          </p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-ink">Nu ești sigur de specializare?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Ghidul despre{" "}
            <Link
              href="/resurse/cum-alegi-un-psiholog"
              className="font-semibold text-brand underline underline-offset-4"
            >
              alegerea unui psiholog
            </Link>{" "}
            explică ce întrebări să pui înainte de prima ședință. Poți citi și{" "}
            <Link
              href="/resurse/psiholog-online-sau-cabinet"
              className="font-semibold text-brand underline underline-offset-4"
            >
              diferențele dintre online și cabinet
            </Link>
            .
          </p>
        </Card>
      </section>
    </div>
  );
}
