import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClasses, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <Card className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Eroare 404</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Pagina nu a fost găsită</h1>
        <p className="mt-3 text-muted">
          Adresa poate fi greșită sau pagina a fost mutată. Încearcă din pagina principală sau din
          directoriul de psihologi.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClasses("primary")}>
            Pagina principală
          </Link>
          <Link href="/psihologi" className={buttonClasses("secondary")}>
            Vezi psihologii
          </Link>
        </div>
      </Card>
    </div>
  );
}
