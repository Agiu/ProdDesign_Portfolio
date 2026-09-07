"use client";

import { animate, cubicBezier, utils } from "animejs";
import { useEffect, useRef, useState } from "react";

/* Same cadence and crossfade timings as the homepage's word rotator
   (components/useWordRotator.ts) — the two should feel like the same piece
   of type doing two different things, not two different rhythms. */
const SWITCH_MS = 2500;
const EXIT_MS = 260;
const ENTER_MS = 340;

/* The box's own resize spans the whole crossfade (exit + enter) rather than
   either half alone, so it settles into the new word's width right as that
   word finishes fading in instead of arriving early and sitting there idle,
   or lagging behind and clipping it. */
const WIDTH_MS = EXIT_MS + ENTER_MS;

const EASE = cubicBezier(0.22, 1, 0.36, 1);
/* A plain in-out for the width: the fade already supplies the "arriving"
   feel via --ease, and a second decelerating curve stacked on top of it here
   read as the box overshooting the word rather than measuring it. */
const EASE_WIDTH = cubicBezier(0.65, 0, 0.35, 1);

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Measures `word` set in `el`'s own font — same family, size, weight, and
 * tracking — by cloning those computed styles onto a detached span. Fixed
 * position and hidden rather than `display: none`, so it still lays out and
 * can be measured, and off in a corner of its own so it can never affect the
 * page it's momentarily attached to.
 */
function measureWord(el: HTMLElement, word: string): number {
  const span = document.createElement("span");
  const computed = getComputedStyle(el);
  span.style.position = "fixed";
  span.style.top = "-9999px";
  span.style.left = "-9999px";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "nowrap";
  span.style.font = computed.font;
  span.style.letterSpacing = computed.letterSpacing;
  span.textContent = word;
  document.body.appendChild(span);
  const width = span.getBoundingClientRect().width;
  document.body.removeChild(span);
  return width;
}

/**
 * Like useWordRotator, but the box the word sits in stretches to fit
 * whichever word is showing instead of holding open at the longest option's
 * width — so a short word doesn't leave a run of blank space behind it.
 *
 * Deliberately its own hook rather than an option on the shared one: the
 * homepage tagline wants exactly the opposite — a fixed box, so the sentence
 * around it never reflows as the word changes (see that hook's own comment)
 * — and the two behaviours would only fight each other inside one
 * implementation.
 *
 * Returns two refs. `box` is the element whose width is animated — it should
 * be `display: inline-block` with `overflow: visible`, since the width
 * tween's midpoints are sized between two words and momentarily narrower
 * than whichever one is rendered; clipping it would read as the word getting
 * cut off rather than the box measuring it. (Overflow has to stay `visible`
 * for another reason too: on an inline-block, anything else moves its
 * baseline to the box's bottom margin edge, which would lift the word off
 * the surrounding line.) `word` is the text node that fades between values;
 * it renders in normal flow inside `box` rather than absolutely positioned,
 * which is what lets `box`'s own explicit width — not its content — decide
 * how much room it holds in the line.
 */
export function useStretchingWordRotator(words: string[]) {
  const [index, setIndex] = useState(0);
  const box = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLSpanElement>(null);

  /* One measured width per word, in the box's own font. Recomputed on mount
     and on resize — the type is set in clamp()ed sizes, so a word's pixel
     width moves with the viewport even though its text never does. */
  const widths = useRef<number[]>([]);
  /* The rotation interval's own view of `index`, kept current by the effect
     below. Read at fire time rather than closed over, so the interval itself
     can be created once and left alone — recreating it on every rotation is
     exactly what lets its cadence drift (see useWordRotator's own note on
     this). */
  const indexRef = useRef(0);
  /* Skips the very first fade-in: there's nothing to fade in from on mount,
     so that turn is set outright instead of animated. */
  const mounted = useRef(false);
  const running = useRef<ReturnType<typeof animate>[]>([]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    const remeasure = () => {
      widths.current = words.map((w) => measureWord(el, w));
      const current = widths.current[indexRef.current];
      if (typeof current === "number") {
        utils.set(el, { width: `${current}px` });
      }
    };

    remeasure();

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(remeasure, 150);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
    // Only ever measures the words it was given; `box` doesn't change either.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (words.length < 2 || reduced()) return;

    const id = setInterval(() => {
      const el = box.current;
      const w = word.current;
      if (!el || !w) return;

      const next = (indexRef.current + 1) % words.length;
      const nextWidth = widths.current[next];

      const anims = [
        animate(w, {
          opacity: [1, 0],
          duration: EXIT_MS,
          ease: EASE,
          onComplete: () => setIndex(next),
        }),
      ];

      if (typeof nextWidth === "number") {
        anims.push(
          animate(el, {
            width: `${nextWidth}px`,
            duration: WIDTH_MS,
            ease: EASE_WIDTH,
          }),
        );
      }

      running.current = anims;
    }, SWITCH_MS);

    return () => {
      clearInterval(id);
      for (const anim of running.current) anim.pause();
    };
  }, [words.length]);

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

  return { box, word, index };
}
