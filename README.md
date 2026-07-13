# Astreo — ordini e CRM

Applicazione Next.js 15 con sito pubblico preservato, form ordini, ricevuta PDF e CRM protetto da Supabase Auth/RLS.

## Avvio locale

1. Creare un progetto Supabase e applicare `supabase/migrations/202607130001_initial_schema.sql` dal SQL editor o dalla CLI.
2. Copiare `.env.example` in `.env.local` e valorizzare le chiavi. La service role viene usata soltanto sul server.
3. Creare il primo utente da Supabase Auth, quindi impostare `role = 'admin'` nella relativa riga `profiles`.
4. Eseguire `npm install` e `npm run dev`.

Il sito pubblico è su `/`, il form su `/ordina` e il CRM, volutamente non collegato né indicizzato, su `/crm`.

## Deploy Netlify

- Collegare il repository al progetto Netlify esistente. `netlify.toml` configura build Next.js, output `.next` e Node 22.
- Configurare nell'interfaccia Netlify tutte le variabili presenti in `.env.example`, disponibili sia in build sia nelle Functions.
- Impostare `NEXT_PUBLIC_SITE_URL=https://astreo.org` e aggiungere lo stesso dominio agli URL consentiti di Supabase Auth.
- Attivare backup e point-in-time recovery secondo il piano Supabase scelto.
- Sostituire `public/images/bottiglia.jpg` con la foto definitiva della cassa quando disponibile.

Non usare un deploy statico o la cartella `public`: form, CRM, Server Actions e PDF richiedono il runtime Next.js/OpenNext di Netlify.

## Verifica

```bash
npm test
npm run build
```
