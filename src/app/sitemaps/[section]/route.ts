import { SITEMAP_SECTIONS, buildSitemapSection, type SitemapSection } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

function isSection(value: string): value is SitemapSection {
  return (SITEMAP_SECTIONS as readonly string[]).includes(value);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ section: string }> },
) {
  const { section: rawSection } = await context.params;
  const section = rawSection.replace(/\.xml$/i, "");

  if (!isSection(section)) {
    return new Response("Sitemap inexistent.", { status: 404 });
  }

  const xml = await buildSitemapSection(section);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
