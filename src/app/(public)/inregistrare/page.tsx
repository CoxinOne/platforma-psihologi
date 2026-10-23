import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Creează cont",
  description:
    "Creează un cont de client sau solicită un cont profesional de psiholog, supus verificării.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string }>;
}) {
  const params = await searchParams;
  const defaultAccountType = params.tip === "psiholog" ? "psychologist" : "client";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-16">
      <div className="lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Cont nou</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Creează un cont</h1>
        <p className="mt-4 text-muted">
          Contul de client este activ după confirmarea e-mailului. Contul profesional este supus
          verificării de către administrator înainte de publicarea profilului.
        </p>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
          <p className="font-semibold text-ink">Ce date colectăm</p>
          <p className="mt-2">
            Nume, adresă de e-mail și parolă. Datele profesionale se adaugă separat, doar dacă
            soliciți un cont de psiholog. Nu colectăm date clinice.
          </p>
          <p className="mt-3">
            Detalii în{" "}
            <Link href="/confidentialitate" className="font-medium text-brand underline underline-offset-4">
              politica de confidențialitate
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-sm sm:p-8">
        <SignupForm defaultAccountType={defaultAccountType} />
        <p className="mt-6 border-t border-line pt-4 text-sm text-muted">
          Ai deja cont?{" "}
          <Link href="/autentificare" className="font-semibold text-brand underline underline-offset-4">
            Autentifică-te
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
