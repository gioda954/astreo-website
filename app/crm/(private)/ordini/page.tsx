import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatEuro } from "@/lib/order";
import { statusLabel, statusTone } from "@/lib/crm";
import type { Campaign, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const size = 25;
  const supabase = await createServerSupabaseClient();
  const { data: campaign } = await supabase.from("campaigns").select("*").eq("is_active", true).single<Campaign>();

  let query = supabase
    .from("orders")
    .select("*, profiles!orders_assignee_id_fkey(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * size, page * size - 1);
  if (campaign) query = query.eq("campaign_id", campaign.id);
  if (params.q) {
    const search = params.q.replace(/[%_,]/g, "");
    query = query.or(`customer_name.ilike.%${search}%,phone.ilike.%${search}%,code.ilike.%${search}%`);
  }
  if (params.contact) query = query.eq("contact_status", params.contact);
  if (params.payment) query = query.eq("payment_status", params.payment);
  if (params.delivery) query = query.eq("delivery_status", params.delivery);

  const { data, count } = await query;
  const orders = (data ?? []) as (Order & { profiles: { full_name: string } | null })[];

  return <>
    <p className="eyebrow">Gestione operativa</p>
    <h1>Ordini {campaign?.vintage}</h1>
    <form className="filters">
      <input name="q" defaultValue={params.q} placeholder="Nome, telefono o codice" />
      <select name="contact" defaultValue={params.contact}><option value="">Contatto: tutti</option><option value="da_contattare">Da contattare</option><option value="contattato">Contattato</option><option value="confermato">Confermato</option></select>
      <select name="payment" defaultValue={params.payment}><option value="">Pagamento: tutti</option><option value="non_pagato">Non pagato</option><option value="parziale">Parziale</option><option value="pagato">Pagato</option></select>
      <select name="delivery" defaultValue={params.delivery}><option value="">Consegna: tutte</option><option value="da_programmare">Da programmare</option><option value="programmata">Programmata</option><option value="consegnata">Consegnata</option></select>
      <button className="button">Filtra</button>
    </form>
    <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Azione</th><th>Telefono</th><th>Casse</th><th>Bottiglie</th><th>Modalità</th><th>Totale</th><th>Collaboratore</th><th>Contatto</th><th>Pagamento</th><th>Consegna</th></tr></thead><tbody>
      {orders.map((order) => <tr key={order.id}>
        <td><strong>{order.customer_name}</strong><br /><small className="muted">{order.code}</small></td>
        <td><Link className="order-action" href={`/crm/ordini/${order.id}`}>Vedi dettagli / contatta</Link></td>
        <td>{order.phone}</td><td>{order.cases_quantity}</td><td>{order.bottles_quantity}</td><td>{order.fulfillment_type}</td><td>{formatEuro(order.expected_total_cents)}</td><td>{order.profiles?.full_name || "—"}</td>
        <td><span className={`badge ${statusTone(order.contact_status)}`}>{statusLabel(order.contact_status)}</span></td>
        <td><span className={`badge ${statusTone(order.payment_status)}`}>{statusLabel(order.payment_status)}</span></td>
        <td><span className={`badge ${statusTone(order.delivery_status)}`}>{statusLabel(order.delivery_status)}</span></td>
      </tr>)}
    </tbody></table></div>
    <div className="radio-row" style={{ marginTop: "1rem" }}>{page > 1 && <Link className="button secondary" href={{ query: { ...params, page: page - 1 } }}>Precedenti</Link>}<span className="muted">Pagina {page} · {count ?? 0} ordini</span>{page * size < (count ?? 0) && <Link className="button secondary" href={{ query: { ...params, page: page + 1 } }}>Successivi</Link>}</div>
  </>;
}
