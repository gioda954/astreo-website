import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { campaignStats, statusLabel, statusTone } from "@/lib/crm";
import { formatEuro } from "@/lib/order";
import type { Campaign, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ campagna?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: campaignRows = [] } = await supabase.from("campaigns").select("*").order("vintage", { ascending: false }).returns<Campaign[]>();
  const campaigns = campaignRows ?? [];
  const selected = campaigns.find((campaign) => campaign.id === params.campagna) ?? campaigns.find((campaign) => campaign.is_active) ?? campaigns[0];
  const { data: orderRows = [] } = selected
    ? await supabase.from("orders").select("*").eq("campaign_id", selected.id).order("created_at", { ascending: false }).returns<Order[]>()
    : { data: [] };
  const orders = orderRows ?? [];
  const stats = campaignStats(orders);

  return <>
    <p className="eyebrow">Archivio campagne</p>
    <h1>Storico edizioni</h1>
    <form className="history-picker">
      <label htmlFor="campagna">Edizione</label>
      <select id="campagna" name="campagna" defaultValue={selected?.id}>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.vintage} · {campaign.name}{campaign.is_active ? " (attiva)" : ""}</option>)}</select>
      <button className="button">Visualizza</button>
    </form>
    {selected ? <>
      <h2>Dashboard {selected.vintage}</h2>
      <div className="stats">
        <div className="stat"><span>Ordini</span><strong>{stats.orders}</strong></div><div className="stat"><span>Casse</span><strong>{stats.cases}</strong></div><div className="stat"><span>Bottiglie</span><strong>{stats.bottles}</strong></div><div className="stat"><span>Totale previsto</span><strong>{formatEuro(stats.expected)}</strong></div>
        <div className="stat"><span>Totale incassato</span><strong>{formatEuro(stats.collected)}</strong></div><div className="stat"><span>Residuo</span><strong>{formatEuro(stats.remaining)}</strong></div><div className="stat"><span>Da contattare</span><strong>{stats.toContact}</strong></div><div className="stat"><span>Da consegnare</span><strong>{stats.toDeliver}</strong></div>
      </div>
      <div className="table-wrap"><table><thead><tr><th>Data</th><th>Cliente</th><th>Azione</th><th>Quantità</th><th>Totale</th><th>Contatto</th><th>Pagamento</th><th>Consegna</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}>
        <td>{new Date(order.created_at).toLocaleDateString("it-IT")}</td><td>{order.customer_name}</td><td><Link className="order-action" href={`/crm/ordini/${order.id}`}>Vedi dettagli / contatta</Link></td><td>{order.cases_quantity} casse / {order.bottles_quantity} bottiglie</td><td>{formatEuro(order.expected_total_cents)}</td>
        <td><span className={`badge ${statusTone(order.contact_status)}`}>{statusLabel(order.contact_status)}</span></td><td><span className={`badge ${statusTone(order.payment_status)}`}>{statusLabel(order.payment_status)}</span></td><td><span className={`badge ${statusTone(order.delivery_status)}`}>{statusLabel(order.delivery_status)}</span></td>
      </tr>)}</tbody></table></div>
    </> : <p className="muted">Non ci sono ancora edizioni archiviate.</p>}
  </>;
}
