"use client";

import { useEffect, useRef } from "react";

/**
 * Fraction of the host's height that the media may drift downward.
 * This MUST stay in sync with the media element's vertical overflow in CSS
 * (`top: -30%; height: 160%`) — drift beyond the overflow exposes a bare edge.
 */
const DRIFT = 0.3;

/**
 * Which stretch of scroll the drift is measured across.
 *
 *   - "pinned": 0 while the host's top hasn't yet reached the viewport's top
 *     edge, ramping to 1 once it has scrolled by its own full height. Right
 *     for a host that starts the page filling the viewport (the Hero) — it
 *     has nowhere to arrive "from below", so the drift is anchored purely to
 *     scrolling past the top.
 *   - "transit": 0 the moment the host first appears at the bottom of the
 *     viewport, 1 the moment it fully exits at the top — the drift runs for
 *     the host's entire time on screen, in both directions. Right for a
 *     section further down the page, which scrolls in from below as well as
 *     out above.
 */
type Variant = "pinned" | "transit";

/**
 * Parallax: the returned ref's element drifts down as its parent scrolls past,
 * so the media appears to move slower than the page. Works for a host
 * anywhere in the document — progress is measured off the host's own
 * position in the viewport, not raw window scroll.
 */
export function useParallax<T extends HTMLElement>(variant: Variant = "pinned") {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = -1;

    const update = () => {
      frame = 0;
      const height = host.offsetHeight;
      const top = host.getBoundingClientRect().top;

      const raw =
        variant === "pinned"
          ? // How far the host's top has scrolled past the viewport's top
            // edge. A host that starts at the top of the document (the Hero)
            // has this equal window.scrollY exactly.
            -top / height
          : // Where the host sits between "just entering at the bottom" and
            // "just exited at the top" — 0 and 1 respectively — so the drift
            // spans its whole time in the viewport either direction.
            1 - (top + height) / (window.innerHeight + height);
      const progress = Math.min(Math.max(raw, 0), 1);

      // Once pinned at either end there's nothing left to move.
      if (progress === last) return;
      last = progress;

      el.style.transform = `translate3d(0, ${(progress * DRIFT * height).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [variant]);

  return ref;
}
