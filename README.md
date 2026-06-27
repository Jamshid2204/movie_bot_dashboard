# Movie Dashboard (React SPA)

Self-contained admin dashboard for the movie bot library. **No backend server** — this is a
static React app that talks directly to **Supabase** from the browser (anon key + Row-Level
Security + Supabase Auth).

## Prerequisites

- Node.js v16+ (for dev/build only — production is a static site)
- A Supabase project with the `movies` table + RLS + admin user set up.
  Follow [`../SUPABASE_SETUP.md`](../SUPABASE_SETUP.md) once (5 minutes).

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev             # http://localhost:5173
```

## What it does

- **Login** with Supabase Auth (email + password). Admin users are created in the
  Supabase dashboard (Authentication → Users → Add user).
- **Movies tab**: list with search + pagination, toggle Featured, delete.
- **Add Movie tab**: paste a storage-channel message link (or just message id) + metadata.
  The next `MOV-XXXX` code is auto-assigned via an atomic RPC.
- **Stats tab**: totals, total downloads, top 5.

## How movies get into the bot

When you add a movie here, a row is written to the Supabase `movies` table. The Telegram
bot reads the same table (via its own service_role connection), so the new movie appears
in its 🆕 New list immediately. Tapping it makes the bot `copyMessage` the file — no
"Forwarded from" label.

## Link formats accepted

| Input | channel_id used |
|---|---|
| `https://t.me/c/1234567890/42` | `-1001234567890` (parsed from link) |
| `https://t.me/+abc/42` or `https://t.me/PublicChan/42` | `VITE_STORAGE_CHANNEL_ID` (env) |
| `42` (bare message id) | `VITE_STORAGE_CHANNEL_ID` (env) |

## Security model

- The **anon key** (`VITE_SUPABASE_ANON_KEY`) is safe to expose in the browser — it can
  only do what Supabase RLS policies allow.
- **Reading** movies: public (RLS policy allows anon SELECT).
- **Writing** movies (create, update, delete): requires an authenticated Supabase session
  (RLS policy allows only `authenticated` role).
- The dashboard calls `supabase.auth.signInWithPassword()` on login; the JWT is stored
  automatically by the Supabase client. No custom JWT, no Express backend.

## Build for production

```bash
npm run build   # outputs dist/
```

The `dist/` folder is a static site you can host anywhere:
- **Vercel**: `npx vercel --prod` (auto-detects Vite)
- **Netlify**: drag `dist/` to Netlify Drop, or connect your repo
- **GitHub Pages**: push `dist/` to a `gh-pages` branch
- **Any web server**: serve `dist/` as static files

No server-side runtime needed.

## Deploy to Vercel (example)

```bash
# Install Vercel CLI (once)
npm i -g vercel

# From this directory
vercel --prod
# Follow the prompts. Vite is auto-detected.
# Set env vars in the Vercel dashboard:
#   VITE_SUPABASE_URL = https://xxxxx.supabase.co
#   VITE_SUPABASE_ANON_KEY = eyJ...
#   VITE_STORAGE_CHANNEL_ID = -1001234567890
```
