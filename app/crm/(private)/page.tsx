import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatEuro } from "@/lib/order";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data = [] } = await supabase.from("orders").select("*").is("cancelled_at",null).returns<Order[]>();
  const orders = data ?? [];
  const sum=(key:"cases_quantity"|"bottles_quantity"|"expected_total_cents"|"collected_total_cents")=>orders.reduce((n,o)=>n+o[key],0);
  const stats=[
    ["Ordini",orders.length],["Casse",sum("cases_quantity")],["Bottiglie",sum("bottles_quantity")],["Totale previsto",formatEuro(sum("expected_total_cents"))],
    ["Totale incassato",formatEuro(sum("collected_total_cents"))],["Residuo",formatEuro(sum("expected_total_cents")-sum("collected_total_cents"))],["Da contattare",orders.filter(o=>o.contact_status==="da_contattare").length],["Da consegnare",orders.filter(o=>o.delivery_status!=="consegnata").length],
  ];
  return <><p className="eyebrow">Panoramica operativa</p><h1>Dashboard</h1><div className="stats">{stats.map(([label,value])=><div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></>;
}
