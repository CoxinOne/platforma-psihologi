import { requireAdmin } from "@/lib/auth";
import { listAdminAuditLogs } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/time";
import { PageHeader } from "@/components/ui";

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await listAdminAuditLogs(200);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Securitate"
        title="Jurnal de audit"
        description="Acțiuni administrative și de securitate. Jurnalul nu conține parole, tokenuri sau conținutul conversațiilor."
      />

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
        <table className="min-w-[840px] w-full text-left text-sm">
          <caption className="sr-only">Jurnal de audit, cele mai recente 200 de intrări</caption>
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Actor</th>
              <th className="px-4 py-3 font-semibold">Acțiune</th>
              <th className="px-4 py-3 font-semibold">Entitate</th>
              <th className="px-4 py-3 font-semibold">Metadate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="px-4 py-3 text-xs text-muted">{formatDateTime(log.created_at)}</td>
                <td className="px-4 py-3">
                  <span className="block text-ink">{log.actor_name ?? "Sistem"}</span>
                  <span className="text-xs text-muted">{log.actor_role ?? "—"}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink">{log.action}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {log.entity_type ?? "—"}
                  {log.entity_id ? <span className="block font-mono">{log.entity_id}</span> : null}
                </td>
                <td className="max-w-64 px-4 py-3">
                  <code className="line-clamp-2 break-all text-[0.7rem] text-muted">
                    {JSON.stringify(log.metadata)}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 ? <p className="text-sm text-muted">Jurnalul este gol.</p> : null}
    </div>
  );
}
