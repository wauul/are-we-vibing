"use client";
import { useLanguage } from "@/components/language-provider";

import Image from "next/image";
import { KeyRound, Library, Music2, RotateCcw } from "lucide-react";
import { trophyArt } from "@/lib/trophy-art";

export function ArtworkStage({ kind }: { kind: "friends" | "picks" }) {
  return <div className={`artwork-stage artwork-${kind}`}>
    <div className="artwork-orbit" aria-hidden="true"><i /><i /></div>
    <Image src={kind === "friends" ? "/art/friends-exchange.webp" : "/art/music-picks.webp"} width={kind === "friends" ? 960 : 640} height={640} sizes={kind === "friends" ? "(max-width:767px) 90vw, 480px" : "(max-width:767px) 164px, 360px"} alt="" priority />
    <div className="artwork-notes" aria-hidden="true">{[0,1,2].map(index=><Music2 key={index} size={28} style={{animationDelay:`${index*-1.5}s`}} />)}</div>
  </div>;
}

export function RecoveryArt({ kind }: { kind: "retry" | "capped" | "invite" }) {
  const { t } = useLanguage();
  const art = {
    retry: { src: "/art/saved-mix.webp", alt: "Two saved records in a crate with a replay arrow" },
    capped: { src: "/art/mix-rest.webp", alt: "Two records safely stored beside an empty hourglass" },
    invite: { src: "/art/private-invite.webp", alt: "A vinyl invitation protected by a lock and key" },
  }[kind];
  return <div className={`recovery-art recovery-${kind} is-playing`}>
    <div className="recovery-rings" aria-hidden="true"><i /><i /></div>
    <Image src={art.src} alt={t(art.alt)} width={640} height={640} sizes="(max-width:767px) 240px, 320px" priority />
    <span className="recovery-token" aria-hidden="true">{kind === "invite" ? <KeyRound size={26} /> : kind === "retry" ? <RotateCcw size={26} /> : <Library size={26} />}</span>
    {kind !== "invite" && <div className="recovery-sides" aria-hidden="true"><i>A</i><i>B</i></div>}
  </div>;
}

export function MusicScene({ mode = "hero" }: { mode?: "hero" | "waiting" | "matching" }) {
  const { t } = useLanguage();
  const waiting = mode === "waiting";
  return <div className={`music-scene scene-${mode} is-playing`}>
    <div className="scene-orbits" aria-hidden="true"><i /><i /><i /></div>
    <div className="scene-side scene-side-a" aria-hidden="true"><span>A</span><small>{waiting ? t("Your side is in") : t("Your taste")}</small></div>
    <div className={`scene-side scene-side-b ${waiting ? "side-pending" : ""}`} aria-hidden="true"><span>B</span><small>{waiting ? t("Their turn") : t("Their taste")}</small></div>
    <div className="scene-message" aria-hidden="true"><i /><i /><i /></div>
    <div className="scene-notes" aria-hidden="true">{[0,1,2].map(index=><Music2 key={index} size={26} style={{animationDelay:`${index*-1.3}s`}} />)}</div>
    <Image className="scene-machine" src="/art/record-player.webp" alt="" width={640} height={640} priority={mode === "hero"} />
    <div className="scene-deck"><div className="scene-wave" aria-hidden="true">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ height: `${8 + ((i * 13) % 23)}px`, animationDelay: `${i * -.12}s` }} />)}</div><span>{waiting ? t("Waiting for their music") : mode === "matching" ? t("Two sides coming together") : t("Two tastes, one frequency")}</span></div>
  </div>;
}

export function TrophyArt({ side, title }: { side: "A" | "B"; title: string }) {
  const { t } = useLanguage();
  return <div className={`trophy-art trophy-${side.toLowerCase()} is-playing`}>
    <div className="trophy-ring" aria-hidden="true" />
    <Image src={trophyArt(title).src} alt={t(trophyArt(title).description)} width={240} height={280} />
  </div>;
}
