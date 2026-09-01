# Connecting NavigSA to Supabase

The app code is already wired up. You need to create the project and paste in two
values. Budget about ten minutes.

---

## 1. Create the project

1. Go to <https://supabase.com> and sign in (GitHub sign-in is quickest).
2. **New project**. Pick your organisation.
3. Fill in:
   - **Name**: `navigsa`
   - **Database password**: generate one and save it in a password manager.
     You won't need it for this app, but you cannot recover it later.
   - **Region**: choose the one closest to your users. For South Africa,
     `eu-west-1` or `eu-central-1` are usually the lowest latency options.
4. **Create new project**, then wait ~2 minutes while it provisions.

## 2. Run the migrations

Open **SQL Editor** in the left sidebar. For each file below, click
**New query**, paste the whole file, and press **Run**. Order matters.

| # | File | What it does |
|---|------|--------------|
| 1 | `supabase/migrations/0001_init.sql` | Creates `profiles`, `applications`, `documents`, `services`, plus the trigger that makes a profile row on signup |
| 2 | `supabase/migrations/0002_rls_and_storage.sql` | Turns on Row Level Security, adds the per-user policies, creates the private `documents` storage bucket |
| 3 | `supabase/migrations/0003_seed_services.sql` | Fills the marketplace with the five providers the prototype used to hardcode |

Each should report **Success. No rows returned**.

## 3. Copy your API credentials

1. **Project Settings** (gear icon) → **API**.
2. Copy **Project URL** and the **anon / public** key.
3. Open `.env.local` in the project root and replace the placeholders:

```
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> **Only ever use the `anon` key here.** It is safe in a browser because Row
> Level Security decides what it can reach. The `service_role` key bypasses RLS
> completely — never put it in `.env.local`, in `src/`, or in any file you commit.

## 4. Restart the dev server

Vite reads env vars at startup, so a restart is required — hot reload won't pick
them up.

```bash
npm run dev
```

The amber "Supabase not connected" banner on the login screen disappears once the
keys are live. That banner is your check that step 3 worked.

## 5. Create your first account

1. Click **Create Account**, enter an email and a password of 6+ characters.
2. By default Supabase sends a confirmation email. Click the link, then sign in.
3. You land in onboarding. Fill in the three steps and click **Complete Setup** —
   that writes to your `profiles` row and flips `onboarding_completed` to true.

**Testing without email round-trips:** go to **Authentication → Sign In / Providers
→ Email** and turn **Confirm email** off. Signup then returns a session straight
away. Turn it back on before this goes anywhere real.

---

## What's wired up

| Area | Behaviour |
|------|-----------|
| **Auth** | Email + password signup, login, password reset, sign out. Session persists across reloads and refreshes itself. |
| **Route guard** | Every page except the login screen sits behind `ProtectedRoute`. Signed-out visitors get bounced to `/`. |
| **Onboarding** | All three steps save to `profiles`. Returning to the page repopulates what you entered. |
| **Dashboard** | Live counts and recent rows from `applications`, `documents`, `services`. |
| **Applications** | Create, list, filter, delete — all against the `applications` table. |
| **Documents** | Real uploads to the private `documents` bucket, drag-and-drop or file picker. View opens a 60-second signed URL. Delete removes both the row and the file. |
| **Profile** | Edit and save personal details, change password, toggle notification preferences, set study preferences. |
| **Language** | The language you save on your profile is restored on next sign-in. |

## Security model

Row Level Security is on for every table, so the anon key can only ever read or
write rows where `user_id` matches the signed-in user. Files are stored under
`<user-id>/<filename>` and the storage policies pin that first path segment to
`auth.uid()`, so one student cannot reach another's uploads even with a guessed
path.

Two things are deliberately **not** student-writable:

- **`documents.status`** — students upload; a reviewer marks documents verified or
  rejected. Do that from the dashboard or a server-side job using the
  `service_role` key, which bypasses RLS.
- **`profiles.verification_status`** — same reasoning.

The RLS policy currently lets a student update their own `documents` row, which
includes `status`. If you want that locked down properly, replace the update
policy with a column-level grant:

```sql
drop policy "update own documents" on public.documents;

revoke update on public.documents from authenticated;
grant update (name, type, application_id) on public.documents to authenticated;

create policy "update own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## Deploying

`createBrowserRouter` uses real URLs, so your host must rewrite all paths to
`index.html` or a refresh on `/dashboard` will 404. On Netlify add a `_redirects`
file containing `/* /index.html 200`; on Vercel it works out of the box.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your host's environment
variables — `.env.local` is gitignored and won't be deployed.

Then add your production URL under **Authentication → URL Configuration → Redirect
URLs**, or password-reset links will bounce back to localhost.

## Troubleshooting

**"Supabase is not configured" banner won't go away** — you edited `.env.local` but
didn't restart `npm run dev`, or the values still contain the placeholder text.

**"Invalid login credentials"** — usually an unconfirmed email. Check
**Authentication → Users** for your account's confirmation status.

**Rows return empty with no error** — that's RLS doing its job. It means the query
ran as a different user than the one that owns the rows, or you're not signed in.

**Upload fails with "new row violates row-level security policy"** — migration
`0002` didn't run, or only partly ran. Re-run the whole file.

**Type errors after changing the schema** — regenerate the types:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts
```
