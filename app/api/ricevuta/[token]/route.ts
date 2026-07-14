import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatEuro } from "@/lib/order";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

function clean(text: string) { return text.replace(/[^\x20-\x7EÀ-ÿ]/g, ""); }

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response("Non trovato", { status: 404 });
  let order: Order | null = null;
  try {
    order = (await createAdminClient().from("orders").select("*").eq("receipt_token", token).single<Order>()).data;
  } catch { /* return not found */ }
  if (!order) return new Response("Non trovato", { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.03, 0.07, 0.13);
  const blue = rgb(0.15, 0.28, 0.47);
  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: navy });
  page.drawRectangle({ x: 42, y: 735, width: 511, height: 3, color: blue });
  page.drawText("ASTREO", { x: 42, y: 770, size: 28, font: bold, color: rgb(.93,.95,1) });
  page.drawText("AD MAIORA", { x: 43, y: 750, size: 9, font: regular, color: rgb(.65,.72,.84) });
  page.drawText("Grazie per aver partecipato", { x: 42, y: 685, size: 24, font: bold, color: rgb(.93,.95,1) });
  page.drawText(clean(`all'edizione ${order.vintage} di Astreo.`), { x: 42, y: 658, size: 15, font: regular, color: rgb(.7,.76,.85) });
  const rows = [
    ["Codice ordine", order.code],
    ["Data", new Intl.DateTimeFormat("it-IT", { dateStyle:"long" }).format(new Date(order.created_at))],
    ["Cliente", order.customer_name],
    ["Prodotto", `${order.product_name} (${order.vintage})`],
    ["Quantita", `${order.cases_quantity} ${order.cases_quantity === 1 ? "cassa" : "casse"} / ${order.bottles_quantity} bottiglie`],
    ["Modalita", order.fulfillment_type === "spedizione" ? "Spedizione" : "Ritiro concordato"],
    ...(order.fulfillment_type === "ritiro" ? [["Punto di ritiro", "Via Spesse 5, 36070 Brogliano (VI)"]] : []),
    ["Casse", formatEuro(order.case_price_cents * order.cases_quantity)],
    ["Spedizione", formatEuro(order.shipping_price_cents)],
    ["Totale previsto", formatEuro(order.expected_total_cents)],
  ];
  let y = 595;
  for (const [label, value] of rows) {
    page.drawText(clean(label), { x: 42, y, size: 10, font: bold, color: rgb(.5,.63,.82) });
    page.drawText(clean(value), { x: 190, y, size: 11, font: regular, color: rgb(.93,.95,1), maxWidth: 355 });
    y -= 34;
  }
  if (order.shipping_address) {
    page.drawText("Indirizzo", { x:42, y, size:10, font:bold, color:rgb(.5,.63,.82) });
    page.drawText(clean(order.shipping_address), { x:190, y, size:10, font:regular, color:rgb(.93,.95,1), maxWidth:355 });
  }
  page.drawRectangle({ x:42,y:88,width:511,height:1,color:blue });
  page.drawText("Questo documento e un riepilogo d'ordine, non una ricevuta fiscale ne una", { x:42,y:62,size:9,font:regular,color:rgb(.65,.72,.84) });
  page.drawText("conferma di pagamento. Pagamento e consegna saranno concordati con il team Astreo.", { x:42,y:48,size:9,font:regular,color:rgb(.65,.72,.84) });
  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), { headers: { "Content-Type":"application/pdf", "Content-Disposition":`attachment; filename="Astreo-${order.code}.pdf"`, "Cache-Control":"private, no-store" } });
}
