import { requireAdmin } from "@/lib/auth";
import { adminSaveCabinetAction, adminToggleCabinetAction } from "@/lib/actions/admin";
import { listAdminCabinets } from "@/lib/data/admin";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";

export default async function AdminCabinetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; eroare?: string }>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const cabinets = await listAdminCabinets();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conținut public"
        title="Cabinete"
        description="Locațiile asociate psihologilor. Adresele sunt publice; datele de contact trebuie să fie reale înainte de lansare."
      />

      {params.status ? <Alert tone="success">Modificările au fost salvate.</Alert> : null}
      {params.eroare ? <Alert tone="danger">{params.eroare}</Alert> : null}

      <Card>
        <h2 className="text-lg font-semibold text-ink">Adaugă un cabinet</h2>
        <form action={adminSaveCabinetAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">
            Denumire
            <input name="name" required maxLength={160} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Slug
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Adresă
            <input name="addressLine" required maxLength={240} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Oraș
            <input name="city" required maxLength={80} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Județ
            <input name="county" maxLength={80} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Cod poștal
            <input name="postalCode" pattern="[0-9]{6}" className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink">
            Telefon
            <input name="phone" maxLength={30} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Descriere
            <textarea name="description" rows={2} maxLength={2000} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked className="accent-[#1f4f49]" />
            Activ
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">
              Salvează cabinetul
            </button>
          </div>
        </form>
      </Card>

      <ul className="space-y-3">
        {cabinets.map((cabinet) => (
          <li key={cabinet.id}>
            <Card className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{cabinet.name}</p>
                    <Badge tone={cabinet.is_active ? "success" : "neutral"}>
                      {cabinet.is_active ? "Activ" : "Inactiv"}
                    </Badge>
                    {cabinet.is_demo ? <Badge tone="sand">Demo</Badge> : null}
                  </div>
                  <p className="text-sm text-muted">{cabinet.address_line}, {cabinet.city}</p>
                  <p className="text-xs text-muted">/{cabinet.slug} · {cabinet.phone ?? "fără telefon"}</p>
                </div>
                <form action={adminToggleCabinetAction}>
                  <input type="hidden" name="id" value={cabinet.id} />
                  <input type="hidden" name="active" value={String(!cabinet.is_active)} />
                  <button type="submit" className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft">
                    {cabinet.is_active ? "Dezactivează" : "Activează"}
                  </button>
                </form>
              </div>

              <details className="border-t border-line pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-brand">Editează</summary>
                <form action={adminSaveCabinetAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="id" value={cabinet.id} />
                  <label className="text-xs text-muted">
                    Denumire
                    <input name="name" defaultValue={cabinet.name} required className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted">
                    Slug
                    <input name="slug" defaultValue={cabinet.slug} required className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted sm:col-span-2">
                    Adresă
                    <input name="addressLine" defaultValue={cabinet.address_line} required className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted">
                    Oraș
                    <input name="city" defaultValue={cabinet.city} required className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted">
                    Județ
                    <input name="county" defaultValue={cabinet.county ?? ""} className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted">
                    Cod poștal
                    <input name="postalCode" defaultValue={cabinet.postal_code ?? ""} className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted">
                    Telefon
                    <input name="phone" defaultValue={cabinet.phone ?? ""} className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs text-muted sm:col-span-2">
                    Descriere
                    <textarea name="description" defaultValue={cabinet.description ?? ""} rows={2} className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input type="checkbox" name="isActive" defaultChecked={cabinet.is_active} className="accent-[#1f4f49]" />
                    Activ
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
