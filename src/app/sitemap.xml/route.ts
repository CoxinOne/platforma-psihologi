import { renderSitemapIndex } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(renderSitemapIndex(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
