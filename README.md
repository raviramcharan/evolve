# Evolve

A 12-week body composition coaching app. Coaches manage clients, track check-ins, and adjust programs. Clients log daily nutrition, weekly check-ins, and progress photos.

**Production:** `https://evolve.raviramcharan.nl`

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS (dark mode only, mobile-first 390px) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Charts | Recharts |
| Email | Resend |
| Hosting | Vercel |
| DNS | Cloudflare (grey cloud — DNS only, not proxied) |

---

## Signup Flows

### Coach signup

1. Go to `/coach/signup`
2. Click **Continue with Google**
3. OAuth callback lands at `/coach/onboarding`
4. Enter your name → **Go to Dashboard**
5. Coach code is auto-generated (e.g. `RV-X9K2PL`) and shown in Settings

### Client signup (via coach invite link)

Coaches share this link with clients:

```
https://evolve.raviramcharan.nl/signup?code=XX-XXXXXX
```

1. Client visits the invite link — sees "Invited by [Coach Name]"
2. Click **Continue with Google**
3. OAuth callback lands at `/onboarding?invite=XX-XXXXXX`
4. Complete 7-step program setup (name, weight, goals, targets)
5. Lands on `/dashboard`

The coach code is validated at signup and the client is linked to the coach automatically.

### Returning users (any role)

```
https://evolve.raviramcharan.nl/login
```

Supports Google OAuth or email/password. Role-based redirect:
- Coaches → `/coach/dashboard`
- Clients → `/dashboard`

---

## Environment Variables

### `.env.local` (local dev)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
```

### Vercel (production)

Add the same four variables in **Vercel → Project → Settings → Environment Variables**.

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Requires `.env.local` with all four variables above.

---

## Supabase Setup

### 1. Create project

Create a new project at [supabase.com](https://supabase.com). Copy the project URL and anon key into `.env.local`.

### 2. Run migrations

In the Supabase dashboard go to **SQL Editor** and run each migration in order:

```
migrations/001_initial_schema.sql
migrations/002_multi_tenant.sql
```

### 3. Storage bucket

1. Go to **Storage → Create bucket**
2. Name: `progress-photos`
3. Public: **Yes** (UUIDs in paths are not guessable — acceptable for a personal coaching app)
4. No additional storage policies needed (public bucket)

### 4. Google OAuth

1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the **Google+ API** (or People API)
3. Create OAuth 2.0 credentials (Web application)
4. Add these **Authorised redirect URIs**:
   ```
   https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
5. In Supabase → **Auth → Providers → Google**, paste the Client ID and Client Secret

### 5. Auth URL configuration

In Supabase → **Auth → URL Configuration**:

| Setting | Value |
|---|---|
| Site URL | `https://evolve.raviramcharan.nl` |
| Redirect URLs | `https://evolve.raviramcharan.nl/**` |
| Redirect URLs | `http://localhost:3000/**` |

Without the Site URL set correctly, Google OAuth redirects to `localhost` in production.

---

## Deployment

### Vercel

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables (see above)
4. Deploy — Vercel auto-deploys on every push to `main`

### Cloudflare DNS (custom domain)

1. In Vercel → **Project → Settings → Domains**, add `evolve.raviramcharan.nl`
2. Vercel gives you a CNAME target (e.g. `cname.vercel-dns.com`)
3. In Cloudflare → **DNS**, add a CNAME record:
   - Name: `evolve`
   - Target: the Vercel CNAME
   - **Proxy status: DNS only (grey cloud)** — do not enable orange cloud, it breaks Vercel's SSL

---

## Role Separation

| Role | Login URL | Dashboard | Nav |
|---|---|---|---|
| Coach | `/coach/signup` or `/login` | `/coach/dashboard` | Bottom nav: Dashboard, Clients, Settings |
| Client | `/signup?code=XX-XXXXXX` or `/login` | `/dashboard` | Bottom nav: Home, Check-in, Photos, Settings |

Roles are stored in `users.role` (values: `coach` or `client`). Server-side `requireCoach()` guards all `/coach/*` pages. Each role has its own nav component — coaches never see the client nav.

---

## Project Structure

```
app/
  coach/              # All coach pages (/coach/*)
    signup/           # Coach Google signup
    onboarding/       # New coach name entry
    dashboard/        # Coach overview + stats
    clients/          # Client list + detail pages
    settings/         # Coach code, name, bio
  (client pages)
    dashboard/        # Client home
    check-in/         # Weekly check-in + history + edit
    photos/           # Progress photo upload/grid
    settings/         # Connected coach, notes
  onboarding/         # Client 7-step program setup
  signup/             # Client signup (reads ?code=)
  login/              # Shared login (Google + email)
  auth/callback/      # OAuth exchange + role-based redirect

components/
  layout/
    CoachNav.tsx      # Coach bottom nav (3 tabs)
    MobileNav.tsx     # Client bottom nav (4 tabs)
  photos/             # PhotoUpload, PhotoGrid
  ui/                 # Button, Input, ProgressBar, etc.

lib/
  auth.ts             # requireCoach(), getUserProfile()
  coach-code.ts       # generateCoachCode(), validateCoachCode()
  supabase.ts         # Browser Supabase client
  supabase-server.ts  # Server Supabase client (cookies)
  supabase-admin.ts   # Admin client (service role key)

migrations/
  001_initial_schema.sql
  002_multi_tenant.sql

types/
  index.ts            # User, Program, CheckIn, Coach, etc.
```

---

## Coach Code Format

Codes are generated at coach account creation:

```
{INITIALS}-{RANDOM6}
e.g. RV-X9K2PL
```

Generated by `lib/coach-code.ts`. Displayed and copyable in `/coach/settings`. Shared with clients as part of the signup URL: `/signup?code=RV-X9K2PL`.
