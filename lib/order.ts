import { z } from "zod";
import type { Campaign, FulfillmentType } from "@/lib/types";

export const orderSchema = z
  .object({
    customerName: z.string().trim().min(2, "Inserisci nome e cognome").max(120),
    phone: z.string().trim().min(6, "Inserisci un numero valido").max(30),
    fulfillmentType: z.enum(["spedizione", "ritiro"]),
    shippingAddress: z.string().trim().max(300),
    casesQuantity: z.coerce.number().int().min(1).max(100),
    notes: z.string().trim().max(1000).optional().default(""),
    pickupAgreement: z.string().optional(),
    privacy: z.literal("on", { errorMap: () => ({ message: "Accetta la privacy" }) }),
    website: z.string().max(0).optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillmentType === "spedizione" && value.shippingAddress.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingAddress"],
        message: "Inserisci via, numero civico, città e CAP",
      });
    }
    if (value.fulfillmentType === "ritiro" && value.pickupAgreement !== "on") {
      ctx.addIssue({
        code: "custom",
        path: ["pickupAgreement"],
        message: "Conferma il punto di ritiro e l’accordo con Giovanni Dal Lago",
      });
    }
  });

export function normalizeItalianPhone(input: string): string {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (hasPlus) return `+${digits}`;
  if (digits.startsWith("39") && digits.length >= 11) return `+${digits}`;
  return `+39${digits.replace(/^0+/, "")}`;
}

export function calculateOrder(
  campaign: Pick<Campaign, "case_price_cents" | "shipping_price_cents" | "bottles_per_case">,
  cases: number,
  fulfillment: FulfillmentType,
) {
  const casesTotalCents = campaign.case_price_cents * cases;
  const shippingCents = fulfillment === "spedizione" ? campaign.shipping_price_cents : 0;
  return {
    bottles: cases * campaign.bottles_per_case,
    casesTotalCents,
    shippingCents,
    totalCents: casesTotalCents + shippingCents,
  };
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function orderCode(): string {
  const year = new Date().getFullYear();
  return `AST-${year}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}
