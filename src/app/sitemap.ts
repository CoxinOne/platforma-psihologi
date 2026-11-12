import type { MetadataRoute } from "next";
import { listPublicPsychologists, listSpecialties } from "@/lib/data/public";
import { getCitySpecialtyCombos, getDirectoryCities } from "@/lib/directory";
import { publicEnv } from "@/lib/public-env";

/**
 * Data ultimei actualizări de conținut a paginilor statice.
 * Actualizează această constantă când modifici paginile statice/ghidurile,
 * ca `lastmod` din sitemap să rămână credibil pentru Google.
 */
const SITE_UPDATED_AT = new Date("2026-11-13T00:00:00.000Z");

function latestDate(dates: (string | null | undefined)[]): Date {
  const valid = dates
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (valid.length === 0) return SITE_UPDATED_AT;
  return new Date(Math.max(...valid.map((date) => date.getTime())));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/psihologi",
    "/psihologi/online",
    "/specializari",
    "/cabinete",
    "/resurse",
    "/resurse/cum-alegi-un-psiholog",
    "/resurse/psiholog-online-sau-cabinet",
    "/despre",
    "/contact",
    "/confidentialitate",
    "/termeni",
    "/consimtamant",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: SITE_UPDATED_AT,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const [psychologists, specialties] = await Promise.all([
    listPublicPsychologists(),
    listSpecialties(),
  ]);

  const cities = getDirectoryCities(psychologists);
  const combos = getCitySpecialtyCombos(psychologists);

  return [
    ...staticRoutes,
    ...psychologists.map((psychologist) => ({
      url: `${base}/psihologi/${psychologist.slug}`,
      lastModified: latestDate([psychologist.published_at]),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...specialties.map((specialty) => ({
      url: `${base}/specializari/${specialty.slug}`,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...cities.map((city) => ({
      url: `${base}/psihologi/oras/${city.slug}`,
      lastModified: latestDate(city.psychologists.map((psychologist) => psychologist.published_at)),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...combos.map((combo) => ({
      url: `${base}/psihologi/oras/${combo.city.slug}/${combo.specialty.slug}`,
      lastModified: latestDate(
        combo.psychologists.map((psychologist) => psychologist.published_at),
      ),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
}
