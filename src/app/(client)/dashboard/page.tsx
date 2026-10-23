import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { requireClient } from "@/lib/auth";
import {
  getUnreadBadge,
  listAppointmentsForClient,
  listConversations,
  listNotifications,
} from "@/lib/data/user";
import { formatDateTime } from "@/lib/time";
import { AppointmentStatusBadge, ModeBadge } from "@/components/appointment-badges";
import { Alert, buttonClasses, Card, DemoBadge, EmptyState, Stat } from "@/components/ui";

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireClient();
  const { profile, supabase } = session;
  const params = await searchParams;

  const [appointments, conversations, notifications, badges] = await Promise.all([
    listAppointmentsForClient(supabase, profile.id),
    listConversations(supabase),
    listNotifications(supabase, 4),
    getUnreadBadge(supabase),
  ]);

  const now = Date.now();
  const upcoming = appointments
    .filter(
      (appointment) =>
        new Date(appointment.starts_at).getTime() >= now &&
        (appointment.status === "pending" || appointment.status === "confirmed"),
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const nextAppointment = upcoming[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Contul meu</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-ink">Bună, {profile.full_name.split(" ")[0]}</h1>
          {profile.is_demo ? <DemoBadge /> : null}
        </div>
        <p className="mt-1 text-muted">
          Aici vezi programările, mesajele și notificările tale.
        </p>
      </div>

      {params.status === "parola-actualizata" ? (
        <Alert tone="success">Parola a fost actualizată.</Alert>
      ) : null}

      {profile.requested_role === "psychologist" ? (
        <Alert tone="info" title="Cerere de cont profesional în așteptare">
          Administratorul verifică identitatea și calificările. Vei primi o notificare după decizie.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Programări viitoare" value={upcoming.length} href="/dashboard/programari" />
        <Stat label="Mesaje necitite" value={badges.messages} href="/dashboard/mesaje" />
        <Stat label="Notificări necitite" value={badges.notifications} href="/dashboard/notificari" />
        <Stat
          label="Cont"
          value={profile.status === "active" ? "Activ" : "Restricționat"}
          hint={profile.status === "pending_deletion" ? "Ștergere solicitată" : undefined}
          href="/dashboard/confidentialitate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="urmatoarea" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="urmatoarea" className="text-xl font-semibold text-ink">Următoarea programare</h2>
            <Link href="/dashboard/programari" className="text-sm font-semibold text-brand underline underline-offset-4">
              Toate programările
            </Link>
          </div>

          {nextAppointment ? (
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">Cu</p>
                  <p className="text-lg font-semibold text-ink">
                    {nextAppointment.psychologist?.full_name ?? "Psiholog"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {formatDateTime(nextAppointment.starts_at)} · {nextAppointment.duration_minutes} min
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <AppointmentStatusBadge status={nextAppointment.status} />
                  <ModeBadge mode={nextAppointment.mode} />
                </div>
              </div>
              {nextAppointment.cabinet ? (
                <p className="mt-3 text-sm text-muted">
                  {nextAppointment.cabinet.name} — {nextAppointment.cabinet.address_line},{" "}
                  {nextAppointment.cabinet.city}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/programari/${nextAppointment.id}`}
                  className={buttonClasses("secondary", "sm")}
                >
                  Detalii și acțiuni
                </Link>
                <Link href="/psihologi" className={buttonClasses("ghost", "sm")}>
                  Vezi alți psihologi
                </Link>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="Nu ai programări viitoare"
              description="Poți căuta un psiholog potrivit și solicita o ședință. Programarea apare aici după confirmare."
              action={
                <Link href="/cauta" className={buttonClasses("primary")}>
                  Caută un psiholog
                </Link>
              }
            />
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/cauta" className="rounded-2xl border border-line bg-surface p-4 hover:border-brand-line">
              <UserRound className="h-5 w-5 text-brand" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink">Găsește un psiholog</p>
              <p className="mt-1 text-xs text-muted">Filtrează după nevoie și oraș.</p>
            </Link>
            <Link href="/dashboard/mesaje" className="rounded-2xl border border-line bg-surface p-4 hover:border-brand-line">
              <MessageCircle className="h-5 w-5 text-brand" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink">Mesajele mele</p>
              <p className="mt-1 text-xs text-muted">Conversații private cu psihologii.</p>
            </Link>
            <Link href="/dashboard/confidentialitate" className="rounded-2xl border border-line bg-surface p-4 hover:border-brand-line">
              <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink">Datele mele</p>
              <p className="mt-1 text-xs text-muted">Export, ștergere și consimțământ.</p>
            </Link>
          </div>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="conversatii" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 id="conversatii" className="text-lg font-semibold text-ink">Conversații recente</h2>
              <Link href="/dashboard/mesaje" className="text-xs font-semibold text-brand underline underline-offset-4">
                Toate
              </Link>
            </div>
            {conversations.length > 0 ? (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {conversations.slice(0, 4).map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      href={`/dashboard/mesaje/${conversation.id}`}
                      className="flex items-center justify-between gap-3 p-4 hover:bg-brand-soft/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {conversation.counterpart_name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {conversation.last_message_preview ?? "Conversație nouă"}
                        </span>
                      </span>
                      {conversation.unread_count > 0 ? (
                        <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[0.65rem] font-bold text-white">
                          {conversation.unread_count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Card className="p-5 text-sm text-muted">
                Nu ai conversații încă. Poți începe una din profilul unui psiholog.
              </Card>
            )}
          </section>

          <section aria-labelledby="notificari-recente" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 id="notificari-recente" className="text-lg font-semibold text-ink">Notificări recente</h2>
              <Link href="/dashboard/notificari" className="text-xs font-semibold text-brand underline underline-offset-4">
                Toate
              </Link>
            </div>
            {notifications.length > 0 ? (
              <ul className="space-y-2">
                {notifications.slice(0, 3).map((notification) => (
                  <li key={notification.id} className="rounded-2xl border border-line bg-surface p-4">
                    <p className="text-sm font-semibold text-ink">{notification.title}</p>
                    <p className="mt-1 text-xs text-muted">{notification.body}</p>
                    <p className="mt-1 text-[0.7rem] text-muted">{formatDateTime(notification.created_at)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Card className="p-5 text-sm text-muted">Nu ai notificări.</Card>
            )}
          </section>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-brand-line bg-brand-soft/50 p-4 text-sm text-brand-strong">
        <p>Ai nevoie de ajutor cu platforma?</p>
        <Link href="/contact" className="inline-flex items-center gap-1 font-semibold underline underline-offset-4">
          Contactează-ne <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
