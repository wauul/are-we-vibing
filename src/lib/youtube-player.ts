export type YouTubePlayer = {
  cuePlaylist(options: { playlist: string[]; index: number }): void;
  playVideoAt(index: number): void;
  playVideo(): void;
  pauseVideo(): void;
  getPlaylistIndex(): number;
  destroy(): void;
};
type PlayerEvent = { target: YouTubePlayer; data: number };
type YouTubeAPI = { Player: new (element: HTMLElement, options: { width: string; height: string; playerVars: Record<string, string | number>; events: { onReady(event: PlayerEvent): void; onStateChange(event: PlayerEvent): void; onError(event: PlayerEvent): void } }) => YouTubePlayer };
declare global { interface Window { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void; } }
let loading: Promise<YouTubeAPI> | undefined;
export function loadYouTubePlayer(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (loading) return loading;
  loading = new Promise<YouTubeAPI>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const timeout = setTimeout(() => { loading = undefined; reject(new Error("YouTube unavailable")); }, 15000);
    window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); previous?.(); if (window.YT) resolve(window.YT); };
    const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.async = true;
    script.onerror = () => { clearTimeout(timeout); loading = undefined; script.remove(); reject(new Error("YouTube unavailable")); };
    document.head.appendChild(script);
  });
  return loading;
}
export function nextPlayableIndex(current: number, length: number, failed: Set<number>): number | null {
  for (let i = Math.max(0, current + 1); i < length; i++) if (!failed.has(i)) return i;
  return null;
}
