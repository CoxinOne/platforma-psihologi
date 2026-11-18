import type { Metadata } from "next";
import Link from "next/link";
import { FileText, UserRound } from "lucide-react";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";

const PUBLISHED = "2026-11-18";
const MODIFIED = "2026-11-18";
const PDF_PATH = "/lucrari/de-la-co-reglare-la-autoreglare-sima-narcis.pdf";
const TITLE =
  "De la co-reglare la autoreglare: rolul specialiștilor în dezvoltarea capacității de reglare emoțională a copilului";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Lucrare de specialitate despre reglarea emoțională la copii: co-reglare, autoreglare, strategii adaptate vârstei, rolul adultului și intervenția în criză. Autor: Sima Narcis Constantin.",
  alternates: { canonical: "/resurse/de-la-co-reglare-la-autoreglare" },
  openGraph: pageOpenGraph({
    title: TITLE,
    description:
      "Cum învață copiii să își gestioneze emoțiile: mecanisme, dezvoltare și recomandări bazate pe cercetare.",
    path: "/resurse/de-la-co-reglare-la-autoreglare",
  }),
};

export default function CoRegulationPaperPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/resurse/de-la-co-reglare-la-autoreglare");
  const profileUrl = absoluteUrl("/psihologi/sima-narcis-constantin");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: TITLE,
              description:
                "Lucrare de specialitate despre reglarea emoțională la copii, co-reglare, autoreglare și rolul specialiștilor.",
              datePublished: PUBLISHED,
              dateModified: MODIFIED,
              inLanguage: "ro-RO",
              mainEntityOfPage: pageUrl,
              image: `${baseUrl}/og-image.jpg`,
              author: {
                "@type": "Person",
                name: "Sima Narcis Constantin",
                jobTitle: "Psiholog clinician principal",
                url: profileUrl,
              },
              publisher: { "@id": `${baseUrl}/#organization` },
              about: ["reglare emoțională", "co-reglare", "autoreglare", "copii", "parenting"],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Resurse", item: `${baseUrl}/resurse` },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Reglare emoțională la copii",
                  item: pageUrl,
                },
              ],
            },
          ],
        }}
      />

      <nav aria-label="Firimituri" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/resurse" className="hover:text-brand">Resurse</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">Reglare emoțională la copii</li>
        </ol>
      </nav>

      <article>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Lucrare de specialitate
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {TITLE}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            Cum învață copiii să își gestioneze emoțiile: mecanisme, dezvoltare și recomandări
            bazate pe cercetare.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand" aria-hidden="true" />
              <Link href="/psihologi/sima-narcis-constantin" className="font-semibold text-ink hover:text-brand">
                Sima Narcis Constantin
              </Link>
            </span>
            <span>Psiholog clinician principal</span>
            <span>·</span>
            <span>Publicat {PUBLISHED}</span>
          </div>
        </header>

        <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-ink">Despre lucrare</h2>
            <p className="mt-3">
              Lucrarea explică modul în care copilul trece de la co-reglare — sprijinul oferit de
              adult — la autoreglare, adică la capacitatea de a-și recunoaște emoțiile, de a le
              gestiona intensitatea și de a alege o reacție potrivită situației. Accentul nu este
              pe „calmarea” copilului cu orice preț, ci pe dezvoltarea flexibilității emoționale.
            </p>
            <p className="mt-3">
              Materialul are la bază o prezentare de 17 slide-uri și este destinat psihologilor,
              părinților și specialiștilor care lucrează cu copii. Poate fi descărcat integral în
              format PDF.
            </p>
            <div className="mt-5 rounded-2xl border border-brand-line bg-brand-soft/40 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-ink">Prezentarea completă, 17 slide-uri</p>
                  <p className="mt-1 text-xs text-muted">PDF · 463 KB · autor Sima Narcis Constantin</p>
                </div>
              </div>
              <a
                href={PDF_PATH}
                download
                className="mt-3 inline-flex shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-cream hover:bg-brand-strong sm:mt-0"
              >
                Descarcă PDF
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">1. De ce contează reglarea emoțională</h2>
            <p className="mt-3">
              Copilul învață să recunoască ce simte, să exprime emoțiile fără să îi rănească pe
              ceilalți, să aștepte, să oprească o reacție impulsivă și să încerce altă soluție când
              prima nu funcționează. Aceste abilități susțin relațiile, învățarea și rezolvarea
              conflictelor. Când strategiile încă nu sunt formate, pot apărea izbucniri, retragere,
              îngrijorare sau dificultăți de concentrare — fără ca acestea să însemne automat o
              tulburare.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">2. Reglare, co-reglare, autoreglare</h2>
            <p className="mt-3">
              Reglarea emoțională este procesul prin care influențăm emoțiile, intensitatea și
              durata lor. Co-reglarea apare în relația dintre adult și copil: adultul observă,
              adaptează tonul, ritmul și apropierea, iar răspunsul copilului arată dacă ajutorul
              este potrivit. Autoreglarea este capacitatea, în dezvoltare, de a recunoaște emoțiile
              și de a alege reacții potrivite, cerând ajutor atunci când este nevoie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">3. Cum alegem strategia potrivită</h2>
            <p className="mt-3">
              Nu există o strategie universală. Observăm starea copilului, contextul și ce s-a
              întâmplat înainte; stabilim obiectivul (reducerea activării, exprimarea unei nevoi,
              tolerarea așteptării sau rezolvarea unei probleme); apoi testăm și ajustăm. Exercițiile
              de respirație și contactul fizic nu ajută la fel pentru toți copiii.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">4. Cum se învață o strategie</h2>
            <p className="mt-3">
              Secvența utilă este: modelare — adultul arată ce face când se enervează; exersare
              ghidată — strategia se repetă în joc sau în frustrări mici; autonomie progresivă —
              adultul trece de la explicație la un semn discret, apoi la observare. Tehnicile noi nu
              se introduc în vârful crizei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">5. Rolul specialiștilor și al familiei</h2>
            <p className="mt-3">
              Copilul învață din felul în care adulții își gestionează propriile emoții, din modul
              în care îi sunt primite emoțiile și din climatul familiei. Somnul, stresul, conflictele
              dintre adulți și sprijinul disponibil pentru părinți influențează interacțiunile
              zilnice. Un specialist atent observă, adaptează răspunsul și verifică dacă ajutorul
              funcționează.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">6. Atașamentul și baza de siguranță</h2>
            <p className="mt-3">
              Când se simte în siguranță, copilul poate explora și poate reveni la adult dacă apare
              o dificultate. Sensibilitatea parentală nu înseamnă perfecțiune, ci capacitatea de a
              observa, de a răspunde și de a repara relația după o greșeală. Un singur episod nu
              stabilește un tip de atașament.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">7. Ce facem într-o criză</h2>
            <p className="mt-3">
              Prioritară este siguranța: reducem stimulii, vorbim puțin și calm, nu forțăm contactul
              fizic dacă dezorganizează copilul. Recunoaștem emoția și păstrăm limita
              („Ești furios, dar nu te las să lovești”). Discuția și exersarea alternativelor au loc
              după calmare, nu în vârful crizei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-ink">Concluzie</h2>
            <p className="mt-3">
              Ținta dezvoltării emoționale este flexibilitatea, nu calmul permanent. Copilul are
              nevoie de siguranță, de un adult care își asumă propria reglare și de experiențe
              repetate în care învață că emoțiile dificile pot fi tolerate. Prezentarea completă,
              cu bibliografia aferentă, este disponibilă mai sus în format PDF.
            </p>
          </section>

          <p className="rounded-xl border border-line bg-surface p-4 text-xs leading-relaxed text-muted">
            Material educativ. Nu înlocuiește evaluarea sau intervenția unui specialist și nu oferă
            sfaturi medicale individuale. Pentru situații de risc imediat, apelați serviciile de
            urgență.
          </p>
        </div>
      </article>
    </div>
  );
}
