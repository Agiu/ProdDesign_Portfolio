"use client";

import { animate, cubicBezier, utils } from "animejs";
import { useEffect, useRef, useState } from "react";

/** Time between one word switching and the next. Every word gets exactly this. */
const SWITCH_MS = 2500;

/* The fade itself, which must fit inside SWITCH_MS with room to spare — the
   word should be at rest for most of its turn, not perpetually in transition. */
const EXIT_MS = 260;
const ENTER_MS = 340;

const EASE = cubicBezier(0.22, 1, 0.36, 1);

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Cycles the hero's highlighted word through `words`: the outgoing word fades
 * out, then the incoming one fades in. Opacity only — no movement, so the word
 * never leaves the line it sits on.
 *
 * Deliberately NOT tied to the hero's hover/pause flag, unlike the slide
 * carousel beside it. The hero fills the viewport, so a pointer is over it most
 * of the time; pausing on hover would stall the rotation almost permanently, and
 * every hover in and out would tear down the interval and restart the countdown
 * from zero, so the cadence would wander. The one timer here runs uninterrupted
 * for the life of the component, which is what makes every word's turn identical.
 *
 * Stopped outright under reduced motion, rather than merely stripped of its
 * transition — a word silently swapping itself is still motion.
 */
export function useWordRotator(words: string[]) {
  const [index, setIndex] = useState(0);
  const word = useRef<HTMLSpanElement>(null);
  const mounted = useRef(false);
  // Tracked so an unmount mid-fade can pause it rather than leave it running
  // against a detached node.
  const exiting = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (words.length < 2 || reduced()) return;

    const id = setInterval(() => {
      const el = word.current;
      if (!el) return;

      exiting.current = animate(el, {
        opacity: [1, 0],
        duration: EXIT_MS,
        ease: EASE,
        onComplete: () => setIndex((i) => (i + 1) % words.length),
      });
    }, SWITCH_MS);

    return () => {
      clearInterval(id);
      exiting.current?.pause();
    };
    // Only the word count — nothing else may retrigger this, or the interval
    // restarts and the cadence drifts.
  }, [words.length]);

  // Fades the new word in once it has actually landed in the DOM. Skips the very
  // first render: there's nothing to fade in from on mount.
  useEffect(() => {
    const el = word.current;
    if (!el) return;

    if (!mounted.current || reduced()) {
      mounted.current = true;
      utils.set(el, { opacity: 1 });
      return;
    }

    utils.set(el, { opacity: 0 });
    const entering = animate(el, {
      opacity: 1,
      duration: ENTER_MS,
      ease: EASE,
    });

    return () => {
      entering.pause();
    };
  }, [index]);

  return { ref: word, index };
}
