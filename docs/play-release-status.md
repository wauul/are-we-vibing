# Play release status — October 1, 2026

Package: `com.wauul.arewevibing`

Play app ID: `4976192882653164667`, developer account `8530344199625899858`.

## Latest update: 1.3 — Friends and account navigation

Submitted **1.3 - Friends and account navigation** on October 1, 2026 to closed **Alpha** track `4699434223865458736`, release ID **3**, version code **4** / version name **1.3**. The publishing overview confirmed **Modifications en cours d'examen / Changes in review** and contained only this Alpha release with a full rollout. Automated quick checks were still running at submission. Managed publishing remains off, so approval publishes automatically. This is submitted for review, not yet confirmed available to testers.

Play accepted the signed bundle with no blocking errors and no device compatibility losses. Its two nonblocking warnings remain missing native debug symbols and a deobfuscation file (minification is disabled). The separate testing tracks, country availability and tester configuration were not changed. The previous Alpha 1.2 release was confirmed published before preparing this update.

The new mobile Friends screen leads with Add a friend, username copy/share, incoming requests, compact friend rows and mix history. Settings groups profile editing, language/appearance, privacy, terms, support, sign-out and the final red Delete account row. Account deletion remains an email request with ownership verification. Android friend links open the add-friend route with a validated username; Google sign-in preserves the destination, and native back dismisses an open confirmation dialog.

Web deployment `dpl_CjnASEzFdNjnmUuuj2biAQYTsJEW` is **READY**, aliased to `https://are-we-vibing.vercel.app`. The existing Android shell loads this live site, so the UI updates are already deployed; the 1.3 bundle additionally delivers the new Android friend-link intent filter. Source implementation commit: `3aa107b` on `master`.

Validation: all **41** unit tests, production Next.js build, Android `bundleRelease lintRelease`, and upload-key signature verification passed. Signed bundle: `artifacts/are-we-vibing-1.3-release.aab`; SHA-256: `75139DD13482F69B02C06297DE4166129521C390F4279D01976D90A5C99657E2`. Production browser verification signed into the existing review profile and confirmed Friends, Add Friend, Settings, profile field loading, and the public deletion email action. Mutation/error/empty-state checks used an isolated local fixture rather than changing real friendships or profiles. Physical Android testing of native sharing, sign-in return routing and App Links remains outstanding.

Proof: `artifacts/review/ui-craft/17-play-1.3-submitted.png`. Production screenshots: `14-production-friends.png`, `15-production-add-friend.png`, and `16-production-settings.png` in the same folder. Design/verification details: [mobile-account-navigation.md](mobile-account-navigation.md).

## Published for internal testing

Version code 2, version name 1.1. Release label: `1.1 - Mobile and playlist update`. Published October 1, 2026 at 12:09 (Play Console display time), replacing internal version code 1.

This release includes the mobile layout and hidden scrollbars, account-connected YouTube playlist selection with pasted-link support, and Spotify search links for song suggestions. The Capacitor shell loads the already-deployed web app at `https://are-we-vibing.vercel.app`.

Play Console visibly confirmed an active track and “Accessible aux testeurs internes”. The owner account, `waelfeza@gmail.com`, is the sole member of the selected `Are We Vibing - Internal testers` list.

Internal tester opt-in link: https://play.google.com/apps/internaltest/4700446591242731968

The app has not been reviewed. Google uses `com.wauul.arewevibing (unreviewed)` as its temporary store name. Internal testing does not count toward closed-test production eligibility.

## Build and signing

### VibeCard gallery fix — version 1.2

Fixed `MainActivity.onCreate` to register `VibeCardPlugin` before `BridgeActivity.onCreate` constructs the Capacitor bridge. The previous order added the plugin to the builder only after the bridge was created, leaving native gallery saving unavailable to the webpage. Version code 3 / version name 1.2 requires an Android app update; the website alone cannot deliver this native fix.

Gradle `bundleRelease lintRelease` passed. Inspection of compiled `MainActivity` bytecode confirmed registration precedes the superclass startup. Signed and verified `artifacts/are-we-vibing-1.2-release.aab` with the existing upload key. SHA-256: `F40927ED37279C22B7C4BD469B93C452800E175CF56BF8B1B848A3D07920F2E1`. No Android device was connected, so gallery saving on a physical device remains to be checked after installing the update.

