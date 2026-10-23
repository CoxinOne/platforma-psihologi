import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { requirePsychologist } from "@/lib/auth";
import { listAppointmentsForPsychologist } from "@/lib/data/user";
import { addDays, formatDateShort, formatDateTime, formatTime, localDateKey, todayInZone } from "@/lib/time";
import { MODE_LABELS } from "@/lib/constants";
import { AppointmentStatusBadge } from "@/components/appointment-badges";
import {
  AppointmentNoteForm,
  CompleteAppointmentForm,
  ConfirmAppointmentForm,
  PsychologistCancelForm,
  RejectAppointmentForm,
} from "@/components/psych-appointment-actions";
import { Alert, Badge, buttonClasses, Card, EmptyState, PageHeader } from "@/components/ui";

const STATUS_MESSAGES: Record<string, string> = {
  confirmata: "Programarea a fost confirmată, iar clientul a fost notificat.",
  respinsa: "Programarea a fost respinsă.",
  anulata: "Programarea a fost anulată.",
  finalizata: "Ședința a fost marcată ca finalizată.",
};

function startOfIsoWeek(date: string): string {
  const value = new Date(`${date}T12:00:00Z`);
  const day = value.getUTCDay();
  const diff = (day + 6) % 7;
  return addDays(date, -diff);
}

