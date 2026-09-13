# R We Vibing?

Two people, two music tastes, one lovingly honest vibe check. Next.js 15.5.24 App Router (upgraded from 14 with user approval for security fixes), React, Tailwind, Neon Postgres, Prisma, Groq, Zod, Recharts, html-to-image and canvas-confetti. No user accounts.

## Run locally

Requires Node.js 22+ and npm. Install dependencies with `npm ci`, copy `.env.example` to `.env.local`, and fill in the keys below. Run `npm run db:deploy`, then `npm run dev`. Open http://localhost:3000.

`npm run build` generates Prisma Client and creates a production build; `npm start` serves it. `npm test` covers normalization, URL validation, AI schema constraints and retry behavior. `npm run typecheck` checks TypeScript.

Prisma uses the JavaScript Postgres adapter so the app works on Windows ARM without a native query engine. Migration CLI still uses Prisma's schema engine. Prisma CLI does not automatically load `.env.local`; `db:deploy` uses dotenv-cli explicitly.

## Free service setup

- **Neon**: https://console.neon.tech → create project on the Free plan → Connect → copy the pooled connection string to `DATABASE_URL`. Keep TLS enabled. No paid upgrade or payment card is needed for this app.
- **Groq**: https://console.groq.com/keys → Create API Key → `GROQ_API_KEY`. The code defaults to `llama-3.1-8b-instant` as originally requested, but this account no longer has that model. Production sets `GROQ_MODEL=openai/gpt-oss-20b`, which was verified with the free account and produces the same validated JSON. Stay on the free plan; quotas may temporarily prevent generation.
- **YouTube**: https://console.cloud.google.com → new project → APIs & Services → Library → YouTube Data API v3 → Enable → Credentials → Create credentials → API key. Restrict the key to YouTube Data API v3. Set `YOUTUBE_API_KEY`. Server-side requests cannot use browser HTTP-referrer restrictions. Do not attach billing for this app.
- **Spotify (conditional)**: https://developer.spotify.com/dashboard → create an app → copy Client ID and Client Secret into `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`. **Spotify changed developer access in 2026: development apps require the owner to have Premium, and playlist access can be restricted. The requested arbitrary-playlist Client Credentials flow is not reliably available to new free accounts.** The adapter implements the requested `/v1/playlists/{id}/tracks` flow and reports a friendly error on provider rejection. Manual and YouTube inputs remain available. Do not purchase Premium just to set up this app. See https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide.

All keys remain server-side and are excluded from Git. Never prefix them with NEXT*PUBLIC*. Manual input still needs Neon and Groq for persistent sessions and AI results.

## How it works

1. `/session/new` submits a name and one music source to `POST /api/sessions`.
2. `normalizeInput(type, value)` returns strings: first 100 Spotify tracks, first 20 YouTube videos, or first 15 manual entries. Playlist URLs are validated against explicit provider hosts; the app never fetches user-supplied hosts.
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
# Only if eligible Spotify credentials are available:
vercel env add SPOTIFY_CLIENT_ID production
vercel env add SPOTIFY_CLIENT_SECRET production
npm run db:deploy
vercel --prod
```

Use Vercel's Hobby account and Neon Free. Do not select paid integrations. Set the same required variables in Vercel's development environment if using `vercel dev`. For future schema changes, create a migration against a development Neon branch using `dotenv -e .env.local -- prisma migrate dev --name your_change`, commit the migration, run `npm run db:deploy` against production, and redeploy. Never run reset against production.

## Privacy and operating limits

Session links are bearer links: anyone with a link may join before the second seat is filled and view names/results. Keep links private if desired. Normalized music lists are stored in the database but omitted from public GET responses. Names/music are sent to Groq to generate the result; music providers receive playlist lookups. There is no automatic session deletion. Share-card downloads are generated in the browser.

Input length limits, provider timeouts, fixed API hosts, same-origin browser mutation checks and a per-session generation cap bound individual requests. Free API quotas still apply; high-traffic public use may need an additional shared IP rate limiter. A free quota exhaustion is surfaced as an error, never an automatic paid upgrade.
