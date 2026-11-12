import type { Metadata, Viewport } from "next";
import { publicEnv } from "@/lib/public-env";
import { isSupabaseConfigured } from "@/lib/public-env";
import { ConsentBanner } from "@/components/consent";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

export const dynamic = "force-dynamic";

const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "Platformă Psihologi — sprijin psihologic, cu claritate",
    template: "%s — Platformă Psihologi",
  },
  description:
    "Platformă de prezentare și mesagerie privată pentru psihologi din România. Profiluri profesionale verificate înainte de publicare.",
  robots: { index: true, follow: true },
  ...(publicEnv.googleSiteVerification
    ? { verification: { google: publicEnv.googleSiteVerification } }
    : {}),
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: publicEnv.platformName,
    title: "Platformă Psihologi",
    description:
      "Găsește un psiholog potrivit și trimite-i un mesaj privat. Tariful se discută direct, în funcție de complexitate.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Platformă Psihologi — profiluri profesionale verificate în România",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Psihologi",
    description:
      "Profiluri profesionale verificate și mesagerie privată pentru psihologii din România.",
    images: ["/og-image.jpg"],
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
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${baseUrl}/#organization`,
                name: publicEnv.platformName,
                url: baseUrl,
                logo: `${baseUrl}/icon.svg`,
                ...(publicEnv.contactEmail ? { email: publicEnv.contactEmail } : {}),
              },
              {
                "@type": "WebSite",
                "@id": `${baseUrl}/#website`,
                url: baseUrl,
                name: publicEnv.platformName,
                inLanguage: "ro-RO",
                publisher: { "@id": `${baseUrl}/#organization` },
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${baseUrl}/cauta?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }}
        />
        <ConsentBanner />
      </body>
    </html>
  );
}
