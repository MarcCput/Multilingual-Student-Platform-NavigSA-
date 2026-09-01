# Multilingual Student Support Platform (NavigSA)

Helps international students apply to South African universities: onboarding,
document uploads, application tracking, and a marketplace of verified service
providers. Four languages (EN / PT / FR / ES).

Originally exported from
[Figma](https://www.figma.com/design/WNMjr11B4UOXjhVebWPqm4/Multilingual-Student-Support-Platform),
now backed by Supabase for auth, data, and file storage.

## Running the code

```bash
npm install
npm run dev
```

The app starts at <http://localhost:5173>.

Without Supabase credentials you'll see the login screen with an amber
"Supabase not connected" banner — the UI renders, but you can't sign in.
See **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** to connect a backend; it takes
about ten minutes.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run typecheck` | `tsc --noEmit` — Vite transpiles without checking types, so run this too |

## Stack

React 18 · TypeScript · Vite 6 · React Router 7 · Tailwind CSS 4 · Supabase

## Layout

```
src/
  lib/
    supabase.ts          Supabase client + config guard
    api.ts               Every database and storage call
    database.types.ts    Table types (regenerate after schema changes)
    useAsyncData.ts      Fetch-on-mount hook with loading/error state
  app/
    contexts/
      AuthContext.tsx    Session, profile, sign in/up/out
      LanguageContext.tsx  Translations, restores saved language
    components/
      ProtectedRoute.tsx Redirects signed-out visitors to the login page
      Navigation.tsx
    pages/               Login, Onboarding, Dashboard, Marketplace,
                         Applications, Documents, Profile
supabase/
  migrations/            Run these in the Supabase SQL editor, in order
```
