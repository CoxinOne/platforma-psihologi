import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { listMyDataRequests } from "@/lib/data/user";
import { formatDate } from "@/lib/time";
import { DeleteAccountForm, ExportDataForm } from "@/components/privacy-forms";
import { ConsentSettings } from "@/components/consent";
import { Badge, buttonClasses, Card, PageHeader } from "@/components/ui";

const REQUEST_STATUS: Record<string, string> = {
  pending: "În așteptare",
  processing: "În procesare",
  completed: "Finalizată",
  rejected: "Respinsă",
};

export default async function PrivacyPage() {
  const session = await requireClient();
  const requests = await listMyDataRequests(session.supabase, session.profile.id);
  const pendingDeletion = requests.some(
    (request) => request.type === "deletion" && (request.status === "pending" || request.status === "processing"),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Date personale"
        title="Confidențialitate și consimțământ"
        description="Poți descărca o copie a datelor, solicita ștergerea contului și verifica preferințele de consimțământ."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
            <Download className="h-5 w-5 text-brand" aria-hidden="true" />
            Exportul datelor
          </h2>
          <p className="mt-1 text-sm text-muted">
            Descarcă o copie în format JSON. Exportul este generat pe server și conține doar datele
            tale.
          </p>
          <div className="mt-4 space-y-4">
            <ExportDataForm />
            <Link
              href="/api/account/export"
              className={buttonClasses("primary", "sm")}
              target="_blank"
              rel="noreferrer"
            >
              Descarcă datele acum
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-ink">Solicitările mele</h2>
          {requests.length > 0 ? (
            <ul className="mt-3 divide-y divide-line text-sm">
              {requests.map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span>
                    <span className="block font-medium text-ink">
                      {request.type === "export" ? "Export date" : "Ștergere cont"}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(request.requested_at)}
                    </span>
                  </span>
                  <Badge tone={request.status === "completed" ? "success" : request.status === "rejected" ? "danger" : "neutral"}>
                    {REQUEST_STATUS[request.status] ?? request.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Nu ai solicitări înregistrate.</p>
          )}
          <p className="mt-4 text-xs text-muted">
            Cererile sunt procesate de administrator. Termenele și excepțiile legale sunt descrise în
            politica de confidențialitate.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-ink">Ștergerea contului</h2>
        <p className="mt-1 text-sm text-muted">
          Ștergerea elimină contul și datele asociate, cu excepția celor pe care legea impune să fie
          păstrate.
        </p>
        <div className="mt-4 max-w-xl">
          <DeleteAccountForm hasPendingRequest={pendingDeletion} />
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
          <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
          Consimțământ și cookie-uri
        </h2>
        <p className="mt-1 text-sm text-muted">
          Folosim doar cookie-uri esențiale. Preferința este salvată local, în acest browser.
        </p>
        <div className="mt-4">
          <ConsentSettings />
        </div>
        <p className="mt-4 text-xs text-muted">
          Detalii complete în{" "}
          <Link href="/confidentialitate" className="font-semibold text-brand underline underline-offset-4">
            politica de confidențialitate
          </Link>{" "}
          și în{" "}
          <Link href="/consimtamant" className="font-semibold text-brand underline underline-offset-4">
            pagina de consimțământ
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
