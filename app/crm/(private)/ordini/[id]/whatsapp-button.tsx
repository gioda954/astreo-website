"use client";
import { logWhatsApp } from "./actions";
export function WhatsAppButton({id,url}:{id:string;url:string}){return <a className="button" href={url} target="_blank" rel="noopener noreferrer" onClick={()=>void logWhatsApp(id)}>Apri in WhatsApp</a>}
