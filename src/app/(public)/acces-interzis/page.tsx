import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { getSessionContext } from "@/lib/auth";
import { buttonClasses, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Acces restricționat",
  robots: { index: false, follow: false },
};

const REASONS: Record<string, string> = {
  "cont-suspendat":
    "Contul tău este suspendat. Dacă ai nevoie de clarificări, contactează administratorul platformei.",
  "rol-insuficient":
    "Contul tău nu are rolul necesar pentru această zonă. Fiecare rol are acces doar la propriile date.",
};

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ motiv?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, getSessionContext().catch(() => null)]);
  const message =
    (params.motiv && REASONS[params.motiv]) ??
    "Nu ai permisiunea necesară pentru această pagină.";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <Card className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-warning">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold text-ink">Acces restricționat</h1>
        <p className="mt-3 text-muted">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {session ? (
            <Link href="/" className={buttonClasses("primary")}>
              Înapoi la pagina principală
            </Link>
          ) : (
            <Link href="/autentificare" className={buttonClasses("primary")}>
              Autentificare
            </Link>
          )}
          <Link href="/contact" className={buttonClasses("secondary")}>
            Contactează platforma
          </Link>
        </div>
      </Card>
    </div>
  );
}
