"use client";
import { T } from "@/components/language-provider";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="content" className="flow-shell">
      <h1><T text={"We hit a playback problem"} /></h1>
      <p><T text={"This page couldn’t load. Your session may still be saved. Try opening it again."} /></p>
      <button className="button" onClick={reset}><T text={"Try again"} /> </button>
    </main>
  );
}
