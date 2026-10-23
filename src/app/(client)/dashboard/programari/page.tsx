import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { listAppointmentsForClient } from "@/lib/data/user";
import { formatDateTime } from "@/lib/time";
import { AppointmentStatusBadge, ModeBadge } from "@/components/appointment-badges";
import { buttonClasses, Card, EmptyState, PageHeader } from "@/components/ui";

export default async function ClientAppointmentsPage() {
  const session = await requireClient();
  const appointments = await listAppointmentsForClient(session.supabase, session.profile.id);

  const now = Date.now();
  const upcoming = appointments
    .filter(
      (appointment) =>
        new Date(appointment.starts_at).getTime() >= now &&
        (appointment.status === "pending" || appointment.status === "confirmed"),
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const history = appointments.filter((appointment) => !upcoming.includes(appointment));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Programări"
        title="Programările mele"
        description="Solicitările în așteptare, ședințele confirmate și istoricul. Anularea online este posibilă cu cel puțin 24 de ore înainte."
        action={
          <Link href="/cauta" className={buttonClasses("primary")}>
            Programează o ședință
          </Link>
        }
      />

      <section aria-labelledby="viitoare" className="space-y-3">
        <h2 id="viitoare" className="text-xl font-semibold text-ink">În viitor</h2>
        {upcoming.length > 0 ? (
          <ul className="space-y-3">
            {upcoming.map((appointment) => (
              <li key={appointment.id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">
                        {appointment.psychologist?.full_name ?? "Psiholog"}
                      </p>
                      <AppointmentStatusBadge status={appointment.status} />
                      <ModeBadge mode={appointment.mode} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {formatDateTime(appointment.starts_at)} · {appointment.duration_minutes} min
                    </p>
                    {appointment.cabinet ? (
                      <p className="mt-1 text-sm text-muted">
                        {appointment.cabinet.name}, {appointment.cabinet.city}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={`/dashboard/programari/${appointment.id}`}
                    className={buttonClasses("secondary", "sm")}
                  >
                    Detalii
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="Nu ai programări viitoare"
            description="Caută un psiholog și alege un interval disponibil. Solicitarea apare aici imediat, iar confirmarea vine prin notificare."
            action={
              <Link href="/cauta" className={buttonClasses("primary")}>
                Caută psihologi
              </Link>
            }
          />
        )}
      </section>

      <section aria-labelledby="istoric" className="space-y-3">
        <h2 id="istoric" className="text-xl font-semibold text-ink">Istoric</h2>
        {history.length > 0 ? (
          <ul className="space-y-3">
            {history.map((appointment) => (
              <li key={appointment.id}>
                <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">
                        {appointment.psychologist?.full_name ?? "Psiholog"}
                      </p>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {formatDateTime(appointment.starts_at)} · {appointment.duration_minutes} min
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/programari/${appointment.id}`}
                    className="text-sm font-semibold text-brand underline underline-offset-4"
                  >
                    Vezi detalii
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="p-5 text-sm text-muted">Nu există programări în istoric.</Card>
        )}
      </section>
    </div>
  );
}
