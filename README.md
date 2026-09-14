# R We Vibing?

Two people, two music tastes, one lovingly honest vibe check. Next.js 15.5.24 App Router (upgraded from 14 with user approval for security fixes), React, Tailwind, Neon Postgres, Prisma, Groq, Zod, Recharts, html-to-image and canvas-confetti. Optional Google accounts add friends and direct invitations; guest sessions remain available.

## Run locally

Requires Node.js 22+ and npm. Install dependencies with `npm ci`, copy `.env.example` to `.env.local`, and fill in the keys below. Run `npm run db:deploy`, then `npm run dev`. Open http://localhost:3000.

`npm run build` generates Prisma Client and creates a production build; `npm start` serves it. `npm test` covers normalization, URL validation, AI schema constraints and retry behavior. `npm run typecheck` checks TypeScript.

Prisma uses the JavaScript Postgres adapter so the app works on Windows ARM without a native query engine. Migration CLI still uses Prisma's schema engine. Prisma CLI does not automatically load `.env.local`; `db:deploy` uses dotenv-cli explicitly.

## Free service setup

- **Neon**: https://console.neon.tech → create project on the Free plan → Connect → copy the pooled connection string to `DATABASE_URL`. Keep TLS enabled. No paid upgrade or payment card is needed for this app.
- **Groq**: https://console.groq.com/keys → Create API Key → `GROQ_API_KEY`. The code defaults to `llama-3.1-8b-instant` as originally requested, but this account no longer has that model. Production sets `GROQ_MODEL=openai/gpt-oss-20b`, which was verified with the free account and produces the same validated JSON. Stay on the free plan; quotas may temporarily prevent generation.
- **YouTube**: https://console.cloud.google.com → new project → APIs & Services → Library → YouTube Data API v3 → Enable → Credentials → Create credentials → API key. Restrict the key to YouTube Data API v3. Set `YOUTUBE_API_KEY`. Server-side requests cannot use browser HTTP-referrer restrictions. Do not attach billing for this app.
- **Spotify (unavailable)**: No Spotify keys are required. After accepting the terms, the account dashboard still exposed no app-creation control. New development access requires Premium, and Spotify terms restrict sending its content to AI models. The form and API disable Spotify import; the original adapter remains only as reference code. Use Manual or YouTube. See https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security and https://developer.spotify.com/terms.

All keys remain server-side and are excluded from Git. Never prefix them with NEXT*PUBLIC*. Manual input still needs Neon and Groq for persistent sessions and AI results.

## How it works

1. `/session/new` submits a name and one music source to `POST /api/sessions`.
2. `normalizeInput(type, value)` returns strings: first 20 YouTube videos or first 15 manual entries. Spotify requests return a friendly unavailable error before any provider request. Playlist URLs are validated against explicit provider hosts; the app never fetches user-supplied hosts.
3. Creator gets `/session/[id]`; a localStorage marker keeps that browser in the waiting state. Their friend opens the same link in another browser and submits to `POST /api/sessions/[id]/join`.
4. An atomic database update claims the second seat. A 60-second generation lease prevents duplicate concurrent Groq calls. Failed or interrupted generation can be retried from the shared page, up to five attempts per session.
5. One Groq call analyzes both lists. Zod validates JSON, score bounds and exact recommendation/award counts. Invalid output gets exactly one stricter retry. API failures return a friendly error without fabricated results.
6. Both clients poll `GET /api/sessions/[id]` every three seconds and navigate to `/results/[id]`. Results show score animation, genre presence chart, recommendations, awards, input badges and a downloadable image. Scores above 80 trigger confetti, respecting reduced-motion preferences.

`POST /api/sessions/[id]/regenerate` with `{}` retries failed generation. Existing successful results cannot be overwritten. A/B values in AI superlatives map to actual display names in the UI.

The Prisma model includes the requested fields plus `generationStartedAt` and `generationAttempts` for durable concurrency and retry control. Genre charts show inferred genre presence, not invented audio metrics. All analysis is playful and subjective.

## GitHub and Vercel

```sh
git init
git add .
git commit -m "Build R We Vibing music compatibility app"
gh auth login --web --git-protocol https
gh repo create are-we-vibing --public --source=. --remote=origin --push
vercel login
vercel link --yes --project are-we-vibing
vercel env add DATABASE_URL production
vercel env add GROQ_API_KEY production
vercel env add YOUTUBE_API_KEY production
vercel env add GROQ_MODEL production
npm run db:deploy
vercel --prod
```

