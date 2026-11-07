import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminSetAccountStatusAction, adminSetRoleAction } from "@/lib/actions/admin";
import { listAdminAccounts } from "@/lib/data/admin";
import { PROFESSIONAL_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/time";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";
import type { UserRole } from "@/lib/types";

const ROLE_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Toate" },
  { value: "client", label: "Clienți" },
  { value: "psychologist", label: "Psihologi" },
  { value: "admin", label: "Administratori" },
];

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; status?: string; eroare?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const accounts = await listAdminAccounts();
  const filter = params.rol ?? "";
  const filtered = filter ? accounts.filter((account) => account.profile.role === filter) : accounts;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrare"
        title="Conturi și roluri"
        description="Rolurile pot fi schimbate doar aici, cu verificare pe server și jurnal de audit. Suspendarea necesită motiv."
      />

      {params.status ? <Alert tone="success">Acțiunea a fost aplicată.</Alert> : null}
      {params.eroare ? <Alert tone="danger">{params.eroare}</Alert> : null}

      <div className="flex flex-wrap gap-2">
        {ROLE_FILTERS.map((item) => (
          <Link
            key={item.value}
            href={item.value ? `/admin/conturi?rol=${item.value}` : "/admin/conturi"}
            className={
              filter === item.value
                ? "rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-cream"
                : "rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft"
            }
          >
            {item.label}
          </Link>
        ))}
        <span className="self-center text-sm text-muted">{filtered.length} conturi</span>
      </div>

      <ul className="space-y-3">
        {filtered.map(({ profile, professionalStatus }) => (
          <li key={profile.id}>
            <Card className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{profile.full_name}</p>
                    <Badge tone={profile.role === "admin" ? "danger" : profile.role === "psychologist" ? "brand" : "neutral"}>
                      {ROLE_LABELS[profile.role]}
                    </Badge>
                    {profile.status === "suspended" ? <Badge tone="danger">Suspendat</Badge> : null}
                    {profile.requested_role === "psychologist" && profile.role === "client" ? (
                      <Badge tone="warning">Cere cont de psiholog</Badge>
                    ) : null}
                    {profile.is_demo ? <Badge tone="sand">Demo</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{profile.email}</p>
                  <p className="text-xs text-muted">
                    Creat la {formatDateTime(profile.created_at)}
                    {professionalStatus
                      ? ` · Profil profesional: ${PROFESSIONAL_STATUS_LABELS[professionalStatus]}`
                      : ""}
                  </p>
                </div>
                <div className="text-right text-xs text-muted">
                  ID: <span className="font-mono">{profile.id.slice(0, 8)}…</span>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-4 border-t border-line pt-4">
                <form action={adminSetRoleAction} className="flex items-end gap-2">
                  <input type="hidden" name="userId" value={profile.id} />
                  <label className="text-xs font-semibold text-muted" htmlFor={`role-${profile.id}`}>
                    Rol
                    <select
                      id={`role-${profile.id}`}
                      name="role"
                      defaultValue={profile.role}
                      className="mt-1 block rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink"
                      disabled={profile.id === session.user.id}
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={profile.id === session.user.id}
                    className="rounded-full border border-brand-line bg-surface px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft disabled:opacity-50"
                  >
                    Salvează rolul
                  </button>
                </form>

                {profile.status === "active" ? (
                  profile.id === session.user.id ? (
                    <p className="text-xs text-muted">Nu îți poți suspenda propriul cont.</p>
                  ) : (
                    <details className="rounded-xl border border-line bg-canvas p-3">
                      <summary className="cursor-pointer list-none text-xs font-semibold text-danger">
                        Suspendă contul
                      </summary>
                      <form action={adminSetAccountStatusAction} className="mt-2 space-y-2">
                        <input type="hidden" name="userId" value={profile.id} />
                        <input type="hidden" name="status" value="suspended" />
                        <label className="block text-xs text-muted" htmlFor={`reason-${profile.id}`}>
                          Motiv (minimum 10 caractere)
                        </label>
                        <textarea
                          id={`reason-${profile.id}`}
                          name="reason"
                          rows={2}
                          required
                          minLength={10}
                          maxLength={1000}
                          className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-cream hover:bg-danger-strong"
                        >
                          Confirmă suspendarea
                        </button>
                      </form>
                    </details>
                  )
                ) : (
                  <form action={adminSetAccountStatusAction}>
                    <input type="hidden" name="userId" value={profile.id} />
                    <input type="hidden" name="status" value="active" />
                    <button
                      type="submit"
                      className="rounded-full border border-brand-line bg-surface px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft"
                    >
                      Reactivează contul
                    </button>
                  </form>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? <p className="text-sm text-muted">Niciun cont pentru filtrul selectat.</p> : null}
    </div>
  );
}
