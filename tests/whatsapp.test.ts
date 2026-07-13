import { describe,expect,it } from "vitest";
import { DEFAULT_WHATSAPP_TEMPLATE,renderWhatsAppMessage,whatsappUrl } from "@/lib/whatsapp";
import type { Order } from "@/lib/types";
const order={customer_name:"Alessandro Rossi",phone:"+393331234567",cases_quantity:1,case_price_cents:9900,shipping_price_cents:2000,expected_total_cents:11900,fulfillment_type:"spedizione"} as Order;
describe("WhatsApp",()=>{it("personalizza il messaggio",()=>{const text=renderWhatsAppMessage(DEFAULT_WHATSAPP_TEMPLATE,order,{full_name:"Giovanni Dal Lago",presentation:"del corso Astraios"},"IBAN TEST");expect(text).toContain("Ciao Alessandro!");expect(text).toContain("1 cassa");expect(text).toContain("119,00 €");expect(text).toContain("IBAN TEST");});it("genera un wa.me senza il simbolo +",()=>expect(whatsappUrl(order.phone,"Ciao")).toMatch(/^https:\/\/wa\.me\/393331234567\?text=/));});
