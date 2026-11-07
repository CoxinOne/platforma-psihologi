import type { Metadata, Viewport } from "next";
import { publicEnv } from "@/lib/public-env";
import { isSupabaseConfigured } from "@/lib/public-env";
import { ConsentBanner } from "@/components/consent";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "Platformă Psihologi — sprijin psihologic, cu claritate",
    template: "%s — Platformă Psihologi",
  },
  description:
    "Platformă de prezentare și mesagerie privată pentru psihologi din România. Profiluri profesionale verificate înainte de publicare.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: publicEnv.platformName,
    title: "Platformă Psihologi",
    description:
      "Găsește un psiholog potrivit și trimite-i un mesaj privat. Tariful se discută direct, în funcție de complexitate.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <a href="#continut" className="skip-link">
          Sari la conținut
        </a>
        {!isSupabaseConfigured() ? (
          <div className="border-b border-danger/30 bg-danger-soft px-4 py-2 text-center text-sm text-danger">
            Configurare incompletă: lipsește conexiunea Supabase. Completează{" "}
            <code className="font-mono text-xs">.env.local</code> conform instrucțiunilor din README.
          </div>
        ) : null}
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
