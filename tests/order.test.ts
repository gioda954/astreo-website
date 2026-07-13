import { describe,expect,it } from "vitest";
import { calculateOrder,normalizeItalianPhone } from "@/lib/order";
const campaign={case_price_cents:9900,shipping_price_cents:2000,bottles_per_case:6};
describe("ordini",()=>{
  it("aggiunge +39 ai numeri senza prefisso",()=>expect(normalizeItalianPhone("333 123 4567")).toBe("+393331234567"));
  it("preserva un prefisso internazionale",()=>expect(normalizeItalianPhone("+44 7700 900123")).toBe("+447700900123"));
  it("calcola casse, bottiglie e spedizione",()=>expect(calculateOrder(campaign,2,"spedizione")).toEqual({bottles:12,casesTotalCents:19800,shippingCents:2000,totalCents:21800}));
  it("esclude la spedizione dal ritiro",()=>expect(calculateOrder(campaign,1,"ritiro").totalCents).toBe(9900));
});
