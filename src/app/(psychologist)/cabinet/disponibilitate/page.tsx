import { requirePsychologist } from "@/lib/auth";
import {
  listAvailabilityExceptions,
  listAvailabilityRules,
  listMyCabinets,
} from "@/lib/data/user";
import { AvailabilityExceptionsSection, AvailabilityRulesSection } from "@/components/availability-editor";
import { Alert, PageHeader } from "@/components/ui";

export default async function AvailabilityPage() {
  const session = await requirePsychologist();
  const [rules, exceptions, cabinets] = await Promise.all([
    listAvailabilityRules(session.supabase, session.user.id),
    listAvailabilityExceptions(session.supabase, session.user.id),
    listMyCabinets(session.supabase, session.user.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Calendar"
        title="Disponibilitate"
        description="Setează programul săptămânal, durata ședințelor și excepțiile. Clientul vede doar intervalele libere."
      />

      <Alert tone="info">
        Rezervările sunt verificate pe server. Chiar dacă două persoane aleg aceeași oră, baza de
        date acceptă o singură programare. La schimbarea orei, orele locale rămân corecte.
      </Alert>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-7">
        <AvailabilityRulesSection rules={rules} cabinets={cabinets} />
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-7">
        <AvailabilityExceptionsSection exceptions={exceptions} />
      </div>
    </div>
  );
}
