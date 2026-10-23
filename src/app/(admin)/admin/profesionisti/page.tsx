import { requireAdmin } from "@/lib/auth";
import { adminSetProfessionalStatusAction } from "@/lib/actions/admin";
import { listAdminProfessionals } from "@/lib/data/admin";
import { PROFESSIONAL_STATUS_LABELS, MODE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/time";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";

export default async function AdminProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; eroare?: string }>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const professionals = await listAdminProfessionals();

  const pending = professionals.filter((item) => item.profile.status === "pending");
  const others = professionals.filter((item) => item.profile.status !== "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verificare"
        title="Profiluri profesionale"
        description="Verifică datele înainte de publicare. Aprobarea setează insigna „Verificat” și publică profilul."
      />

      {params.status ? (
        <Alert tone="success">Statusul profilului a fost actualizat: {params.status}.</Alert>
      ) : null}
      {params.eroare ? <Alert tone="danger">{params.eroare}</Alert> : null}

      <section aria-labelledby="in-verificare" className="space-y-4">
        <h2 id="in-verificare" className="text-xl font-semibold text-ink">
          În verificare ({pending.length})
        </h2>
        {pending.length > 0 ? (
          <ul className="space-y-4">
            {pending.map((item) => (
              <li key={item.profile.user_id}>
                <Card className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-ink">{item.profile.display_name}</p>
                      <p className="text-sm text-muted">{item.profile.professional_title}</p>
                      <p className="text-xs text-muted">
                        {item.fullName} · {item.email} · /psihologi/{item.profile.slug}
                      </p>
                    </div>
                    <Badge tone="warning">{PROFESSIONAL_STATUS_LABELS[item.profile.status]}</Badge>
                  </div>

                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Prezentare</p>
                      <p className="mt-1 whitespace-pre-line text-ink">{item.profile.bio ?? "—"}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Studii</p>
                        <p className="mt-1 whitespace-pre-line text-ink">{item.profile.education ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Experiență</p>
                        <p className="mt-1 whitespace-pre-line text-ink">{item.profile.experience ?? "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted">Specializări</p>
                      <p className="text-ink">{item.specialties.join(", ") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Consultații</p>
                      <p className="text-ink">
                        {item.profile.consultation_modes.map((mode) => MODE_LABELS[mode]).join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Nr. înregistrare</p>
                      <p className="font-mono text-xs text-ink">{item.profile.professional_registry_number ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-3 border-t border-line pt-4">
                    <form action={adminSetProfessionalStatusAction}>
                      <input type="hidden" name="userId" value={item.profile.user_id} />
                      <input type="hidden" name="status" value="approved" />
                      <button
                        type="submit"
                        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
                      >
                        Aprobă și publică
                      </button>
                    </form>

                    <details className="rounded-xl border border-line bg-canvas p-3">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-danger">
                        Respinge
                      </summary>
                      <form action={adminSetProfessionalStatusAction} className="mt-2 space-y-2">
                        <input type="hidden" name="userId" value={item.profile.user_id} />
                        <input type="hidden" name="status" value="rejected" />
                        <textarea
                          name="reason"
                          rows={2}
                          required
                          minLength={10}
                          maxLength={1000}
                          placeholder="Motivul respingerii (minimum 10 caractere)"
                          className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Confirmă respingerea
                        </button>
                      </form>
                    </details>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="p-5 text-sm text-muted">Nu există profiluri în așteptare.</Card>
        )}
      </section>

      <section aria-labelledby="toate" className="space-y-4">
        <h2 id="toate" className="text-xl font-semibold text-ink">Toate profilurile ({others.length})</h2>
        <ul className="space-y-3">
          {others.map((item) => (
            <li key={item.profile.user_id}>
              <Card className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{item.profile.display_name}</p>
                      <Badge
                        tone={
                          item.profile.status === "approved"
                            ? "success"
                            : item.profile.status === "rejected"
                              ? "danger"
                              : item.profile.status === "suspended"
                                ? "warning"
                                : "neutral"
                        }
                      >
                        {PROFESSIONAL_STATUS_LABELS[item.profile.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">{item.fullName} · {item.email}</p>
                    <p className="text-xs text-muted">
                      Actualizat {formatDate(item.profile.updated_at)} · {item.specialties.join(", ") || "fără specializări"}
                    </p>
                    {item.profile.rejection_reason ? (
                      <p className="mt-1 text-sm text-danger">Motiv: {item.profile.rejection_reason}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.profile.status === "approved" ? (
                      <form action={adminSetProfessionalStatusAction}>
                        <input type="hidden" name="userId" value={item.profile.user_id} />
                        <input type="hidden" name="status" value="suspended" />
                        <input type="hidden" name="reason" value="Suspendare administrativă pentru verificare." />
                        <button
                          type="submit"
                          className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-danger hover:border-danger"
                        >
                          Suspendă profilul
                        </button>
                      </form>
                    ) : null}
                    {item.profile.status === "suspended" || item.profile.status === "rejected" ? (
                      <form action={adminSetProfessionalStatusAction}>
                        <input type="hidden" name="userId" value={item.profile.user_id} />
                        <input type="hidden" name="status" value="pending" />
                        <button
                          type="submit"
                          className="rounded-full border border-brand-line px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft"
                        >
                          Redeschide verificarea
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
