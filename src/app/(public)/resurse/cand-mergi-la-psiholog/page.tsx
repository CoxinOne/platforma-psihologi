import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Când să mergi la psiholog — semne că e momentul",
  description:
    "Semne că ar fi util să vorbești cu un psiholog, diferența dintre o perioadă grea și o tulburare, cum alegi specializarea și ce se întâmplă la prima ședință.",
  alternates: { canonical: "/resurse/cand-mergi-la-psiholog" },
  openGraph: pageOpenGraph({
    title: "Când să mergi la psiholog — semne că e momentul",
    description:
      "Semne că ar fi util să vorbești cu un psiholog, diferența dintre o perioadă grea și o tulburare și cum alegi specializarea.",
    path: "/resurse/cand-mergi-la-psiholog",
  }),
};

const PUBLISHED = "2026-11-13";
const MODIFIED = "2026-11-13";

export default function WhenToSeePsychologistPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/resurse/cand-mergi-la-psiholog");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: "Când să mergi la psiholog — semne că e momentul",
              description:
                "Semne că ar fi util să vorbești cu un psiholog și cum alegi specializarea potrivită.",
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
                  name: "Când să mergi la psiholog",
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
            Când să mergi la psiholog
          </li>
        </ol>
      </nav>

      <article>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Ghid practic</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Când să mergi la psiholog — semne că e momentul
          </h1>
          <p className="mt-4 text-sm text-muted">Publicat de Redacția Platformă Psihologi · {PUBLISHED}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Nu trebuie să fii „la capătul puterilor” ca să ceri ajutor. Un psiholog poate fi util
            și înainte ca o dificultate să devină criză — la fel cum mergi la medic înainte ca un
            simptom să se agraveze.
          </p>
        </header>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-ink">Semne că ar fi util un psiholog</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Te simți copleșit de anxietate, tristețe sau iritabilitate mai multe săptămâni.</li>
              <li>Dormi prost, ai modificări de apetit sau oboseală constantă fără explicație medicală.</li>
              <li>Eviti locuri, oameni sau situații care înainte nu te deranjau.</li>
              <li>Relațiile apropiate devin tensionate sau te izolezi tot mai mult.</li>
              <li>Ai evenimente dificile: doliu, divorț, concediere, boală, mutare.</li>
              <li>Îți pui mereu aceleași întrebări despre tine și nu reușești să iei o decizie.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">
              Perioadă grea sau tulburare? De ce contează nuanța
            </h2>
            <p className="mt-3">
              O perioadă grea este legată de un context și de obicei se ameliorează cu sprijin,
              odihnă și timp. O tulburare are simptome care durează, se agravează și afectează viața
              de zi cu zi. Psihologul clinician poate face o evaluare și poate recomanda intervenția
              potrivită — fără să pună etichete gratuite și fără să promită vindecări minune.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Cum alegi specializarea</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Anxietate, depresie, traumă — psihoterapie individuală (CBT, EMDR, alte abordări).</li>
              <li>Relația de cuplu — consiliere sau terapie de cuplu.</li>
              <li>Copii și adolescenți — psihologie pentru copii, evaluare și consiliere parentală.</li>
              <li>Evaluări și rapoarte — psiholog clinician cu experiență în evaluare.</li>
            </ul>
            <p className="mt-3">
              Poți explora{" "}
              <Link href="/specializari" className="font-semibold text-brand underline underline-offset-4">
                specializările
              </Link>{" "}
              disponibile pe platformă sau căuta direct în{" "}
              <Link href="/psihologi" className="font-semibold text-brand underline underline-offset-4">
                directoriu
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Ce se întâmplă la prima ședință</h2>
            <p className="mt-3">
              Vorbești despre ce te aduce, cât timp crezi că e nevoie, iar psihologul îți explică
              cum lucrează, cât durează ședințele și ce obiective se pot stabili. Poți întreba orice:
              despre confidențialitate, metodă, tarif, anulări. Dacă simți că nu se potrivește, poți
              alege alt psiholog fără să te simți vinovat.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Dacă este o urgență</h2>
            <p className="mt-3">
              Platforma nu oferă consultații de urgență. Pentru situații critice, apeluri la 112 sau
              adresează-te celui mai apropiat serviciu de urgență.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Următorul pas</h2>
            <p className="mt-3">
              Citește{" "}
              <Link href="/resurse/cum-alegi-un-psiholog" className="font-semibold text-brand underline underline-offset-4">
                ghidul despre alegerea unui psiholog
              </Link>{" "}
              și{" "}
              <Link
                href="/resurse/psiholog-online-sau-cabinet"
                className="font-semibold text-brand underline underline-offset-4"
              >
                diferențele dintre online și cabinet
              </Link>
              , apoi trimite un mesaj privat psihologului ales.
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
