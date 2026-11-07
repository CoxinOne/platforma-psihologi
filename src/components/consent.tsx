"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "platforma-psihologi.consent.v1";

type Consent = {
  necessary: true;
  analytics: false;
  marketing: false;
  decidedAt: string;
};

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    if (!parsed.decidedAt) return null;
    return parsed as Consent;
  } catch {
    return null;
  }
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  const accept = () => {
    const value: Consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Stocarea locală poate fi blocată; nu insistăm.
    }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Informare privind cookie-urile"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-brand-line bg-surface p-4 shadow-2xl sm:inset-x-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Folosim doar cookie-uri esențiale pentru autentificare și sesiune. Nu avem configurate
          instrumente de analiză sau de marketing.{" "}
          <Link href="/consimtamant" className="font-medium text-brand underline underline-offset-4">
            Detalii
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-strong"
        >
          Am înțeles
        </button>
      </div>
    </div>
  );
}

export function ConsentSettings() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setLoaded(true);
  }, []);

  const reset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorăm
    }
    setConsent(null);
  };

  if (!loaded) {
    return <p className="text-sm text-muted">Se încarcă preferințele salvate…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm font-semibold text-ink">Cookie-uri esențiale</p>
        <p className="mt-1 text-sm text-muted">
          Necesare pentru autentificare, securitatea sesiunii și păstrarea preferinței de
          consimțământ. Nu pot fi dezactivate.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-line bg-canvas p-5">
        <p className="text-sm font-semibold text-ink">Analiză și marketing</p>
        <p className="mt-1 text-sm text-muted">
          Nu sunt configurate în această versiune. Dacă vor fi activate, vor necesita un
          consimțământ separat, iar această pagină va fi actualizată înainte de activare.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-brand-line bg-surface px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
        >
          Retrage preferința salvată
        </button>
        <p className="text-sm text-muted">
          {consent
            ? `Preferință înregistrată la ${new Date(consent.decidedAt).toLocaleString("ro-RO")}.`
            : "Nu există o preferință înregistrată în acest browser."}
        </p>
      </div>
    </div>
  );
}
