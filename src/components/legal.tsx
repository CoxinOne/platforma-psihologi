import { AlertCircle } from "lucide-react";

export function LegalNotice() {
  return (
    <div className="mb-8 rounded-2xl border border-[#ead6ac] bg-warning-soft p-5 text-sm text-warning">
      <p className="flex items-center gap-2 font-semibold">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        Document în lucru — necesită verificare juridică înainte de publicare
      </p>
      <p className="mt-2">
        Textul de mai jos este un model funcțional pentru dezvoltare. Operatorul, temeiurile
        juridice, termenele de retenție, furnizorii și clauzele de răspundere trebuie confirmate de
        un consilier juridic și adaptate la forma reală a serviciului.
      </p>
    </div>
  );
}

export function LegalPageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Document legal</p>
      <h1 className="mt-2 text-4xl font-semibold text-ink">{title}</h1>
      <p className="mt-4 text-muted">{intro}</p>
      <div className="mt-8">
        <LegalNotice />
        <div className="prose-legal">{children}</div>
      </div>
      <p className="mt-10 border-t border-line pt-5 text-xs text-muted">
        Versiune de lucru 1.0. Ultima actualizare a conținutului tehnic: octombrie 2026. Data
        intrării în vigoare se completează după verificarea juridică.
      </p>
    </div>
  );
}
