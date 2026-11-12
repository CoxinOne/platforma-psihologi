import type { MetadataRoute } from "next";
import { listPublicPsychologists, listSpecialties } from "@/lib/data/public";
import { getCitySpecialtyCombos, getDirectoryCities } from "@/lib/directory";
import { publicEnv } from "@/lib/public-env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/psihologi",
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
    lastModified: new Date(),
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
      lastModified: psychologist.published_at ? new Date(psychologist.published_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...specialties.map((specialty) => ({
      url: `${base}/specializari/${specialty.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...cities.map((city) => ({
      url: `${base}/psihologi/oras/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...combos.map((combo) => ({
      url: `${base}/psihologi/oras/${combo.city.slug}/${combo.specialty.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
}
