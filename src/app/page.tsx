import { T } from "@/components/language-provider";
import Link from "next/link";
import VibeVisual from "@/components/vibe-visual";
import { Side } from "@/components/ui";

export default function Home() {
  return <main id="content" className="home">
    <section className="hero">
      <div className="hero-copy">
        <h1><T text={"Your taste"} /><br />{" "}<T text={"Their taste"} /><br />{" "}<span className="accent-word"><T text={"A new mix"} /></span></h1>
        <p className="hero-description"><T text={"Compare the songs you keep coming back to with someone you know. See where you meet, and what you could discover together."} /></p>
        <div className="hero-actions"><Link className="button" href="/session/new"><T text={"Start a vibe check"} /></Link><span><T text={"Two people. No account needed."} /></span></div>
      </div>
      <VibeVisual />
    </section>
    <section className="exchange-guide" aria-labelledby="how-title">
      <div className="guide-intro"><h2 id="how-title"><T text={"Pass a little"} /><br />{" "}<T text={"of your world"} /></h2><p><T text={"A few favorites are enough to start a conversation."} /></p></div>
      <ol className="guide-steps">
        <li><Side side="A" /><div><h3><T text={"Add your music"} /></h3><p><T text={"Type artists and songs, or bring a YouTube playlist."} /></p></div></li>
        <li><Side side="B" /><div><h3><T text={"Invite your person"} /></h3><p><T text={"Send the link. They add their taste, on their own time."} /></p></div></li>
        <li><span className="mix-marker" aria-hidden="true"><i /><i /></span><div><h3><T text={"Find your common ground"} /></h3><p><T text={"A playful AI score, a verdict, and ten songs to explore together."} /></p></div></li>
      </ol>
    </section>
    <section className="circle-invitation"><div className="circle-title"><h2><T text={"Keep your people"} /><br />{" "}<T text={"in the rotation"} /></h2></div><div><p><T text={"Sign in with Google to add friends, send direct invitations and find your shared results in one place."} /></p><Link className="button outline-button" href="/friends"><T text={"Open your music circle"} /></Link></div></section>
    <div className="home-note"><p><T text={"Music taste is a starting point, not a personality test. Our results are playful AI interpretations."} /></p><Link href="/privacy"><T text={"How your data is used"} /></Link></div>
  </main>;
}
