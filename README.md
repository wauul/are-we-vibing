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

## Android: one app, two shells

The Android app loads **https://are-we-vibing.vercel.app** using `server.url` in `capacitor.config.ts`. The existing Next.js app, APIs, database and Vercel deployment remain the single source of truth. There is no static export, second frontend or separate mobile backend. Web deployments appear in Android automatically; **web-only changes do not require a new APK or `cap sync`**. Native plugin, manifest, icon or Capacitor configuration changes require `npm run android:sync` and a rebuilt APK. Remote loading needs internet; `native-shell/index.html` supplies an offline retry screen. Only the trusted HTTPS app host is loaded with native privileges.

The Android package is `com.wauul.arewevibing`. Install Node 22+, Android Studio, SDK Platform 36, and JDK 21. On this Windows ARM computer, JDK 21 is available locally under `.tools/jdk21`; the installed Studio JDK 25 cannot run this project's Gradle version. Google does not support the Android Studio emulator on Windows ARM: use a physical Android phone with USB debugging, or an emulator on a supported host. No iOS project is installed.

```sh
npm ci
npm run android:sync
npm run android:open
# Or from android/ with JAVA_HOME pointing to JDK 21:
./gradlew assembleDebug
# Windows: .\gradlew.bat assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

A fresh clone also needs its Firebase Android configuration at `android/app/google-services.json` (excluded from Git). In Android Studio select the project in `android/`, select your device, then Run. CSS safe-area insets and Capacitor's native system-bar handling protect the content; browsers with no insets receive zero padding.

### Icons and splash

Replace `assets/logo.svg` with your source artwork, or supply `assets/icon-only.png` and `assets/splash.png` following [Capacitor Assets](https://github.com/ionic-team/capacitor-assets). Run `npm run android:assets`, then `npm run android:sync` and rebuild. The current orange waveform artwork is a placeholder based on the web favicon. Generated Android resources are committed; signing keys and Firebase configuration are not.

### Firebase push notifications

Firebase project `r-we-vibing` uses the free Spark plan. Register an Android application with the exact package above and download its `google-services.json`. Under Project settings → Service accounts → Firebase Admin SDK, generate an Admin service-account JSON. Keep it private, outside Git. Set its one-line JSON as **server-only** `FIREBASE_SERVICE_ACCOUNT_JSON` locally and in Vercel production (`vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production`). Do not use a NEXT_PUBLIC variable. FCM requires a Google Play-enabled device/emulator.

Only the native creator waiting screen requests notification permission and registers FCM. `POST /api/push-tokens` associates the token with that session, authorized by the signed-in owner or a seven-day HttpOnly creator-proof cookie; possession of the shared link is insufficient. After a result is saved, an optional Firebase Admin delivery sends “Your friend just vibed!” and its result URL. Missing tokens/configuration and delivery failures never fail result generation. Invalid tokens are cleared. Delivery is best effort; OS settings/network conditions can delay or suppress it. Browser code exits before touching native notification APIs. Tokens are currently session-specific, so a new device does not retroactively register old sessions.

Push taps and Android App Links accept only the app's HTTPS result/session URLs. Native Google sign-in uses Android Credential Manager through the free, open-source `@capgo/capacitor-social-login` plugin. It opens the native Google account picker. The backend verifies Google's signed ID token, audience, issuer, expiry and single-use nonce, then issues the same app session cookie used by browser accounts. Google tokens are not persisted. Register an Android OAuth client in the same Google Cloud project as the existing web client, using package `com.wauul.arewevibing` and the installed APK's SHA-1. Add a separate client for the Play App Signing certificate before store release. No additional Google API scopes or paid Capgo service are used. The older browser-handoff endpoint remains only for earlier test APKs.

### Ten shared songs and playback

New Groq results request exactly ten specific songs, validated by Zod with one stricter retry. Existing three-recommendation results remain valid and readable. Ten server-side YouTube `search.list` requests seek embeddable, syndicated music videos; unique matches (ID, title and thumbnail) are stored in `Session.playlistJson`. Searches happen during result generation, never on every page load. Partial matches are shown; a total lookup failure preserves the text recommendations and compatibility result.

The IFrame Player API queues the ordered videos, highlights the active track, and advances past failed videos without looping indefinitely. Both participants receive the same playlist; playback positions are independent, not a synchronized listening room. Sound requires a first tap. Backgrounding pauses playback; there is no native background audio. YouTube can remove/restrict a video after lookup, and its normal ads and controls remain.

Quota note: the older quota model charged 100 units per search (10 searches = 1,000 of 10,000 daily units). Current [YouTube search documentation](https://developers.google.com/youtube/v3/docs/search/list) instead describes a separate default **100-search daily limit**, effectively around **10 complete new playlists/day**. Check your project's actual console quota. This is suitable for small demos, not unlimited traffic; there is no automatic paid upgrade. Manual input and results continue to work if searches run out.

`ShareableResultCard.tsx` is shared by web and Android: a portrait score reveal, connected names, verdict quote, both participants’ special award titles and a stack of available thumbnails. A fixed-host thumbnail proxy supports reliable html-to-image export. Browsers download a PNG; Android's Save vibe card writes it to Pictures / Are We Vibing using MediaStore, visible in Gallery. Android 10+ needs no library access for an app-created image; Android 7–9 requests legacy write permission only when saving. Share invite/result remains a separate native share-sheet action.

### Android App Links and future publishing

Set `ANDROID_SHA256_FINGERPRINTS` to comma-separated signing certificate SHA-256 fingerprints. `/.well-known/assetlinks.json` publishes the association for `com.wauul.arewevibing`; the manifest declares verified HTTPS links. `cd android && ./gradlew signingReport` prints the debug fingerprint. For Play releases add the **Play App Signing certificate** from Play Console, not merely the upload certificate, then redeploy Vercel. Verify on a connected device with `adb shell pm verify-app-links --re-verify com.wauul.arewevibing` and `adb shell pm get-app-links com.wauul.arewevibing`.

Before Play Store submission: obtain the $25 developer account, choose and safely back up an upload signing key, build a signed release AAB, configure Play App Signing fingerprint, complete privacy/Data Safety/content-rating declarations, and satisfy your account's current testing requirements. This debug APK is for testing, not store publication. Native updates still require a new store build; remote web delivery does not override store review policies.

**iOS deferred:** on a Mac later, add the Capacitor iOS platform, configure an Apple team/bundle ID and Associated Domains entitlement (`applinks:are-we-vibing.vercel.app`), serve an `apple-app-site-association` file identifying that team/bundle and session/results paths, configure APNs with Firebase, then test Universal Links and notification delivery on iOS. None of that is implemented or tested in this pass; Apple membership is a separate $99/year cost.

### Migration and verification

`202609140002_mobile` adds nullable session playlist/token/creator-proof/push-delivery fields and a temporary native-login handoff table. It preserves all existing records. Apply `npm run db:deploy` before deploying the changed web code. Run `npm test`, `npm run typecheck`, and `npm run build`; then test a fresh guest create/share/join/results flow in a regular browser and on Android. Verify legacy results, permission denial, background push receipt and tap, playlist skips, card export, and native Google sign-in. Actual device delivery must be checked on a connected device; a successful APK build or Firebase API call alone does not prove it.

### Visual system and card downloads

The shared interface follows TypeUI fundamentals; see DESIGN.md for tokens, responsive rules, and accessibility decisions. Save vibe card renders a fixed 480×600 composition at 2× resolution (960×1200 PNG), outside the page layout. Saving never injects a duplicate preview. The orange logo is preserved. Web-only visual updates appear in the installed Android shell automatically.
