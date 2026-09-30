import { T } from "@/components/language-provider";
import Link from "next/link";
export default function NotFound() {
  return (
    <main id="content" className="flow-shell">
      <h1><T text={"This page isn’t in the mix"} /></h1>
      <p><T text={"Check your link or head home to start a session."} /></p>
      <Link href="/" className="button"><T text={"Go to home"} /> </Link>
    </main>
  );
}
