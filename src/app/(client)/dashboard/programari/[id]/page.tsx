import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Video } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { getAppointmentById } from "@/lib/data/user";
import { canClientCancel } from "@/lib/permissions";
import { formatDateTime, formatDuration } from "@/lib/time";
import { formatPriceRon } from "@/lib/utils";
import { APPOINTMENT_STATUS_LABELS, MODE_LABELS } from "@/lib/constants";
import { AppointmentStatusBadge } from "@/components/appointment-badges";
import { CancelAppointmentForm, RescheduleForm } from "@/components/appointment-actions";
import { Alert, buttonClasses, Card, PageHeader } from "@/components/ui";

const STATUS_MESSAGES: Record<string, string> = {
  solicitata: "Solicitarea a fost trimisă. Psihologul trebuie să o confirme.",
  anulata: "Programarea a fost anulată.",
  reprogramata: "Intervalul nou a fost propus. Programarea a revenit în așteptare.",
};

export default async function ClientAppointmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, query, session] = await Promise.all([
    params,
    searchParams,
    requireClient(),
  ]);

  const appointment = await getAppointmentById(session.supabase, id);
  if (!appointment || appointment.client_id !== session.profile.id) notFound();

  const canChange =
    (appointment.status === "pending" || appointment.status === "confirmed") &&
    new Date(appointment.starts_at).getTime() > Date.now();
  const canCancel = canChange && canClientCancel(appointment.starts_at);
  const canReschedule = canChange && canClientCancel(appointment.starts_at);

  const { data: conversation } = await session.supabase
    .from("conversations")
    .select("id")
    .eq("client_id", session.profile.id)
    .eq("psychologist_id", appointment.psychologist_id)
    .maybeSingle();

  const statusMessage = query.status ? STATUS_MESSAGES[query.status] : undefined;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/programari" className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Toate programările
      </Link>

      <PageHeader
        eyebrow="Programare"
        title={`Cu ${appointment.psychologist?.full_name ?? "psiholog"}`}
        description={`${formatDateTime(appointment.starts_at)} · ${formatDuration(
          appointment.duration_minutes,
        )}`}
      />

      {statusMessage ? <Alert tone="success">{statusMessage}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <AppointmentStatusBadge status={appointment.status} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-sm text-brand-strong">
                {appointment.mode === "online" ? (
                  <Video className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {MODE_LABELS[appointment.mode]}
              </span>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Data și ora</dt>
                <dd className="mt-1 font-medium text-ink">{formatDateTime(appointment.starts_at)}</dd>
                <dd className="text-sm text-muted">Ora României ({appointment.timezone})</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Durată</dt>
                <dd className="mt-1 font-medium text-ink">{formatDuration(appointment.duration_minutes)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Tarif</dt>
                <dd className="mt-1 font-medium text-ink">
                  {appointment.price_ron !== null ? formatPriceRon(appointment.price_ron) : "La solicitare"}
                </dd>
                <dd className="text-xs text-muted">Plata nu se face online în această versiune.</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Status</dt>
                <dd className="mt-1 font-medium text-ink">
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </dd>
              </div>
            </dl>

            {appointment.cabinet ? (
              <div className="mt-5 rounded-xl border border-line bg-canvas p-4 text-sm">
                <p className="font-semibold text-ink">{appointment.cabinet.name}</p>
                <p className="text-muted">
                  {appointment.cabinet.address_line}, {appointment.cabinet.city}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${appointment.cabinet.address_line}, ${appointment.cabinet.city}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-block font-semibold text-brand underline underline-offset-4"
                >
                  Deschide în hartă
                </a>
              </div>
            ) : appointment.mode === "online" ? (
              <Alert tone="info" className="mt-5">
                Linkul de videoconferință este transmis de psiholog după confirmare, prin mesageria
                platformei sau pe canalul agreat.
              </Alert>
            ) : null}

            {appointment.client_note ? (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Nota ta</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink">{appointment.client_note}</p>
              </div>
            ) : null}

            {appointment.cancellation_reason ? (
              <Alert tone="warning" className="mt-5" title="Motiv">
                {appointment.cancellation_reason}
              </Alert>
            ) : null}
          </Card>

          <div className="flex flex-wrap gap-2">
            {conversation ? (
              <Link href={`/dashboard/mesaje/${conversation.id}`} className={buttonClasses("secondary", "sm")}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Deschide conversația
              </Link>
            ) : (
              <Link
                href={`/psihologi`}
                className={buttonClasses("secondary", "sm")}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Găsește profilul psihologului
              </Link>
            )}
            <Link href="/contact" className={buttonClasses("ghost", "sm")}>
              Raportează o problemă
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {canChange ? (
            <>
              <CancelAppointmentForm
                appointmentId={appointment.id}
                redirectTo={`/dashboard/programari/${appointment.id}`}
                canCancel={canCancel}
              />
              <RescheduleForm
                appointmentId={appointment.id}
                psychologistId={appointment.psychologist_id}
                mode={appointment.mode}
                canReschedule={canReschedule}
              />
            </>
          ) : (
            <Card className="p-5 text-sm text-muted">
              <CalendarDays className="h-5 w-5 text-brand" aria-hidden="true" />
              <p className="mt-2 font-semibold text-ink">
                {appointment.status === "cancelled" || appointment.status === "rejected"
                  ? "Această programare nu mai este activă."
                  : appointment.status === "completed"
                    ? "Ședința a fost finalizată."
                    : "Programarea nu mai poate fi modificată online."}
              </p>
              <p className="mt-1">
                Pentru modificări, contactează psihologul prin mesagerie sau platforma.
              </p>
            </Card>
          )}

          <Card className="p-5 text-sm text-muted">
            <p className="font-semibold text-ink">Reguli de anulare</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Clientul poate anula sau reprograma cu cel puțin 24 de ore înainte.</li>
              <li>Psihologul poate anula cu motiv, iar clientul este notificat.</li>
              <li>Solicitarea reprogramării intră din nou în așteptare.</li>
              <li>Nicio programare nu este confirmată automat.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