Use Vercel's Hobby account and Neon Free. Do not select paid integrations. Set the same required variables in Vercel's development environment if using `vercel dev`. For future schema changes, create a migration against a development Neon branch using `dotenv -e .env.local -- prisma migrate dev --name your_change`, commit the migration, run `npm run db:deploy` against production, and redeploy. Never run reset against production.

## Privacy and operating limits

Session links are bearer links: anyone with a link may join before the second seat is filled and view names/results. Keep links private if desired. Normalized music lists are stored in the database but omitted from public GET responses. Names/music are sent to Groq to generate the result; music providers receive playlist lookups. There is no automatic session deletion. Share-card downloads are generated in the browser.

Input length limits, provider timeouts, fixed API hosts, same-origin browser mutation checks and a per-session generation cap bound individual requests. Free API quotas still apply; high-traffic public use may need an additional shared IP rate limiter. A free quota exhaustion is surfaced as an error, never an automatic paid upgrade.

## Verified service limitations

Spotify Developer Terms section IV.2.a.i prohibits ingesting Spotify content into an AI model, and its definition includes playlist metadata. Spotify input is therefore disabled in this AI application at both form and API levels. The requested adapter is retained as a reference implementation but never executed. No Spotify credentials are required or provisioned. Manual and YouTube flows are supported. See https://developer.spotify.com/terms.

Production: https://are-we-vibing.vercel.app
Repository: https://github.com/wauul/are-we-vibing


## Current live link and UI

Always use https://are-we-vibing.vercel.app. Vercel deployment-specific URLs are immutable snapshots: the old `are-we-vibing-mdsydv21b-wauuls-projects.vercel.app` snapshot predates the Prisma WASM fix and still fails to create sessions. Do not share that old link.

The interface includes an animated record-player scene with a pause control, sound bars, floating cards, a session progress indicator, and a score reveal. All motion respects reduced-motion preferences. The waiting screen supports entering the second person's music on the same device. Browser storage is optional; an in-memory fallback preserves the creator state during the current visit, and invitations contain only the shared session ID. Network errors preserve the form, and automatic mutation retries are deliberately avoided to prevent duplicate sessions.


## Artist and song autocomplete

My picks searches Apple’s public iTunes Search API after a short typing pause (minimum two characters). No API key or paid service is needed. Only the active search fragment is sent to the catalog; identical searches are cached for an hour. Select with a click or Arrow keys and Enter; Escape dismisses matches. Suggestions replace the active comma/newline-separated entry and never prevent typing custom music. Catalog limits or outages fall back to free text. No album artwork or audio previews are fetched. Spotify remains disabled and is labeled Coming soon.

## Google accounts, friends, and mobile sharing

In Google Cloud, select the app project, open Google Auth Platform, configure an External audience and create an OAuth client of type Web application. Only basic OpenID, email and profile scopes are needed. Add these authorized redirect URIs:

- `https://are-we-vibing.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a random `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`). Set `NEXTAUTH_URL=http://localhost:3000` locally and `NEXTAUTH_URL=https://are-we-vibing.vercel.app` in Vercel production. Add each using `vercel env add NAME production`, apply `npm run db:deploy`, and redeploy. Google apps in Testing allow only explicitly listed test users; publish the consent configuration when ready for other users. No billing is required.

At `/friends`, sign in, choose a display name and unique username, then add a friend by their exact username. The recipient must accept before either person can send a direct vibe invitation. Direct sessions require the creator or invited Google account to view, and only the invited account can join. Invitations and recent sessions appear in the friends dashboard. Removing a friendship does not erase existing sessions or revoke an existing invitation.

Google identities are keyed by Google's stable subject identifier. The app stores that identifier, username and display name; it does not persist Google access or refresh tokens. Account sessions use encrypted, HTTP-only cookies lasting seven days. Public profiles expose neither Google identifiers nor email addresses. Guest session links retain their original bearer-link behavior. There is no automatic profile or session deletion.

Share invite/result invokes the native share sheet on supported browsers, including mobile browsers with Web Share support. The operating system decides which installed apps appear. Other browsers fall back to copying the link; Copy link is also available directly. Canceling the share sheet does not copy unexpectedly.
