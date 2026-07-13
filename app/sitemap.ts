import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{const site=process.env.NEXT_PUBLIC_SITE_URL??"https://astreo.org";return [{url:site,changeFrequency:"monthly",priority:1},{url:`${site}/ordina`,changeFrequency:"weekly",priority:.9}]}
