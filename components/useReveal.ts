"use client";

import { animate, cubicBezier } from "animejs";
import { useEffect, useRef } from "react";

const EASE = cubicBezier(0.22, 1, 0.36, 1);
const DURATION = 700;

/*
 * Trips a little before the block is fully on screen, so the motion reads as
 * arriving rather than snapping in right at the viewport's edge.
 */
const ROOT_MARGIN = "0px 0px -15% 0px";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fades the returned ref's element in and rises it into place the first time
 * it scrolls into view. Pair the ref with the global `reveal` class (see
 * globals.css) — that's what actually renders the element hidden before this
 * effect ever runs; this hook only ever animates it back to the CSS's own
 * settled values, so there's nothing to duplicate here.
 *
 * Plays once per mount: the observer disconnects itself on the first
 * intersection, so scrolling back past a section later doesn't replay its
 * entrance. Reduced motion is a no-op — `reveal`'s own media query already
 * renders the settled state, so there's nothing left for this to do.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animate(el, {
          opacity: 1,
          translateY: 0,
          duration: DURATION,
          ease: EASE,
        });
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
