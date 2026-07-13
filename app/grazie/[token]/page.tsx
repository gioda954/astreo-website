import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatEuro } from "@/lib/order";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Grazie per il tuo ordine | Astreo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ThankYouPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let order: Order | null = null;
  try {
    const result = await createAdminClient().from("orders").select("*").eq("receipt_token", token).single<Order>();
    order = result.data;
  } catch { /* configuration error looks like an unknown receipt */ }
  if (!order) notFound();
  return <main className="app-shell"><header className="topbar"><Link className="brand" href="/"><img src="/images/logo.jpg" alt="Logo Astreo"/><span>Astreo</span></Link></header><div className="page"><section className="card" style={{maxWidth:760,margin:"0 auto"}}>
    <p className="eyebrow">Ordine ricevuto</p><h1>Grazie, {order.customer_name.split(" ")[0]}!</h1><p className="lead">Grazie per aver partecipato all’edizione {order.vintage}. Ti contatteremo presto per concordare pagamento e {order.fulfillment_type === "spedizione" ? "spedizione" : "ritiro"}.</p>
    <div className="summary"><div className="summary-row"><span>Codice ordine</span><strong>{order.code}</strong></div><div className="summary-row"><span>Casse</span><strong>{order.cases_quantity}</strong></div><div className="summary-row"><span>Bottiglie</span><strong>{order.bottles_quantity}</strong></div><div className="summary-row"><span>Modalità</span><strong>{order.fulfillment_type === "spedizione" ? "Spedizione" : "Ritiro/consegna"}</strong></div>{order.shipping_address && <div className="summary-row"><span>Indirizzo</span><strong>{order.shipping_address}</strong></div>}<div className="summary-row summary-total"><span>Totale previsto</span><strong>{formatEuro(order.expected_total_cents)}</strong></div></div>
    <p className="muted">Il riepilogo non è una ricevuta fiscale né una conferma di pagamento.</p><div className="radio-row"><a className="button" href={`/api/ricevuta/${token}`}>Scarica il riepilogo PDF</a><Link className="button secondary" href="/">Torna al sito</Link></div>
  </section></div></main>;
}
