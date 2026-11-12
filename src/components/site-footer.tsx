import Link from "next/link";
import { publicEnv } from "@/lib/public-env";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-olive bg-brand-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Platformă Psihologi</p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Platformă de prezentare și comunicare pentru psihologi din România.
            Nu oferim servicii medicale de urgență și nu ținem dosare clinice.
          </p>
          {publicEnv.contactEmail ? (
            <p className="mt-4 text-sm text-muted">
              Contact:{" "}
              <a className="underline decoration-brand-line underline-offset-4" href={`mailto:${publicEnv.contactEmail}`}>
                {publicEnv.contactEmail}
              </a>
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              <Link href="/contact" className="underline decoration-brand-line underline-offset-4">
                Formular de contact
              </Link>
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Public</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-brand" href="/psihologi">Psihologi</Link></li>
            <li><Link className="hover:text-brand" href="/psihologi/online">Psihologi online</Link></li>
            <li><Link className="hover:text-brand" href="/cauta">Căutare</Link></li>
            <li><Link className="hover:text-brand" href="/specializari">Specializări</Link></li>
            <li><Link className="hover:text-brand" href="/cabinete">Cabinete</Link></li>
            <li><Link className="hover:text-brand" href="/resurse">Resurse</Link></li>
            <li><Link className="hover:text-brand" href="/intrebari-frecvente">Întrebări frecvente</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Platformă</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-brand" href="/despre">Despre</Link></li>
            <li><Link className="hover:text-brand" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-brand" href="/inregistrare">Cont nou</Link></li>
            <li><Link className="hover:text-brand" href="/autentificare">Autentificare</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-brand" href="/confidentialitate">Confidențialitate</Link></li>
            <li><Link className="hover:text-brand" href="/termeni">Termeni</Link></li>
            <li><Link className="hover:text-brand" href="/consimtamant">Consimțământ</Link></li>
            <li><Link className="hover:text-brand" href="/acces-interzis">Acces restricționat</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/80 px-4 py-5 text-center text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} Platformă Psihologi. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
