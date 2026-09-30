# SpotAPI and R We Vibing

Reviewed 30 September 2026. This is a source review, not a successful live Spotify import test.

## Requested outcome

Import a Spotify playlist and use its songs as input to the existing Groq vibe check. A direct song/artist overlap mode does not meet the requested outcome.

## What the implementation does

- `PublicPlaylist.get_playlist_info` sends a `fetchPlaylist` persisted GraphQL operation to Spotify's web-player Pathfinder endpoint. Variables include a playlist URI, offset and limit. `paginate_playlist` reads `totalCount` and retrieves subsequent pages.
- `BaseClient` loads Spotify's web-player page for configuration and cookies, obtains an expiring access token and a client token, and attaches them to requests. It refreshes the access token before expiry and can retry once after an authentication failure.
- Query identifiers are discovered by downloading and examining Spotify's JavaScript bundles rather than using a documented developer API contract.
- Token acquisition relies on a time-based value whose secret is fetched from a third-party repository, with a hardcoded fallback. This is another external dependency that would need to remain compatible.
- The HTTP layer uses `curl_cffi` browser impersonation. A port to ordinary Node `fetch` is not demonstrated by this review.
- Public playlists have a separate reader from account-specific operations. Private library operations depend on a logged-in session; the login code supports credentials, challenge solvers and imported cookies.

Source files:

- https://github.com/Aran404/SpotAPI/blob/main/spotapi/playlist.py
- https://github.com/Aran404/SpotAPI/blob/main/spotapi/client.py
- https://github.com/Aran404/SpotAPI/blob/main/spotapi/http/request.py
- https://github.com/Aran404/SpotAPI/blob/main/spotapi/login.py

## Fit with the app

The app's `src/lib/normalize.ts` already turns provider input into `string[]`. `src/lib/sessions.ts` passes those lists into `analyze`, and `src/lib/ai.ts` sends them to Groq. Therefore a playlist reader could supply `Artist — Song` strings without changing the scoring model or results UI.

A similar implementation would require either a Python service alongside the Next.js deployment or an independently written Node implementation whose HTTP compatibility is tested. Installing this Python package as an npm dependency would not work. The repository declares GPL-3.0; copying its implementation requires considering that license.

## Useful design ideas

For any authorized provider integration, retain a narrow server-side reader, explicit response validation, bounded pagination, expiring token caches and bounded authentication retries. Keep playlist URL validation and fixed provider hosts. Deduplicate tracks and enforce a fixed song budget before building the AI prompt. Surface provider errors instead of inventing playlist results.

For this app, public playlist links would be the smallest useful scope. Account passwords, session-cookie uploads, private libraries and playlist mutations would add complexity that the requested vibe check does not require.

## Unresolved requirement

Spotify Developer Terms section II.8 includes metadata and playlists in Spotify Content. Section IV.2.a.i prohibits ingesting that content into a machine learning or AI model; it is not limited to model training. The web-player approach changes how the data is retrieved, but does not establish permission to send it to Groq. Spotify's terms also restrict unauthorized automated retrieval and collection of account credentials.

https://developer.spotify.com/terms

This review does not demonstrate that SpotAPI works against Spotify today, nor does it establish authorization covering access and AI use.

## Implemented experiment

At the user's subsequent explicit request, the app now imports public Spotify playlists from `https://open.spotify.com/embed/playlist/{id}`. A live anonymous lookup of Today's Top Hits exposed a structured `__NEXT_DATA__` playlist with song titles and artist labels. The independently written TypeScript reader validates playlist identity, skips malformed/non-track entries, deduplicates songs and caps the result at 20. It never executes embedded scripts, follows redirects, requests audio or uses a Spotify account. Responses are limited to 2 MiB and a 12-second timeout. No Python service or SpotAPI code was added.

Spotify input now reaches the existing Groq pipeline and is labeled Experimental. The terms restriction above remains unresolved. Anonymous access does not guarantee that every playlist works, continued availability, or absence of enforcement consequences.
