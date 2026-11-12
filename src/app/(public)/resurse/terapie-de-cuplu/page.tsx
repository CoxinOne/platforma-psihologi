import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Terapie de cuplu — când are sens și cum începe",
  description:
    "Când merită terapia de cuplu, ce se întâmplă în primele ședințe, cum alegi terapeutul și ce nu înlocuiește terapia de cuplu.",
  alternates: { canonical: "/resurse/terapie-de-cuplu" },
  openGraph: pageOpenGraph({
    title: "Terapie de cuplu — când are sens și cum începe",
    description:
      "Când merită terapia de cuplu, ce se întâmplă în primele ședințe, cum alegi terapeutul și ce nu înlocuiește terapia de cuplu.",
    path: "/resurse/terapie-de-cuplu",
  }),
};

const PUBLISHED = "2026-11-13";
const MODIFIED = "2026-11-13";

export default function CoupleTherapyPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/resurse/terapie-de-cuplu");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: "Terapie de cuplu — când are sens și cum începe",
              description:
                "Când merită terapia de cuplu, ce se întâmplă în primele ședințe și cum alegi terapeutul.",
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
                { "@type": "ListItem", position: 3, name: "Terapie de cuplu", item: pageUrl },
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
            Terapie de cuplu
          </li>
        </ol>
      </nav>

      <article>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Ghid practic</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Terapie de cuplu — când are sens și cum începe
          </h1>
          <p className="mt-4 text-sm text-muted">Publicat de Redacția Platformă Psihologi · {PUBLISHED}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Terapia de cuplu nu este pentru „cuplurile care se ceartă mult”. Este pentru cuplurile
            care vor să înțeleagă ce se întâmplă între ei și să decidă în cunoștință de cauză unde
            merg relația și fiecare partener.
          </p>
        </header>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-ink">Când merită să începeți terapia de cuplu</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Aceleași conflicte se repetă și discuțiile ajung mereu în același punct.</li>
              <li>Ați pierdut intimitatea emoțională sau comunicarea a devenit funcțională.</li>
              <li>Au apărut trădări, resentimente sau tăceri care nu se mai rezolvă acasă.</li>
              <li>Sunteți într-o tranziție: mutare, copil, carieră, boală, doliu, divorț.</li>
              <li>Vreți să decideți împreună dacă relația mai poate continua și cum.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Ce se întâmplă în primele ședințe</h2>
            <p className="mt-3">
              Primul pas este o discuție despre ce vă aduce, ce ați încercat deja și ce ați vrea să
              fie diferit. Terapeutul stabilește cadrul: durata ședințelor, obiectivele, limitele
              confidențialității și ce se întâmplă dacă unul dintre parteneri nu poate continua.
              Uneori sunt ședințe individuale scurte, pentru a completa tabloul.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Cum alegi terapeutul de cuplu</h2>
            <p className="mt-3">
              Caută un psihoterapeut cu formare în terapie de cuplu sau familie, nu doar în
              consiliere individuală. Verifică:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Formarea și supervizarea în terapia de cuplu sau de familie.</li>
              <li>Experiența cu tema voastră (comunicare, infidelitate, divorț, parenting).</li>
              <li>Modalitatea: la cabinet sau online — și dacă ambele variante sunt posibile.</li>
              <li>Durata ședințelor (de regulă 60–90 de minute) și tariful.</li>
            </ul>
            <p className="mt-3">
              Pe platformă poți vedea specializările pentru{" "}
              <Link
                href="/specializari/consiliere-cuplu"
                className="font-semibold text-brand underline underline-offset-4"
              >
                consiliere pentru cuplu
              </Link>{" "}
              sau{" "}
              <Link
                href="/specializari/terapie-cuplu-imago"
                className="font-semibold text-brand underline underline-offset-4"
              >
                terapie de cuplu Imago
              </Link>
              , în funcție de ce oferă fiecare psiholog.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Ce nu înlocuiește terapia de cuplu</h2>
            <p className="mt-3">
              Terapia nu decide singură dacă rămâneți sau nu împreună și nu ține locul unui
              avocat, al unei evaluări psihologice pentru copil sau al unui serviciu de urgență.
              Pentru situații critice, apelează 112.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Următorul pas</h2>
            <p className="mt-3">
              Citește profilurile aprobate și trimite un mesaj privat pentru a verifica disponibilitatea
              și modul de lucru. Poți începe de la{" "}
              <Link href="/psihologi" className="font-semibold text-brand underline underline-offset-4">
                lista psihologilor
              </Link>{" "}
              sau de la{" "}
              <Link href="/psihologi/online" className="font-semibold text-brand underline underline-offset-4">
                psihologii online
              </Link>
              .
            </p>
          </section>
        </div>
      </article>

      <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
        Material informativ redactat de echipa platformei. Nu înlocuiește consultul unui specialist.
      </p>
    </div>
  );
}
