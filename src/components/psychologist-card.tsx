import Link from "next/link";
import { BadgeCheck, MapPin, Monitor, Video } from "lucide-react";
import type { PublicPsychologist } from "@/lib/types";
import { MODE_LABELS } from "@/lib/constants";
import { formatPriceRon } from "@/lib/utils";
import { Badge, Card, DemoBadge } from "@/components/ui";
import { Avatar } from "@/components/ui";

export function PsychologistCard({ psychologist }: { psychologist: PublicPsychologist }) {
  const city = psychologist.cabinets[0]?.city;
  const specialties = psychologist.specialties.slice(0, 3);

  return (
    <Card className="flex h-full flex-col gap-4 transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(28,42,39,0.35)]">
      <div className="flex items-start gap-4">
        <Avatar name={psychologist.display_name} photoPath={psychologist.photo_path} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink">
              <Link href={`/psihologi/${psychologist.slug}`} className="hover:text-brand">
                {psychologist.display_name}
              </Link>
            </h3>
            {psychologist.is_verified ? (
              <span
                title="Calificări verificate de administrator"
                className="inline-flex items-center gap-1 text-xs font-semibold text-success"
              >
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Verificat
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted">{psychologist.professional_title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {psychologist.is_demo ? <DemoBadge /> : null}
            {!psychologist.is_accepting_new_clients ? (
              <Badge tone="warning">Nu acceptă programări noi</Badge>
            ) : null}
          </div>
        </div>
      </div>

      {psychologist.bio ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{psychologist.bio}</p>
      ) : null}

      {specialties.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Specializări">
          {specialties.map((specialty) => (
            <li key={specialty.slug}>
              <Link href={`/specializari/${specialty.slug}`}>
                <Badge tone="brand">{specialty.name}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted">Consultații</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-ink">
            {psychologist.consultation_modes.includes("online") ? (
              <span className="inline-flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                Online
              </span>
            ) : null}
            {psychologist.consultation_modes.includes("in_person") ? (
              <span className="inline-flex items-center gap-1">
                <Monitor className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                Cabinet
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Locație</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium text-ink">
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {city ?? "Online"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Ședință</dt>
          <dd className="mt-0.5 font-medium text-ink">{psychologist.session_duration_minutes} min</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Tarif</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {psychologist.price_ron !== null ? formatPriceRon(psychologist.price_ron) : "La solicitare"}
          </dd>
        </div>
      </dl>

      <Link
        href={`/psihologi/${psychologist.slug}`}
        className="inline-flex items-center justify-center rounded-full border border-brand-line bg-surface px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
      >
        Vezi profilul
      </Link>
      <span className="sr-only">
        Tipuri de consultație: {psychologist.consultation_modes.map((mode) => MODE_LABELS[mode]).join(", ")}
      </span>
    </Card>
  );
}
