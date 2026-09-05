# PRIME 72 — MVP

Sito/PWA prototipo per il lancio GTA 6 (19 novembre 2026).

## Cosa c’è già
- Countdown reale al 19/11/2026 00:00 ET
- Mappa scura stile Leonida (base Miami) con pin seed + pin utente
- Feed scoperte + ticker
- Quiz profilo criminale
- Pagina Pro / Launch Pack (checkout finto)

## Come aprirlo in locale
Apri `index.html` in Chrome, oppure da questa cartella:

```bash
python3 -m http.server 8080
```

Poi vai su http://localhost:8080

La mappa (Leaflet) ha bisogno di rete.

## Deploy in 10 minuti
1. Carica la cartella su GitHub
2. Importa su [Vercel](https://vercel.com) o [Netlify](https://netlify.com)
3. Dominio: `prime72.it` / `prime72.app` se libero

## Cosa manca per produzione (tue chiavi)
- Account Supabase/Firebase per pin e feed condivisi
- Stripe per i 7,99 €
- OneSignal per le push
- Privacy policy + disclaimer Rockstar (già in footer)

Non usare logo o asset ufficiali Rockstar come brand.
