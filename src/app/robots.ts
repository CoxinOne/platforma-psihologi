import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/public-env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/cabinet",
          "/admin",
          "/api",
          "/auth",
          "/autentificare",
          "/inregistrare",
          "/parola-uitata",
          "/resetare-parola",
          "/verifica-email",
          "/acces-interzis",
        ],
      },
    ],
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
