import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:"*",allow:["/","/ordina"],disallow:["/crm/","/grazie/","/api/ricevuta/"]}],sitemap:`${process.env.NEXT_PUBLIC_SITE_URL??"https://astreo.org"}/sitemap.xml`}}
