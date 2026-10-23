import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { ResendConfirmationForm } from "@/components/auth-forms";
import { buttonClasses } from "@/components/ui";

export const metadata: Metadata = {
  title: "Confirmă adresa de e-mail",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, getSessionContext().catch(() => null)]);

  if (session?.user.email_confirmed_at) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Aproape gata</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Confirmă adresa de e-mail</h1>
        <p className="mt-3 text-sm text-muted">
          Ți-am trimis un link de confirmare
          {params.email ? (
            <>
              {" "}la <strong className="text-ink">{params.email}</strong>
            </>
          ) : null}
          . Deschide-l pentru a activa contul. Linkul poate ajunge și în folderul de spam.
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-canvas p-4">
          <p className="text-sm font-semibold text-ink">Nu ai primit e-mailul?</p>
          <p className="mt-1 text-sm text-muted">
            Verifică adresa introdusă și folderul de spam, apoi retrimite mesajul.
          </p>
          <div className="mt-4">
            <ResendConfirmationForm initialEmail={params.email ?? ""} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-4">
          <Link href="/autentificare" className={buttonClasses("secondary", "sm")}>
            Autentificare
          </Link>
          <Link href="/contact" className={buttonClasses("ghost", "sm")}>
            Am nevoie de ajutor
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">
          Dacă serverul SMTP nu este configurat în proiectul Supabase, e-mailurile de confirmare nu
          pleacă. Administratorul găsește instrucțiunile în README.
        </p>
      </div>
    </div>
  );
}
