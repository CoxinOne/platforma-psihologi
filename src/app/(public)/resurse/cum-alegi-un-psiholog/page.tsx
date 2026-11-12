import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Cum alegi un psiholog potrivit — ghid practic",
  description:
    "Ghid practic pentru alegerea unui psiholog: formare profesională, modalități de lucru, întrebări de pus înainte de prima ședință și semnele unei potriviri bune.",
  alternates: { canonical: "/resurse/cum-alegi-un-psiholog" },
  openGraph: pageOpenGraph({
    title: "Cum alegi un psiholog potrivit — ghid practic",
    description:
      "Ce verifici înainte de prima ședință: formarea profesională, modalitatea de lucru, întrebările de pus și semnele că ai găsit potrivirea.",
    path: "/resurse/cum-alegi-un-psiholog",
  }),
};

const PUBLISHED = "2026-11-12";
const MODIFIED = "2026-11-12";

export default function ChoosePsychologistPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/resurse/cum-alegi-un-psiholog");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: "Cum alegi un psiholog potrivit — ghid practic",
              description:
                "Ghid practic pentru alegerea unui psiholog: formare profesională, modalități de lucru, întrebări de pus înainte de prima ședință.",
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
                  name: "Cum alegi un psiholog",
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
            Cum alegi un psiholog
          </li>
        </ol>
      </nav>

      <article>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Ghid practic</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Cum alegi un psiholog potrivit — ghid practic
          </h1>
          <p className="mt-4 text-sm text-muted">
            Publicat de Redacția Platformă Psihologi · {PUBLISHED}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Alegerea unui psiholog nu este o loterie. Câteva criterii simple — formarea, modalitatea
            de lucru, primele semne de potrivire — te ajută să eviți drumurile lungi și să începi
            cu întrebările potrivite.
          </p>
        </header>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-ink">1. Începe cu problema, nu cu eticheta</h2>
            <p className="mt-3">
              Înainte să cauți un nume, notează pe scurt ce te aduce la psiholog: o relație, o
              perioadă de anxietate, o decizie, dificultăți legate de parenting sau o pierdere.
              Descrierea concretă a situației te ajută să alegi între specializări — de exemplu
              terapie de cuplu, consiliere individuală sau terapie pentru copii și adolescenți.
              Platforma are o pagină de{" "}
              <Link
                href="/specializari"
                className="font-semibold text-brand underline underline-offset-4"
              >
                specializări
              </Link>{" "}
              tocmai pentru această etapă.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">
              2. Verifică formarea și dreptul de practică
            </h2>
            <p className="mt-3">
              Un psiholog care lucrează în România este înregistrat la Colegiul Psihologilor din
              România și are un cod de parafă. La psihoterapeuți, formarea are loc într-o școală de
              psihoterapie recunoscută, cu supervizare. Pe platformă, profilurile publice sunt
              aprobate înainte de publicare, iar datele profesionale sunt verificate de
              administrator. Cere oricând lămuriri despre formare dacă un detaliu nu este clar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">
              3. Potrivirea contează mai mult decât „etichetă”
            </h2>
            <p className="mt-3">
              Specializarea este necesară, dar nu suficientă. Contează dacă rezonezi cu stilul
              persoanei, dacă modalitatea de lucru ți se potrivește (la cabinet sau online), dacă
              limbile în care poți lucra sunt cele în care te simți confortabil și dacă ai
              disponibilitate pentru o relație terapeutică pe termen mediu. Prima discuție te ajută
              să afli toate acestea fără angajament.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">4. Întrebări de pus înainte de prima ședință</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Cât durează o ședință și cum arată un parcurs obișnuit?</li>
              <li>Ce modalități de lucru folosești (la cabinet, online, combinate)?</li>
              <li>Cum se stabilește tariful și ce se întâmplă dacă trebuie să anulez?</li>
              <li>Ai experiență cu situația pe care o descriu — și în ce fel de abordare lucrezi?</li>
              <li>Cum se păstrează confidențialitatea și ce date sunt necesare la început?</li>
            </ul>
            <p className="mt-3">
              Platforma nu stochează date clinice și nu înlocuiește serviciile de urgență. Pentru
              situații critice, apelează 112.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">
              5. Semnele unei potriviri bune — și când să schimbi
            </h2>
            <p className="mt-3">
              O potrivire bună nu înseamnă doar că te simți ascultat, ci că înțelegi ce se
              întâmplă: primești explicații pentru metoda de lucru, obiectivele se clarifică în
              primele ședințe, iar tu poți spune deschis ce nu funcționează. Dacă după câteva
              ședințe simți că nu poți fi sincer sau că nevoile tale nu sunt luate în serios, ai
              dreptul să cauți alt psiholog — fără vină.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Următorul pas</h2>
            <p className="mt-3">
              Poți începe cu{" "}
              <Link href="/psihologi" className="font-semibold text-brand underline underline-offset-4">
                lista psihologilor verificați
              </Link>{" "}
              și cu paginile pe orașe, de exemplu{" "}
              <Link
                href="/psihologi/oras/pitesti"
                className="font-semibold text-brand underline underline-offset-4"
              >
                psihologi în Pitești
              </Link>
              . Dacă te interesează doar o singură modalitate de lucru, citește și ghidul{" "}
              <Link
                href="/resurse/psiholog-online-sau-cabinet"
                className="font-semibold text-brand underline underline-offset-4"
              >
                psiholog online sau la cabinet
              </Link>
              .
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
