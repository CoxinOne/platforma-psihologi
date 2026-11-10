import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { requireClient } from "@/lib/auth";
import {
  getUnreadBadge,
  listConversations,
  listNotifications,
} from "@/lib/data/user";
import { formatDateTime } from "@/lib/time";
import { Alert, buttonClasses, Card, Stat } from "@/components/ui";

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireClient();
  const { profile, supabase } = session;
  const params = await searchParams;

  const [conversations, notifications, badges] = await Promise.all([
    listConversations(supabase),
    listNotifications(supabase, 4),
    getUnreadBadge(supabase),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Contul meu</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-ink">Bună, {profile.full_name.split(" ")[0]}</h1>
        </div>
        <p className="mt-1 text-muted">
          Aici vezi mesajele și notificările tale. Pentru o consultație, contactează psihologul prin
          mesagerie.
        </p>
      </div>

      {params.status === "parola-actualizata" ? (
        <Alert tone="success">Parola a fost actualizată.</Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Mesaje necitite" value={badges.messages} href="/dashboard/mesaje" />
        <Stat label="Conversații" value={conversations.length} href="/dashboard/mesaje" />
        <Stat label="Notificări necitite" value={badges.notifications} href="/dashboard/notificari" />
        <Stat
          label="Cont"
          value={profile.status === "active" ? "Activ" : "Restricționat"}
          hint={profile.status === "pending_deletion" ? "Ștergere solicitată" : undefined}
          href="/dashboard/confidentialitate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="conversatii" className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="conversatii" className="text-xl font-semibold text-ink">Conversațiile mele</h2>
            <Link href="/dashboard/mesaje" className="text-sm font-semibold text-brand underline underline-offset-4">
              Toate
            </Link>
          </div>

          {conversations.length > 0 ? (
            <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
              {conversations.slice(0, 5).map((conversation) => (
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
                      <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[0.65rem] font-bold text-cream">
                        {conversation.unread_count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Card className="p-5 text-sm text-muted">
              Nu ai conversații încă. Alege un psiholog și trimite-i un mesaj privat.
            </Card>
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

          <Card className="border-brand-line bg-brand-soft/40 p-5">
            <p className="text-sm font-semibold text-brand-strong">Cum stabilim tariful</p>
            <p className="mt-1 text-sm text-brand-strong/80">
              Prețul este în funcție de complexitate. Îl poți discuta direct cu psihologul, în
              conversația privată, înainte de a stabili o întâlnire.
            </p>
            <Link href="/psihologi" className={buttonClasses("secondary", "sm", "mt-3")}>
              Vezi psihologii
            </Link>
          </Card>
        </section>

        <div className="min-w-0 space-y-6">
          <section aria-labelledby="notificari-recente" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 id="notificari-recente" className="text-lg font-semibold text-ink">Notificări recente</h2>
              <Link href="/dashboard/notificari" className="text-xs font-semibold text-brand underline underline-offset-4">
                Toate
              </Link>
            </div>
            {notifications.length > 0 ? (
              <ul className="space-y-2">
                {notifications.slice(0, 4).map((notification) => (
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

          <Card className="p-5 text-sm text-muted">
            <p className="font-semibold text-ink">Platforma nu procesează plăți</p>
            <p className="mt-1">
              Nu există plată online și nu afișăm tarife fixe. Detaliile financiare se stabilesc
              direct cu psihologul.
            </p>
          </Card>
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
