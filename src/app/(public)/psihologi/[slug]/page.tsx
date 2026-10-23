import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Globe2,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  ShieldAlert,
  Video,
} from "lucide-react";
import { getPsychologistBySlug } from "@/lib/data/public";
import { getSessionContext } from "@/lib/auth";
import { MODE_LABELS } from "@/lib/constants";
import { formatDuration } from "@/lib/time";
import { Avatar, Badge, Card, DemoBadge } from "@/components/ui";
import { BookingWidget } from "@/components/booking-widget";
import { ContactPsychologist } from "@/components/contact-psychologist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const psychologist = await getPsychologistBySlug(slug);
  if (!psychologist) return { title: "Profil inexistent" };

  return {
    title: `${psychologist.display_name} — ${psychologist.professional_title}`,
    description: psychologist.bio?.slice(0, 160) ?? `Profil profesional ${psychologist.display_name}.`,
  };
}

export default async function PsychologistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const psychologist = await getPsychologistBySlug(slug);
  if (!psychologist) notFound();

  const session = await getSessionContext().catch(() => null);
  const isAuthenticated = Boolean(session);
  const isClient = session?.profile.role === "client";
  const price =
    psychologist.price_ron !== null
      ? new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(
          psychologist.price_ron,
        )
      : "Tarif la solicitare";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Firimituri" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-brand">Acasă</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/psihologi" className="hover:text-brand">Psihologi</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">{psychologist.display_name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-8">
          <header className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar name={psychologist.display_name} photoPath={psychologist.photo_path} size={96} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{psychologist.display_name}</h1>
                  {psychologist.is_verified ? (
                    <Badge tone="success">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Calificări verificate
                    </Badge>
                  ) : null}
                  {psychologist.is_demo ? <DemoBadge /> : null}
                </div>
                <p className="mt-1 text-lg text-muted">{psychologist.professional_title}</p>

                <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                  {psychologist.consultation_modes.map((mode) => (
                    <li key={mode} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-brand-strong">
                      {mode === "online" ? (
                        <Video className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {MODE_LABELS[mode]}
                    </li>
                  ))}
                  {psychologist.cabinet_cities[0] ? (
                    <li className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f1ed] px-3 py-1 text-muted">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {psychologist.cabinet_cities.join(", ")}
                    </li>
                  ) : null}
                </ul>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-sm">
                  <span className="font-semibold text-ink">{price}</span>
                  <span className="text-muted">Ședință de {formatDuration(psychologist.session_duration_minutes)}</span>
                  {!psychologist.is_accepting_new_clients ? (
                    <Badge tone="warning">Nu acceptă programări noi</Badge>
                  ) : (
                    <Badge tone="success">Acceptă solicitări</Badge>
                  )}
                </div>
              </div>
            </div>

            {psychologist.is_demo ? (
              <div className="mt-6 rounded-xl border border-[#ead6ac] bg-warning-soft px-4 py-3 text-sm text-warning">
                Acest profil este fictiv și marchează datele demonstrative ale platformei. Persoana,
                studiile și tarifele nu sunt reale.
              </div>
            ) : null}
          </header>

          {psychologist.bio ? (
            <section aria-labelledby="despre" className="space-y-3">
              <h2 id="despre" className="text-2xl font-semibold text-ink">Despre</h2>
              <p className="whitespace-pre-line text-[1.02rem] leading-relaxed text-muted">{psychologist.bio}</p>
            </section>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            {psychologist.education ? (
              <Card>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                  <GraduationCap className="h-5 w-5 text-brand" aria-hidden="true" />
                  Studii și calificări
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {psychologist.education}
                </p>
              </Card>
            ) : null}
            {psychologist.experience ? (
              <Card>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                  <CalendarDays className="h-5 w-5 text-brand" aria-hidden="true" />
                  Experiență profesională
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {psychologist.experience}
                </p>
              </Card>
            ) : null}
          </div>

          {psychologist.specialties.length > 0 ? (
            <section aria-labelledby="specializari" className="space-y-3">
              <h2 id="specializari" className="text-2xl font-semibold text-ink">Specializări</h2>
              <ul className="flex flex-wrap gap-2">
                {psychologist.specialties.map((specialty) => (
                  <li key={specialty.slug}>
                    <Link href={`/specializari/${specialty.slug}`}>
                      <Badge tone="brand" className="px-3 py-1.5 text-sm">{specialty.name}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {psychologist.languages.length > 0 ? (
            <section aria-labelledby="limbi" className="space-y-3">
              <h2 id="limbi" className="flex items-center gap-2 text-2xl font-semibold text-ink">
                <Languages className="h-5 w-5 text-brand" aria-hidden="true" />
                Limbi vorbite
              </h2>
              <p className="text-muted">{psychologist.languages.join(", ")}</p>
            </section>
          ) : null}

          <section aria-labelledby="servicii" className="space-y-3">
            <h2 id="servicii" className="text-2xl font-semibold text-ink">Servicii oferite</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {psychologist.consultation_modes.map((mode) => (
                <li key={mode} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                  <p className="font-semibold text-ink">
                    {mode === "online" ? "Ședință individuală online" : "Ședință individuală la cabinet"}
                  </p>
                  <p className="mt-1 text-muted">
                    {formatDuration(psychologist.session_duration_minutes)} · {price}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {mode === "online"
                      ? "Linkul de videoconferință se transmite după confirmare."
                      : "Adresa cabinetului este afișată mai jos."}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {psychologist.cabinets.length > 0 ? (
            <section aria-labelledby="cabinete" className="space-y-3">
              <h2 id="cabinete" className="text-2xl font-semibold text-ink">Cabinete</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {psychologist.cabinets.map((cabinet) => (
                  <Card key={cabinet.id} className="p-5">
                    <p className="font-semibold text-ink">{cabinet.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {cabinet.address_line}, {cabinet.city}
                      {cabinet.county ? `, ${cabinet.county}` : ""}
                    </p>
                    {cabinet.phone ? <p className="mt-1 text-sm text-muted">Tel. {cabinet.phone}</p> : null}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${cabinet.address_line}, ${cabinet.city}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline underline-offset-4"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      Deschide în hartă
                    </a>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="mesaj" className="space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-6">
            <h2 id="mesaj" className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <MessageCircle className="h-5 w-5 text-brand" aria-hidden="true" />
              Trimite un mesaj
            </h2>
            <ContactPsychologist
              psychologistId={psychologist.user_id}
              psychologistName={psychologist.display_name}
              slug={psychologist.slug}
              isAuthenticated={isAuthenticated}
              isClient={isClient}
            />
          </section>

          <section aria-labelledby="verificare" className="rounded-2xl border border-line bg-canvas p-5 text-sm text-muted">
            <h2 id="verificare" className="flex items-center gap-2 font-semibold text-ink">
              <ShieldAlert className="h-4 w-4 text-brand" aria-hidden="true" />
              Despre verificare și limite
            </h2>
            <p className="mt-2">
              {psychologist.is_verified
                ? "Administratorul a verificat existența studiilor și a calificărilor declarate înainte de publicare. Verificarea nu echivalează cu o acreditare oficială și nu garantează rezultatul unei intervenții."
                : "Acest profil nu are încă insigna de verificare. Datele profesionale sunt declarate de psiholog și pot fi în curs de verificare."}
            </p>
            <p className="mt-2">
              Platforma nu oferă servicii de urgență, nu pune diagnostice și nu ține dosare clinice.
              Pentru situații critice, apelează 112 sau serviciile de urgență competente.
            </p>
            {session?.profile.role === "client" ? (
              <p className="mt-2">
                <Link
                  href={`/dashboard/raportari?utilizator=${psychologist.user_id}`}
                  className="font-semibold text-brand underline underline-offset-4"
                >
                  Raportează o problemă legată de acest profil
                </Link>
              </p>
            ) : null}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="programare">
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Programare</p>
              <h2 id="programare" className="mt-1 text-2xl font-semibold text-ink">Alege un interval</h2>
              <p className="mt-1 text-sm text-muted">
                Vezi numai orele libere, calculate în funcție de programul publicat și de
                programările existente.
              </p>
            </div>
            <BookingWidget
              psychologistId={psychologist.user_id}
              psychologistName={psychologist.display_name}
              slug={psychologist.slug}
              modes={psychologist.consultation_modes}
              duration={psychologist.session_duration_minutes}
              price={psychologist.price_ron}
              cabinets={psychologist.cabinets.map((cabinet) => ({
                id: cabinet.id,
                name: cabinet.name,
                city: cabinet.city,
                address_line: cabinet.address_line,
              }))}
              isAuthenticated={isAuthenticated}
              isClient={isClient}
              loginNext={`/psihologi/${psychologist.slug}`}
            />
          </Card>

          <div className="mt-4 rounded-2xl border border-line bg-canvas p-4 text-xs text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
              Fus orar: {psychologist.timezone}
            </p>
            <p className="mt-1">
              Orele sunt afișate în ora României, cu ajustarea automată la schimbarea orei.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
