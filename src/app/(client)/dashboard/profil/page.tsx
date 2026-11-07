import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { ProfileForm } from "@/components/account-forms";
import { buttonClasses, Card, DemoBadge, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/time";

export default async function ClientProfilePage() {
  const { profile } = await requireClient();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cont"
        title="Profilul meu"
        description="Datele de cont sunt folosite pentru autentificare și contact. Nu colectăm date clinice."
      />

      <div className="flex flex-wrap items-center gap-2">
        {profile.is_demo ? <DemoBadge /> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold text-ink">Date personale</h2>
          <p className="mt-1 text-sm text-muted">
            Numele apare în conversații. Telefonul este opțional și nu este public.
          </p>
          <div className="mt-5">
            <ProfileForm
              fullName={profile.full_name}
              phone={profile.phone}
              marketingConsent={profile.marketing_consent}
              email={profile.email}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
              Confidențialitate
            </h2>
            <p className="mt-2 text-sm text-muted">
              Cont creat la {profile.terms_accepted_at ? formatDate(profile.terms_accepted_at) : "—"}.
              Termenii și politica de confidențialitate au fost acceptate la înregistrare.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/dashboard/confidentialitate" className="font-semibold text-brand underline underline-offset-4">
                Export, ștergere și consimțământ
              </Link>
              <Link href="/dashboard/notificari" className="font-semibold text-brand underline underline-offset-4">
                Preferințe de notificare
              </Link>
              <Link href="/confidentialitate" className="text-muted underline underline-offset-4">
                Politica de confidențialitate
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-ink">Securitatea contului</h2>
            <p className="mt-2 text-sm text-muted">
              Parola poate fi schimbată printr-un link trimis pe e-mail. Nu îți solicităm niciodată
              parola prin telefon sau mesaje.
            </p>
            <Link href="/parola-uitata" className={buttonClasses("secondary", "sm", "mt-3")}>
              Schimbă parola
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
