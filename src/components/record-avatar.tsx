import type { CSSProperties } from "react";

/** A record label represents a person without inventing a profile photograph. */
export default function RecordAvatar({ name, seed, small = false }: { name: string; seed: string; small?: boolean }) {
  const colors = ["#ed986c", "#edc9d7", "#f7f0e7"];
  const color = colors[Array.from(seed).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % colors.length];
  return <span className={`record-avatar ${small ? "record-avatar-small" : ""}`} style={{ "--record-label": color } as CSSProperties} aria-hidden="true"><span>{name.trim().slice(0, 1).toUpperCase()}</span></span>;
}
