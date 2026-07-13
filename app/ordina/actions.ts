"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateOrder, normalizeItalianPhone, orderCode, orderSchema } from "@/lib/order";
import type { Campaign } from "@/lib/types";

export type OrderFormState = { error?: string; fields?: Record<string, string> };
const attempts = new Map<string, number[]>();

export async function submitOrder(_: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controlla i dati inseriti" };
  }
  if (parsed.data.website) return { error: "Richiesta non valida" };

  const phone = normalizeItalianPhone(parsed.data.phone);
  const now = Date.now();
  const recent = (attempts.get(phone) ?? []).filter((time) => now - time < 10 * 60_000);
  if (recent.length >= 3) return { error: "Troppi tentativi. Riprova tra qualche minuto." };
  attempts.set(phone, [...recent, now]);

  try {
    const supabase = createAdminClient();
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("is_active", true)
      .single<Campaign>();
    if (campaignError || !campaign) return { error: "La campagna ordini non è al momento disponibile." };

    const totals = calculateOrder(campaign, parsed.data.casesQuantity, parsed.data.fulfillmentType);
    const receiptToken = crypto.randomUUID();
    const { error } = await supabase.from("orders").insert({
      code: orderCode(),
      receipt_token: receiptToken,
      campaign_id: campaign.id,
      customer_name: parsed.data.customerName,
      phone,
      fulfillment_type: parsed.data.fulfillmentType,
      shipping_address: parsed.data.fulfillmentType === "spedizione" ? parsed.data.shippingAddress : null,
      cases_quantity: parsed.data.casesQuantity,
      bottles_quantity: totals.bottles,
      notes: parsed.data.notes || null,
      product_name: campaign.name,
      vintage: campaign.vintage,
      bottles_per_case: campaign.bottles_per_case,
      case_price_cents: campaign.case_price_cents,
      shipping_price_cents: totals.shippingCents,
      expected_total_cents: totals.totalCents,
      privacy_accepted_at: new Date().toISOString(),
    });
    if (error) throw error;
    redirect(`/grazie/${receiptToken}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Order submission failed");
    return { error: "Non è stato possibile inviare l’ordine. Riprova più tardi." };
  }
}