Submitted **1.2 - VibeCard gallery save fix** to the active closed **Alpha** track `4699434223865458736`, release ID 2, with English and French notes and a full rollout to existing testers. Google accepted the bundle with no blocking errors and the same nonblocking debug-symbol/deobfuscation warnings. No devices lost compatibility. Publishing overview confirmed **Modifications en cours d'examen**, containing only this Alpha release; automated checks were still running. Managed publishing remains off, so approval will publish automatically. This is submitted, not yet confirmed available to testers. Proof: `artifacts/review/play-release/vibecard-1.2-in-review.png`. The separate Closed Beta draft and internal track were not changed by this update.

Recovered `android/app/google-services.json` using the Firebase connector for existing project `r-we-vibing`, app ID `1:994621042993:android:a1ffd350eb45dcf3c10010`. This file remains excluded from Git.

Downloaded Microsoft's OpenJDK 21.0.12.1 Windows x64 ZIP from the official source, verified its SHA-256, and extracted under `.tools/play-publish/jdk/`. The installed Android Studio Java directory was incomplete. The Android SDK at `C:/Users/Waul/AppData/Local/Android/Sdk` includes API 36 and build tools.

Ran `npx cap sync android`, then Gradle `bundleRelease lintRelease`. Gradle's build and release lint succeeded. The signed bundle is `artifacts/are-we-vibing-1.1-release.aab`; jarsigner verified it. SHA-256: `9DC19DE179689AF250DB5133284E7C294063F9ECC50CEADAA00E21926E85CA5A`. The original 1.0 bundle is retained separately.

The upload key and password are stored in `C:/Users/Waul/.android/are-we-vibing-upload/`, with folder permissions restricted to the current Windows user. Back up both `upload.jks` and `upload-password.txt` securely outside this computer. Do not commit, upload, or include them in logs. The public certificate is `artifacts/upload-certificate.pem`. The local signing helper is `.tools/play-publish/sign-release.ps1`.

Google's 1.1 release validation showed two nonblocking warnings: missing native debug symbols and missing deobfuscation mapping (minification is disabled). No blocking bundle-validation errors appeared, and no devices lost compatibility. The existing tester list remains selected with one member. Publication proof is saved at `artifacts/review/play-release/internal-1.1-active.jpg`. Play says distribution usually appears within an hour, sometimes longer.

Google Cloud's YouTube callback and read-only scope are configured, but Google OAuth verification remains pending as described in `docs/youtube-playlists.md`. Publishing this Android release does not complete Google's OAuth review.

## Saved app setup

- Privacy policy: https://are-we-vibing.vercel.app/privacy
- Public support email: waelfeza@gmail.com
- Website: https://are-we-vibing.vercel.app
- Category: Music & Audio

## Closed beta submitted for review

**Current status, verified October 1:** submission #1 is **Publiée / Published**. Alpha is **Actif**, release `1.1 - First closed beta`, available in 178 country/region entries, with `r-we-vibing@googlegroups.com` selected. Both tester-link controls are enabled. Evidence: `artifacts/review/play-release/alpha-published.jpg` and `alpha-active.jpg`. A separate submission #2 for another track named **Closed Beta**, sent at 3:06 PM (Console display time), is still in review; it does not change the published Alpha status. This check did not submit that track's three pending country changes.

Closed Alpha track `4699434223865458736`: version code 2 (1.1), release name `1.1 - First closed beta`. Removed bundle 1 from the draft (still retained in the library), supplied English and French notes, and enabled 178 country/region entries including the rest of the world.

Google's automated checks completed without blocking issues. At submission, activity confirmed ID **1**, October 1, 2026 at **2:40 PM** (Console display time), **En cours d'examen / In review**. This includes the closed release, store listing, app-content declarations, and listing category. Managed publishing is off, so approved changes publish automatically. Historical submission evidence: `artifacts/review/play-release/closed-beta-in-review.jpg`. Alpha has since published as noted above; production remains separate.

Saved all app setup: age target 13+, IARC rating questionnaire and terms (explicit user approval), app access, privacy, Data Safety, advertising, government, health, financial, and advertising-ID declarations. Ads are declared because embedded YouTube can display ads. Android advertising ID is declared unused after checking the release's merged manifest and dependencies; there is no AD_ID permission or Mobile Ads SDK. Device identifiers in Data Safety include web/player identifiers and push tokens, a separate concept.

Store listing now has a full English description, 512px icon, 1024x500 feature graphic, and three actual 540x960 portrait screenshots, saved under `artifacts/play-store/`.

