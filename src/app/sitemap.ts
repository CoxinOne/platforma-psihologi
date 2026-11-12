import type { MetadataRoute } from "next";
import { listPublicPsychologists, listSpecialties } from "@/lib/data/public";
import { publicEnv } from "@/lib/public-env";
import { slugify } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/psihologi",
    "/cauta",
    "/specializari",
    "/cabinete",
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

  const cityRoutes = Array.from(
    new Map(
      psychologists
        .flatMap((psychologist) => psychologist.cabinet_cities)
        .map((city) => [slugify(city), city] as const),
    ).entries(),
  ).map(([slug]) => ({
    url: `${base}/psihologi/oras/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

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
    ...cityRoutes,
  ];
}
