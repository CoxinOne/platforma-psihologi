import Link from "next/link";
import { AlertTriangle, BadgeCheck, MessageCircle, UserRound } from "lucide-react";
import { requirePsychologist } from "@/lib/auth";
import {
  getMyPsychologistProfile,
  getUnreadBadge,
  listConversations,
} from "@/lib/data/user";
import { PROFESSIONAL_STATUS_LABELS } from "@/lib/constants";
import { buttonClasses, Card, DemoBadge, PageHeader, Stat } from "@/components/ui";

export default async function PsychologistHomePage() {
  const session = await requirePsychologist();
  const [profile, conversations, badges] = await Promise.all([
    getMyPsychologistProfile(session.supabase, session.user.id),
    listConversations(session.supabase),
    getUnreadBadge(session.supabase),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cabinet"
        title={`Bună, ${session.profile.full_name.split(" ")[0]}`}
        description="Mesajele clienților și starea profilului tău profesional."
        action={
          <Link href="/cabinet/profil" className={buttonClasses("secondary")}>
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Editează profilul
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Stare profil"
          value={profile ? PROFESSIONAL_STATUS_LABELS[profile.status] : "Necreat"}
          href="/cabinet/profil"
        />
        <Stat label="Conversații" value={conversations.length} href="/cabinet/mesaje" />
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

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section aria-labelledby="conversatii" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="conversatii" className="text-xl font-semibold text-ink">Conversații recente</h2>
            <Link href="/cabinet/mesaje" className="text-sm font-semibold text-brand underline underline-offset-4">
              Toate mesajele
            </Link>
          </div>
          {conversations.length > 0 ? (
            <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
              {conversations.slice(0, 6).map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    href={`/cabinet/mesaje/${conversation.id}`}
                    className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-brand-soft/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
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
                    ) : (
                      <MessageCircle className="h-4 w-4 text-muted" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Card className="p-5 text-sm text-muted">
              Nu ai conversații încă. Clienții îți pot scrie din profilul public, după aprobare.
            </Card>
          )}
        </section>

        <div className="space-y-4">
          <Card className="p-5 text-sm text-muted">
            <p className="font-semibold text-ink">Cum te contactează clienții</p>
            <p className="mt-1">
              Platforma oferă profil public și mesagerie privată. Nu gestionează programări sau
              plăți. Tariful se discută direct, în funcție de complexitate.
            </p>
          </Card>

          <Card className="p-5 text-sm text-muted">
            <p className="font-semibold text-ink">Vizibilitate</p>
            <p className="mt-1">
              Profilul apare în directoriu numai după aprobarea administratorului și dacă datele
              profesionale sunt complete.
            </p>
            <Link href="/cabinet/profil" className={buttonClasses("secondary", "sm", "mt-3")}>
              Verifică profilul
            </Link>
          </Card>
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
    </div>
  );
}
