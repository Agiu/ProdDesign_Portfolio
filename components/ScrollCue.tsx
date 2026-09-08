"use client";

import type { MouseEvent } from "react";
import styles from "./ScrollCue.module.css";

/**
 * The one thing on the first screen that admits there is a second one.
 *
 * Three blocks stepping up out of the work section's top edge, in the section's
 * own dark, with a chevron in the one that stands on the corner — the mosaic
 * idiom the break and the footer already use, cut down to a handle. It is
 * positioned against that edge rather than against the viewport (see
 * app/page.module.css), so while the hero is pinned and the work is climbing
 * over it, the cue climbs too: it is the leading edge of the thing it points at,
 * not a badge floating over the hero.
 *
 * It is a real link as well as an ornament. Without JS the href jumps; with it,
 * the jump is smoothed, because a cue for scrolling that teleports when you
 * take it up rather undoes the pin it is standing on.
 */
export function ScrollCue() {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("work");
    if (!target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <a
      href="#work"
      className={styles.cue}
      onClick={onClick}
      aria-label="Scroll to case studies"
    >
      {/* The loose one, off the corner and a shade lighter — it breathes, so
          the cluster reads as still settling rather than printed. */}
      <span className={styles.high} aria-hidden />
      <span className={styles.low} aria-hidden />
      <span className={styles.face} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className={styles.chevron}>
          <path
            d="m5 9 7 7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </span>
    </a>
  );
}
