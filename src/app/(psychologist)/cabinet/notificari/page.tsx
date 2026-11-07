import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { requirePsychologist } from "@/lib/auth";
import { getNotificationPreferences, listNotifications } from "@/lib/data/user";
import { formatDateTime } from "@/lib/time";
import { notificationHref } from "@/lib/notifications";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";
import { NotificationPreferencesForm } from "@/components/account-forms";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export default async function PsychologistNotificationsPage() {
  const session = await requirePsychologist();
  const [notifications, preferences] = await Promise.all([
    listNotifications(session.supabase),
    getNotificationPreferences(session.supabase),
  ]);
  const unread = notifications.filter((notification) => !notification.read_at).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notificări"
        title="Notificările mele"
        description="Mesaje noi și notificări despre contul tău."
        action={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-surface px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Marchează toate citite
              </button>
            </form>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section aria-label="Lista notificărilor" className="space-y-3">
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={
                    notification.read_at
                      ? "rounded-2xl border border-line bg-surface p-4"
                      : "rounded-2xl border border-brand-line bg-brand-soft/40 p-4"
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{notification.title}</p>
                      {notification.body ? <p className="mt-1 text-sm text-muted">{notification.body}</p> : null}
                      <p className="mt-2 text-xs text-muted">{formatDateTime(notification.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read_at ? <Badge tone="brand">Necitită</Badge> : null}
                      {notificationHref(notification.action_url) ? (
                        <Link
                          href={notificationHref(notification.action_url) as string}
                          className="text-sm font-semibold text-brand underline underline-offset-4"
                        >
                          Deschide
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {!notification.read_at ? (
                    <form action={markNotificationReadAction} className="mt-2">
                      <input type="hidden" name="id" value={notification.id} />
                      <button type="submit" className="text-xs font-semibold text-brand underline underline-offset-4">
                        Marchează citită
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Bell className="h-6 w-6" />}
              title="Nu ai notificări"
              description="Vei primi notificări pentru mesaje noi și schimbări ale contului."
            />
          )}
        </section>

        <Card>
          <h2 className="text-lg font-semibold text-ink">Preferințe</h2>
          <div className="mt-4">
            <NotificationPreferencesForm
              inApp={preferences?.in_app ?? true}
              emailMessages={preferences?.email_messages ?? false}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
