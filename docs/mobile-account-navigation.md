# Mobile friends and account navigation — October 1, 2026

Applied [UI Craft](https://github.com/Achref23illi/ui-craft) using its settings and people references. Preserved the Bricolage/Manrope typography, orange action colour, record avatars, and existing light/dark tokens.

## Navigation

- The mobile bar has Home, New session, Friends, and Settings. Friend subroutes keep Friends selected; account and legal routes keep Settings selected.
- Friends leads with Add a friend and a copy/share username row. Incoming requests precede accepted friends and sent requests; mix history follows. Each friend offers a direct mix invitation and removal with a consequence-specific confirmation.
- `/friends/add` accepts an exact username, explains how to find it, preserves input on failure, and confirms the destination after sending. Shared links prefill the username and preserve it through web and native Google sign-in. The Android manifest and native URL allowlist support this route, forwarding only valid usernames.
- `/settings` groups profile editing, language/appearance, privacy/terms/support, and account actions. Deletion is the final red row. Preferences remain usable without signing in. Desktop retains header preferences, synchronized with Settings.
- `/settings/profile` is a dedicated editor with field constraints, an unsaved-change-dependent Save action, and inline success/error feedback.
- Privacy, terms, and deletion have a consistent route back to Settings. The deletion page remains a public manual email request flow and now has an explicit email action and French translations. No automatic account deletion was introduced.

## Verification

Production Next.js build and all 41 unit tests passed, including translation coverage and friend-link origin/username validation. Android `bundleRelease lintRelease` passed; signed version code 4 / version name 1.3 with the existing upload key.

Browser checks used an isolated local API fixture with no real account mutations: send/accept requests, reject self-add and unknown usernames, preserve failed inputs, cancellation of removal, duplicate username errors, and successful profile saves. Phone renders at 390px and compact French/dark Settings at 360px showed no horizontal overflow; desktop Settings was inspected at 1280px. Screenshots are local under `artifacts/review/ui-craft/` (excluded from Git).

Native share, Android back dismissal, App Links, and sign-in return routing still require verification on a physical Play-installed Android device. No device was connected during this work.
