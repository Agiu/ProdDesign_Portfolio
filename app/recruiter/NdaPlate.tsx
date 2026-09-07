"use client";

import { createTimeline, cubicBezier, utils } from "animejs";
import { useEffect, useRef } from "react";
import styles from "./Recruiter.module.css";

/*
 * The redacted plate for a shot that will never have a picture (`Shot["nda"]`)
 * — and the one place on this page allowed to be a little sci-fi about it.
 *
 * The idea is a monitor showing something it isn't cleared to show: faint
 * scanlines, a slow band sweeping down the plate, and every few seconds a
 * short burst where the label tears sideways and two ghosts of it flash off
 * either edge.
 *
 * Restraint is the whole design constraint here. The label has to stay
 * readable at every frame, so:
 *   - the bursts are ~200ms each, seconds apart, and the plate is at rest for
 *     most of its cycle;
 *   - the label itself never drops below 0.7 opacity or moves more than 3px;
 *   - the ghosts are cream at low alpha rather than an RGB split — the site
 *     has no accent colour, and a red/cyan tear would be the first hue on the
 *     whole page;
 *   - nothing scales, so no text is ever resampled mid-motion.
 *
 * Everything is one looping anime.js timeline, so the beats can't drift apart
 * from each other. It only runs while the plate is actually on screen, and
 * not at all under reduced motion — where the plate stands as the plain
 * still card it is at rest.
 */

const EASE = cubicBezier(0.22, 1, 0.36, 1);
/* Steps in a burst are square on purpose — a tear that eases is a slide. */
const SNAP = "linear";

/* One full cycle. Long enough that the plate reads as still with occasional
   interference rather than as something perpetually broken. */
const CYCLE = 7200;

/* When the sweep runs, and the two bursts after it. */
const SWEEP_AT = 800;
const SWEEP_MS = 1500;
const BURST_A = 3900;
const BURST_B = 5600;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function LockIcon({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="10.5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
      <path d="M12 16.4V18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function NdaPlate() {
  const root = useRef<HTMLDivElement>(null);
  const running = useRef<ReturnType<typeof createTimeline> | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;

    const sweep = el.querySelector<HTMLElement>("[data-sweep]");
    const label = el.querySelector<HTMLElement>("[data-label]");
    const ghostA = el.querySelector<HTMLElement>("[data-ghost='a']");
    const ghostB = el.querySelector<HTMLElement>("[data-ghost='b']");
    const lock = el.querySelector<HTMLElement>("[data-lock]");
    if (!sweep || !label || !ghostA || !ghostB || !lock) return;

    /* anime.js reads transforms off inline styles, not computed ones, so the
       resting values are seeded here rather than left to the stylesheet —
       the same reason CaseCard.tsx seeds its caption before the first
       hover. */
    utils.set(sweep, { translateY: "-140%", opacity: 0 });
    utils.set([ghostA, ghostB], { opacity: 0 });
    utils.set(label, { translateX: 0, opacity: 1 });

    const tl = createTimeline({ loop: true, defaults: { ease: EASE } });

    /* The sweep: a soft band down the plate, fading in off the top edge and
       out through the bottom, so it reads as a pass rather than as a bar
       arriving and leaving. */
    tl.add(sweep, { opacity: 0.5, duration: 260, ease: SNAP }, SWEEP_AT);
    tl.add(
      sweep,
      { translateY: "140%", duration: SWEEP_MS, ease: "linear" },
      SWEEP_AT,
    );
    tl.add(
      sweep,
      { opacity: 0, duration: 300, ease: SNAP },
      SWEEP_AT + SWEEP_MS - 300,
    );

    /*
     * A burst, twice per cycle. Four square steps: tear left, tear back
     * right, settle. The ghosts only exist during the tear — they flash on
     * with it and are gone before the label lands, which is what keeps the
     * word legible rather than permanently doubled.
     */
    const burst = (at: number, throwPx: number) => {
      tl.add(label, { translateX: -throwPx, opacity: 0.72, duration: 50, ease: SNAP }, at);
      tl.add(ghostA, { opacity: 0.45, translateX: -throwPx * 2, duration: 50, ease: SNAP }, at);
      tl.add(ghostB, { opacity: 0.32, translateX: throwPx * 1.5, duration: 50, ease: SNAP }, at);
      tl.add(lock, { opacity: 0.35, duration: 50, ease: SNAP }, at);

      tl.add(label, { translateX: throwPx * 0.7, duration: 60, ease: SNAP }, at + 60);
      tl.add(ghostA, { translateX: throwPx, duration: 60, ease: SNAP }, at + 60);
      tl.add(ghostB, { translateX: -throwPx, duration: 60, ease: SNAP }, at + 60);

      tl.add(label, { translateX: 0, opacity: 1, duration: 90 }, at + 130);
      tl.add([ghostA, ghostB], { opacity: 0, duration: 90, ease: SNAP }, at + 130);
      tl.add(lock, { opacity: 1, duration: 140 }, at + 130);
    };

    burst(BURST_A, 3);
    /* The second is smaller — two identical bursts a cycle read as a metronome
       rather than as interference. */
    burst(BURST_B, 2);

    /* Holds the loop open to its full length: the last burst lands well before
       CYCLE, and without this the timeline would restart the moment it did. */
    tl.add(label, { translateX: 0, duration: 1, ease: SNAP }, CYCLE - 1);

    running.current = tl;

    /*
     * Only while it's on screen. A loop like this is cheap, but it is also
     * pointless three sections up the page, and leaving it running would keep
     * waking the compositor for something nobody is looking at.
     */
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) tl.play();
      else tl.pause();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      tl.pause();
    };
  }, []);

  return (
    <div className={styles.shotFrame} data-nda ref={root}>
      {/* Scanlines and the sweep are texture — nothing here to read. */}
      <span className={styles.ndaScan} aria-hidden />
      <span className={styles.ndaSweep} data-sweep aria-hidden />

      <span className={styles.ndaStack}>
        {/* The wrapper carries the animation hook rather than the svg, so the
            glyph component stays the plain className-only shape every other
            icon on the site has. */}
        <span className={styles.ndaLock} data-lock>
          <LockIcon className={styles.shotNdaIcon} />
        </span>

        {/* The two ghosts are the tear; the third copy is the one you read.
            Both ghosts are hidden from assistive tech and from the flow — see
            .ndaGhost — so the label is announced once. */}
        <span className={styles.ndaLabelWrap}>
          <span className={styles.ndaGhost} data-ghost="a" aria-hidden>
            Under NDA
          </span>
          <span className={styles.ndaGhost} data-ghost="b" aria-hidden>
            Under NDA
          </span>
          <span className={styles.shotNdaLabel} data-label>
            Under NDA
          </span>
        </span>
      </span>
    </div>
  );
}
