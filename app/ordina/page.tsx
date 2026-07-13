import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Campaign } from "@/lib/types";
import { formatEuro } from "@/lib/order";
import { OrderForm } from "./order-form";

export const metadata: Metadata = { title: "Ordina Astreo 2026", robots: { index: true, follow: true } };
export const dynamic = "force-dynamic";
const fallback: Campaign = { id:"preview", name:"Astreo — annata 2020", vintage:"2026", description:"Taglio Bordolese elegante e raffinato, 50% Cabernet Sauvignon e 50% Merlot, affinato due anni in botti di rovere.", case_price_cents:9900, shipping_price_cents:2000, bottles_per_case:6, delivery_note:"Consegna prevista in meno di un mese.", charity_note:"Il 100% dei profitti sarà donato in beneficenza attraverso i progetti indicati.", goal_bottles:1000, is_active:true };

async function getCampaign() {
  try {
    const { data } = await createAdminClient().from("campaigns").select("*").eq("is_active", true).single<Campaign>();
    return data ?? fallback;
  } catch { return fallback; }
}

export default async function OrderPage() {
  const campaign = await getCampaign();
  return <main className="app-shell"><header className="topbar"><Link className="brand" href="/"><img src="/images/logo.jpg" alt="Logo Astreo"/><span>Astreo</span></Link><Link href="/" className="button secondary">Torna al sito</Link></header>
    <div className="page order-grid"><section className="card"><p className="eyebrow">Ordine Astreo {campaign.vintage}</p><h1>Un vino che lascia il segno.</h1><p className="lead">{campaign.description}</p><img className="product-image" src="/images/bottiglia.jpg" alt="Cassa da sei bottiglie di vino Astreo"/>
      <div className="facts"><div className="fact"><span className="muted">Una cassa</span><strong>{formatEuro(campaign.case_price_cents)}</strong><small>{formatEuro(campaign.case_price_cents / campaign.bottles_per_case)} a bottiglia</small></div><div className="fact"><span className="muted">Contenuto</span><strong>{campaign.bottles_per_case} bottiglie</strong><small>Niente bottiglie singole</small></div></div>
      <p>{campaign.delivery_note}</p><p>{campaign.charity_note}</p><p className="muted">Obiettivo: {campaign.goal_bottles} bottiglie. Dopo l’ordine sarai contattato per pagamento e consegna.</p><p><strong>Grazie mille e Pale a Prora!</strong></p>
    </section><OrderForm campaign={campaign}/></div></main>;
}
