"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function updateProfile(formData:FormData){const s=await createServerSupabaseClient();const {data:{user}}=await s.auth.getUser();if(!user)return;const full_name=String(formData.get("fullName")||"").trim();const presentation=String(formData.get("presentation")||"").trim();if(full_name.length<2)return;await s.from("profiles").update({full_name,presentation}).eq("id",user.id);revalidatePath("/crm/profilo");}
