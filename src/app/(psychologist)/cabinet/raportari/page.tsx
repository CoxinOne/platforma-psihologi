import Link from "next/link";
import { Flag } from "lucide-react";
import { requirePsychologist } from "@/lib/auth";
import { listConversations, listMyReports } from "@/lib/data/user";
import { formatDate } from "@/lib/time";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { ReportAbuseForm } from "@/components/report-abuse-form";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function PsychologistReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ utilizator?: string; conversatie?: string }>;
}) {
  const session = await requirePsychologist();
  const params = await searchParams;

  const [conversations, reports] = await Promise.all([
    listConversations(session.supabase),
    listMyReports(session.supabase, session.user.id),
  ]);

  const options = new Map<string, { userId: string; conversationId: string | null; label: string }>();

  for (const conversation of conversations) {
    options.set(conversation.counterpart_id, {
      userId: conversation.counterpart_id,
      conversationId: conversation.id,
      label: `${conversation.counterpart_name} (conversație)`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Siguranță"
        title="Raportări de abuz"
        description="Raportează spam, hărțuire sau conținut inadecvat. Raportările sunt verificate de administrator."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Flag className="h-4 w-4 text-brand" aria-hidden="true" />
            Raportare nouă
          </h2>
          <div className="mt-4">
            <ReportAbuseForm
              options={Array.from(options.values())}
              defaultReportedUserId={params.utilizator}
              defaultConversationId={params.conversatie}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-ink">Raportările mele</h2>
          {reports.length > 0 ? (
            <ul className="mt-3 divide-y divide-line text-sm">
              {reports.map((report) => (
                <li key={report.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink">Categorie: {report.category}</span>
                    <Badge tone={report.status === "resolved" ? "success" : report.status === "dismissed" ? "neutral" : "warning"}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">{formatDate(report.created_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Nu ai trimis raportări.</p>
          )}
          <p className="mt-4 text-xs text-muted">
            Nu oferim detalii despre acțiunile administrative aplicate altor utilizatori. Pentru
            urgențe, apelează 112.
          </p>
          <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-brand underline underline-offset-4">
            Contactează platforma
          </Link>
        </Card>
      </div>
    </div>
  );
}
