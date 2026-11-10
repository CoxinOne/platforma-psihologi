import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, ShieldAlert } from "lucide-react";
import { publicEnv } from "@/lib/public-env";
import { ContactForm } from "@/components/contact-form";
import { Card, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactează echipa platformei pentru întrebări, probleme tehnice sau sesizări.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Contact"
        title="Scrie-ne"
        description="Răspundem solicitărilor legate de cont, funcționarea platformei și raportarea unui profil. Nu oferim consultanță psihologică prin acest formular."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <h2 className="text-xl font-semibold text-ink">Formular de contact</h2>
          <p className="mt-1 text-sm text-muted">
            Câmpurile marcate cu <span className="text-danger">*</span> sunt obligatorii.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </Card>

        <div className="space-y-4">
          {publicEnv.contactEmail ? (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
                E-mail direct
              </h2>
              <p className="mt-2 text-sm text-muted">
                <a
                  href={`mailto:${publicEnv.contactEmail}`}
                  className="font-medium text-brand underline underline-offset-4"
                >
                  {publicEnv.contactEmail}
                </a>
              </p>
            </Card>
          ) : null}

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <Clock className="h-4 w-4 text-brand" aria-hidden="true" />
              Termen de răspuns
            </h2>
            <p className="mt-2 text-sm text-muted">
              Solicitările sunt verificate în ordinea primirii. Nu promitem un termen fix până la
              stabilirea unui proces operațional.
            </p>
          </Card>

          <Card className="border-[#ead6ac] bg-warning-soft p-5 text-warning">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              Urgențe
            </h2>
            <p className="mt-2 text-sm">
              Platforma nu este un serviciu de urgență. Dacă tu sau o altă persoană sunteți în
              pericol, apelează <a href="tel:112" className="font-bold underline">112</a>.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink">Protecția datelor</h2>
            <p className="mt-2 text-sm text-muted">
              Detalii despre prelucrare, drepturi și retenție în{" "}
              <Link href="/confidentialitate" className="font-medium text-brand underline underline-offset-4">
                politica de confidențialitate
              </Link>
              . Pentru o solicitare GDPR, folosește pagina dedicată din cont.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
