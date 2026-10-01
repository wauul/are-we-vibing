import { T } from "@/components/language-provider";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Privacy — R We Vibing?" };

export default function PrivacyPage() {
  return <main id="content" className="flow-shell legal-shell"><Link className="back-link legal-back" href="/settings"><ArrowLeft size={20} aria-hidden="true" /><T text={"Settings"} /></Link><article className="prose">
    <h1><T text={"Privacy"} /></h1>
    <p><T text={"Last updated: October 1, 2026."} /></p>
    <h2><T text={"What we store"} /></h2>
    <p><T text={"Guest sessions store display names, music selections, input methods, generated compatibility results and creation times. Optional Google accounts store a Google account identifier, your chosen display name and username. We also store friend requests, friendships and session invitations."} /></p>
    <h2><T text={"Google sign-in"} /></h2>
    <p><T text={"Google provides basic identity information to verify your account. We use a verified email during sign-in but do not store it in your profile or show it to friends. An encrypted, HTTP-only cookie keeps you signed in for up to seven days."} /></p>
    <p><T text={"Connecting YouTube is optional and requests read-only access to your playlists. YouTube access and refresh tokens are kept in a separate encrypted, HTTP-only cookie for up to seven days, bound to your signed-in account. They are not stored in our database or exposed to other users. Disconnect YouTube from the playlist picker to remove that cookie, or revoke access in your Google account. Only the songs from a playlist you choose to submit are used for analysis and the shared result, including songs from private playlists."} /></p>
    <h2><T text={"Who receives information"} /></h2>
    <p><T text={"Vercel hosts the app and Neon stores its database. Submitted music, including imported playlist song titles and artists, is sent to Groq to generate the playful analysis using participant labels A and B. YouTube receives playlist lookups, Spotify receives anonymous public-playlist preview requests from our server, and Apple's iTunes catalog receives autocomplete search fragments. We do not request or store Spotify account credentials or cookies. Google handles Google sign-in. These providers process requests under their own policies; hosting services may keep operational request logs. Vercel Analytics and Speed Insights collect site usage and performance information."} /></p>
    <h2><T text={"Sharing and visibility"} /></h2>
    <p>Hosting and analytics providers process technical information such as IP addresses, approximate location inferred from IP, browser and device type, page visits, and loading performance. We do not request precise GPS location or access your phone’s address book; friends are added by their app usernames. Embedded YouTube services may receive browser or device identifiers, approximate location and playback interactions, including for advertising under Google’s policies.</p>
    <p><T text={"In the Android app, optional notifications store a Firebase device token with the session you create. Firebase receives that token and a results link to deliver your notification. Browsers do not request notification permission. Android Google sign-in uses Google's native account picker. We verify its signed identity token and a single-use security challenge that expires after five minutes; identity tokens are not stored."} /></p>
    <p><T text={"Shared song recommendations are searched on YouTube and matching video details are stored with the result. Loading the embedded YouTube player shares playback requests with YouTube under its policies. Exported cards may contain video thumbnails."} /></p>
    <p><T text={"Anyone with a guest session link can view its names and results, and can join before its second seat is filled. Direct invitations require the creator's or invited friend's signed-in account. Friends see your chosen name and username. Saving a card downloads an image in your browser or adds it to Pictures / Are We Vibing on Android; sharing a link sends it to the app or person you select."} /></p>
    <p><T text={"Your language preference is saved on this device using a functional cookie and local storage. You can change it from the header at any time."} /></p>
    <h2><T text={"Retention and choices"} /></h2>
    <p><Link href="/delete-account">Request deletion of your Are We Vibing account and associated data</Link></p>
    <p><T text={"Records are retained until removed; automatic deletion is not implemented. You can sign out, change your profile and remove friendships. Removing a friendship does not delete past sessions or invitations. To request deletion of your account or sessions, contact"} /> <a href="mailto:waelfeza@gmail.com"><T text={"waelfeza@gmail.com"} /></a><T text={"and identify your username or session link. We may ask you to verify ownership."} /></p>
    <p><Link href="/friends"><T text={"Back to your music circle"} /></Link></p>
  </article></main>;
}
