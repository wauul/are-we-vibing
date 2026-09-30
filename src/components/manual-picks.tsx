"use client";
import { T, useLanguage } from "@/components/language-provider";

import { useEffect, useRef, useState } from "react";
import { Mic2, Music2 } from "lucide-react";
import { activePick, completePick, type MusicSuggestion } from "@/lib/autocomplete";

export default function ManualPicks({ value, onChange, disabled }: {
  value: string; onChange: (value: string) => void; disabled: boolean;
}) {
  const { t } = useLanguage();
  const input = useRef<HTMLTextAreaElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [suggestions, setSuggestions] = useState<MusicSuggestion[]>([]);
  const [selected, setSelected] = useState(-1);
  const [status, setStatus] = useState("");
  const query = activePick(value, caret).query;
  const open = focused && !dismissed && !disabled && query.length >= 2 && query.length <= 80;

  useEffect(() => () => { if (blurTimer.current) clearTimeout(blurTimer.current); }, []);

  useEffect(() => {
    setSuggestions([]);
    setSelected(-1);
    if (!open) { setStatus(""); return; }
    const controller = new AbortController();
    setStatus("Looking for your music…");
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json();
        if (controller.signal.aborted) return;
        setSuggestions(data.suggestions ?? []);
        setStatus(data.unavailable ? "Suggestions are taking a break. You can still type any artist or song." : data.suggestions?.length ? "" : "No matches. Keep your own pick or try another spelling.");
      } catch {
        if (!controller.signal.aborted) setStatus("Suggestions are taking a break. You can still type any artist or song.");
      }
    }, 550);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, open]);

  function choose(suggestion: MusicSuggestion) {
    const next = completePick(value, caret, suggestion.label);
    if (next.value.length > 5000) return;
    onChange(next.value);
    setCaret(next.caret);
    setDismissed(true);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(next.caret, next.caret);
    });
  }

  return <div className="autocomplete-wrap">
    <textarea ref={input} id="music" rows={5} maxLength={5000}
      placeholder="Frank Ocean, SZA, Daft Punk…"
      value={value} disabled={disabled} required
      role="combobox" aria-expanded={open} aria-haspopup="listbox"
      aria-autocomplete="list" aria-controls={open ? "music-matches" : undefined}
      aria-activedescendant={open && selected >= 0 ? `music-match-${selected}` : undefined}
      aria-describedby="picks-guidance"
      onChange={event => { onChange(event.target.value); setCaret(event.target.selectionStart); setDismissed(false); }}
      onSelect={event => setCaret(event.currentTarget.selectionStart)}
      onFocus={() => { if (blurTimer.current) clearTimeout(blurTimer.current); setFocused(true); }}
      // Keep the in-flow panel stable through pointer-up so clicking Submit works.
      onBlur={() => { blurTimer.current = setTimeout(() => setFocused(false), 150); }}
      onKeyDown={event => {
        if (!open) return;
        if (event.key === "Escape") { event.preventDefault(); setDismissed(true); }
        if (suggestions.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
          event.preventDefault();
          const next = event.key === "ArrowDown" ? (selected + 1) % suggestions.length : (selected <= 0 ? suggestions.length - 1 : selected - 1);
          setSelected(next);
          document.getElementById(`music-match-${next}`)?.scrollIntoView({ block: "nearest" });
        }
        if (event.key === "Enter" && selected >= 0 && suggestions[selected]) { event.preventDefault(); choose(suggestions[selected]); }
      }} />
    {open && <div className="autocomplete-panel">
      <div className="autocomplete-heading"><T text={"Music suggestions"} /> <span><T text={"Artists & songs"} /></span></div>
      {status && <p role="status" className="autocomplete-status">{t(status)}</p>}
      <ul id="music-matches" role="listbox" aria-label={t("Artist and song suggestions")}>
        {suggestions.map((suggestion, index) => <li key={`${suggestion.kind}:${suggestion.label}`} id={`music-match-${index}`} role="option" aria-selected={selected === index}
          className={selected === index ? "selected" : ""}
          onPointerDown={event => event.preventDefault()} onClick={() => choose(suggestion)}>
          <span className="match-icon">{suggestion.kind === "artist" ? <Mic2 size={17} /> : <Music2 size={17} />}</span>
          <span>{suggestion.label}<small>{suggestion.kind === "artist" ? t("Artist") : t("Song")}</small></span>
        </li>)}
      </ul>
      <small className="catalog-credit"><T text={"Apple music catalog. You can always type your own pick."} /></small>
    </div>}
  </div>;
}
