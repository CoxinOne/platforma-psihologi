"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonClasses } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Nu jurnalizăm date personale sau conținut privat; doar identificatorul erorii.
    console.error("[app] Eroare de randare", error.digest ?? "fără-digest");
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-danger">Eroare 500</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Ceva nu a funcționat</h1>
        <p className="mt-3 text-muted">
          Operațiunea nu a fost finalizată. Poți reîncerca; dacă problema persistă, contactează
          administratorul și menționează codul erorii.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted">Cod: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClasses("primary")}>
            Reîncearcă
          </button>
          <Link href="/" className={buttonClasses("secondary")}>
            Pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}