Reviewer access is deployed at `/review-login`, linked from the signed-out Friends page. It uses a dedicated server-controlled password and fixed sample identity `play_reviewer`, with an accepted sample friend. Instructions and credentials are saved in Google's App access declaration. The password file is gitignored at `.tools/play-publish/review-password.txt`, with access restricted to the current Windows user; do not print it or commit it. Password validation tests and TypeScript passed. Live browser login verified the reviewer and sample friend. Proof: `artifacts/review/play-release/reviewer-demo.jpg`.

The footer and signed-in profile link to `/delete-account`, which explains manual verified deletion requests by email. The public privacy page discloses technical analytics, approximate location, embedded-player identifiers/advertising, and deletion. Latest web deployment: `dpl_GzAL5HKGcCrUGk6XCQ1PzRPVdCd6`, READY, production alias `https://are-we-vibing.vercel.app`. The existing native shell loads that site, so these web changes did not require another bundle.

## Tester access and account distinction

The existing group **r-we-vibing@googlegroups.com**, owned under **waelfezari@gmail.com**, remains the selected closed-test group. Enabled public group visibility while preserving self-join, and restricted the membership list to group owners. Browser verification from the other signed-in account shows the **Rejoindre le groupe** button. Group link: https://groups.google.com/g/r-we-vibing

A separate **are-we-vibing-beta@googlegroups.com** group was also created under **waelfeza@gmail.com** before the account distinction was identified. It is unused and was never added to Play. It was not deleted because deletion is permanent. Firebase, support, reviewer/deletion contact, and tester feedback remain **waelfeza@gmail.com** as previously configured; group ownership is separate.

Closed-test opt-in URL displayed by Play (enabled on published Alpha): https://play.google.com/apps/testing/com.wauul.arewevibing

Store/install URL: https://play.google.com/store/apps/details?id=com.wauul.arewevibing

Testers must join the selected Google Group and then opt in with the same Google account after approval. Current enrollment was zero before submission. Recruit at least 12 testers who remain opted in continuously for 14 days, gather actual feedback, and then apply for production access. Internal testing does not count.

An existing Reddit recruitment post is visible at https://www.reddit.com/r/AndroidClosedTesting/comments/1wuvnix/test_for_test_are_we_vibing_compare_your_music/ . This submission work did not edit or repost it. Replace outdated internal-test instructions with closed-test links after approval.

## Native signing and remaining verification

### Android Google sign-in configuration corrected October 1

The live website Google sign-in was tested successfully with the existing owner account. The app's OAuth project `awesome-habitat-508513-b2` previously contained only the web client and an Android debug client with SHA-1 `06:2C:5F:F7:E6:0B:01:0D:F5:24:C4:E9:17:68:D1:D2:B5:24:93:D5`. The Firebase fingerprint registration below was in a different project and did not register the Play release in the OAuth project used by `GOOGLE_CLIENT_ID`.

Created and confirmed **Are We Vibing Android Play release**, client `475000589224-9q0ub2bgr6q76a6ruse8bvbmi4c3rsik.apps.googleusercontent.com`, in the same project as the live web client, for package `com.wauul.arewevibing` and Play signing SHA-1 `25:DB:91:5B:1E:66:70:F5:98:44:8A:BC:3E:73:86:CB:1C:84:2B:B9`. Proof: `artifacts/review/play-release/android-oauth-play-client.png`. The app continues to use the existing web client ID for token audience validation. No new bundle is required for this Google Cloud configuration fix. Google says propagation can take five minutes to a few hours. A Play-installed device must still verify the complete native login; no physical device was connected. Branding and YouTube scope verification remain separate and pending.

Registered the Play distribution certificate's SHA-1 and SHA-256 with the existing Firebase Android app successfully:

- SHA-1: `25:DB:91:5B:1E:66:70:F5:98:44:8A:BC:3E:73:86:CB:1C:84:2B:B9`
- SHA-256: `83:FE:4D:84:73:E9:12:63:5C:8A:A5:D7:1B:9A:75:6F:6C:17:AF:BE:A7:CC:2F:B5:F4:30:78:71:7A:6D:50:E1`

The production `ANDROID_SHA256_FINGERPRINTS` setting predated Play signing. Its live JSON endpoint could not be inspected in the in-app browser (blocked by client), so confirm it includes the distribution SHA-256 before claiming Android App Links work. No certificate rotation or key change was performed.

Test a Play-installed build on a physical Android device; none was connected during this preparation. Push notifications, native Google sign-in, gallery export, and App Links remain unverified on a device. Google YouTube OAuth verification remains pending. The two bundle warnings concern native debug symbols and deobfuscation mapping; minification is disabled.
