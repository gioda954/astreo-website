import type { Metadata } from "next";
import { LoginForm } from "./login-form";
export const metadata: Metadata = { title:"Accesso CRM Astreo", robots:{ index:false, follow:false } };
export default function LoginPage(){ return <main className="app-shell"><LoginForm/></main>; }
