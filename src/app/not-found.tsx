import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flow-shell">
      <h1 className="flow-title">This track is missing.</h1>
      <p>Let’s get you back to the good stuff.</p>
      <Link href="/" className="button">
        Back to the music
      </Link>
    </main>
  );
}
