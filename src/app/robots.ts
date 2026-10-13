import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://mantauiku.stimiyapmi.ac.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/public/tracer-study", "/public/employer-survey"],
        disallow: ["/dashboard/", "/api/", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
