import "server-only";
import { listPublicPsychologists, listSpecialties } from "@/lib/data/public";
import { getCitySpecialtyCombos, getDirectoryCities } from "@/lib/directory";
import { publicEnv } from "@/lib/public-env";
import type { PublicPsychologist } from "@/lib/types";

const BASE_URL = publicEnv.siteUrl.replace(/\/$/, "");
const SITE_UPDATED_AT = new Date("2026-11-15T00:00:00.000Z");

export const SITEMAP_SECTIONS = [
  "pages",
  "guides",
  "psychologists",
  "specialties",
  "cities",
  "city-specialties",
  "images",
] as const;

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

export interface SitemapImage {
  loc: string;
  title?: string;
  caption?: string;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  images?: SitemapImage[];
}

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function latest(dates: (string | null | undefined)[]): string {
  const values = dates
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) return SITE_UPDATED_AT.toISOString();
  return new Date(Math.max(...values)).toISOString();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sitemapUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function renderEntry(entry: SitemapEntry): string {
  const lines = [`    <loc>${escapeXml(entry.loc)}</loc>`];
  if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (typeof entry.priority === "number") lines.push(`    <priority>${entry.priority.toFixed(2)}</priority>`);
  for (const image of entry.images ?? []) {
    lines.push("    <image:image>");
    lines.push(`      <image:loc>${escapeXml(image.loc)}</image:loc>`);
    if (image.title) lines.push(`      <image:title>${escapeXml(image.title)}</image:title>`);
    if (image.caption) lines.push(`      <image:caption>${escapeXml(image.caption)}</image:caption>`);
    lines.push("    </image:image>");
  }
  return `  <url>\n${lines.join("\n")}\n  </url>`;
}

export function renderUrlset(entries: SitemapEntry[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map(renderEntry),
    "</urlset>",
  ].join("\n");
}

export function renderSitemapIndex(): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...SITEMAP_SECTIONS.map(
      (section) =>
        `  <sitemap>\n    <loc>${sitemapUrl(`/sitemaps/${section}.xml`)}</loc>\n    <lastmod>${SITE_UPDATED_AT.toISOString()}</lastmod>\n  </sitemap>`,
    ),
    "</sitemapindex>",
  ].join("\n");
}

const GUIDE_PATHS = [
  "/resurse",
  "/resurse/cum-alegi-un-psiholog",
  "/resurse/psiholog-online-sau-cabinet",
  "/resurse/psiholog-pentru-copii",
  "/resurse/terapie-de-cuplu",
  "/resurse/cand-mergi-la-psiholog",
  "/resurse/de-la-co-reglare-la-autoreglare",
];

const STATIC_PATHS = [
  "/",
  "/psihologi",
  "/psihologi/online",
  "/specializari",
  "/cabinete",
  "/intrebari-frecvente",
  "/despre",
  "/contact",
  "/confidentialitate",
  "/termeni",
  "/consimtamant",
];

function imageUrl(psychologist: PublicPsychologist): string | null {
  if (!psychologist.photo_path || !publicEnv.supabaseUrl) return null;
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/avatars/${psychologist.photo_path}`;
}

async function getData() {
  const [psychologists, specialties] = await Promise.all([
    listPublicPsychologists(),
    listSpecialties(),
  ]);
  const cities = getDirectoryCities(psychologists);
  const combos = getCitySpecialtyCombos(psychologists);
  return { psychologists, specialties, cities, combos };
}

export async function buildSitemapSection(section: SitemapSection): Promise<string> {
  const { psychologists, specialties, cities, combos } = await getData();

  if (section === "pages") {
    return renderUrlset(
      STATIC_PATHS.map((path) => ({
        loc: sitemapUrl(path),
        lastmod: SITE_UPDATED_AT.toISOString(),
        changefreq: "weekly",
        priority: path === "/" ? 1 : 0.7,
      })),
    );
  }

  if (section === "guides") {
    return renderUrlset(
      GUIDE_PATHS.map((path) => ({
        loc: sitemapUrl(path),
        lastmod: SITE_UPDATED_AT.toISOString(),
        changefreq: "monthly",
        priority: 0.6,
      })),
    );
  }

  if (section === "psychologists") {
    return renderUrlset(
      psychologists.map((psychologist) => ({
        loc: sitemapUrl(`/psihologi/${psychologist.slug}`),
        lastmod: iso(psychologist.published_at) ?? SITE_UPDATED_AT.toISOString(),
        changefreq: "weekly",
        priority: 0.85,
        images: (() => {
          const image = imageUrl(psychologist);
          return image
            ? [{ loc: image, title: `Fotografie ${psychologist.display_name}`, caption: psychologist.professional_title }]
            : [];
        })(),
      })),
    );
  }

  if (section === "specialties") {
    return renderUrlset(
      specialties.map((specialty) => ({
        loc: sitemapUrl(`/specializari/${specialty.slug}`),
        lastmod: SITE_UPDATED_AT.toISOString(),
        changefreq: "monthly",
        priority: 0.6,
      })),
    );
  }

  if (section === "cities") {
    return renderUrlset(
      cities.map((city) => ({
        loc: sitemapUrl(`/psihologi/oras/${city.slug}`),
        lastmod: latest(city.psychologists.map((psychologist) => psychologist.published_at)),
        changefreq: "weekly",
        priority: 0.75,
      })),
    );
  }

  if (section === "city-specialties") {
    return renderUrlset(
      combos.map((combo) => ({
        loc: sitemapUrl(`/psihologi/oras/${combo.city.slug}/${combo.specialty.slug}`),
        lastmod: latest(combo.psychologists.map((psychologist) => psychologist.published_at)),
        changefreq: "monthly",
        priority: 0.55,
      })),
    );
  }

  const imageEntries: SitemapEntry[] = [];
  for (const psychologist of psychologists) {
    const image = imageUrl(psychologist);
    if (!image) continue;
    imageEntries.push({
      loc: sitemapUrl(`/psihologi/${psychologist.slug}`),
      lastmod: iso(psychologist.published_at) ?? SITE_UPDATED_AT.toISOString(),
      images: [
        {
          loc: image,
          title: `Fotografie ${psychologist.display_name}`,
          caption: psychologist.professional_title,
        },
      ],
    });
  }
  return renderUrlset(imageEntries);
}
