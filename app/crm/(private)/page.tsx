import { createServerSupabaseClient } from "@/lib/supabase/server";
import { campaignStats } from "@/lib/crm";
import { formatEuro } from "@/lib/order";
import type { Campaign, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: campaign } = await supabase.from("campaigns").select("*").eq("is_active", true).single<Campaign>();
  const { data = [] } = campaign
    ? await supabase.from("orders").select("*").eq("campaign_id", campaign.id).returns<Order[]>()
    : { data: [] };
  const stats = campaignStats(data ?? []);
  const cards = [
    ["Ordini", stats.orders], ["Casse", stats.cases], ["Bottiglie", stats.bottles], ["Totale previsto", formatEuro(stats.expected)],
    ["Totale incassato", formatEuro(stats.collected)], ["Residuo", formatEuro(stats.remaining)], ["Da contattare", stats.toContact], ["Da consegnare", stats.toDeliver],
  ];
  return <><p className="eyebrow">Panoramica operativa · Edizione {campaign?.vintage}</p><h1>Dashboard</h1><div className="stats">{cards.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></>;
}