export default async function PsychologistAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ saptamana?: string; status?: string }>;
}) {
  const session = await requirePsychologist();
  const params = await searchParams;
  const appointments = await listAppointmentsForPsychologist(session.supabase, session.user.id);

  const weekStart = startOfIsoWeek(
    params.saptamana && /^\d{4}-\d{2}-\d{2}$/.test(params.saptamana) ? params.saptamana : todayInZone(),
  );
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const dayKeys = new Set(days);

  const byDay = new Map<string, typeof appointments>();
  for (const appointment of appointments) {
    const key = localDateKey(appointment.starts_at);
    if (!dayKeys.has(key)) continue;
    const list = byDay.get(key) ?? [];
    list.push(appointment);
    byDay.set(key, list);
  }

  const pending = appointments
    .filter((appointment) => appointment.status === "pending")
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const upcoming = appointments
    .filter(
      (appointment) =>
        appointment.status === "confirmed" && new Date(appointment.starts_at).getTime() >= Date.now(),
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const statusMessage = params.status ? STATUS_MESSAGES[params.status] : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Programări"
        title="Cereri și calendar"
        description="Confirmă solicitările, vezi calendarul săptămânii și marchează ședințele finalizate."
      />

      {statusMessage ? <Alert tone="success">{statusMessage}</Alert> : null}

      <section aria-labelledby="cereri" className="space-y-4">
        <h2 id="cereri" className="text-xl font-semibold text-ink">
          Solicitări în așteptare ({pending.length})
        </h2>
        {pending.length > 0 ? (
          <ul className="space-y-3">
            {pending.map((appointment) => (
              <li key={appointment.id}>
                <Card className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{appointment.client?.full_name ?? "Client"}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDateTime(appointment.starts_at)} · {appointment.duration_minutes} min ·{" "}
                        {MODE_LABELS[appointment.mode]}
                      </p>
                      {appointment.cabinet ? (
                        <p className="text-sm text-muted">{appointment.cabinet.name}, {appointment.cabinet.city}</p>
                      ) : null}
                    </div>
                    <Badge tone="warning">În așteptare</Badge>
                  </div>
                  {appointment.client_note ? (
                    <div className="rounded-xl border border-line bg-canvas p-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mesajul clientului</p>
                      <p className="mt-1 whitespace-pre-line text-ink">{appointment.client_note}</p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-start gap-3">
                    <ConfirmAppointmentForm appointmentId={appointment.id} />
                    <RejectAppointmentForm appointmentId={appointment.id} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="p-5 text-sm text-muted">Nu ai solicitări în așteptare.</Card>
        )}
      </section>

      <section aria-labelledby="calendar" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="calendar" className="text-xl font-semibold text-ink">Calendarul săptămânii</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/cabinet/programari?saptamana=${addDays(weekStart, -7)}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-brand hover:bg-brand-soft"
              aria-label="Săptămâna anterioară"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="text-sm font-medium text-muted">
              {formatDateShort(days[0]!)} – {formatDateShort(days[6]!)}
            </span>
            <Link
              href={`/cabinet/programari?saptamana=${addDays(weekStart, 7)}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-brand hover:bg-brand-soft"
              aria-label="Săptămâna următoare"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/cabinet/programari" className="text-xs font-semibold text-brand underline underline-offset-4">
              Săptămâna curentă
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
          <div className="grid min-w-[860px] grid-cols-7 divide-x divide-line">
            {days.map((day) => {
              const items = (byDay.get(day) ?? []).sort(
                (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
              );
              const isToday = day === todayInZone();
              return (
                <div key={day} className={isToday ? "bg-brand-soft/30" : ""}>
                  <div className="border-b border-line px-2 py-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {new Intl.DateTimeFormat("ro-RO", { weekday: "short", timeZone: "UTC" }).format(
                        new Date(`${day}T12:00:00Z`),
                      )}
                    </p>
                    <p className={isToday ? "font-display text-xl font-semibold text-brand" : "font-display text-xl font-semibold text-ink"}>
                      {new Intl.DateTimeFormat("ro-RO", { day: "numeric", timeZone: "UTC" }).format(
                        new Date(`${day}T12:00:00Z`),
                      )}
                    </p>
                  </div>
                  <div className="min-h-40 space-y-1 p-1.5">
                    {items.length > 0 ? (
                      items.map((appointment) => (
                        <div
                          key={appointment.id}
                          className={
                            appointment.status === "pending"
                              ? "rounded-lg border border-[#ead6ac] bg-warning-soft p-1.5 text-[0.7rem]"
                              : appointment.status === "confirmed"
                                ? "rounded-lg border border-brand-line bg-brand-soft p-1.5 text-[0.7rem]"
                                : "rounded-lg border border-line bg-canvas p-1.5 text-[0.7rem] text-muted"
                          }
                        >
                          <p className="font-semibold text-ink">{formatTime(appointment.starts_at)}</p>
                          <p className="truncate">{appointment.client?.full_name ?? "Client"}</p>
                          <p className="truncate text-[0.65rem] text-muted">{MODE_LABELS[appointment.mode]}</p>
                        </div>
                      ))
                    ) : (
                      <p className="px-1 py-3 text-center text-[0.65rem] text-muted">Liber</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="confirmate" className="space-y-4">
        <h2 id="confirmate" className="text-xl font-semibold text-ink">Ședințe confirmate</h2>
        {upcoming.length > 0 ? (
          <ul className="space-y-3">
            {upcoming.map((appointment) => (
              <li key={appointment.id}>
                <Card className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{appointment.client?.full_name ?? "Client"}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDateTime(appointment.starts_at)} · {appointment.duration_minutes} min ·{" "}
                        {MODE_LABELS[appointment.mode]}
                      </p>
                      {appointment.cabinet ? (
                        <p className="text-sm text-muted">{appointment.cabinet.name}, {appointment.cabinet.city}</p>
                      ) : null}
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  {appointment.client_note ? (
                    <p className="rounded-xl bg-canvas p-3 text-sm text-muted">{appointment.client_note}</p>
                  ) : null}
                  <div className="flex flex-wrap items-start gap-3">
                    {new Date(appointment.ends_at).getTime() <= Date.now() ? (
                      <CompleteAppointmentForm appointmentId={appointment.id} />
                    ) : (
                      <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand-strong">
                        <Clock className="mr-1 inline h-3 w-3" aria-hidden="true" />
                        În desfășurare viitoare
                      </span>
                    )}
                    <PsychologistCancelForm appointmentId={appointment.id} />
                  </div>
                  <AppointmentNoteForm appointmentId={appointment.id} note={appointment.psychologist_note} />
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="Nu ai ședințe confirmate"
            description="Confirmă o solicitare sau publică mai multă disponibilitate pentru a primi programări."
            action={
              <Link href="/cabinet/disponibilitate" className={buttonClasses("secondary")}>
                Editează disponibilitatea
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
