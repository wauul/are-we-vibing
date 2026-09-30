"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const targets = ".hero-copy, .hero>.music-scene, .guide-steps>li, .circle-invitation, .session-context, .flow-card, .recovery-panel, .circle-banner, .social-section, .friends-grid, .welcome-visual, .welcome-actions, .result-heading, .result-reveal, .trophies-section, .listen-section, .details-grid, .prose>h2";

export default function AppMotion() {
  const pathname = usePathname();
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(preference.matches);
      document.documentElement.dataset.motion = preference.matches ? "paused" : "playing";
    };
    sync(); setReady(true); preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!ready || reduced) return;
    const observed = new WeakSet<Element>();
    const revealed = new WeakSet<Element>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        element.dataset.motionVisible = entry.isIntersecting ? "visible" : "hidden";
        if (entry.isIntersecting && !revealed.has(element)) {
          revealed.add(element); element.classList.add("motion-enter");
        }
      }
    }, { threshold: .08 });
    function register() {
      document.querySelectorAll(targets).forEach(element => {
        if (!observed.has(element)) { observed.add(element); observer.observe(element); }
      });
    }
    register();
    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame); frame = requestAnimationFrame(register);
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); mutations.disconnect(); };
  }, [pathname, reduced, ready]);
  return null;
}
