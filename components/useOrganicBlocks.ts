"use client";

import { animate, cubicBezier, utils } from "animejs";
import { useEffect, useRef } from "react";

/** Symmetric in-out, near enough to a sine — the shape of a breath. */
const BREATHE = cubicBezier(0.45, 0, 0.55, 1);

/* Luminance: every block, always, quietly. */
const LUMA_MIN_MS = 3200;
const LUMA_VAR_MS = 4200;
const LUMA_LEAD_MS = 3000;

/* Growth: the slower layer, and the more staggered. */
const GROW_MIN_MS = 2400;
const GROW_VAR_MS = 3000;
const GROW_LEAD_MS = 15000;
const GROW_HOLD_MS = 2200;

/** Deterministic per-block randomness, independent of render order. */
function seed(i: number, salt: number) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Makes the footer mosaic feel alive rather than printed. Two looping layers,
 * over the blocks laid out in footerBlocks.ts (base blocks first, then growth):
 *
 *   - every block breathes in luminance;
 *   - growth blocks scale up out of nothing and shrink back, so the mosaic
 *     thickens and thins along its own edge.
 *
 * Each block gets its own duration and its own head start, so the periods are
 * mutually incommensurate — nothing is ever in lockstep and the ensemble never
 * visibly repeats. That's the whole difference between organic and blinking.
 *
 * The two layers touch separate properties (opacity / scale), which is what lets
 * them run over the same elements without fighting.
 */
export function useOrganicBlocks(baseCount: number, total: number) {
  const blocks = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reduced()) return;

    const els = blocks.current.filter(Boolean) as HTMLSpanElement[];
    if (els.length === 0) return;

    const growth = els.slice(baseCount);

    // anime.js declares these params optional, so they must be optional here.
    const breathing = animate(els, {
      opacity: (_t?: unknown, i?: number) => [0.55 + seed(i ?? 0, 1) * 0.2, 1],
      duration: (_t?: unknown, i?: number) =>
        LUMA_MIN_MS + seed(i ?? 0, 2) * LUMA_VAR_MS,
      delay: (_t?: unknown, i?: number) => seed(i ?? 0, 3) * LUMA_LEAD_MS,
      ease: BREATHE,
      loop: true,
      alternate: true,
    });

    /*
     * Growth blocks start at nothing. Seeded inline because anime.js reads
     * transforms off the style attribute and cannot see one set in a stylesheet
     * — without this the first cycle would snap them to full size.
     */
    utils.set(growth, { scale: 0 });

    const growing = animate(growth, {
      scale: [0, 1],
      duration: (_t?: unknown, i?: number) =>
        GROW_MIN_MS + seed(i ?? 0, 6) * GROW_VAR_MS,
      // The long lead is what makes accretion read as occasional: at any moment
      // most growth cells are still waiting their turn.
      delay: (_t?: unknown, i?: number) => seed(i ?? 0, 9) * GROW_LEAD_MS,
      loopDelay: GROW_HOLD_MS,
      ease: BREATHE,
      loop: true,
      alternate: true,
    });

    return () => {
      breathing.pause();
      growing.pause();
    };
  }, [baseCount, total]);

  return blocks;
}
