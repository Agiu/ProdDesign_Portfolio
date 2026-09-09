"use client";

import { animate, createTimeline, cubicBezier, stagger } from "animejs";
import { useEffect, useRef } from "react";
import styles from "../CaseStudy.module.css";

/**
 * The `stream` custom block — a plain list of what something records, played
 * as a recording rather than set as a list.
 *
 * One item per line in the fence; it reads on the page as the bullet list it
 * replaces, at the same size and rhythm as the prose around it.
 *
 * Two beats, and the second is the whole reason this isn't just a list:
 *
 *   1. The spine draws down and the rows come up behind it in a stagger —
 *      the fields arriving, one after another, as they're captured.
 *   2. The spine's marks then pulse down the list three times over, faster
 *      each pass. That's the volume claim made with the author's own field
 *      names instead of an invented figure: not eight things recorded once,
 *      but eight things recorded again, and again, for as long as the
 *      aircraft is moving.
 *
 * Choreography and resting state follow the recruiter timeline (Timeline.tsx)
 * exactly: CSS owns the pending state off `data-anim`, so this is served
 * hidden rather than hidden by a script after first paint, and both ways out
 * of it — reduced motion, and no JS at all — settle every row where it
 * belongs. `data-anim="done"` comes off the last tween so nothing is left
 * depending on inline styles anime happened to write.
 */

const EASE = cubicBezier(0.22, 1, 0.36, 1);

/* Same margin the site's reveal hook uses, so this trips on the same beat as
   every other block that arrives on scroll. */
const ROOT_MARGIN = "0px 0px -15% 0px";

/* How many times the marks run down the list once it has settled, and how
   long the whole run takes. Accelerating rather than steady: three passes at
   one speed reads as a decoration with a period, three that speed up read as
   something being written faster than you can follow. */
const SWEEP_PASSES = 3;
const SWEEP_MS = 1600;
const SWEEP_EASE = cubicBezier(0.4, 0, 0.85, 0.55);

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TrackStream({ content }: { content: string }) {
  const items = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ref = useRef<HTMLDivElement>(null);
  const running = useRef<{ pause: () => void } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || items.length === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const spine = el.querySelector<HTMLElement>("[data-spine]");
        const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
        const marks = Array.from(el.querySelectorAll<HTMLElement>("[data-mark]"));

        const tl = createTimeline({
          defaults: { ease: EASE },
          onComplete: () => {
            el.dataset.anim = "done";
            running.current = sweep(marks);
          },
        });

        if (spine) tl.add(spine, { scaleY: [0, 1], duration: 720 }, 0);
        if (rows.length > 0) {
          tl.add(
            rows,
            {
              opacity: [0, 1],
              translateY: [14, 0],
              duration: 560,
              delay: stagger(70),
            },
            220,
          );
        }

        running.current = tl;
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      running.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={styles.stream} data-anim="pending" ref={ref}>
      <span className={styles.streamSpine} data-spine aria-hidden />
      <ul className={styles.streamList}>
        {items.map((item, i) => (
          <li key={i} className={styles.streamItem} data-row>
            <span className={styles.streamMark} data-mark aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The second beat: one playhead walked from 0 to SWEEP_PASSES, with the mark
 * under it lit as it goes. Written straight to the nodes — a mark lighting
 * and going out again isn't state the panel needs to re-render to hold.
 */
function sweep(marks: HTMLElement[]) {
  if (marks.length === 0) return null;

  const clear = () => marks.forEach((mark) => delete mark.dataset.live);
  const playhead = { p: 0 };

  return animate(playhead, {
    p: SWEEP_PASSES,
    duration: SWEEP_MS,
    ease: SWEEP_EASE,
    onUpdate: () => {
      const within = playhead.p % 1;
      const live = Math.min(marks.length - 1, Math.floor(within * marks.length));
      marks.forEach((mark, i) => {
        if (i === live) mark.dataset.live = "true";
        else delete mark.dataset.live;
      });
    },
    onComplete: clear,
  });
}
