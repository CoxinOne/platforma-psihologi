import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Psiholog pentru copii și adolescenți — când și cum alegi",
  description:
    "Când merită să duci copilul la psiholog, cum alegi un psiholog pentru copii și adolescenți și ce se întâmplă la prima ședință.",
  alternates: { canonical: "/resurse/psiholog-pentru-copii" },
  openGraph: pageOpenGraph({
    title: "Psiholog pentru copii și adolescenți — când și cum alegi",
    description:
      "Când merită să duci copilul la psiholog, cum alegi un psiholog pentru copii și adolescenți și ce se întâmplă la prima ședință.",
    path: "/resurse/psiholog-pentru-copii",
  }),
};

const PUBLISHED = "2026-11-13";
const MODIFIED = "2026-11-13";

export default function ChildPsychologistPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/resurse/psiholog-pentru-copii");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: "Psiholog pentru copii și adolescenți — când și cum alegi",
              description:
                "Când merită să duci copilul la psiholog, cum alegi un psiholog pentru copii și adolescenți și ce se întâmplă la prima ședință.",
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
                  name: "Psiholog pentru copii",
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
            Psiholog pentru copii
          </li>
        </ol>
      </nav>

      <article>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Ghid practic</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Psiholog pentru copii și adolescenți — când și cum alegi
          </h1>
          <p className="mt-4 text-sm text-muted">Publicat de Redacția Platformă Psihologi · {PUBLISHED}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Un copil nu are nevoie de „o problemă mare” ca să beneficieze de sprijin psihologic. Uneori
            este suficientă o schimbare care îl copleșește, o perioadă de anxietate sau o relație
            tensionată acasă sau la școală.
          </p>
        </header>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-ink">Semne că merită o evaluare</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Schimbări brusce de comportament sau de rezultate la școală.</li>
              <li>Anxietate, frici intense, refuz școlar, tulburări de somn.</li>
              <li>Retragere, iritabilitate, conflicte repetate sau bullying.</li>
              <li>Dificultăți de atenție, învățare sau relaționare cu copiii de vârsta lui.</li>
              <li>Evenimente dificile: divorț, doliu, mutare, boală în familie.</li>
            </ul>
            <p className="mt-3">
              Nu fiecare perioadă grea înseamnă tulburare. Un psiholog pentru copii poate face o
              evaluare atentă și poate spune dacă este nevoie de intervenție, de un plan educațional
              sau doar de sprijin temporar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Cum alegi un psiholog pentru copii</h2>
            <p className="mt-3">
              Contează experiența cu vârsta copilului, formarea în evaluare psihologică și felul în
              care psihologul lucrează cu părintele. Întreabă:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Cum va arăta prima ședință și cât durează?</li>
              <li>Cât de implicați vom fi părinții în proces?</li>
              <li>Se va face o evaluare standardizată sau doar consiliere?</li>
              <li>Cum se comunică rezultatele și ce se întâmplă mai departe?</li>
            </ul>
            <p className="mt-3">
              Pe platformă găsești psihologi cu profil aprobat; poți filtra în{" "}
              <Link href="/psihologi" className="font-semibold text-brand underline underline-offset-4">
                directoriu
              </Link>{" "}
              și poți citi profilurile pentru specializările de{" "}
              <Link
                href="/specializari/psihologie-copil-adolescent"
                className="font-semibold text-brand underline underline-offset-4"
              >
                psihologie pentru copii și adolescenți
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Online sau la cabinet?</h2>
            <p className="mt-3">
              Pentru copiii mici, ședințele la cabinet sunt de obicei mai potrivite, pentru că
              implică joc, materiale și prezență fizică. Pentru adolescenți, online-ul poate funcționa
              bine dacă există un spațiu privat și o conexiune stabilă. În ambele cazuri, confidențialitatea
              și limitele se stabilesc clar de la început, cu acordul părintelui și al copilului.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Ce faci dacă e o urgență</h2>
            <p className="mt-3">
              Platforma nu oferă consultații de urgență. Dacă există risc imediat pentru copil,
              apelează 112 sau adresează-te celui mai apropiat serviciu de urgență.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Următorul pas</h2>
            <p className="mt-3">
              Citește profilurile, verifică specializările și modalitatea de lucru, apoi trimite un
              mesaj privat. Vezi și ghidul{" "}
              <Link
                href="/resurse/cum-alegi-un-psiholog"
                className="font-semibold text-brand underline underline-offset-4"
              >
                cum alegi un psiholog potrivit
              </Link>{" "}
              și lista{" "}
              <Link href="/psihologi/online" className="font-semibold text-brand underline underline-offset-4">
                psihologilor online
              </Link>
              .
            </p>
          </section>
        </div>
      </article>

      <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
        Material informativ redactat de echipa platformei. Nu înlocuiește evaluarea unui specialist
        și nu constituie consult psihologic.
      </p>
    </div>
  );
}
