"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function context(){ const s=await createServerSupabaseClient(); const {data:{user}}=await s.auth.getUser(); if(!user) throw new Error("Non autorizzato"); return {s,user}; }
export async function updateOrder(id:string, formData:FormData){
  const {s}=await context(); const collected=Math.round(Number(formData.get("collectedEuros")||0)*100);
  const payload={ contact_status:String(formData.get("contactStatus")), payment_status:String(formData.get("paymentStatus")), delivery_status:String(formData.get("deliveryStatus")), assignee_id:String(formData.get("assigneeId")||"")||null, collected_total_cents:Math.max(0,collected) };
  const {error}=await s.from("orders").update(payload).eq("id",id); if(error) throw new Error(error.message); revalidatePath(`/crm/ordini/${id}`); revalidatePath("/crm");
}
export async function selfAssign(id:string){ const {s,user}=await context(); const {error}=await s.from("orders").update({assignee_id:user.id}).eq("id",id); if(error) throw new Error(error.message); revalidatePath(`/crm/ordini/${id}`); }
export async function addNote(id:string,formData:FormData){ const body=String(formData.get("body")||"").trim(); if(!body||body.length>2000)return; const {s,user}=await context(); const {error}=await s.from("internal_notes").insert({order_id:id,author_id:user.id,body}); if(error)throw new Error(error.message); await s.from("activity_log").insert({order_id:id,actor_id:user.id,action:"nota_aggiunta",details:{}}); revalidatePath(`/crm/ordini/${id}`); }
export async function cancelOrder(id:string,formData:FormData){ const reason=String(formData.get("reason")||"").trim(); if(reason.length<3)throw new Error("Inserisci una motivazione"); const {s}=await context(); const {error}=await s.from("orders").update({cancelled_at:new Date().toISOString(),cancellation_reason:reason}).eq("id",id); if(error)throw new Error(error.message); revalidatePath(`/crm/ordini/${id}`); }
export async function logWhatsApp(id:string){ const {s,user}=await context(); await s.from("activity_log").insert({order_id:id,actor_id:user.id,action:"whatsapp_aperto",details:{}}); }
