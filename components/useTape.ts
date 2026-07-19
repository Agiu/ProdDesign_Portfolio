"use client";

import { animate, spring } from "animejs";
import { useEffect, useRef } from "react";

/** How far a strip runs out when hovered or selected, as a scale factor. */
const EXTEND = 8;

/**
 * Push applied to the strip immediately beside the hovered one, in px. Kept well
 * under half a slot: the buttons themselves never move (see below), so a shift
 * this large is the most the visual can drift from its own hit box before you'd
 * start clicking a strip other than the one under your cursor.
 */
const MAX_SHIFT = 9;

/**
 * Per-strip decay of that push. Each step further from the hovered strip gets
 * this fraction of the previous one's shift, so the tape yields most where it's
 * touched and barely at all at the ends. A uniform shift — which is all CSS can
 * express without hardcoding a rule per index — reads as the whole row lurching.
 */
const FALLOFF = 0.5;

/** Delay per step outward, so the push travels as a ripple rather than at once. */
const RIPPLE_MS = 45;

/** Overshoots and settles, like a tape lock snapping home. */
const SPRING = spring({ stiffness: 130, damping: 13 });
const SPRING_SOFT = spring({ stiffness: 90, damping: 15 });

/**
 * Drives the hero's measuring-tape carousel. Colour stays in CSS (instant, and
 * free); this owns only what CSS can't do — a displacement that falls off with
 * distance and arrives as a ripple.
 *
 * Note what is *not* moved: the <button>. Displacing the buttons would displace
 * their hit boxes, so hovering one would shove its neighbours out from under the
 * cursor, open gaps between them mid-flight, drop the hover, snap everything
 * back, and reacquire — the pointer ends up chasing a target that flees it. The
 * push is applied to an inner span instead, leaving the hit boxes fixed and
 * flush against each other.
 */
export function useTape(count: number, active: number, hovered: number | null) {
  const inners = useRef<(HTMLSpanElement | null)[]>([]);
  const strips = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Ripples radiate from whatever the tape is currently keyed to.
    const origin = hovered ?? active;

    for (let i = 0; i < count; i++) {
      const inner = inners.current[i];
      const strip = strips.current[i];
      if (!inner || !strip) continue;

      const steps = Math.abs(i - origin);
      const delay = steps * RIPPLE_MS;

      // Hovered and selected strips both stay run out.
      const extended = i === active || i === hovered;

      // Only a hover parts the tape; the resting selection leaves it flat.
      const shift =
        hovered === null || i === hovered
          ? 0
          : Math.sign(i - hovered) *
            MAX_SHIFT *
            Math.pow(FALLOFF, Math.abs(i - hovered) - 1);

      animate(strip, {
        scaleX: extended ? EXTEND : 1,
        ease: SPRING,
        delay,
      });

      // The inner span, never the button — see the note on this hook.
      animate(inner, {
        translateX: shift,
        ease: SPRING_SOFT,
        delay,
      });
    }
  }, [count, active, hovered]);

  return { inners, strips };
}
