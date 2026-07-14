import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { statusLabel, statusTone } from "@/lib/crm";
import type { Order } from "@/lib/types";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: orderRows = [] }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("orders").select("*").eq("assignee_id", user!.id).is("cancelled_at", null).order("created_at", { ascending: false }).returns<Order[]>(),
  ]);
  const orders = orderRows ?? [];
  const contacted = orders.filter((order) => order.contact_status !== "da_contattare");
  const tasks = orders.filter((order) => order.contact_status === "da_contattare" || order.payment_status !== "pagato" || order.delivery_status !== "consegnata");

  return <>
    <p className="eyebrow">Account e attività</p><h1>Il tuo profilo</h1>
    <div className="profile-grid">
      <form action={updateProfile} className="card"><h2>Dati collaboratore</h2><div className="field"><label>Email</label><input value={profile?.email ?? ""} disabled /></div><div className="field"><label>Nome completo</label><input name="fullName" defaultValue={profile?.full_name} required /></div><div className="field"><label>Presentazione WhatsApp</label><input name="presentation" defaultValue={profile?.presentation ?? ""} placeholder="del corso Astraios 19-22 del Morosini" /><small className="muted">Comparirà dopo il tuo nome nei messaggi.</small></div><button className="button">Salva profilo</button></form>
      <section className="card"><h2>Le tue attività</h2><div className="profile-stats"><div><span>Ordini assegnati</span><strong>{orders.length}</strong></div><div><span>Clienti contattati</span><strong>{contacted.length}</strong></div><div><span>Cose da fare</span><strong>{tasks.length}</strong></div></div></section>
    </div>
    <div className="detail-grid" style={{ marginTop: "1.2rem" }}>
      <section className="card"><h2>Cose da fare</h2>{tasks.length ? <ul className="task-list">{tasks.slice(0, 20).map((order) => <li key={order.id}><div><strong>{order.customer_name}</strong><br /><span className={`badge ${statusTone(order.contact_status)}`}>{statusLabel(order.contact_status)}</span> <span className={`badge ${statusTone(order.payment_status)}`}>{statusLabel(order.payment_status)}</span> <span className={`badge ${statusTone(order.delivery_status)}`}>{statusLabel(order.delivery_status)}</span></div><Link className="order-action" href={`/crm/ordini/${order.id}`}>Apri</Link></li>)}</ul> : <p className="success">Non hai attività in sospeso.</p>}</section>
      <section className="card"><h2>Clienti contattati</h2>{contacted.length ? <ul className="task-list">{contacted.slice(0, 20).map((order) => <li key={order.id}><div><strong>{order.customer_name}</strong><br /><small className="muted">{statusLabel(order.contact_status)}</small></div><Link className="order-action" href={`/crm/ordini/${order.id}`}>Dettagli</Link></li>)}</ul> : <p className="muted">Nessun cliente contattato per ora.</p>}</section>
    </div>
  </>;
}
