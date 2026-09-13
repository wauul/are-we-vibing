import Link from "next/link";
import VibeVisual from "@/components/vibe-visual";
import {
  ArrowRight,
  Music2,
  Link2,
  Sparkles,
  Headphones,
  Heart,
  Play,
} from "lucide-react";
export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> THE MUSIC TASTE COMPATIBILITY CHECK
          </div>
          <h1>
            Different playlists.
            <br />
            Same <span className="serif orange">wavelength?</span>
          </h1>
          <p className="hero-description">
            Your music says a lot about you.
            <br />
            Let’s find out what it says about the two of you.
          </p>
          <Link className="button" href="/session/new">
            Start a session <ArrowRight size={19} />
          </Link>
          <p className="micro">
            <span>✦</span> No accounts. No awkward questions. Just vibes.
          </p>
          <div className="sources">
            <span>
              <Sparkles size={15} /> AI-powered chemistry
            </span>
            <span>
              <Play size={15} /> YouTube
            </span>
            <span>
              <Music2 size={15} /> Your own picks
            </span>
          </div>
        </div>
        <VibeVisual />
      </section>
      <div className="ticker">
        <span>BESTIES OR SKIP BUTTONS?</span>
        <span>✦</span>
        <span>LET THE PLAYLISTS DECIDE</span>
        <span>✦</span>
        <span>A LITTLE CHAOS. A LOT OF CHEMISTRY.</span>
        <span>✦</span>
        <span>BESTIES OR SKIP BUTTONS?</span>
      </div>
      <section className="how">
        <div className="section-top">
          <div>
            <div className="eyebrow">THE SETLIST</div>
            <h2>
              Three steps to your <span className="serif">vibe check.</span>
            </h2>
          </div>
          <p>
            No music snobbery here.
            <br />
            Guilty pleasures encouraged.
          </p>
        </div>
        <div className="steps">
          {[
            {
              icon: Music2,
              title: "Drop your taste",
              text: "Share a playlist or type your on-repeat artists and songs. Yes, that one too.",
            },
            {
              icon: Link2,
              title: "Pass the aux",
              text: "Send your unique link to a friend, a crush, or your favorite music rival.",
            },
            {
              icon: Sparkles,
              title: "Meet your match",
              text: "Get your score, a lovingly honest verdict, and your next shared favorites.",
            },
          ].map((s, i) => (
            <article key={s.title}>
              <div className="step-top">
                <s.icon size={23} />
                <span>0{i + 1}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bottom-banner">
        <div>
          <span className="eyebrow">THE AUX CORD IS CALLING</span>
          <h2>So… r we vibing?</h2>
        </div>
        <Link className="button dark-button" href="/session/new">
          Let’s find out <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}



