export type MusicSuggestion = { label: string; kind: "artist" | "song" };

/** Find only the comma/newline-delimited pick at the caret, preserving other picks. */
export function activePick(value: string, caret: number) {
  const position = Math.max(0, Math.min(caret, value.length));
  const before = value.slice(0, position);
  const start = Math.max(before.lastIndexOf(","), before.lastIndexOf("\n")) + 1;
  const next = value.slice(position).search(/[,\n]/);
  const end = next < 0 ? value.length : position + next;
  return { start, end, query: value.slice(start, end).trim() };
}

export function completePick(value: string, caret: number, label: string) {
  const { start, end } = activePick(value, caret);
  // Commas are list separators in manual input; retain the name without that punctuation.
  const pick = label.replace(/,/g, "").trim();
  const prefix = value.slice(0, start);
  const suffix = value.slice(end);
  const separator = suffix ? "" : "\n";
  return { value: prefix + pick + separator + suffix, caret: prefix.length + pick.length + (suffix ? 0 : 1) };
}
