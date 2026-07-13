"use client";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as LoginState);
  return <form action={action} className="card login"><p className="eyebrow">Area riservata</p><h1>CRM Astreo</h1><p className="muted">Accesso riservato ai collaboratori invitati.</p><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email"/></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password"/></div>{state.error && <p className="error">{state.error}</p>}<button className="button" disabled={pending}>{pending ? "Accesso…" : "Accedi"}</button></form>;
}
