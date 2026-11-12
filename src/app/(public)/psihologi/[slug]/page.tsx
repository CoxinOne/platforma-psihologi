import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ExternalLink,
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
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";
import { Avatar, Badge, buttonClasses, Card } from "@/components/ui";
import { ContactPsychologist } from "@/components/contact-psychologist";
import { WhatsAppButton } from "@/components/whatsapp-button";

interface BioSections {
  about: string[];
  intervention: { intro: string[]; bullets: string[] } | null;
}

/**
 * Profilurile au descrierea într-un singur câmp text. Când textul conține un paragraf
 * „Arii de intervenție:", îl scoatem într-o secțiune separată, cu listă, ca să fie ușor de citit.
 */
function splitBio(bio: string): BioSections {
  const paragraphs = bio
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const index = paragraphs.findIndex((paragraph) => /^arii de interven/i.test(paragraph));
  if (index === -1) return { about: paragraphs, intervention: null };

  const about = paragraphs.slice(0, index);
  const block = paragraphs
    .slice(index)
    .join("\n\n")
    .replace(/^arii de interven[^:\n]*:\s*/i, "");
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const intro: string[] = [];
  const bullets: string[] = [];
  for (const line of lines) {
    if (/^[•\-–—*]\s+/.test(line)) {
      bullets.push(line.replace(/^[•\-–—*]\s+/, ""));
    } else {
      intro.push(line);
    }
  }

  return { about, intervention: { intro, bullets } };
}

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
    alternates: { canonical: `/psihologi/${psychologist.slug}` },
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
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const primaryCabinet = psychologist.cabinets[0] ?? null;
  const profileUrl = `${baseUrl}/psihologi/${psychologist.slug}`;
  const imageUrl = psychologist.photo_path
    ? `${publicEnv.supabaseUrl}/storage/v1/object/public/avatars/${psychologist.photo_path}`
    : `${baseUrl}/icon.svg`;
  const bioSections = psychologist.bio ? splitBio(psychologist.bio) : null;
  const hasLongServices = psychologist.services.some((service) => service.length > 120);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${profileUrl}#person`,
              name: psychologist.display_name,
              jobTitle: psychologist.professional_title,
              description: psychologist.bio ?? undefined,
              url: profileUrl,
              image: imageUrl,
              knowsLanguage: psychologist.languages,
              ...(psychologist.website_url ? { sameAs: [psychologist.website_url] } : {}),
              ...(primaryCabinet
                ? {
                    telephone: primaryCabinet.phone ?? undefined,
                    areaServed: primaryCabinet.city,
                    worksFor: {
                      "@type": "ProfessionalService",
                      name: primaryCabinet.name,
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: primaryCabinet.address_line,
                        addressLocality: primaryCabinet.city,
                        addressRegion: primaryCabinet.county ?? undefined,
                        addressCountry: "RO",
                      },
                    },
                  }
                : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Psihologi", item: `${baseUrl}/psihologi` },
                { "@type": "ListItem", position: 3, name: psychologist.display_name, item: profileUrl },
              ],
            },
          ],
        }}
      />
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
            <span className="mb-5 block h-1.5 w-14 rounded-full bg-terracotta" aria-hidden="true" />
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
                  <span className="font-semibold text-ink">Prețul este în funcție de complexitate</span>
                  <span className="text-muted">Ședință de {formatDuration(psychologist.session_duration_minutes)}</span>
                  {!psychologist.is_accepting_new_clients ? (
                    <Badge tone="warning">Nu acceptă solicitări noi</Badge>
                  ) : (
                    <Badge tone="success">Acceptă solicitări</Badge>
                  )}
                </div>
              </div>
            </div>
          </header>

          {psychologist.motto ? (
            <blockquote className="border-l-2 border-terracotta pl-5">
              <p className="font-display text-xl italic leading-relaxed text-ink">
                „{psychologist.motto}”
              </p>
              <footer className="mt-2 text-sm font-semibold text-muted">
                — {psychologist.motto_author ?? psychologist.display_name}
              </footer>
            </blockquote>
          ) : null}

          {bioSections ? (
            <>
              {bioSections.about.length > 0 ? (
                <section aria-labelledby="despre" className="space-y-3">
                  <h2 id="despre" className="text-2xl font-semibold text-ink">Despre</h2>
                  <div className="space-y-3">
                    {bioSections.about.map((paragraph, index) => (
                      <p
                        key={index}
                        className="whitespace-pre-line text-[1.02rem] leading-relaxed text-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ) : null}

              {bioSections.intervention ? (
                <section aria-labelledby="arii-interventie" className="space-y-3">
                  <h2 id="arii-interventie" className="text-2xl font-semibold text-ink">
                    Arii de intervenție
                  </h2>
                  {bioSections.intervention.intro.length > 0 ? (
                    <div className="space-y-2">
                      {bioSections.intervention.intro.map((paragraph, index) => (
                        <p
                          key={index}
                          className="whitespace-pre-line text-[1.02rem] leading-relaxed text-muted"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {bioSections.intervention.bullets.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 text-[1.02rem] leading-relaxed text-muted marker:text-terracotta">
                      {bioSections.intervention.bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ) : null}
            </>
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
            <ul className={hasLongServices ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
              {psychologist.services.map((service, index) => (
                <li key={`${service}-${index}`} className="rounded-2xl border border-brand-line bg-brand-soft/30 p-4 text-sm">
                  <p className="font-semibold text-ink">{service}</p>
                </li>
              ))}
              {psychologist.consultation_modes.map((mode) => (
                <li key={mode} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                  <p className="font-semibold text-ink">
                    {mode === "online" ? "Ședință individuală online" : "Ședință individuală la cabinet"}
                  </p>
                  <p className="mt-1 text-muted">
                    {formatDuration(psychologist.session_duration_minutes)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {mode === "online"
                      ? "Linkul de videoconferință se transmite după ce stabiliți detaliile."
                      : "Adresa cabinetului este afișată mai jos."}
                  </p>
                </li>
              ))}
            </ul>
            {psychologist.services.length === 0 ? (
              <p className="text-sm text-muted">
                Serviciile și tarifele se stabilesc direct cu psihologul, în funcție de solicitare.
              </p>
            ) : null}
            <p className="text-sm font-medium text-brand-strong">
              Prețul este în funcție de complexitate.
            </p>
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
                      href={
                        cabinet.map_url ??
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${cabinet.address_line}, ${cabinet.city}`,
                        )}`
                      }
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline underline-offset-4"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {cabinet.map_url?.includes("waze.com") ? "Deschide în Waze" : "Deschide în hartă"}
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

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="contact-rapid">
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Contact</p>
              <h2 id="contact-rapid" className="mt-1 text-2xl font-semibold text-ink">
                Discută întâi cu psihologul
              </h2>
              <p className="mt-1 text-sm text-muted">
                Trimite un mesaj privat, descrie pe scurt ce te interesează și stabiliți împreună
                detaliile. Nu există programare automată sau plată online.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-soft/60 p-4 text-sm text-brand-strong">
              <p className="font-semibold">Prețul este în funcție de complexitate.</p>
              <p className="mt-1 text-brand-strong/80">
                Tariful se discută direct cu psihologul, înainte de a decide.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#mesaj" className={buttonClasses("primary", "md", "flex-1")}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Trimite un mesaj
              </a>
              <WhatsAppButton
                phone={psychologist.cabinets.find((cabinet) => cabinet.phone)?.phone}
                psychologistName={psychologist.display_name}
                className="flex-1"
              />
            </div>
            {psychologist.website_url ? (
              <a
                href={psychologist.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline underline-offset-4"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Site-ul cabinetului
              </a>
            ) : null}
          </Card>

          <div className="mt-4 rounded-2xl border border-line bg-canvas p-4 text-xs text-muted">
            Platforma facilitează contactul, nu intermediază plăți și nu stabilește tarife.
          </div>
        </aside>
      </div>
    </div>
  );
}
