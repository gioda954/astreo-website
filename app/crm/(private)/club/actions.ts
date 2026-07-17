"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClubStatus } from "@/lib/types";

async function context() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");
  return { supabase, user };
}

function validPhone(value: FormDataEntryValue | null) {
  const phone = String(value ?? "").trim();
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) throw new Error("Numero di telefono non valido");
  return phone;
}

export async function updateClubStatus(formData: FormData) {
  const phone = validPhone(formData.get("phone"));
  const status: ClubStatus = formData.get("status") === "membro" ? "membro" : "non_membro";
  const { supabase, user } = await context();
  const { error } = await supabase.from("club_contacts").upsert({ phone, status, updated_by: user.id }, { onConflict: "phone" });
  if (error) throw new Error(error.message);
  revalidatePath("/crm/club");
}

export async function logClubWhatsApp(phone: string) {
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) return;
  const { supabase, user } = await context();
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from("club_contacts").select("phone").eq("phone", phone).maybeSingle();
  const query = existing
    ? supabase.from("club_contacts").update({ last_contacted_at: now, updated_by: user.id }).eq("phone", phone)
    : supabase.from("club_contacts").insert({ phone, status: "non_membro", last_contacted_at: now, updated_by: user.id });
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/crm/club");
}
