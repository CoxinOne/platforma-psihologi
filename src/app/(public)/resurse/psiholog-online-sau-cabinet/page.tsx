import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Psiholog online sau la cabinet — cum alegi",
  description:
    "Comparație practică între ședințele online și cele la cabinet: avantaje, limite, criterii de alegere și ce să pregătești pentru prima ședință.",
  alternates: { canonical: "/resurse/psiholog-online-sau-cabinet" },
  openGraph: pageOpenGraph({
    title: "Psiholog online sau la cabinet — cum alegi",
    description:
      "Avantajele și limitele fiecărei variante, criterii concrete de alegere și ce să pregătești pentru o ședință online.",
    path: "/resurse/psiholog-online-sau-cabinet",
  }),
};

const PUBLISHED = "2026-11-12";
const MODIFIED = "2026-11-12";

export default function OnlineOrOfficePage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/resurse/psiholog-online-sau-cabinet");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: "Psiholog online sau la cabinet — cum alegi",
              description:
                "Comparație practică între ședințele online și cele la cabinet: avantaje, limite și criterii de alegere.",
              datePublished: PUBLISHED,
              dateModified: MODIFIED,
              inLanguage: "ro-RO",
              mainEntityOfPage: pageUrl,
              image: `${baseUrl}/og-image.jpg`,
              author: { "@id": `${baseUrl}/#organization` },
              publisher: { "@id": `${baseUrl}/#organization` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Resurse", item: `${baseUrl}/resurse` },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Psiholog online sau la cabinet",
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
            <Link href="/resurse" className="hover:text-brand">
              Resurse
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            Online sau la cabinet
          </li>
        </ol>
      </nav>

      <article>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Ghid practic</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Psiholog online sau la cabinet — cum alegi
          </h1>
          <p className="mt-4 text-sm text-muted">Publicat de Redacția Platformă Psihologi · {PUBLISHED}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Ambele variante funcționează; alegerea depinde de situația ta, de logistica zilei și de
            felul în care te simți lucrând cu un ecran între tine și psiholog.
          </p>
        </header>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-ink">Când ședințele online sunt o alegere bună</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Nu ai un psiholog cu specializarea potrivită în orașul tău.</li>
              <li>Ai un program încărcat sau locuiești în altă localitate decât cabinetul.</li>
              <li>Te simți mai confortabil să vorbești dintr-un spațiu familiar.</li>
              <li>Ai nevoie de continuitate în perioade în care călătorești.</li>
            </ul>
            <p className="mt-3">
              Online-ul cere însă un spațiu privat, o conexiune stabilă și o cameră funcțională.
              Este util să stabilești din start cum se desfășoară ședința și ce se întâmplă dacă
              conexiunea cade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Când cabinetul rămâne preferabil</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Lucrezi cu copii mici sau ai nevoie de prezență fizică și materiale.</li>
              <li>Terapia de cuplu sau de familie cere un cadru neutru, fără distrageri casnice.</li>
              <li>Preferi un ritm clar de deplasare care marchează începutul și sfârșitul ședinței.</li>
              <li>Situația ta cere evaluări care se fac la cabinet.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Criterii concrete de alegere</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                <strong className="text-ink">Specializarea</strong> — verifică dacă psihologul
                lucrează exact cu problema ta, nu doar cu o temă apropiată.
              </li>
              <li>
                <strong className="text-ink">Formarea</strong> — înregistrare la Colegiul
                Psihologilor din România, formare în psihoterapie și supervizare.
              </li>
              <li>
                <strong className="text-ink">Modalitatea</strong> — alege ce poți susține constant,
                nu doar ce pare mai comod o singură dată.
              </li>
              <li>
                <strong className="text-ink">Logistica</strong> — distanța, programul, tariful și
                politica de anulare.
              </li>
              <li>
                <strong className="text-ink">Prima impresie</strong> — claritate, limite sănătoase
                și respect pentru ritmul tău.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Ce pregătești pentru o ședință online</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Un spațiu în care nu ești întrerupt și în care poți vorbi liber.</li>
              <li>Căști, pentru confidențialitate și pentru a evita ecoul.</li>
              <li>Telefonul pe silențios și notificările oprite.</li>
              <li>Un plan pentru situația în care conexiunea nu funcționează.</li>
            </ul>
            <p className="mt-3">
              Platforma afișează pe fiecare profil modalitățile de consultație disponibile. Poți
              filtra direct în{" "}
              <Link
                href="/cauta?mod=online"
                className="font-semibold text-brand underline underline-offset-4"
              >
                căutarea de psihologi online
              </Link>{" "}
              sau poți citi{" "}
              <Link
                href="/resurse/cum-alegi-un-psiholog"
                className="font-semibold text-brand underline underline-offset-4"
              >
                ghidul despre alegerea unui psiholog
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Un detaliu important</h2>
            <p className="mt-3">
              Online nu înseamnă mai puțin riguros. Contează aceeași pregătire, aceeași
              confidențialitate și același cadru clar. Dacă nu ești sigur, discută întâi cu
              psihologul despre cum lucrează și decide după primele două ședințe.
            </p>
          </section>
        </div>
      </article>

      <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
        Material informativ redactat de echipa platformei. Nu înlocuiește recomandarea unui
        specialist și nu constituie consult psihologic.
      </p>
    </div>
  );
}
