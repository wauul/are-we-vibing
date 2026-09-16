import { SoundBars } from "./vibe-visual";

/** Decorative CSS motion; the status remains readable with reduced motion enabled. */
export default function ResultsLoading() {
  return (
    <main className="flow-shell result-loading" aria-busy="true">
      <div className="listening-scene" aria-hidden="true">
        <div className="listening-caption"><span>SIDE A</span><span>ONE SHARED FREQUENCY</span><span>SIDE B</span></div>
        <svg viewBox="0 0 480 280" fill="none" className="listening-art">
          <ellipse cx="240" cy="236" rx="192" ry="18" fill="#dce2ce" />
          <path d="M112 150C160 230 320 230 368 150" stroke="#82917a" strokeWidth="2" strokeDasharray="5 7" />
          <g className="listener listener-a">
            <path d="M48 229v-27c0-34 24-53 57-53s57 19 57 53v27" fill="#eaa07b" />
            <path d="M89 143v21c0 15 31 15 31 0v-21" fill="#b96e4b" />
            <rect x="74" y="69" width="62" height="88" rx="30" fill="#d48d65" />
            <path d="M73 107V91c-3-32 14-47 35-47 29 0 39 26 31 43-18 5-35-6-41-18-1 22-9 32-25 38Z" fill="#28382d" />
            <path d="M66 112V99c0-57 80-57 80 0v13" stroke="#28382d" strokeWidth="9" strokeLinecap="round" />
            <rect x="60" y="101" width="17" height="33" rx="8" fill="#28382d" /><rect x="133" y="101" width="17" height="33" rx="8" fill="#28382d" />
            <path d="M102 123q8 7 16-1M90 110h2m24 0h2" stroke="#503928" strokeWidth="3" strokeLinecap="round" />
            <path d="m133 182 25 21 38-9" stroke="#d48d65" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="listener listener-b">
            <path d="M318 229v-27c0-34 24-53 57-53s57 19 57 53v27" fill="#77927d" />
            <path d="M342 99c0-41 63-44 68-2l9 76h-85Z" fill="#493a2d" />
            <path d="M360 143v21c0 15 30 15 30 0v-21" fill="#b87952" />
            <rect x="345" y="70" width="60" height="87" rx="29" fill="#edb68b" />
            <path d="M344 105c-7-25 0-55 30-55 23 0 37 17 32 43-19-1-32-12-37-25-3 17-10 30-25 37Z" fill="#493a2d" />
            <path d="M334 112V99c0-57 80-57 80 0v13" stroke="#28382d" strokeWidth="9" strokeLinecap="round" />
            <rect x="328" y="101" width="17" height="33" rx="8" fill="#28382d" /><rect x="401" y="101" width="17" height="33" rx="8" fill="#28382d" />
            <path d="M362 124q8 7 16-1m-21-13h2m24 0h2" stroke="#704b32" strokeWidth="3" strokeLinecap="round" />
            <path d="m345 183-23 21-39-10" stroke="#edb68b" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="shared-record">
            <circle cx="240" cy="185" r="45" fill="#26372b" />
            <circle cx="240" cy="185" r="37" stroke="#60705b" /><circle cx="240" cy="185" r="30" stroke="#60705b" />
            <circle cx="240" cy="185" r="20" fill="#efd59a" /><circle cx="240" cy="185" r="4" fill="#26372b" />
            <path d="m237 172 7 2" stroke="#926340" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="passing-note note-a" stroke="#b84222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M190 102V79l13-4v22" /><ellipse cx="185" cy="103" rx="5" ry="4" fill="#b84222" /><ellipse cx="198" cy="98" rx="5" ry="4" fill="#b84222" /></g>
          <g className="passing-note note-b" stroke="#48695b" strokeWidth="3" strokeLinecap="round"><path d="M277 69V44l10 5" /><ellipse cx="272" cy="70" rx="5" ry="4" fill="#48695b" /></g>
          <path className="listening-spark" d="m238 94 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill="#bd7947" />
        </svg>
        <SoundBars className="listening-wave" />
      </div>
      <div role="status" aria-live="polite">
        <div className="eyebrow">TWO TASTES. ONE FREQUENCY.</div>
        <h1>Putting the needle<br /><span className="serif orange">on your result…</span></h1>
        <p>Your shared mix is almost ready. Good company included.</p>
      </div>
    </main>
  );
}
