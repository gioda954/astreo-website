# Astreo — ordini e CRM

Applicazione Next.js 15 con il sito pubblico Astreo v2 preservato, form ordini, ricevuta PDF e CRM protetto da Supabase Auth/RLS.

Il sito pubblico originale vive in `public/` (`index.html`, `seconda-edizione.html`, `album.html`, CSS, JavaScript e immagini). Next.js riscrive solamente `/` verso `public/index.html`; le pagine applicative rimangono route Next.js. In questo modo l’aspetto del sito v2 resta fedele alla sorgente e il form/CRM mantengono il runtime server necessario.

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

Non pubblicare direttamente la sola cartella `public`: form, CRM, Server Actions e PDF richiedono il runtime Next.js/OpenNext di Netlify. La directory di pubblicazione resta `.next`.

## Verifica

```bash
npm test
npm run build
```
