"use client";

import { animate, cubicBezier } from "animejs";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./CaseStudy.module.css";

/*
 * The opening. The curtain over the page (PageTransition.tsx) lifts in 620ms,
 * so this comes up just behind it and settles a little after it has gone —
 * the link arriving on the page rather than being uncovered by it.
 *
 * Even easing, not the site's usual decelerating curve: this is a plain
 * cross-fade with nothing moving, and a curve that spends most of its travel
 * in the first third reads as a pop with a tail rather than a fade. It is the
 * same curve the curtain itself uses, so the two are one beat.
 */
const INTRO_LEAD = 280;
const INTRO_MS = 520;
const INTRO_EASE = cubicBezier(0.4, 0, 0.2, 1);

/**
 * The back control, pinned to the top-left corner of the viewport rather than
 * stacked above the title in the hero.
 *
 * Two things follow from being fixed. First, it outlives the hero: once the
 * page has scrolled under the fold it comes to rest in the outer margin beside
 * the sticky Navigation rail, on the rail's own top offset, so the two read as
 * one row of page furniture rather than two floating controls (see `.back` in
 * CaseStudy.module.css for how that offset is derived, and what happens at
 * widths where the margin can't hold it).
 *
 * Second, it crosses grounds. The hero is dark and so is the metadata band
 * directly under it, but the page body below them is cream — a single ink
 * would be invisible on one side or the other. So this tracks the bottom edge
 * of that dark run and flips its tone the moment the cream reaches the link,
 * not the moment the hero leaves: switching at the hero would strand a dark
 * glyph on the dark metadata card for the length of that band.
 */
export function BackLink() {
  const ref = useRef<HTMLAnchorElement>(null);
  // Which ground is under the link: the dark hero/meta run, or the page body.
  const [onDark, setOnDark] = useState(true);

  /*
   * Fades in once, on mount. `[data-intro]` (globals.css) is what holds it at
   * opacity 0 until this runs, so it is never seen sitting at full strength
   * first — and that same hook is what the <noscript> block in layout.tsx and
   * the reduced-motion rule beside it use to put it back, for the readers who
   * never get this animation.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      return;
    }

    const intro = animate(el, {
      opacity: [0, 1],
      duration: INTRO_MS,
      delay: INTRO_LEAD,
      ease: INTRO_EASE,
    });
    return () => {
      intro.cancel();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let last: boolean | null = null;

    const update = () => {
      frame = 0;
      // The last dark surface on the page — the metadata band when a study has
      // one, otherwise the hero itself. Queried per-frame rather than cached:
      // it costs nothing next to the rect read below, and it keeps this honest
      // if the band is ever collapsed or removed.
      const dark =
        document.querySelector<HTMLElement>("[data-dark-run]") ?? null;
      if (!dark) return;

      // Flip when the dark run's bottom passes the link's own bottom edge, so
      // the tone changes exactly as the boundary crosses the glyph rather than
      // a scroll-length early or late.
      const cut = el.getBoundingClientRect().bottom;
      const next = dark.getBoundingClientRect().bottom > cut;
      if (next === last) return;
      last = next;
      setOnDark(next);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Link
      ref={ref}
      href="/#work"
      className={styles.back}
      data-intro
      data-ground={onDark ? "dark" : "paper"}
      aria-label="Back to case studies"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M19 12H5m0 0 6 6m-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
