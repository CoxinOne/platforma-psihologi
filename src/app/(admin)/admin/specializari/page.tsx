import { requireAdmin } from "@/lib/auth";
import { adminSaveSpecialtyAction, adminToggleSpecialtyAction } from "@/lib/actions/admin";
import { listAdminSpecialties } from "@/lib/data/admin";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";

export default async function AdminSpecialtiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; eroare?: string }>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const specialties = await listAdminSpecialties();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conținut public"
        title="Specializări"
        description="Taxonomia folosită în directoriu și în profilurile profesionale. Dezactivarea ascunde specializarea din paginile publice."
      />

      {params.status ? <Alert tone="success">Modificările au fost salvate.</Alert> : null}
      {params.eroare ? <Alert tone="danger">{params.eroare}</Alert> : null}

      <Card>
        <h2 className="text-lg font-semibold text-ink">Adaugă o specializare</h2>
        <form action={adminSaveSpecialtyAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">
            Denumire
            <input name="name" required maxLength={120} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Slug
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="ex. psihologie-clinica"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Descriere
            <textarea name="description" rows={2} maxLength={1000} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Ordine
            <input name="sortOrder" type="number" min={0} max={9999} defaultValue={100} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked className="accent-[#1f4f49]" />
            Activă
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">
              Salvează specializarea
            </button>
          </div>
        </form>
      </Card>

      <ul className="space-y-3">
        {specialties.map((specialty) => (
          <li key={specialty.id}>
            <Card className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{specialty.name}</p>
                    <Badge tone={specialty.is_active ? "success" : "neutral"}>
                      {specialty.is_active ? "Activă" : "Inactivă"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">/{specialty.slug} · ordine {specialty.sort_order}</p>
                  {specialty.description ? <p className="mt-1 text-sm text-muted">{specialty.description}</p> : null}
                </div>
                <form action={adminToggleSpecialtyAction}>
                  <input type="hidden" name="id" value={specialty.id} />
                  <input type="hidden" name="active" value={String(!specialty.is_active)} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft"
                  >
                    {specialty.is_active ? "Dezactivează" : "Activează"}
                  </button>
                </form>
              </div>

              <details className="border-t border-line pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-brand">Editează</summary>
                <form action={adminSaveSpecialtyAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="id" value={specialty.id} />
                  <label className="text-xs text-muted">
                    Denumire
                    <input name="name" defaultValue={specialty.name} required className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted">
                    Slug
                    <input name="slug" defaultValue={specialty.slug} required className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted sm:col-span-2">
                    Descriere
                    <textarea name="description" defaultValue={specialty.description ?? ""} rows={2} className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted">
                    Ordine
                    <input name="sortOrder" type="number" defaultValue={specialty.sort_order} className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input type="checkbox" name="isActive" defaultChecked={specialty.is_active} className="accent-[#1f4f49]" />
                    Activă
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white">
                      Salvează modificările
                    </button>
                  </div>
                </form>
              </details>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
