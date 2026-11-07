import { requireAdmin } from "@/lib/auth";
import { adminUpdateReportAction } from "@/lib/actions/admin";
import { listAdminReports } from "@/lib/data/admin";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/time";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; eroare?: string }>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const reports = await listAdminReports();
  const open = reports.filter((report) => report.status === "open" || report.status === "in_review");
  const closed = reports.filter((report) => !open.includes(report));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Siguranță"
        title="Raportări de abuz"
        description="Verifică raportările, notează decizia și închide cazul. Nu afișa public detalii despre persoane."
      />

      {params.status ? <Alert tone="success">Raportarea a fost actualizată.</Alert> : null}
      {params.eroare ? <Alert tone="danger">{params.eroare}</Alert> : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Deschise ({open.length})</h2>
        {open.length > 0 ? (
          <ul className="space-y-3">
            {open.map((report) => (
              <li key={report.id}>
                <Card className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">
                        {report.reporter_name} → {report.reported_name}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDateTime(report.created_at)} · categorie: {report.category}
                      </p>
                    </div>
                    <Badge tone="warning">{REPORT_STATUS_LABELS[report.status]}</Badge>
                  </div>
                  {report.details ? (
                    <p className="rounded-xl bg-canvas p-3 text-sm whitespace-pre-line text-ink">{report.details}</p>
                  ) : null}
                  <form action={adminUpdateReportAction} className="flex flex-wrap items-end gap-3 border-t border-line pt-3">
                    <input type="hidden" name="reportId" value={report.id} />
                    <label className="text-xs text-muted">
                      Status
                      <select name="status" defaultValue={report.status} className="mt-1 block rounded-lg border border-line bg-surface px-2 py-1.5 text-sm">
                        {Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="min-w-64 flex-1 text-xs text-muted">
                      Notă internă
                      <textarea name="note" rows={2} maxLength={2000} defaultValue={report.resolution_note ?? ""} className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm" />
                    </label>
                    <button type="submit" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream">
                      Salvează decizia
                    </button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="p-5 text-sm text-muted">Nu există raportări deschise.</Card>
        )}
      </section>

      {closed.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Închise ({closed.length})</h2>
          <ul className="space-y-2">
            {closed.map((report) => (
              <li key={report.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-ink">
                    {report.reporter_name} → {report.reported_name} · {report.category}
                  </span>
                  <Badge tone={report.status === "resolved" ? "success" : "neutral"}>
                    {REPORT_STATUS_LABELS[report.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">{formatDateTime(report.created_at)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
