import { requireAdmin } from "@/lib/auth";
import {
  adminDeleteAccountAction,
  adminProcessDataRequestAction,
} from "@/lib/actions/admin";
import { listAdminDataRequests } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/time";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";

const STATUS_LABELS: Record<string, string> = {
  pending: "În așteptare",
  processing: "În procesare",
  completed: "Finalizată",
  rejected: "Respinsă",
};

export default async function AdminDataRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; eroare?: string }>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const requests = await listAdminDataRequests();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="GDPR"
        title="Cereri privind datele"
        description="Exporturile se marchează după livrare. Ștergerea contului elimină utilizatorul și datele asociate prin cascade. Acțiunile sunt auditate."
      />

      {params.status ? <Alert tone="success">Cererea a fost actualizată.</Alert> : null}
      {params.eroare ? <Alert tone="danger">{params.eroare}</Alert> : null}

      {requests.length > 0 ? (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{request.user_name}</p>
                    <p className="text-sm text-muted">{request.user_email}</p>
                    <p className="text-xs text-muted">
                      {request.type === "export" ? "Export date" : "Ștergere cont"} ·{" "}
                      {formatDateTime(request.requested_at)}
                    </p>
                    {request.note ? <p className="mt-1 text-sm text-muted">Notă: {request.note}</p> : null}
                  </div>
                  <Badge tone={request.status === "completed" ? "success" : request.status === "rejected" ? "danger" : "warning"}>
                    {STATUS_LABELS[request.status] ?? request.status}
                  </Badge>
                </div>

                {request.type === "export" ? (
                  <form action={adminProcessDataRequestAction} className="flex flex-wrap items-end gap-3 border-t border-line pt-3">
                    <input type="hidden" name="requestId" value={request.id} />
                    <label className="text-xs text-muted">
                      Status
                      <select name="status" defaultValue={request.status} className="mt-1 block rounded-lg border border-line bg-white px-2 py-1.5 text-sm">
                        <option value="processing">În procesare</option>
                        <option value="completed">Finalizată</option>
                        <option value="rejected">Respinsă</option>
                      </select>
                    </label>
                    <label className="min-w-56 flex-1 text-xs text-muted">
                      Notă
                      <input name="note" maxLength={1000} className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                    </label>
                    <button type="submit" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
                      Actualizează
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 border-t border-line pt-3">
                    <Alert tone="warning" title="Ștergerea este ireversibilă">
                      Verifică identitatea și cererea înainte de ștergere. Programările viitoare și
                      mesajele vor fi eliminate.
                    </Alert>
                    <form action={adminDeleteAccountAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="userId" value={request.user_id} />
                      <input type="hidden" name="requestId" value={request.id} />
                      <label className="text-xs text-muted">
                        Scrie „sterge” pentru confirmare
                        <input
                          name="confirmation"
                          required
                          pattern="sterge"
                          className="mt-1 block rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                        />
                      </label>
                      <button type="submit" className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white">
                        Șterge contul
                      </button>
                    </form>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-5 text-sm text-muted">Nu există cereri.</Card>
      )}
    </div>
  );
}
