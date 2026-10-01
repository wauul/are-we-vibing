# Account playlist setup

Google sign-in stays on its existing identity scopes. The session form offers a separate **Connect YouTube** action to request `https://www.googleapis.com/auth/youtube.readonly`.

In the Google Cloud project used by `GOOGLE_CLIENT_ID`:

1. Enable **YouTube Data API v3**.
2. Add `https://www.googleapis.com/auth/youtube.readonly` to the OAuth consent screen. During testing, add your Google accounts as test users; complete Google's verification requirements before making the scope available publicly.
3. Add `https://YOUR_APP_DOMAIN/api/youtube/callback` to the web client's authorized redirect URIs (and `http://localhost:3000/api/youtube/callback` for local testing).

No additional API key is required for account playlists. The existing `YOUTUBE_API_KEY` remains necessary for guest playlist-link import and matching shared recommendations to YouTube videos.

## Production configuration checked October 1, 2026

The existing OAuth web client in Google Cloud project `awesome-habitat-508513-b2` now includes `https://are-we-vibing.vercel.app/api/youtube/callback`, alongside its existing Google sign-in callback. YouTube Data API v3 was already enabled. The consent configuration now includes `youtube.readonly` and a usage justification describing the account playlist picker, bounded title import, explicit submission to Groq analysis and encrypted token cookie. The app's terms URL was added to its existing branding profile.

The OAuth audience remains External / In production. Google shows the new sensitive scope as unverified, with the standard unverified-app warning and a lifetime cap of 100 users for unapproved scopes. The branding check initially failed because homepage ownership was unverified. The official verification file `public/google7dc2b9b5e73e2aaa.html` was published to the existing site, and Google Search Console confirmed ownership for `https://are-we-vibing.vercel.app/`. Keep that file in future deployments. Google explicitly requires waiting 24 hours after ownership verification before retrying branding review. Data-access verification then additionally needs an authentic YouTube demonstration video showing the consent flow and the feature in all OAuth clients; the configuration alone does not grant Google's approval. Local callback URIs still need to be added if local OAuth testing is desired.

Production deployment `dpl_FvWunDtLNuTQWLfpJhGfkWQu6Hjj` is ready and aliased to the existing app domain. It includes the mobile interface, playlist picker, Spotify discovery search links, updated privacy page and ownership file. The deployed YouTube form and its signed-out fallback were checked in the browser without console errors. Live consent granting, account playlist responses and Android scope authorization still require testing with an opted-in account/device.

The OAuth callback checks state, PKCE and the Google identity against the signed-in account. Credentials are encrypted in a separate HttpOnly cookie for at most seven days. Account playlists are fetched without caching and paginated in batches of 50. Imports still use at most 20 available videos. Only a playlist explicitly submitted by the user is sent to the existing analysis pipeline.

Android requests the extra scope through the existing native Google plugin. Its access token is checked server-side for audience, account identity and scope before it can be used. Native tokens without refresh credentials require reconnecting after expiry. Validate this flow on a physical device with the configured Android OAuth client.

Spotify discovery uses the existing AI song suggestions and opens Spotify search for each song. It requires no Spotify credentials and does not claim to resolve exact tracks or provide Spotify playback. Direct catalog search, Spotify track metadata and embedded track playback would require a registered Spotify application and appropriate API access.
