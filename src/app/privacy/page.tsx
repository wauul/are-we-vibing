import Link from "next/link";

export const metadata = { title: "Privacy — R We Vibing?" };

export default function PrivacyPage() {
  return <main className="flow-shell"><article className="detail-card">
    <div className="eyebrow">YOUR DATA, EXPLAINED</div>
    <h1>Privacy</h1>
    <p>Last updated: September 14, 2026.</p>
    <h2>What we store</h2>
    <p>Guest sessions store display names, music selections, input methods, generated compatibility results and creation times. Optional Google accounts store a Google account identifier, your chosen display name and username. We also store friend requests, friendships and session invitations.</p>
    <h2>Google sign-in</h2>
    <p>Google provides basic identity information to verify your account. We use a verified email during sign-in but do not store it in your profile or show it to friends. We do not store Google access or refresh tokens. An encrypted, HTTP-only cookie keeps you signed in for up to seven days.</p>
    <h2>Who receives information</h2>
    <p>Vercel hosts the app and Neon stores its database. Names and submitted music are sent to Groq to generate the playful analysis. YouTube receives playlist lookups, and Apple's iTunes catalog receives autocomplete search fragments. Google handles Google sign-in. These providers process requests under their own policies; hosting services may keep operational request logs.</p>
    <h2>Sharing and visibility</h2>
    <p>In the Android app, optional notifications store a Firebase device token with the session you create. Firebase receives that token and a results link to deliver your notification. Browsers do not request notification permission. Android Google sign-in uses the system browser and a single-use handoff that expires after five minutes.</p>
    <p>Shared song recommendations are searched on YouTube and matching video details are stored with the result. Loading the embedded YouTube player shares playback requests with YouTube under its policies. Exported cards may contain video thumbnails.</p>
    <p>Anyone with a guest session link can view its names and results, and can join before its second seat is filled. Direct invitations require the creator's or invited friend's signed-in account. Friends see your chosen name and username. Downloading a result card creates an image in your browser; sharing a link sends it to the app or person you select.</p>
    <h2>Retention and choices</h2>
    <p>Records are retained until removed; automatic deletion is not implemented. You can sign out, change your profile and remove friendships. Removing a friendship does not delete past sessions or invitations. To request deletion of your account or sessions, contact <a href="mailto:waelfeza@gmail.com">waelfeza@gmail.com</a> and identify your username or session link. We may ask you to verify ownership.</p>
    <p><Link href="/friends">Back to your music circle →</Link></p>
  </article></main>;
}
