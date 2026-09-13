"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flow-shell">
      <h1 className="flow-title">A little technical remix.</h1>
      <p>Something skipped a beat. Your session may still be saved.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
