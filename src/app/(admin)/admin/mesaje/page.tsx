import { requireAdmin } from "@/lib/auth";
import { adminSetContactStatusAction } from "@/lib/actions/admin";
import { listAdminContactMessages } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/time";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";

export default async function AdminContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; eroare?: string }>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const messages = await listAdminContactMessages();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operare"
        title="Mesaje din formularul public"
        description="Solicitări primite prin formularul de contact. Nu conțin date medicale solicitate de platformă."
      />

      {params.status ? <Alert tone="success">Mesajul a fost actualizat.</Alert> : null}
      {params.eroare ? <Alert tone="danger">{params.eroare}</Alert> : null}

      {messages.length > 0 ? (
        <ul className="space-y-3">
          {messages.map((message) => (
            <li key={message.id}>
              <Card className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{message.subject}</p>
                    <p className="text-sm text-muted">
                      {message.name} · <a className="underline" href={`mailto:${message.email}`}>{message.email}</a>
                    </p>
                    <p className="text-xs text-muted">{formatDateTime(message.created_at)}</p>
                  </div>
                  <Badge tone={message.status === "new" ? "warning" : message.status === "read" ? "brand" : "neutral"}>
                    {message.status}
                  </Badge>
                </div>
                <p className="whitespace-pre-line rounded-xl bg-canvas p-3 text-sm text-ink">{message.message}</p>
                <form action={adminSetContactStatusAction} className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
                  <input type="hidden" name="messageId" value={message.id} />
                  <label className="text-xs text-muted">
                    Status
                    <select name="status" defaultValue={message.status} className="mt-1 block rounded-lg border border-line bg-surface px-2 py-1.5 text-sm">
                      <option value="new">Nou</option>
                      <option value="read">Citit</option>
                      <option value="archived">Arhivat</option>
                    </select>
                  </label>
                  <button type="submit" className="rounded-full border border-brand-line px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft">
                    Salvează
                  </button>
                </form>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-5 text-sm text-muted">Nu există mesaje.</Card>
      )}
    </div>
  );
}
