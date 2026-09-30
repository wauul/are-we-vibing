import { T } from "@/components/language-provider";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = { title: "Terms of Use — R We Vibing?", description: "Rules for using R We Vibing, submitting music and sharing your results." };

export default function TermsPage() {
  return <main id="content" className="flow-shell"><article className="prose">
    <h1><T text={"Terms of Use"} /></h1>
    <div className="terms-meta"><FileText size={20} aria-hidden="true" /><span><T text={"Last updated: September 30, 2026"} /></span></div>
    <p><T text={"These terms explain how to use R We Vibing and share its results. They apply to the website and Android app."} /></p>
    <h2><T text={"A playful music comparison"} /></h2>
    <p><T text={"Two people submit music selections to receive an AI-generated comparison, personal music awards and song recommendations. Scores and descriptions are subjective entertainment, not a scientific test, professional advice or a judgment of someone’s character. AI can make mistakes."} /></p>
    <h2><T text={"Your music and account"} /></h2>
    <p><T text={"Submit only information you are permitted to use and share. Do not include sensitive personal information in names or music entries. Optional Google sign-in adds a profile, friends and direct invitations. Use your own account and do not impersonate anyone."} /></p>
    <p><T text={"Playlist imports and playback depend on third-party services and their terms. A public playlist is not permission for every use of its contents. The experimental Spotify importer is unofficial; technical access does not establish authorization to use Spotify content for AI analysis. Manual picks remain available."} /></p>
    <h2><T text={"Shared links and cards"} /></h2>
    <p><T text={"Anyone with a guest session link can see its names and results and join while the second seat is open. Share links only with people you intend to give access to. Direct invitations require the creator’s or invited friend’s account."} /></p>
    <p><T text={"You may save and share your own vibe cards for personal use. Consider the other participant’s privacy before posting their name or result. Song and artist rights remain with their owners; the app does not grant rights to download, redistribute or commercially use music."} /></p>
    <h2><T text={"Respect the circle"} /></h2>
    <ul>
      <li><T text={"Do not harass others, spam invitations or submit unlawful content."} /></li>
      <li><T text={"Do not access another person’s account or a private invitation without permission."} /></li>
      <li><T text={"Do not bypass limits, probe for private data or disrupt the service."} /></li>
    </ul>
    <h2><T text={"Availability and your rights"} /></h2>
    <p><T text={"Features may be interrupted by maintenance, provider changes, network failures or API quotas. Results and recommendations may be incomplete or unavailable. These terms do not limit rights or protections that cannot lawfully be excluded."} /></p>
    <h2><T text={"Privacy and updates"} /></h2>
    <p><T text={"Read our"} /> <Link href="/privacy"><T text={"Privacy page"} /></Link><T text={"for what is stored, who processes it, link visibility and deletion requests. Updated terms will be published here with a new date. Keep a copy if you need to refer to this version."} /></p>
    <h2><T text={"Contact"} /></h2>
    <p><T text={"For questions, concerns or account and session deletion requests, email"} /> <a href="mailto:waelfeza@gmail.com"><T text={"waelfeza@gmail.com"} /></a><T text={". Include your username or session link when relevant; ownership may need to be verified."} /></p>
    <p><Link href="/"><T text={"Back to the app"} /></Link></p>
  </article></main>;
}
