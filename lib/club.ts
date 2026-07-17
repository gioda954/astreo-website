export const CLUB_MESSAGE = `Ciao {{nome}}! Stiamo creando un piccolo gruppo WhatsApp per chi ha partecipato ad ASTREO, così da condividere aggiornamenti sul vino e sul progetto benefico e invitarvi presto a un evento in cantina.

Ci farebbe piacere averti con noi. Posso aggiungerti?`;

export function renderClubMessage(customerName: string): string {
  const firstName = customerName.trim().split(/\s+/)[0] || customerName.trim();
  return CLUB_MESSAGE.replace("{{nome}}", firstName);
}

export function clubWhatsAppUrl(phone: string, customerName: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(renderClubMessage(customerName))}`;
}
