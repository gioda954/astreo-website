import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatEuro } from "@/lib/order";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";
export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const p=await searchParams; const page=Math.max(1,Number(p.page)||1); const size=25;
  const supabase=await createServerSupabaseClient();
  let query=supabase.from("orders").select("*, profiles!orders_assignee_id_fkey(full_name)",{count:"exact"}).order("created_at",{ascending:false}).range((page-1)*size,page*size-1);
  if(p.q) query=query.or(`customer_name.ilike.%${p.q.replace(/[%_,]/g,"")}%,phone.ilike.%${p.q.replace(/[%_,]/g,"")}%,code.ilike.%${p.q.replace(/[%_,]/g,"")}%`);
  if(p.contact) query=query.eq("contact_status",p.contact); if(p.payment) query=query.eq("payment_status",p.payment); if(p.delivery) query=query.eq("delivery_status",p.delivery);
  const {data,count}=await query; const orders=(data??[]) as (Order & {profiles:{full_name:string}|null})[];
  return <><p className="eyebrow">Gestione operativa</p><h1>Ordini</h1><form className="filters"><input name="q" defaultValue={p.q} placeholder="Nome, telefono o codice"/><select name="contact" defaultValue={p.contact}><option value="">Contatto: tutti</option><option value="da_contattare">Da contattare</option><option value="contattato">Contattato</option><option value="confermato">Confermato</option></select><select name="payment" defaultValue={p.payment}><option value="">Pagamento: tutti</option><option value="non_pagato">Non pagato</option><option value="parziale">Parziale</option><option value="pagato">Pagato</option></select><select name="delivery" defaultValue={p.delivery}><option value="">Consegna: tutte</option><option value="da_programmare">Da programmare</option><option value="programmata">Programmata</option><option value="consegnata">Consegnata</option></select><button className="button">Filtra</button></form>
    <div className="table-wrap"><table><thead><tr><th>Codice</th><th>Cliente</th><th>Telefono</th><th>Casse</th><th>Bottiglie</th><th>Modalità</th><th>Totale</th><th>Collaboratore</th><th>Contatto</th><th>Pagamento</th><th>Consegna</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><Link href={`/crm/ordini/${o.id}`}>{o.code}</Link></td><td>{o.customer_name}</td><td>{o.phone}</td><td>{o.cases_quantity}</td><td>{o.bottles_quantity}</td><td>{o.fulfillment_type}</td><td>{formatEuro(o.expected_total_cents)}</td><td>{o.profiles?.full_name??"—"}</td><td><span className="badge">{o.contact_status}</span></td><td><span className="badge">{o.payment_status}</span></td><td><span className="badge">{o.delivery_status}</span></td></tr>)}</tbody></table></div>
    <div className="radio-row" style={{marginTop:"1rem"}}>{page>1&&<Link className="button secondary" href={{query:{...p,page:page-1}}}>Precedenti</Link>}<span className="muted">Pagina {page} · {count??0} ordini</span>{page*size<(count??0)&&<Link className="button secondary" href={{query:{...p,page:page+1}}}>Successivi</Link>}</div></>;
}
