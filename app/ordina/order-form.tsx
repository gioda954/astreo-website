"use client";

import { useActionState, useState } from "react";
import { calculateOrder, formatEuro } from "@/lib/order";
import type { Campaign, FulfillmentType } from "@/lib/types";
import { submitOrder } from "./actions";

export function OrderForm({ campaign }: { campaign: Campaign }) {
  const [state, action, pending] = useActionState(submitOrder, {});
  const [cases, setCases] = useState(1);
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("spedizione");
  const totals = calculateOrder(campaign, cases || 1, fulfillment);
  return (
    <form action={action} className="card">
      <p className="eyebrow">Il tuo ordine</p>
      <h2>Partecipa all’edizione {campaign.vintage}</h2>
      <div className="field"><label htmlFor="customerName">Nome e cognome *</label><input id="customerName" name="customerName" required autoComplete="name" maxLength={120}/></div>
      <div className="field"><label htmlFor="phone">Numero di telefono *</label><input id="phone" name="phone" required autoComplete="tel" inputMode="tel" placeholder="Es. 333 123 4567"/><small className="muted">Se manca il prefisso useremo automaticamente +39.</small></div>
      <fieldset className="field"><legend className="label">Modalità *</legend><div className="radio-row">
        <label className="radio"><input type="radio" name="fulfillmentType" value="spedizione" checked={fulfillment === "spedizione"} onChange={() => setFulfillment("spedizione")}/> Spedizione</label>
        <label className="radio"><input type="radio" name="fulfillmentType" value="ritiro" checked={fulfillment === "ritiro"} onChange={() => setFulfillment("ritiro")}/> Ritiro a Brogliano</label>
      </div></fieldset>
      {fulfillment === "spedizione" && <div className="field"><label htmlFor="shippingAddress">Indirizzo di spedizione *</label><textarea id="shippingAddress" name="shippingAddress" required placeholder="Via, numero civico, città, CAP"/></div>}
      {fulfillment !== "spedizione" && <><input type="hidden" name="shippingAddress" value=""/><div className="pickup-notice" role="note"><strong>Unico punto di ritiro</strong><p>Via Spesse 5, 36070 Brogliano (VI).</p><label className="check"><input type="checkbox" name="pickupAgreement" required/> <span>Confermo che il ritiro sarà concordato in anticipo con Giovanni Dal Lago. *</span></label></div></>}
      <div className="field"><label htmlFor="casesQuantity">Quante casse vuoi ordinare? *</label><input id="casesQuantity" name="casesQuantity" type="number" min="1" max="100" value={cases} onChange={(e) => setCases(Math.max(1, Number(e.target.value)))} required/><small className="muted">Ogni cassa contiene {campaign.bottles_per_case} bottiglie. Non sono disponibili bottiglie singole.</small></div>
      <div className="field"><label htmlFor="notes">Note</label><textarea id="notes" name="notes" maxLength={1000}/></div>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <div className="summary" aria-live="polite">
        <div className="summary-row"><span>{cases} {cases === 1 ? "cassa" : "casse"} × {formatEuro(campaign.case_price_cents)}</span><strong>{formatEuro(totals.casesTotalCents)}</strong></div>
        <div className="summary-row"><span>Bottiglie</span><strong>{totals.bottles}</strong></div>
        <div className="summary-row"><span>Spedizione</span><strong>{formatEuro(totals.shippingCents)}</strong></div>
        <div className="summary-row summary-total"><span>Totale previsto</span><strong>{formatEuro(totals.totalCents)}</strong></div>
      </div>
      <label className="check"><input type="checkbox" name="privacy" required/> <span>Acconsento al trattamento dei dati per la gestione dell’ordine. *</span></label>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      <button className="button" disabled={pending}>{pending ? "Invio in corso…" : "Invia ordine"}</button>
    </form>
  );
}
