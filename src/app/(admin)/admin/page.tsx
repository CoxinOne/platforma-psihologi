import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAdminAuditLogs, getAdminSystemStatus } from "@/lib/data/admin";
import type { AdminStats } from "@/lib/types";
import { formatDateTime } from "@/lib/time";
import { Alert, buttonClasses, Card, PageHeader, Stat } from "@/components/ui";

export default async function AdminHomePage() {
  const session = await requireAdmin();
  const [statsResult, audit, system] = await Promise.all([
    session.supabase.rpc("admin_dashboard_stats"),
    listAdminAuditLogs(8).catch(() => []),
    getAdminSystemStatus(),
  ]);

  const stats = (statsResult.data ?? {}) as Partial<AdminStats>;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administrare"
        title="Sumar operațional"
        description="Starea platformei, activitatea recentă și acțiunile care necesită atenție."
      />

      {!system.serviceRoleConfigured ? (
        <Alert tone="danger" title="Cheia de serviciu lipsește">
          Operațiunile administrative care necesită acces la date (liste de conturi, aprobări,
          ștergeri) nu funcționează fără SUPABASE_SERVICE_ROLE_KEY.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Conturi active" value={stats.users_total ?? 0} href="/admin/conturi" />
        <Stat label="Profiluri în verificare" value={stats.profiles_pending ?? 0} href="/admin/profesionisti" />
        <Stat label="Raportări deschise" value={stats.reports_open ?? 0} href="/admin/raportari" />
        <Stat label="Cereri GDPR" value={stats.data_requests_pending ?? 0} href="/admin/cereri" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Activitate administrativă recentă</h2>
            <Link href="/admin/audit" className="text-sm font-semibold text-brand underline underline-offset-4">
              Jurnal complet
            </Link>
          </div>
          {audit.length > 0 ? (
            <ul className="mt-4 divide-y divide-line text-sm">
              {audit.map((log) => (
                <li key={log.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-ink">{log.action}</span>
                    <span className="text-xs text-muted">{formatDateTime(log.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {log.actor_name ?? "Sistem"} · {log.entity_type ?? "—"} {log.entity_id ?? ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Nu există activitate înregistrată.</p>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-ink">Starea sistemului</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Baza de date</dt>
                <dd className={system.database === "ok" ? "font-semibold text-success" : "font-semibold text-danger"}>
                  {system.database === "ok" ? `OK (${system.latencyMs} ms)` : "Eroare"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">E-mail tranzacțional</dt>
                <dd className="font-semibold text-ink">
                  {system.emailConfigured ? "Configurat" : "Neconfigurat"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Cheie de serviciu</dt>
                <dd className="font-semibold text-ink">
                  {system.serviceRoleConfigured ? "Configurată" : "Lipsă"}
                </dd>
              </div>
            </dl>
            <Link href="/admin/sistem" className={buttonClasses("secondary", "sm", "mt-4")}>
              Detalii sistem
            </Link>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-ink">Acțiuni rapide</h2>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/admin/profesionisti" className={buttonClasses("primary", "sm")}>
                Verifică profiluri ({stats.profiles_pending ?? 0})
              </Link>
              <Link href="/admin/conturi" className={buttonClasses("secondary", "sm")}>
                Gestionează conturi
              </Link>
              <Link href="/admin/raportari" className={buttonClasses("secondary", "sm")}>
                Raportări deschise ({stats.reports_open ?? 0})
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5 text-sm text-muted">
        <p className="font-semibold text-ink">Acces limitat la date sensibile</p>
        <p className="mt-1">
          Administratorul nu are acces la conversațiile private prin interfață. Datele de contact
          sunt afișate doar în scop administrativ. Fiecare acțiune este înregistrată în jurnalul de
          audit.
        </p>
      </Card>
    </div>
  );
}
