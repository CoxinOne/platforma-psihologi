import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";
import { Alert } from "@/components/ui";

export const metadata: Metadata = {
  title: "Autentificare",
  description: "Autentifică-te în contul tău de client, psiholog sau administrator.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; eroare?: string; status?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
      <div className="order-2 lg:order-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Cont</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Bine ai revenit</h1>
        <p className="mt-4 text-muted">
          Intră în cont pentru mesaje private și notificări. Sesiunea este păstrată
          într-un cookie sigur, iar datele sunt protejate prin politici la nivel de bază de date.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-muted">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            Nu îți solicităm niciodată parola prin e-mail sau telefon.
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            După autentificare ajungi în zona potrivită rolului tău.
          </li>
        </ul>
      </div>

      <div className="order-1 rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-sm sm:p-8 lg:order-2">
        <h2 className="text-2xl font-semibold text-ink">Autentificare</h2>
        <p className="mt-1 text-sm text-muted">Folosește adresa de e-mail confirmată la înregistrare.</p>

        {params.eroare === "link-invalid" ? (
          <Alert tone="danger" className="mt-4">
            Linkul a expirat sau nu este valid. Solicită un link nou de resetare ori autentifică-te.
          </Alert>
        ) : null}

        <div className="mt-6">
          <LoginForm next={params.next} />
        </div>

        <p className="mt-6 border-t border-line pt-4 text-sm text-muted">
          Nu ai cont?{" "}
          <Link href="/inregistrare" className="font-semibold text-brand underline underline-offset-4">
            Creează unul
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
