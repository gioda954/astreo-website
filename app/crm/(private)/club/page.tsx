import { clubWhatsAppUrl } from "@/lib/club";
import { formatEuro } from "@/lib/order";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Campaign, ClubContact, Order } from "@/lib/types";
import { updateClubStatus } from "./actions";
import { ClubWhatsAppButton } from "./club-whatsapp-button";

export const dynamic = "force-dynamic";

type ContactSummary = {
  phone: string;
  name: string;
  email: string | null;
  address: string | null;
  status: "membro" | "non_membro";
  lastContactedAt: string | null;
  editions: string[];
  orders: Order[];
  bottles: number;
  spent: number;
};

function aggregateContacts(orders: Order[], clubRows: ClubContact[], campaigns: Campaign[]): ContactSummary[] {
  const club = new Map(clubRows.map((row) => [row.phone, row]));
  const editions = new Map(campaigns.map((campaign) => [campaign.id, campaign.vintage]));
  const grouped = new Map<string, Order[]>();
  for (const order of orders) grouped.set(order.phone, [...(grouped.get(order.phone) ?? []), order]);
  return [...grouped.entries()].map(([phone, contactOrders]) => {
    const sorted = [...contactOrders].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    const metadata = club.get(phone);
    return {
      phone,
      name: sorted[0].customer_name,
      email: metadata?.email ?? null,
      address: sorted.find((order) => order.shipping_address)?.shipping_address ?? null,
      status: metadata?.status ?? "non_membro",
      lastContactedAt: metadata?.last_contacted_at ?? null,
      editions: [...new Set(sorted.map((order) => editions.get(order.campaign_id) ?? order.vintage))],
      orders: sorted,
      bottles: sorted.reduce((sum, order) => sum + order.bottles_quantity, 0),
      spent: sorted.reduce((sum, order) => sum + order.expected_total_cents, 0),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "it"));
}

export default async function ClubPage({ searchParams }: { searchParams: Promise<{ q?: string; stato?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const [{ data: orderRows = [] }, { data: clubRows = [] }, { data: campaignRows = [] }] = await Promise.all([
    supabase.from("orders").select("*").is("cancelled_at", null).order("created_at", { ascending: false }).returns<Order[]>(),
    supabase.from("club_contacts").select("*").returns<ClubContact[]>(),
    supabase.from("campaigns").select("*").returns<Campaign[]>(),
  ]);
  const contacts = aggregateContacts(orderRows ?? [], clubRows ?? [], campaignRows ?? []);
  const query = (params.q ?? "").trim().toLocaleLowerCase("it");
  const status = params.stato === "membro" || params.stato === "non_membro" ? params.stato : "tutti";
  const filtered = contacts.filter((contact) => {
    const matchesQuery = !query || [contact.name, contact.phone, contact.email, contact.address].some((value) => value?.toLocaleLowerCase("it").includes(query));
    return matchesQuery && (status === "tutti" || contact.status === status);
  });
  const members = contacts.filter((contact) => contact.status === "membro").length;
  const repeats = contacts.filter((contact) => contact.editions.length > 1).length;
  const contacted = contacts.filter((contact) => contact.lastContactedAt).length;

  return <>
    <p className="eyebrow">Community Astreo</p>
    <h1>Club</h1>
    <p className="lead">Tutti i contatti acquisiti nelle diverse edizioni, riuniti per numero di telefono.</p>
    <div className="stats club-stats">
      <div className="stat"><span>Contatti totali</span><strong>{contacts.length}</strong></div>
      <div className="stat"><span>Membri</span><strong>{members}</strong></div>
      <div className="stat"><span>Clienti di più edizioni</span><strong>{repeats}</strong></div>
      <div className="stat"><span>Inviti WhatsApp aperti</span><strong>{contacted}</strong></div>
    </div>
    <form className="filters club-filters">
      <div className="field"><label htmlFor="q">Cerca</label><input id="q" name="q" defaultValue={params.q} placeholder="Nome, telefono, email o indirizzo" /></div>
      <div className="field"><label htmlFor="stato">Stato Club</label><select id="stato" name="stato" defaultValue={status}><option value="tutti">Tutti</option><option value="membro">Membri</option><option value="non_membro">Non membri</option></select></div>
      <button className="button">Filtra</button>
    </form>
    <p className="muted">{filtered.length} contatti visualizzati</p>
    <div className="table-wrap"><table className="club-table"><thead><tr><th>Contatto</th><th>Recapiti</th><th>Edizioni</th><th>Acquisti</th><th>Stato Club</th><th>Azione</th></tr></thead><tbody>{filtered.map((contact) => <tr key={contact.phone}>
      <td><strong>{contact.name}</strong><br/><small className="muted">{contact.address ?? "Nessun indirizzo"}</small></td>
      <td><a href={`tel:${contact.phone}`}>{contact.phone}</a>{contact.email && <><br/><a href={`mailto:${contact.email}`}>{contact.email}</a></>}</td>
      <td>{contact.editions.map((edition) => <span className="edition-chip" key={edition}>{edition}</span>)}</td>
      <td><strong>{contact.orders.length} ordini · {contact.bottles} bottiglie</strong><br/><span>{formatEuro(contact.spent)}</span><details className="contact-history"><summary>Vedi storico completo</summary>{contact.orders.map((order) => <div key={order.id}><strong>{order.vintage}</strong> · {new Date(order.created_at).toLocaleDateString("it-IT")}<br/>{order.cases_quantity} casse / {order.bottles_quantity} bottiglie · {formatEuro(order.expected_total_cents)}<br/>{order.fulfillment_type === "spedizione" ? order.shipping_address ?? "Spedizione" : "Ritiro concordato"}{order.notes ? <><br/><em>{order.notes}</em></> : null}</div>)}</details></td>
      <td><form action={updateClubStatus} className="club-status-form"><input type="hidden" name="phone" value={contact.phone}/><select name="status" defaultValue={contact.status} aria-label={`Stato Club di ${contact.name}`}><option value="non_membro">NON MEMBRO</option><option value="membro">MEMBRO</option></select><button className="button secondary">Salva</button></form>{contact.lastContactedAt && <small className="muted">Contattato: {new Date(contact.lastContactedAt).toLocaleDateString("it-IT")}</small>}</td>
      <td><ClubWhatsAppButton phone={contact.phone} href={clubWhatsAppUrl(contact.phone, contact.name)} /></td>
    </tr>)}</tbody></table></div>
  </>;
}
