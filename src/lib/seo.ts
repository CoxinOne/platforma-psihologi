import { publicEnv } from "@/lib/public-env";

export const SITE_URL = publicEnv.siteUrl.replace(/\/$/, "");

export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Platformă Psihologi — profiluri profesionale verificate în România",
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageOpenGraph({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title,
    description,
    url: absoluteUrl(path),
    siteName: publicEnv.platformName,
    locale: "ro_RO",
    type: "website" as const,
    images: [OG_IMAGE],
  };
}
