import { formatEuro } from "@/lib/order";
import type { Order } from "@/lib/types";

export const DEFAULT_WHATSAPP_TEMPLATE = `Ciao {{nome_cliente}}! Sono {{nome_collaboratore}} {{presentazione_collaboratore}}.

Ti contatto perché abbiamo preparato il tuo ordine di vino Astreo e possiamo procedere con pagamento e {{consegna_o_ritiro}}.

{{numero_casse}} {{cassa_o_casse}} = {{totale_casse}}{{testo_spedizione}}, per un totale di {{totale_ordine}}.

Le coordinate:

{{coordinate_bancarie}}

Grazie mille ancora per credere in questo progetto, il vino quest’anno è veramente spettacolare.`;

export function renderWhatsAppMessage(
  template: string,
  order: Order,
  collaborator: { full_name: string; presentation: string | null },
  bankDetails: string,
) {
  const casesTotal = order.case_price_cents * order.cases_quantity;
  const replacements: Record<string, string> = {
    nome_cliente: order.customer_name.split(" ")[0],
    nome_collaboratore: collaborator.full_name,
    presentazione_collaboratore: collaborator.presentation ?? "",
    consegna_o_ritiro: order.fulfillment_type === "spedizione" ? "spedizione" : "ritiro/consegna",
    numero_casse: String(order.cases_quantity),
    cassa_o_casse: order.cases_quantity === 1 ? "cassa" : "casse",
    totale_casse: formatEuro(casesTotal),
    testo_spedizione:
      order.shipping_price_cents > 0 ? ` + ${formatEuro(order.shipping_price_cents)} di spedizione` : "",
    totale_ordine: formatEuro(order.expected_total_cents),
    coordinate_bancarie: bankDetails,
  };
  return template.replace(/{{([a-z_]+)}}/g, (_, key: string) => replacements[key] ?? "").replace(/ +\./g, ".");
}

export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
