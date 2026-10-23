import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Recuperare parolă",
  description: "Solicită un link de resetare a parolei contului tău.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold text-ink">Recuperare parolă</h1>
        <p className="mt-2 text-sm text-muted">
          Introdu adresa de e-mail a contului. Vei primi un link valabil o perioadă limitată.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
        <p className="mt-6 border-t border-line pt-4 text-sm text-muted">
          <Link href="/autentificare" className="font-semibold text-brand underline underline-offset-4">
            Înapoi la autentificare
          </Link>
        </p>
      </div>
    </div>
  );
}
