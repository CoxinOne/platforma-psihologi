import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Clock,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { requirePsychologist } from "@/lib/auth";
import {
  getMyPsychologistProfile,
  getUnreadBadge,
  listAppointmentsForPsychologist,
  listConversations,
} from "@/lib/data/user";
import { formatDateTime } from "@/lib/time";
import { PROFESSIONAL_STATUS_LABELS } from "@/lib/constants";
import { AppointmentStatusBadge } from "@/components/appointment-badges";
import { Alert, buttonClasses, Card, DemoBadge, EmptyState, PageHeader, Stat } from "@/components/ui";

export default async function PsychologistHomePage() {
  const session = await requirePsychologist();
  const [profile, appointments, conversations, badges] = await Promise.all([
    getMyPsychologistProfile(session.supabase, session.user.id),
    listAppointmentsForPsychologist(session.supabase, session.user.id),
    listConversations(session.supabase),
    getUnreadBadge(session.supabase),
  ]);

  const now = Date.now();
  const pending = appointments.filter((appointment) => appointment.status === "pending");
  const upcoming = appointments
    .filter(
      (appointment) =>
        new Date(appointment.starts_at).getTime() >= now &&
        appointment.status === "confirmed",
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cabinet"
        title={`Bună, ${session.profile.full_name.split(" ")[0]}`}
        description="Solicitările, programările confirmate și mesajele tale."
        action={
          <Link href="/cabinet/disponibilitate" className={buttonClasses("secondary")}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            Editează disponibilitatea
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Solicitări în așteptare" value={pending.length} href="/cabinet/programari" />
        <Stat label="Programări viitoare" value={upcoming.length} href="/cabinet/programari" />
        <Stat label="Mesaje necitite" value={badges.messages} href="/cabinet/mesaje" />
        <Stat label="Notificări" value={badges.notifications} href="/cabinet/notificari" />
      </div>

      {!profile ? (
        <Card className="border-brand-line bg-brand-soft/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-strong">Profilul profesional nu este creat</h2>
              <p className="mt-1 text-sm text-brand-strong/80">
                Completează datele profesionale pentru a putea fi verificat și publicat.
              </p>
            </div>
            <Link href="/cabinet/profil" className={buttonClasses("primary")}>
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Creează profilul
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Starea profilului</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-ink">
                  {PROFESSIONAL_STATUS_LABELS[profile.status]}
                </span>
                {profile.status === "approved" ? (
                  <BadgeCheck className="h-5 w-5 text-success" aria-label="Profil aprobat" />
                ) : null}
                {profile.is_demo ? <DemoBadge /> : null}
              </div>
              {profile.rejection_reason ? (
                <p className="mt-2 max-w-xl text-sm text-danger">{profile.rejection_reason}</p>
              ) : null}
              {profile.status === "draft" ? (
                <p className="mt-2 max-w-xl text-sm text-muted">
                  Completează profilul și trimite-l spre verificare. Nu este public până la aprobare.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/cabinet/profil" className={buttonClasses("secondary", "sm")}>
                Editează profilul
              </Link>
              {profile.status === "approved" ? (
                <Link href={`/psihologi/${profile.slug}`} className={buttonClasses("ghost", "sm")}>
                  Vezi profilul public
                </Link>
              ) : null}
            </div>
          </div>
        </Card>
      )}

      {pending.length > 0 ? (
        <Alert tone="warning" title="Ai solicitări care așteaptă răspuns">
          Confirmă sau respinge cererile din pagina de programări. Clientul primește notificare.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section aria-labelledby="cereri" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="cereri" className="text-xl font-semibold text-ink">Solicitări recente</h2>
            <Link href="/cabinet/programari" className="text-sm font-semibold text-brand underline underline-offset-4">
              Toate programările
            </Link>
          </div>
          {pending.length > 0 ? (
            <ul className="space-y-3">
              {pending.slice(0, 4).map((appointment) => (
                <li key={appointment.id}>
                  <Card className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{appointment.client?.full_name ?? "Client"}</p>
                      <p className="text-sm text-muted">
                        {formatDateTime(appointment.starts_at)} · {appointment.mode === "online" ? "Online" : "În cabinet"}
                      </p>
                    </div>
                    <Link href="/cabinet/programari" className={buttonClasses("secondary", "sm")}>
                      Răspunde
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card className="p-5 text-sm text-muted">Nu ai solicitări în așteptare.</Card>
          )}
        </section>

        <div className="space-y-4">
          <section aria-labelledby="urmatoare" className="space-y-3">
            <h2 id="urmatoare" className="text-lg font-semibold text-ink">Următoarele ședințe</h2>
            {upcoming.length > 0 ? (
              <ul className="space-y-2">
                {upcoming.slice(0, 4).map((appointment) => (
                  <li key={appointment.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">
                        {appointment.client?.full_name ?? "Client"}
                      </p>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(appointment.starts_at)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Card className="p-5 text-sm text-muted">Nu ai ședințe confirmate în viitor.</Card>
            )}
          </section>

          <section aria-labelledby="mesaje" className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 id="mesaje" className="text-lg font-semibold text-ink">Conversații</h2>
              <Link href="/cabinet/mesaje" className="text-xs font-semibold text-brand underline underline-offset-4">
                Toate
              </Link>
            </div>
            {conversations.length > 0 ? (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {conversations.slice(0, 3).map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      href={`/cabinet/mesaje/${conversation.id}`}
                      className="flex items-center justify-between gap-2 p-4 text-sm hover:bg-brand-soft/40"
                    >
                      <span className="truncate font-medium text-ink">{conversation.counterpart_name}</span>
                      {conversation.unread_count > 0 ? (
                        <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[0.65rem] font-bold text-white">
                          {conversation.unread_count}
                        </span>
                      ) : (
                        <MessageCircle className="h-4 w-4 text-muted" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Card className="p-5 text-sm text-muted">Nu ai conversații încă.</Card>
            )}
          </section>
        </div>
      </div>

      {profile && !profile.photo_path ? (
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted">
            <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
            Adaugă o fotografie de profil pentru un profil public complet. Fără fotografie, profilul
            afișează inițialele numelui.
          </p>
          <Link href="/cabinet/profil" className={buttonClasses("secondary", "sm")}>
            Adaugă fotografie
          </Link>
        </Card>
      ) : null}

      {appointments.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Nicio programare încă"
          description="Publică disponibilitatea și aprobă profilul pentru a primi solicitări."
        />
      ) : null}
    </div>
  );
}
