import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { listPublicPsychologists, listSpecialties } from "@/lib/data/public";
import { PsychologistCard } from "@/components/psychologist-card";
import { buttonClasses, Card, EmptyState, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Psihologi în România — profiluri, mesagerie și programări",
  description:
    "Găsește un psiholog potrivit, citește profiluri profesionale aprobate, trimite un mesaj privat și solicită o programare.",
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
    icon: CalendarCheck,
    title: "Programări fără suprapuneri",
    text: "Disponibilitatea este verificată pe server, iar baza de date blochează două rezervări pe același interval.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Caută și compară",
    text: "Filtrează după specializare, oraș, limbă și tipul consultației. Citește studiile, experiența și tarifele afișate.",
  },
  {
    icon: MessageCircle,
    title: "Trimite un mesaj privat",
    text: "Poți începe o conversație cu psihologul ales, fără să oferi date suplimentare în afara contului.",
  },
  {
    icon: CalendarCheck,
    title: "Solicită o programare",
    text: "Alegi un interval liber, trimiți solicitarea, iar psihologul o confirmă sau o respinge. Primești notificare.",
  },
];

export default async function HomePage() {
  const [psychologists, specialties] = await Promise.all([
    listPublicPsychologists(),
    listSpecialties(),
  ]);

  const featured = psychologists.slice(0, 3);
  const topSpecialties = specialties.filter((specialty) => specialty.psychologist_count > 0).slice(0, 6);
  const displayedSpecialties = topSpecialties.length > 0 ? topSpecialties : specialties.slice(0, 6);

  return (
    <>
      <section className="pattern-soft border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-line bg-surface/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Psihologi din România
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-[3.6rem]">
              Sprijin psihologic,
              <br />
              găsit cu claritate.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Profiluri profesionale, mesagerie privată și programări într-un singur loc. Fără
              recenzii inventate, fără promisiuni de vindecare și fără date clinice stocate aici.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/psihologi" className={buttonClasses("primary", "lg")}>
                Găsește un psiholog
              </Link>
              <Link href="/despre" className={buttonClasses("secondary", "lg")}>
                Cum funcționează platforma
              </Link>
            </div>
            <p className="mt-6 flex items-start gap-2 text-sm text-muted">
              <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              Platforma nu înlocuiește serviciile de urgență. Pentru situații critice, sună la 112.
            </p>
          </div>

          <div className="relative">
            <Card className="relative z-10 space-y-5">
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
                  "Trimiți un mesaj privat sau soliciți direct o programare.",
                  "Primești notificări pentru fiecare schimbare importantă.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl bg-brand-soft/70 p-4 text-sm text-brand-strong">
                <p className="font-semibold">Date demonstrative marcate</p>
                <p className="mt-1 text-brand-strong/80">
                  Profilurile marcate „demonstrativ” sunt fictive, pentru testare. Nu sunt persoane
                  reale și nu au calificări reale.
                </p>
              </div>
            </Card>
            <div
              aria-hidden="true"
              className="absolute -bottom-5 -left-5 -z-0 hidden h-40 w-40 rounded-[2rem] bg-sand sm:block"
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
            description="Fiecare profil afișează specializările, limbile, tipurile de consultație și disponibilitatea declarată."
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
              description="Directoriul se completează pe măsură ce profilurile profesionale sunt verificate. Dacă ești psiholog, poți cere acces la un cont profesional."
              action={
                <Link href="/inregistrare?tip=psiholog" className={buttonClasses("primary")}>
                  Solicită cont de psiholog
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section aria-labelledby="specializari" className="border-y border-line bg-[#f1ede4]">
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

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-[2rem] border border-brand-line bg-brand px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Pentru psihologi
              </p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                Ai un cabinet? Îți poți construi profilul aici.
              </h2>
              <p className="mt-3 text-white/80">
                Contul profesional se activează după verificarea identității și a calificărilor.
                Profilul devine public doar după aprobare.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/inregistrare?tip=psiholog"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-brand-soft"
              >
                Solicită cont profesional
              </Link>
              <Link
                href="/despre"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Detalii despre verificare
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
