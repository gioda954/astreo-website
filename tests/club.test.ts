import { describe, expect, it } from "vitest";
import { clubWhatsAppUrl, renderClubMessage } from "@/lib/club";

describe("Club Astreo", () => {
  it("personalizza l'invito con il nome proprio", () => {
    expect(renderClubMessage("Alessandro Rossi")).toBe("Ciao Alessandro! Stiamo creando un piccolo gruppo WhatsApp per chi ha partecipato ad ASTREO, così da condividere aggiornamenti sul vino e sul progetto benefico e invitarvi presto a un evento in cantina.\n\nCi farebbe piacere averti con noi. Posso aggiungerti?");
  });

  it("genera un link wa.me correttamente codificato", () => {
    const url = clubWhatsAppUrl("+39 333 123 4567", "Maria Bianchi");
    expect(url).toContain("https://wa.me/393331234567?text=");
    expect(decodeURIComponent(url.split("text=")[1])).toContain("Ciao Maria!");
  });
});
