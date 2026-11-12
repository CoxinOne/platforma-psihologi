import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  MessagesSquare,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { listPublicPsychologists, listSpecialties } from "@/lib/data/public";
import { slugify } from "@/lib/utils";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, Card, EmptyState, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Psihologi în România — profiluri și mesagerie privată",
  description:
    "Găsește un psiholog potrivit, citește profiluri profesionale aprobate și trimite un mesaj privat. Tariful se discută direct, în funcție de complexitate.",
  alternates: { canonical: "/" },
};

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Profiluri aprobate înainte de publicare",
    text: "Un profil devine public doar după ce administratorul verifică datele profesionale. Insigna „Verificat” apare doar după această etapă.",
  },
  {
    icon: LockKeyhole,
    title: "Conversații private",
    text: "Mesajele sunt vizibile exclusiv celor doi participanți. Administratorul nu are acces automat la conversații.",
  },
  {
    icon: MessagesSquare,
    title: "Tarif discutat direct",
    text: "Nu afișăm tarife fixe și nu procesăm plăți. Prețul este în funcție de complexitate și se stabilește cu psihologul.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Caută și compară",
    text: "Filtrează după specializare, oraș, limbă și tipul consultației. Citește studiile și experiența afișate.",
  },
  {
    icon: MessageCircle,
    title: "Trimite un mesaj privat",
    text: "Poți începe o conversație cu psihologul ales, fără să oferi date suplimentare în afara contului.",
  },
  {
    icon: CheckCircle2,
    title: "Stabilește detaliile",
    text: "Discuți direct despre nevoile tale și despre tarif. Plata și întâlnirea se stabilesc în afara platformei.",
  },
];

