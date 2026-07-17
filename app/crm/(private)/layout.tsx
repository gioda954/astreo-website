import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/crm/login");
  const supabase = await createServerSupabaseClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login");
  const { data:profile } = await supabase.from("profiles").select("full_name,role,disabled").eq("id",user.id).single();
  if (!profile || profile.disabled) { await supabase.auth.signOut(); redirect("/crm/login"); }
  return <div className="crm-layout"><aside className="sidebar"><Link className="brand" href="/crm"><img src="/images/logo.jpg" alt="Astreo"/><span>CRM</span></Link><nav><Link href="/crm">Dashboard</Link><Link href="/crm/ordini">Ordini</Link><Link href="/crm/profilo">Profilo</Link><Link href="/crm/storico">Storico edizioni</Link><Link href="/crm/club">Club</Link>{profile.role === "admin" && <Link href="/crm/impostazioni">Impostazioni</Link>}</nav><p className="muted" style={{marginTop:"2rem"}}>{profile.full_name}<br/><small>{profile.role}</small></p><form action={logout}><button className="button secondary">Esci</button></form></aside><main className="crm-main">{children}</main></div>;
}
