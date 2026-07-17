"use client";

import { logClubWhatsApp } from "./actions";

export function ClubWhatsAppButton({ phone, href }: { phone: string; href: string }) {
  return <a
    className="button club-whatsapp"
    href={href}
    target="_blank"
    rel="noreferrer"
    onClick={() => void logClubWhatsApp(phone)}
  >Contatta su WhatsApp</a>;
}