export default async function HomePage() {
  const [psychologists, specialties] = await Promise.all([
    listPublicPsychologists(),
    listSpecialties(),
  ]);

  const featured = psychologists.slice(0, 12);
  const topSpecialties = specialties.filter((specialty) => specialty.psychologist_count > 0).slice(0, 6);
  const displayedSpecialties = topSpecialties.length > 0 ? topSpecialties : specialties.slice(0, 6);
  const cities = Array.from(
    new Map(
      psychologists
        .flatMap((psychologist) => psychologist.cabinet_cities)
        .map((city) => [slugify(city), city] as const),
    ).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1], "ro"));

  return (
    <>
      <section className="pattern-soft border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-line bg-surface/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden="true" />
              Psihologi din România
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-[3.6rem]">
              Sprijin psihologic,
              <br />
              găsit cu claritate.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Profiluri profesionale și mesagerie privată într-un singur loc. Fără recenzii
              inventate, fără promisiuni de vindecare și fără date clinice stocate aici.
            </p>
            <div className="mt-8">
              <Link href="/psihologi" className={buttonClasses("primary", "lg")}>
                Găsește un psiholog
              </Link>
            </div>
            <p className="mt-6 flex items-start gap-2 text-sm text-muted">
              <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              Platforma nu înlocuiește serviciile de urgență. Pentru situații critice, sună la 112.
            </p>
          </div>

          <div className="relative">
            <Card className="relative z-10 space-y-5">
              <span className="block h-1.5 w-14 rounded-full bg-terracotta" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                  Ce poți face aici
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Un parcurs simplu, fără presiune</h2>
              </div>
              <ul className="space-y-4">
                {[
                  "Cauți după specializare, oraș, limbă și tip de consultație.",
                  "Citești profilul profesional și verifici dacă ți se potrivește.",
                  "Trimiți un mesaj privat și discuți direct detaliile.",
                  "Primești notificări pentru fiecare schimbare importantă.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/despre"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline underline-offset-4 hover:text-brand-strong"
              >
                Cum funcționează platforma
                <span aria-hidden="true">→</span>
              </Link>
            </Card>
            <div
              aria-hidden="true"
              className="absolute -bottom-5 -left-5 -z-0 hidden h-40 w-40 rounded-[2rem] bg-sage/40 sm:block"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="garantii" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 id="garantii" className="sr-only">
          Principii de funcționare
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <Card key={point.title} className="bg-surface/80">
              <point.icon className="h-6 w-6 text-brand" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-ink">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{point.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="psihologi" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Directoriu"
            title="Psihologi cu profile complete"
            description="Fiecare profil afișează specializările, limbile și tipurile de consultație. Tariful se discută direct."
          />
          <Link href="/psihologi" className={buttonClasses("secondary", "md")}>
            Vezi toți psihologii
          </Link>
        </div>

        <div className="mt-8">
          {featured.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((psychologist) => (
                <PsychologistCard key={psychologist.user_id} psychologist={psychologist} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="Momentan nu există profiluri aprobate"
              description="Directoriul se completează pe măsură ce profilurile profesionale sunt verificate. Conturile de psiholog sunt create exclusiv de administrator."
              action={
                <Link href="/inregistrare" className={buttonClasses("primary")}>
                  Creează cont de client
                </Link>
              }
            />
          )}
        </div>
      </section>

      {cities.length > 0 ? (
        <section aria-labelledby="orase" className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
          <h2 id="orase" className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Psihologi pe orașe
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {cities.map(([slug, city]) => (
              <li key={slug}>
                <Link
                  href={`/psihologi/oras/${slug}`}
                  className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-brand-strong hover:border-brand hover:text-brand"
                >
                  Psihologi în {city}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="specializari" className="border-y border-line bg-sand/55">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Arii de lucru"
            title="Caută după ceea ce te interesează"
            description="Specializările sunt administrate central, astfel încât denumirile să rămână consecvente."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedSpecialties.map((specialty) => (
              <li key={specialty.slug}>
                <Link
                  href={`/specializari/${specialty.slug}`}
                  className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand-line hover:bg-brand-soft/40"
                >
                  <span>
                    <span className="block font-semibold text-ink group-hover:text-brand">
                      {specialty.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {specialty.psychologist_count === 0
                        ? "În curs de completare"
                        : `${specialty.psychologist_count} ${
                            specialty.psychologist_count === 1 ? "profil" : "profiluri"
                          }`}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-brand">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link href="/specializari" className="text-sm font-semibold text-brand underline underline-offset-4">
              Toate specializările
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="pasi" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Parcurs"
          title="Trei pași, fără complicații"
          description="Poți începe cu o întrebare și decide după ce citești profilul."
          align="center"
        />
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft font-display text-lg font-semibold text-brand">
                    {index + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-brand" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="ghiduri" className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <SectionHeading
          eyebrow="Ghiduri"
          title="Citește înainte de prima ședință"
          description="Două materiale scurte despre alegerea psihologului și despre ședințele online."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card className="flex h-full flex-col">
            <h3 className="text-lg font-semibold text-ink">
              <Link href="/resurse/cum-alegi-un-psiholog" className="hover:text-brand">
                Cum alegi un psiholog potrivit
              </Link>
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              Ce verifici înainte de prima ședință, ce întrebări să pui și cum recunoști o
              potrivire bună.
            </p>
            <Link
              href="/resurse/cum-alegi-un-psiholog"
              className="mt-4 text-sm font-semibold text-brand underline underline-offset-4"
            >
              Citește ghidul
            </Link>
          </Card>
          <Card className="flex h-full flex-col">
            <h3 className="text-lg font-semibold text-ink">
              <Link href="/resurse/psiholog-online-sau-cabinet" className="hover:text-brand">
                Psiholog online sau la cabinet
              </Link>
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              Avantaje, limite și criterii concrete pentru a alege modalitatea care ți se
              potrivește.
            </p>
            <Link
              href="/resurse/psiholog-online-sau-cabinet"
              className="mt-4 text-sm font-semibold text-brand underline underline-offset-4"
            >
              Citește ghidul
            </Link>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-[2rem] border border-brand-line bg-cocoa px-6 py-10 text-cream sm:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="mb-4 block h-1 w-12 rounded-full bg-terracotta" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/70">
                Începe aici
              </p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                Nu știi de unde să începi? Citește profilurile.
              </h2>
              <p className="mt-3 text-cream/80">
                Fiecare psiholog are un profil verificat înainte de publicare. Îți poți face cont
                public de client și îi poți scrie direct, în mesagerie privată.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/psihologi"
                className="inline-flex items-center justify-center rounded-full bg-surface px-6 py-3 text-sm font-semibold text-brand hover:bg-brand-soft"
              >
                Găsește un psiholog
              </Link>
              <Link
                href="/inregistrare"
                className="inline-flex items-center justify-center rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold text-cream hover:bg-cream/10"
              >
                Creează cont de client
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
