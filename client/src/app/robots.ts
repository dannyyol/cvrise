import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/pdf-render/", "/reset-password/", "/verify-email/"],
      },
    ],
    sitemap: "https://getcvrise.com/sitemap.xml",
  };
}
