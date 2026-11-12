import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { Card, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Resurse pentru alegerea unui psiholog — ghiduri practice",
  description:
    "Ghiduri practice despre cum alegi un psiholog, cum funcționează ședințele online și ce întrebări să pui înainte de prima consultație.",
  alternates: { canonical: "/resurse" },
  openGraph: pageOpenGraph({
    title: "Resurse pentru alegerea unui psiholog — ghiduri practice",
    description:
      "Ghiduri practice despre cum alegi un psiholog și cum funcționează ședințele online.",
    path: "/resurse",
  }),
};

const ARTICLES = [
  {
    slug: "cum-alegi-un-psiholog",
    title: "Cum alegi un psiholog potrivit — ghid practic",
    description:
      "Ce verifici înainte de prima ședință: formarea profesională, modalitatea de lucru, întrebările de pus și semnele că ai găsit potrivirea.",
  },
  {
    slug: "psiholog-online-sau-cabinet",
    title: "Psiholog online sau la cabinet — cum alegi",
    description:
      "Avantajele și limitele fiecărei variante, criterii concrete de alegere și ce să pregătești pentru o ședință online.",
  },
] as const;

export default function ResourcesPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${baseUrl}/resurse`,
              name: "Resurse pentru alegerea unui psiholog",
              url: `${baseUrl}/resurse`,
              inLanguage: "ro-RO",
              isPartOf: { "@id": `${baseUrl}/#website` },
            },
            {
              "@type": "ItemList",
              numberOfItems: ARTICLES.length,
              itemListElement: ARTICLES.map((article, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: absoluteUrl(`/resurse/${article.slug}`),
                name: article.title,
              })),
            },
          ],
        }}
      />

      <nav aria-label="Firimituri" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-brand">
              Acasă
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            Resurse
          </li>
        </ol>
      </nav>

      <PageHeader
        eyebrow="Ghiduri"
        title="Resurse pentru alegerea unui psiholog"
        description="Informații practice, fără promisiuni de vindecare, ca să poți lua o decizie informată înainte de prima ședință."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {ARTICLES.map((article) => (
          <Card key={article.slug} className="flex h-full flex-col">
            <h2 className="text-xl font-semibold text-ink">
              <Link href={`/resurse/${article.slug}`} className="hover:text-brand">
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{article.description}</p>
            <Link
              href={`/resurse/${article.slug}`}
              className="mt-4 text-sm font-semibold text-brand underline underline-offset-4"
            >
              Citește ghidul
            </Link>
          </Card>
        ))}
      </div>

      <section className="mt-12 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Continuă căutarea</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          După ce ai citit ghidurile, poți trece direct la{" "}
          <Link href="/psihologi" className="font-semibold text-brand underline underline-offset-4">
            lista psihologilor verificați
          </Link>
          , la{" "}
          <Link href="/specializari" className="font-semibold text-brand underline underline-offset-4">
            specializări
          </Link>{" "}
          sau la paginile pe orașe, de exemplu{" "}
          <Link
            href="/psihologi/oras/pitesti"
            className="font-semibold text-brand underline underline-offset-4"
          >
            psihologi în Pitești
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
