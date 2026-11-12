import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Întrebări frecvente despre psihologi și ședințe",
  description:
    "Răspunsuri clare despre verificarea psihologilor, costul ședințelor, diferența dintre online și cabinet, durata ședinței și modul de contact prin platformă.",
  alternates: { canonical: "/intrebari-frecvente" },
  openGraph: pageOpenGraph({
    title: "Întrebări frecvente despre psihologi și ședințe",
    description:
      "Răspunsuri despre verificarea psihologilor, costul ședințelor, online vs cabinet, durata ședinței și contact.",
    path: "/intrebari-frecvente",
  }),
};

const FAQ = [
  {
    question: "Cum verific dacă un psiholog este autorizat?",
    answer:
      "În România, psihologii cu drept de liberă practică sunt înregistrați la Colegiul Psihologilor din România și au un cod de parafă. Pe platformă, profilurile publice sunt aprobate de administrator înainte de publicare, iar datele profesionale declarate sunt verificate. Poți cere oricând lămuriri despre formare înainte de prima ședință.",
  },
  {
    question: "Ce înseamnă un profil aprobat pe platformă?",
    answer:
      "Înseamnă că administratorul a verificat datele profesionale înainte ca profilul să devină public: titlul profesional, studiile, specializările, cabinetele și datele de contact. Insigna „Calificări verificate” apare doar după această etapă.",
  },
  {
    question: "Cât costă o ședință?",
    answer:
      "Platforma nu afișează tarife fixe și nu procesează plăți. Tariful se discută direct cu psihologul, în funcție de durata ședinței și de complexitatea situației. Cere clarificări despre tarif și politica de anulare înainte de prima întâlnire.",
  },
  {
    question: "Merită o ședință online sau la cabinet?",
    answer:
      "Ambele variante sunt valide. Online-ul ajută când nu există un psiholog potrivit în orașul tău, când ai un program încărcat sau când te simți mai confortabil acasă. Cabinetul rămâne potrivit pentru lucrul cu copii mici, terapie de cuplu sau evaluări care cer prezență fizică.",
  },
  {
    question: "Cât durează o ședință de psihoterapie?",
    answer:
      "Durata variază în funcție de tipul ședinței: de obicei 50–60 de minute pentru consiliere individuală și 60–90 de minute pentru evaluări psihologice sau ședințe de cuplu/familie. Fiecare psiholog își afișează durata pe profil, iar detaliile se confirmă înainte de programare.",
  },
  {
    question: "Cum trimit un mesaj unui psiholog?",
    answer:
      "Deschizi profilul psihologului și folosești butonul de mesaj sau WhatsApp, dacă numărul este public. Platforma păstrează conversațiile private între tine și psiholog; administratorul nu are acces la conținutul mesajelor.",
  },
  {
    question: "Platforma oferă consultații de urgență?",
    answer:
      "Nu. Platforma este un director de profiluri și un canal de mesagerie, nu un serviciu de urgență. Pentru situații critice, apeluri la 112 sau linia de urgență psihiatrică la nivel național.",
  },
  {
    question: "Ce date sunt publice pe profilul unui psiholog?",
    answer:
      "Sunt publice datele profesionale: numele, titlul, biografia, studiile, experiența, specializările, limbile, modalitățile de consultație, durata ședinței, serviciile și adresa cabinetului. Emailul și telefonul personal ale contului nu sunt afișate public; rămâne public doar telefonul cabinetului, dacă psihologul îl completează.",
  },
  {
    question: "Pot schimba psihologul dacă nu simt că se potrivește?",
    answer:
      "Da. Este dreptul tău să alegi alt psiholog dacă după primele ședințe simți că nu poți fi sincer sau că nevoile tale nu sunt luate în serios. Încearcă să discuți deschis, iar dacă nu se rezolvă, caută alt profil fără vină.",
  },
  {
    question: "Cum devin psiholog pe platformă?",
    answer:
      "Conturile profesionale se acordă de administrator, în limita unui număr de 12 conturi. Îți creezi un cont public de client, administratorul îl promovează în cont de psiholog, apoi îți completezi profilul profesional din cabinet și îl trimiți spre aprobare.",
  },
];

export default function FaqPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/intrebari-frecvente");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          url: pageUrl,
          inLanguage: "ro-RO",
          isPartOf: { "@id": `${baseUrl}/#website` },
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
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
            Întrebări frecvente
          </li>
        </ol>
      </nav>

      <PageHeader
        eyebrow="Informații utile"
        title="Întrebări frecvente"
        description="Răspunsuri scurte despre verificarea psihologilor, costuri, ședințe online și modul în care funcționează platforma."
      />

      <div className="mt-8 space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-line bg-surface p-5 open:border-brand-line"
          >
            <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
          </details>
        ))}
      </div>

      <section className="mt-10 rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold text-ink">Continuă căutarea</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Vezi{" "}
          <Link href="/psihologi" className="font-semibold text-brand underline underline-offset-4">
            lista psihologilor verificați
          </Link>
          , varianta{" "}
          <Link href="/psihologi/online" className="font-semibold text-brand underline underline-offset-4">
            online a directoriului
          </Link>{" "}
          sau{" "}
          <Link href="/resurse" className="font-semibold text-brand underline underline-offset-4">
            ghidurile despre alegerea unui psiholog
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
