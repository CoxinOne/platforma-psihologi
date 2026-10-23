import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminSystemStatus } from "@/lib/data/admin";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";

export default async function AdminSystemPage() {
  await requireAdmin();
  const system = await getAdminSystemStatus();

  const items = [
    { label: "Baza de date PostgreSQL", ok: system.database === "ok", detail: `${system.latencyMs} ms` },
    { label: "Supabase public (URL + anon key)", ok: system.supabaseConfigured, detail: "necesar pentru autentificare" },
    { label: "Cheie de serviciu (server)", ok: system.serviceRoleConfigured, detail: "necesară pentru administrare" },
    { label: "E-mail tranzacțional (Resend)", ok: system.emailConfigured, detail: "opțional; fără el nu pleacă e-mailuri" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operare"
        title="Starea sistemului"
        description="Verificări de configurare și sănătate. Nu afișăm valori de chei sau date personale."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{item.label}</p>
                <p className="mt-1 text-xs text-muted">{item.detail}</p>
              </div>
              <Badge tone={item.ok ? "success" : "warning"}>{item.ok ? "Configurat" : "Lipsă"}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {!system.emailConfigured ? (
        <Alert tone="warning" title="E-mailul tranzacțional nu este configurat">
          Notificările din aplicație funcționează, dar nu se trimit e-mailuri. Configurează
          RESEND_API_KEY și EMAIL_FROM, apoi repornește aplicația. Instrucțiuni în README, secțiunea
          „E-mail și notificări”.
        </Alert>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold text-ink">Verificări recomandate înainte de lansare</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>• Rulează `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:db` și `npm run build`.</li>
          <li>• Verifică politicile RLS pe proiectul Supabase real (anon, client, psiholog, admin).</li>
          <li>• Configurează SMTP în Supabase și șabloanele de e-mail (confirmare, resetare).</li>
          <li>• Setează NEXT_PUBLIC_SITE_URL și Redirect URLs în Supabase Auth.</li>
          <li>• Completează documentele juridice și desemnarea operatorului/DPO.</li>
          <li>• Verifică locația de găzduire și eventualele transferuri internaționale.</li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          Endpoint de sănătate:{" "}
          <Link href="/api/health" className="font-mono text-brand underline underline-offset-4">
            /api/health
          </Link>
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink">Fus orar platformă</h2>
        <p className="mt-1 text-sm text-muted">{system.timezone}</p>
        <p className="mt-1 text-xs text-muted">
          Orele sunt stocate în UTC și afișate în fusul orar al platformei, cu suport pentru
          schimbarea orei.
        </p>
      </Card>
    </div>
  );
}
