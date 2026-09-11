"use client";

import { preload } from "react-dom";
import { animate, cubicBezier, splitText, stagger, utils } from "animejs";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { hero } from "@/content/home";
import { makeNoise2D } from "@/lib/noise";
import { useWordRotator } from "./useWordRotator";
import styles from "./Hero.module.css";

/*
 * The hero is a sheet of paper laid over the work, with a single ragged gash
 * torn through it. The paper is a grid of block elements — closed blocks are
 * opaque --paper, open ones are transparent and let the slide beneath show
 * through. Advancing the carousel heals the tear shut over the outgoing slide,
 * swaps the media while nothing is visible, then tears the next one open.
 *
 * Everything is derived from seeded value noise (lib/noise.ts), so a slide
 * always carves the same shape and nothing has to be authored by hand.
 */

/* A slide's turn: how long the duration bar takes to fill, and therefore how
   long one slide holds before the next transition starts. */
const AUTOPLAY_MS = 7000;

/*
 * The opening, the part of it that belongs to the type: the name lifts in a
 * word at a time and the tagline comes up behind it, both from a little below
 * where they belong.
 *
 * RISE is short deliberately. The copy is arriving on the page, not travelling
 * across it — a long throw on type this size reads as a slide transition, and
 * the sheet behind it is already doing the site's one big move.
 *
 * LEAD holds the type until the curtain over it (PageTransition.tsx, INTRO) is
 * most of the way gone, so the lift happens in the clear rather than behind
 * cream. The two are timed against each other by hand; nothing enforces it,
 * because a shared clock between a layout component and this one would cost
 * more than the half-frame of drift it would save.
 */
const INTRO_RISE = 24;
const INTRO_MS = 900;
const INTRO_STAGGER = 110;
const INTRO_LEAD = 300;

/*
 * Decelerating, and hard. "Easing in" in the sense that matters here is easing
 * *into place*: the words leave at once and settle slowly. A curve that
 * genuinely accelerates would hold them still and then throw them at their
 * mark, which on a display-size name reads as a jolt rather than as arriving.
 */
const INTRO_EASE = cubicBezier(0.16, 1, 0.3, 1);

/*
 * The transition's timings, in ms — every stagger spread and tween duration in
 * one place, because the state machine below needs to know exactly how long
 * each stage lasts, not just ask an animation to tell it afterwards.
 *
 * A stage advances on its animation's onComplete, which is accurate to the
 * frame. But that callback is the only thing that would ever advance it, and a
 * stage that never reports back would leave the carousel locked out for good —
 * no autoplay, and no response to the picker either, since both go through the
 * same gate. So each stage also carries a deadline computed from these: whichever
 * arrives first runs the stage, once. The animations still drive what you see;
 * these only guarantee the machine keeps moving.
 */
const REVEAL_LEAD = 320;
const REVEAL_SPREAD = 620;
const REVEAL_MS = 240;
const CLOSE_SPREAD = 520;
const CLOSE_MS = 200;
const OPEN_LEAD = 200;
const OPEN_SPREAD = 560;
const OPEN_MS = 230;
/* Slack on top of each stage's own length, so the fallback only ever fires
   when the callback genuinely didn't. */
const GRACE = 150;
const REVEAL_TOTAL = REVEAL_LEAD + REVEAL_SPREAD + REVEAL_MS + GRACE;
const CLOSE_TOTAL = CLOSE_SPREAD + CLOSE_MS + GRACE;
const OPEN_TOTAL = OPEN_LEAD + OPEN_SPREAD + OPEN_MS + GRACE;

/** Runs `fn` at most once, whichever caller gets there first. */
function once(fn: () => void) {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    fn();
  };
}

/*
 * The one margin: the bottom of the sheet, where the name and the picker sit.
 * Deeper on a phone, where .inner stacks the copy above the picker instead of
 * setting them side by side.
 *
 * There is deliberately no margin anywhere else. Any threshold expressed in
 * height alone — a shield, a clip, a floor — puts its boundary at a fixed v,
 * and a fixed v is a dead-level line across the whole sheet. So the top and
 * the sides have none at all: the tear runs off them wherever its own noise
 * takes it. Even this margin, which exists because type has to stay legible,
 * defends itself along a wandering line rather than a straight one (TYPE_ZONE
 * below) — the tear is pushed back from the copy, never cut off at it.
 */
const COPY_BAND = { wide: 0.27, compact: 0.4 };

/*
 * The part of that margin the type actually occupies, and the only hard limit
 * in the pattern. The tear may wander down into the margin — that's the copy
 * shield's job to discourage, not forbid — but it may never reach the type.
 * TYPE_WAVE is how far the limit itself wanders, and is already accounted for
 * in the zone: the line rides between (1 - zone) and (1 - zone + wave).
 */
const TYPE_ZONE = { wide: 0.25, compact: 0.37 };
const TYPE_WAVE = 0.045;

/*
 * The air between a compact sheet's hard line and the type it is protecting.
 *
 * The line is measured off the real copy box, and without this it would sit on
 * the exact pixel the name starts at — which is what the old constant worked
 * out to, and it showed: the hem cleared the letters but the fray dropped
 * blocks against their tops, and a block a hair above a capital reads as
 * touching it. The zone is a promise about where paper ends, not about where
 * the reader stops noticing.
 */
const TYPE_CLEAR = 0.045;

/*
 * A phone tears differently.
 *
 * A gash floating in the middle of a portrait screen leaves paper above it and
 * paper below it, and what shows through the slot between them is a letterbox —
 * the least of a picture you can show while still calling it visible. So on a
 * compact viewport the sheet is torn clean off the top edge instead: no upper
 * lip at all, the slide running from the very top of the screen down to a
 * single ragged hem. Everything that made the tear worth looking at — the fray,
 * the ghosts, the flicker — now lives on that one edge, which is the edge right
 * above the name and the tagline.
 *
 * HEM_DROP is how far above the type line the hem rides on average; HEM_WAVE is
 * how far it wanders either side. The wander is put through tanh, so these
 * *bound* the hem rather than merely describing where it usually falls: there
 * is no roll of the noise, however unlucky, that walks it into the type.
 */
const HEM_DROP = 0.115;
const HEM_WAVE = 0.07;

/*
 * A wide sheet carries two blocks of type, and they sit in opposite corners:
 * the meta block — caption, picker, clock — at the top right, the name and
 * tagline at the bottom left. Each is measured off the real layout (see Keep)
 * and the tear is carved around both.
 *
 * FEATHER_U/V is how far past a block the repulsion reaches, PUSH is how hard
 * it repels once inside, PAD is the hard margin around the block itself — the
 * line nothing may open within, whatever the noise wants.
 *
 * The feathers are the whole point. A clearance with no reach would punch a
 * rectangle out of the tear; these are what turn its lips away early, so the
 * opening bends around a corner instead of being cut off square at it.
 */
const KEEP_FEATHER_U = 0.14;
const KEEP_FEATHER_V = 0.11;
const KEEP_PUSH = 1.15;
const KEEP_PAD = 0.015;

/*
 * The fall — how far the tear's spine travels down the sheet from left to
 * right, and the shape of that travel.
 *
 * With type parked in the top-right and bottom-left corners, the only way
 * across the sheet is the other diagonal, and this is the tear taking it: in
 * at the top left, out through the bottom right. Which is why the direction no
 * longer alternates per slide the way the old lean did — that lean was
 * decoration and could point either way; this one is the composition.
 *
 * But not a straight diagonal. The spine comes in almost level along the top
 * left, turns hard through the middle of the sheet, and levels out again down
 * the right: an S. A straight lean of the same drop meets the two corners at
 * an angle and gets clipped by them, which reads as a cut-off; an S arrives at
 * each edge already flat and slides out of the sheet instead.
 *
 * FALL is the spine's reach either side of the sheet's middle, TURN is where
 * it turns and TURN_SPAN how much of the width the turn takes. tanh, so the
 * ends flatten off rather than stopping dead.
 */
const FALL = 0.39;
const TURN = 0.58;
const TURN_SPAN = 0.3;

/*
 * How far each lip sits off that spine, as a fraction of the sheet's height,
 * and how much it wanders on top of it.
 *
 * Wide, and deliberately steady. The band is most of a screen tall, so nearly
 * everywhere only one of its two lips is on the sheet at all and the other is
 * off an edge — which is what lets the width be this consistent without the
 * opening reading as a ribbon. You are never looking at both edges at once, so
 * they never get the chance to look parallel. That is also why this can be a
 * single number where the old narrow tear needed its two lips driven far apart
 * by noise to avoid exactly that.
 *
 * WANDER is all the raggedness the large scale needs; the fray adds the rest
 * at pixel scale.
 */
const LIP = 0.52;
const LIP_WANDER = 0.14;

/*
 * The scraps: single blocks left stuck over the media near the tear's lip.
 * REACH is how far in from the lip they can still land, in cells; RATE is the
 * chance a cell right on the lip becomes one.
 */
const SCRAP_REACH = 5;
const SCRAP_RATE = 0.1;

/**
 * How much of the sheet's bottom edge the type claims.
 *
 * Measured wherever there is a measurement to use — the topmost edge of any
 * block, which on a compact sheet is the name. The constants are the fallback
 * for the one frame before the layout has been read, and for nothing else.
 */
const zoneFor = (compact: boolean, keep: Keep) => {
  if (!compact) return TYPE_ZONE.wide;
  if (!keep || keep.length === 0) return TYPE_ZONE.compact;
  return 1 - Math.min(...keep.map((b) => b.v0));
};

/** The lowest v any cell may open at — the hard type line, at its deepest. */
const tearBottom = (compact: boolean, keep: Keep) =>
  1 - zoneFor(compact, keep) + TYPE_WAVE / 2;

/**
 * Where the tear sits, as a fraction of the hero's height: the middle of
 * everything the copy leaves it. The wide sheet's spine is built around this —
 * it's the value the S-curve turns about (see FALL).
 *
 * The media used to be hung off it too, published as --tear-mid so a slide
 * could sit high over a tear that pooled above the sheet's middle. It isn't
 * any more: the tear reaches both the top-left and bottom-right corners now,
 * so the slide is simply the hero (see .media in the stylesheet).
 *
 * Compact doesn't use this at all: with the sheet open from the top edge down,
 * the window starts at 0, so the media is hung from the top and sized to
 * --tear-bottom instead.
 */
const tearMid = (compact: boolean) =>
  (1 - (compact ? COPY_BAND.compact : COPY_BAND.wide)) / 2;

/* One per slide. Spaced far enough apart that neighbours never hash into
   similar-looking tears; extends automatically as slides are added. */
const seedFor = (index: number) => 11 + index * 36;

/**
 * A block of type the sheet has to keep clear of, as a box in the sheet's own
 * normalised coordinates — already stretched to whichever two edges it hangs
 * from, so a corner block really is a corner rather than an island with paper
 * to squeeze past on the outside.
 */
type Block = { u0: number; u1: number; v0: number; v1: number };

/**
 * Every block of type on the sheet, measured off the real layout rather than
 * written down here: where their edges fall depends on the column's width, the
 * gutter, the longest caption and the tagline's wrapping, none of which this
 * file gets to decide.
 *
 * A wide sheet has two, in opposite corners. A compact one stacks its type
 * down the bottom instead, so it has one band across that edge — measured to
 * where the name actually starts rather than guessed at, which is the whole
 * difference between the tear clearing the type and landing on it.
 *
 * Null only for the frame before the first measurement lands.
 */
type Keep = Block[] | null;

type Dims = { cols: number; rows: number; compact: boolean; keep: Keep };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * How deep into a block's clearance a cell sits: 1 anywhere over the block
 * itself, easing to 0 across the feather on every side. `wu`/`wv` shift the
 * boundary — the caller passes noise, because a line the tear runs alongside
 * must never be a straight one.
 */
function clearance(b: Block, u: number, v: number, wu: number, wv: number) {
  const nearU = Math.min(u - (b.u0 - KEEP_FEATHER_U), b.u1 + KEEP_FEATHER_U - u);
  const nearV = Math.min(v - (b.v0 - KEEP_FEATHER_V), b.v1 + KEEP_FEATHER_V - v);
  return (
    clamp01((nearU + wu) / KEEP_FEATHER_U) * clamp01((nearV + wv) / KEEP_FEATHER_V)
  );
}

/** The hard core: inside the block itself, plus its pad. Nothing opens here. */
const inside = (b: Block, u: number, v: number, wu: number, wv: number) =>
  u > b.u0 - KEEP_PAD + wu &&
  u < b.u1 + KEEP_PAD - wu &&
  v > b.v0 - KEEP_PAD + wv &&
  v < b.v1 + KEEP_PAD - wv;

/**
 * 1 = closed (paper block visible), 0 = open (media shows through).
 *
 * On a wide sheet the open region is a single gash torn across it. Its spine
 * snakes — a long swell with a shorter ripple riding it, over a per-slide lean
 * — and its two lips are driven by separate noise fields, so the tear is never
 * a symmetric ribbon about a level line.
 *
 * On a compact one the upper lip is gone: the sheet is torn away from the top
 * edge entirely and only the lower lip survives, as the hem above the copy (see
 * HEM_DROP). Either way, pixel-scale noise frays the surviving edges and throws
 * a few specks of splatter clear of them.
 */
function computePattern(
  seed: number,
  cols: number,
  rows: number,
  index: number,
  compact: boolean,
  keep: Keep,
): Uint8Array {
  const param = makeNoise2D(seed * 31 + 17);
  const spine = makeNoise2D(seed);
  const ripple = makeNoise2D(seed * 3 + 11);
  const upperN = makeNoise2D(seed * 7 + 3);
  const upperN2 = makeNoise2D(seed * 17 + 29);
  const lowerN = makeNoise2D(seed * 11 + 5);
  const lowerN2 = makeNoise2D(seed * 29 + 13);
  const fine = makeNoise2D(seed * 13 + 7);
  const speck = makeNoise2D(seed * 19 + 5);
  const scrap = makeNoise2D(seed * 37 + 21);
  const edgeN = makeNoise2D(seed * 23 + 9);
  const edgeN2 = makeNoise2D(seed * 41 + 3);

  const band = compact ? COPY_BAND.compact : COPY_BAND.wide;
  const zone = zoneFor(compact, keep);
  // The tear rides the middle of everything above the copy, and its size
  // scales with that room — so it stays a window filling the sheet at any
  // proportion, rather than a gash pinned to one edge of it.
  const mid = tearMid(compact);
  // Compact only: where the hem rides, with the type line as its datum.
  const hemMid = 1 - zone - HEM_DROP;
  /* Everything below is written as a fraction of a full-height sheet and then
     scaled by this, so a short viewport (or a phone, with its deeper copy
     margin) gets the same tear proportionally rather than the same tear
     cropped. 0.73 is the room a desktop sheet has, i.e. room === 1 there. */
  const room = (1 - band) / 0.73;

  /*
   * Every cut leans off the horizon. On a compact sheet that lean is still
   * decoration, so it stays shallow and alternates down the carousel to keep
   * neighbouring slides from slanting alike.
   *
   * On a wide one it is the composition: the tear falls hard from the top left
   * to the bottom right, threading the gap the two corner blocks leave it (see
   * FALL). Only the steepness varies from slide to slide — alternating the
   * direction would send it straight through the type.
   */
  const tilt = (index % 2 === 0 ? 1 : -1) * (0.1 + param(0.5, 0.5) * 0.16);

  /* Wide: how far this sheet falls and where it breaks, varied a little per
     slide so no two tear in the same place. The direction never varies. */
  const fall = FALL * (0.88 + param(1.3, 2.9) * 0.24);
  const turn = TURN + (param(2.1, 0.7) - 0.5) * 0.1;
  const phase = param(3.7, 1.2) * 6.283;

  const pattern = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = x / (cols - 1);
      const v = y / (rows - 1);

      // The fray: pixel-scale noise that breaks up whichever edges this sheet
      // has, plus stray specks of splatter thrown clear of them.
      const fray =
        (fine(x * 0.5, y * 0.5) - 0.5) * 0.16 + (speck(x * 1.1, y * 1.1) - 0.5) * 0.1;

      let openness: number;
      if (compact) {
        /*
         * The hem, and the only edge on the sheet: everything above it is open
         * to the top of the screen. Four octaves of wander over the slide's own
         * lean — but all of it inside a tanh, which is what makes HEM_WAVE a
         * bound rather than a hope. The hem may snake and lean as hard as the
         * noise cares to take it and still cannot arrive at the type.
         */
        const wobble =
          (spine(u * 2.1 + phase, 0.37) - 0.5) * 1.6 +
          (lowerN(u * 1.6, 4.1) - 0.5) * 1.3 +
          (lowerN2(u * 4.3, 6.7) - 0.5) * 0.8 +
          (lowerN2(u * 9.7, 3.3) - 0.5) * 0.45 +
          tilt * 3 * (u - 0.5);
        openness = hemMid + HEM_WAVE * Math.tanh(wobble) - v;

        /* No copy shield down here — the tanh already holds the hem off the
           type, and a shield would only drag it back up the screen, which is
           the whole thing this layout is trying not to do. The fray is faded
           out as the type line nears instead: a speck thrown past the hem is
           the tear's own texture, but one thrown far enough to be clipped by
           the type line would draw that line for the viewer, and the point of
           the line is that it is never seen. */
        openness += fray * Math.min(1, Math.max(0, (1 - zone - v) / 0.06));
      } else {
        /* The spine. Two octaves — a long swell the width of the sheet, and a
           shorter ripple riding it — over the slide's own lean, so the tear
           wanders up and down across the frame instead of running level. */
        const center =
          mid +
          fall * Math.tanh((u - turn) / TURN_SPAN) +
          ((spine(u * 2.3 + phase, 0.37) - 0.5) * 0.18 +
            (ripple(u * 6.1 + phase, 1.7) - 0.5) * 0.08) *
            room;

        /* Barely a taper any more. It used to pinch the ends so the tear ran
           off the sides rather than closing to a point inside the sheet — but
           the band leaves through the corners now, and pinching those would
           only round off the two edges the composition is built on. */
        const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, (u + 0.06) / 1.12)));
        const swell = (0.88 + 0.12 * taper) * room;
        /*
         * Each lip is its own edge, built from three octaves over LIP: a long
         * one that carries it up or down the sheet, and two shorter ones that
         * break that curve into the staircase of blocks a tear actually leaves.
         * They share no noise, so the two never mirror each other.
         */
        const halfTop =
          (LIP +
            (upperN(u * 1.9, 7.3) - 0.5) * LIP_WANDER +
            (upperN2(u * 4.7, 2.1) - 0.5) * LIP_WANDER * 0.55 +
            (upperN2(u * 10.3, 8.9) - 0.5) * LIP_WANDER * 0.28) *
          swell;
        const halfBot =
          (LIP +
            (lowerN(u * 1.6, 4.1) - 0.5) * LIP_WANDER +
            (lowerN2(u * 4.1, 6.7) - 0.5) * LIP_WANDER * 0.55 +
            (lowerN2(u * 9.7, 3.3) - 0.5) * LIP_WANDER * 0.28) *
          swell;

        openness = Math.min(v - (center - halfTop), center + halfBot - v) + fray;

        /*
         * Both blocks of type repel the cut, on a soft gradient reaching well
         * past each box, so the tear eases away from them rather than running
         * at one and being cut off. Squared, so the repulsion is negligible out
         * where the tear actually lives and only bites as it nears a block.
         *
         * The gradient's own threshold wanders — two octaves along u for the
         * horizontal edges and one along v for the vertical, the shorter one
         * fast enough to break up a stretch the long one leaves level. A
         * boundary set purely in v is a straight edge across the whole sheet,
         * which is the one thing a tear must never look like.
         */
        if (keep) {
          const waveV =
            (edgeN(u * 3.1, 5.5) - 0.5) * 0.10 + (edgeN2(u * 8.3, 1.9) - 0.5) * 0.05;
          const waveU = (edgeN2(v * 3.7, 5.9) - 0.5) * 0.06;
          let sum = 0;
          for (const block of keep) sum += clearance(block, u, v, waveU, waveV);
          const shield = Math.min(1, sum);
          openness -= KEEP_PUSH * shield * shield;
        }
      }

      let closed = openness < 0 ? 1 : 0;
      /*
       * A few blocks stay stuck over the media, like scraps that didn't come
       * away with the rest of the sheet. Sampled at whole-cell coordinates,
       * where the value noise degenerates to its own hash, so these land as
       * isolated single blocks rather than clumps.
       *
       * They are weighted onto the lip, though, and squared so the falloff is
       * steep: openness is a rough distance to the nearest edge, so this reads
       * as "how far into the opening is this cell", in cells. A scrap a couple
       * of cells off the tear still belongs to it — the eye reads it as paper
       * that didn't quite let go. One adrift in the middle of the picture has
       * nothing to have torn from, and reads as a dead pixel instead.
       */
      const lip = Math.max(0, 1 - openness * (rows - 1) / SCRAP_REACH);
      if (!closed && scrap(x, y) > 1 - SCRAP_RATE * lip * lip) closed = 1;
      /*
       * The hard limits, and they wander too: type may not depend on which way
       * the noise fell, but the line that protects it needn't be straight to do
       * its job.
       *
       * A compact sheet guards the one band along its bottom edge and nothing
       * else — up above, the tear runs clean off wherever it likes. A wide one
       * guards its two corners instead, which is exactly what frees the other
       * two for the tear to enter and leave by. The shields above should mean
       * the tear never comes near enough for these to bite, but "should" is not
       * what type stands on.
       */
      const wanderU = (edgeN(v * 2.7, 6.3) - 0.5) * TYPE_WAVE;
      const wanderV = (edgeN2(u * 2.3, 9.1) - 0.5) * TYPE_WAVE;
      if (compact) {
        if (v > 1 - zone + wanderV) closed = 1;
      } else if (keep) {
        for (const block of keep) {
          if (inside(block, u, v, wanderU, wanderV)) {
            closed = 1;
            break;
          }
        }
      }
      pattern[y * cols + x] = closed;
    }
  }
  return pattern;
}

/**
 * Ghost ornament strength per cell: closed cells near the open region get
 * a faint outline, strongest right at the gash's lip and dissolving within
 * a few cells. It also fades out toward the hero's edges, and a noise
 * dapple thins the halo into scattered marks instead of a solid band.
 */
function computeGhostLevels(
  pattern: Uint8Array,
  cols: number,
  rows: number,
  compact: boolean,
  keep: Keep,
): Float32Array {
  // Chebyshev distance from each closed cell to the open region, out to
  // REACH cells, via layered dilation from the open cells.
  const REACH = 4;
  const dist = new Int8Array(cols * rows).fill(-1);
  let frontier: number[] = [];
  for (let i = 0; i < pattern.length; i++) {
    if (!pattern[i]) {
      dist[i] = 0;
      frontier.push(i);
    }
  }
  for (let d = 1; d <= REACH && frontier.length > 0; d++) {
    const next: number[] = [];
    for (const i of frontier) {
      const x = i % cols;
      const y = (i / cols) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
          const j = ny * cols + nx;
          if (dist[j] === -1) {
            dist[j] = d;
            next.push(j);
          }
        }
      }
    }
    frontier = next;
  }

  const band = compact ? COPY_BAND.compact : COPY_BAND.wide;
  const zone = zoneFor(compact, keep);
  const dapple = makeNoise2D(271);
  const levels = new Float32Array(cols * rows);
  for (let i = 0; i < levels.length; i++) {
    const d = dist[i];
    if (d <= 0) continue;
    const x = i % cols;
    const y = (i / cols) | 0;
    const u = x / (cols - 1);
    const v = y / (rows - 1);

    // Keep the type legible: no ghosts over it at all, and a soft gradient
    // fade beyond that so the halo dissolves as it nears rather than cutting
    // off sharply.
    let textFade;
    if (keep && !compact) {
      /*
       * Both blocks, and they need clearing more than the edge fade below
       * provides: the halo reaches REACH cells off the lip, and the lips now
       * run right along the underside of one block and over the top of the
       * other. Cleared outright over a block, then faded across the same
       * feather the pattern turns away over, so the ornament thins out as it
       * approaches rather than stopping at a line of its own.
       */
      let hidden = false;
      let near = 0;
      for (const block of keep) {
        if (inside(block, u, v, 0, 0)) hidden = true;
        near += clearance(block, u, v, 0, 0);
      }
      if (hidden) continue;
      near = Math.min(1, near);
      textFade = 1 - near * near;
    } else {
      // Compact: the one band along the bottom — measured now, like the
      // pattern's own line — padded a touch past that hard core so the halo's
      // REACH doesn't creep in from just outside it, plus a gradient beyond.
      if (v > 1 - zone) continue;
      const textShield = Math.max(0, 1 - (1 - v) / (band * 2));
      textFade = 1 - textShield * textShield;
    }

    // 0 at the hero's edge, 1 once past the outer ~22% band.
    const t = Math.min(1, Math.min(u, 1 - u, v, 1 - v) / 0.22);
    const edgeFade = t * t * (3 - 2 * t);
    const proximity = 1 - (d - 1) / REACH;
    const o = edgeFade * textFade * proximity * (0.2 + 0.8 * dapple(x * 0.45, y * 0.45));
    levels[i] = o < 0.05 ? 0 : o;
  }
  return levels;
}

/** Noise-driven stagger so the close/open creeps like static, not a sweep. */
function computeDelays(seed: number, cols: number, rows: number, spread: number): Float32Array {
  const noise = makeNoise2D(seed);
  const delays = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      delays[y * cols + x] = noise(x * 0.22, y * 0.22) * spread + Math.random() * spread * 0.25;
    }
  }
  return delays;
}

export function Hero() {
  const slides = hero.slides;

  const sources = useMemo(() => slides.map((s) => s.image), [slides]);
  // The slides are CSS backgrounds, so there's no <Image priority> to lean on.
  preload(sources[0], { as: "image", fetchPriority: "high" });

  const [dims, setDims] = useState<Dims | null>(null);
  const [active, setActive] = useState(0);
  /* Bumped the moment a transition is accepted. The clock below keys off this
     rather than off `active`, because `active` only changes when the sheet has
     healed shut over the outgoing slide — most of a second later. Keyed off
     that, the bar would sit pinned at full through the whole close, which
     reads as the carousel hanging at the end of every turn. */
  const [cycle, setCycle] = useState(0);

  /* What the opening tear waits on, and therefore exactly what "the hero is
     live" means: a measured grid to tear. Derived rather than held as its own
     state, so it can never disagree with the layout effect below that acts on
     the same condition. */
  const ready = dims !== null;

  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ghostGridRef = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const dots = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  /* The two blocks the pattern keeps clear of, measured rather than assumed —
     see Keep. */
  const metaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  /* The two things the opening lifts. */
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  /* Deadlines for the stage in flight (see the timings above). Cleared when a
     stage lands on time, and when a new transition supersedes it. */
  const fallbacks = useRef<ReturnType<typeof setTimeout>[]>([]);
  /* The tween filling that bar — the carousel's clock, held here so the
     observer below can pause and resume it. */
  const clockRef = useRef<ReturnType<typeof animate> | null>(null);

  const activeRef = useRef(0);
  const dimsRef = useRef<Dims | null>(null);
  // Closed until the opening tear has run, so nothing can interrupt it.
  const busyRef = useRef(true);
  const firstRef = useRef(true);
  const patternRef = useRef<Uint8Array | null>(null);
  const ghostLevelsRef = useRef<Float32Array | null>(null);
  const reducedRef = useRef(false);
  const visibleRef = useRef(true);

  /* Mirrors for the callbacks and intervals below, which outlive the render
     that created them and must never close over a stale slide or grid. Written
     in a layout effect, and declared above the effect that reads them, so both
     are already current by the time the pattern is applied in the same commit. */
  useLayoutEffect(() => {
    activeRef.current = active;
    dimsRef.current = dims;
  }, [active, dims]);

  const clearFallbacks = () => {
    for (const id of fallbacks.current) clearTimeout(id);
    fallbacks.current = [];
  };

  const fallback = (fn: () => void, after: number) => {
    fallbacks.current.push(setTimeout(fn, after));
  };

  useEffect(() => clearFallbacks, []);

  const blockEls = () => Array.from(gridRef.current?.children ?? []) as HTMLElement[];
  const ghostEls = () => Array.from(ghostGridRef.current?.children ?? []) as HTMLElement[];

  /*
   * Promote exactly the blocks that are about to tween — a compositor layer
   * per animating block keeps the fades off the paint path, while the rest of
   * the grid stays unpromoted so we never park a thousand-odd layers.
   */
  const setWillChange = (targets: HTMLElement[], on: boolean) => {
    for (const el of targets) el.style.willChange = on ? "opacity" : "";
  };

  /*
   * The opening's type: the name in, word by word, and the tagline behind it.
   *
   * Split by word rather than by character. The name is two words, and a
   * per-letter cascade across a display-size heading reads as a effect being
   * performed on the name rather than as the name arriving — which is also why
   * the stagger is a beat rather than a ripple. anime.js's splitter keeps the
   * original text announced (`accessible`, on by default), so what a screen
   * reader gets is still one name and not a list of fragments.
   *
   * Runs once, on mount, and never again: the words are wrapped in the real
   * DOM, and this is the only thing that puts them there.
   */
  useEffect(() => {
    const name = greetingRef.current;
    const tagline = taglineRef.current;
    if (!name || !tagline) return;

    const split = splitText(name, { words: true });
    const words = split.words;

    /*
     * `[data-intro]` holds both of these at opacity 0 from the first paint
     * (globals.css), so nothing is ever seen sitting at its mark before it
     * lifts. The heading is handed back its opacity here and the words take
     * over carrying it — the split has to happen first, or there would be a
     * frame with the name visible and unsplit.
     */
    utils.set(name, { opacity: 1 });
    utils.set(words, { opacity: 0, translateY: INTRO_RISE });
    utils.set(tagline, { opacity: 0, translateY: INTRO_RISE * 0.75 });

    if (reducedRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      utils.set(words, { opacity: 1, translateY: 0 });
      utils.set(tagline, { opacity: 1, translateY: 0 });
      return () => {
        split.revert();
      };
    }

    const lift = animate(words, {
      opacity: 1,
      translateY: 0,
      duration: INTRO_MS,
      ease: INTRO_EASE,
      delay: stagger(INTRO_STAGGER, { start: INTRO_LEAD }),
    });

    /* Behind the last word rather than with it, so the two read as one phrase
       arriving in order and not as two blocks moving together. */
    const follow = animate(tagline, {
      opacity: 1,
      translateY: 0,
      duration: INTRO_MS,
      ease: INTRO_EASE,
      delay: INTRO_LEAD + INTRO_STAGGER * words.length,
    });

    return () => {
      lift.cancel();
      follow.cancel();
      split.revert();
    };
  }, []);

  /*
   * Measure the hero into a block grid; rebuild on resize. clientWidth/Height
   * is the padding box — the same box the absolutely-positioned grids fill —
   * so cells come out square regardless of the hero's own min-height maths.
   * The 1fr tracks stretch with the window mid-drag, then the debounced
   * re-measure snaps the cells back to square once things settle.
   */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const compact = window.innerWidth < 640;
      const target = compact ? 26 : 34;
      const cols = Math.min(60, Math.max(18, Math.round(w / target)));
      const rows = Math.max(10, Math.round(h / (w / cols)));

      /*
       * Where the two blocks of type actually landed, in the sheet's own
       * coordinates, each stretched to the two edges it hangs from — the meta
       * out to the top and right, the copy out to the bottom and left. That
       * stretch is deliberate: leaving a block as an island would let the tear
       * squeeze through the gutter outside it, and a sliver of media in the
       * margin beside a caption reads as a mistake rather than as a tear.
       *
       * Only on a wide sheet. Compact stacks both down the bottom and keeps
       * the single band it always had.
       *
       * Rounded, because this feeds a state comparison — an unrounded fraction
       * would differ in its last decimal on almost every measure and rebuild
       * the whole pattern for a change nobody could see.
       */
      const meta = metaRef.current;
      const copy = copyRef.current;
      let keep: Keep = null;
      if (meta && copy) {
        const sheet = el.getBoundingClientRect();
        const round = (n: number) => Math.round(n * 1000) / 1000;
        const mb = meta.getBoundingClientRect();
        const cb = copy.getBoundingClientRect();
        keep = compact
          ? /* Stacked down the bottom edge, so one band across the sheet from
               wherever the topmost of them starts — the name — held off by
               TYPE_CLEAR. */
            [
              {
                u0: 0,
                u1: 1,
                v0: round(
                  (Math.min(cb.top, mb.top) - sheet.top) / h - TYPE_CLEAR,
                ),
                v1: 1,
              },
            ]
          : [
              {
                u0: round((mb.left - sheet.left) / w),
                u1: 1,
                v0: 0,
                v1: round((mb.bottom - sheet.top) / h),
              },
              {
                u0: 0,
                u1: round((cb.right - sheet.left) / w),
                v0: round((cb.top - sheet.top) / h),
                v1: 1,
              },
            ];
      }

      const same = (a: Keep, b: Keep) =>
        a === b ||
        (!!a &&
          !!b &&
          a.length === b.length &&
          a.every(
            (block, i) =>
              block.u0 === b[i].u0 &&
              block.u1 === b[i].u1 &&
              block.v0 === b[i].v0 &&
              block.v1 === b[i].v1,
          ));

      setDims((d) =>
        d &&
        d.cols === cols &&
        d.rows === rows &&
        d.compact === compact &&
        same(d.keep, keep)
          ? d
          : { cols, rows, compact, keep },
      );
    };

    measure();
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 180);
    });
    observer.observe(el);
    /* Both blocks too, not just the sheet: they are sized by the type inside
       them, so they settle at different dimensions once the webfont lands —
       and the sheet's own box never changes when that happens. */
    if (metaRef.current) observer.observe(metaRef.current);
    if (copyRef.current) observer.observe(copyRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  /*
   * Apply the pattern whenever the grid (re)builds. The very first run is the
   * opening tear and waits for the loader; resizes after that snap instantly,
   * since re-staggering a settled hero mid-drag would read as a glitch.
   */
  useLayoutEffect(() => {
    if (!dims || !gridRef.current) return;
    /* Where a compact sheet's media is cut off — see .media in the stylesheet.
       Published rather than duplicated, so the picture and the pattern can't
       disagree about where the tear ends: --tear-bottom is the deepest any
       cell can open, which is what a phone sizes its slide to. A wide sheet
       needs no such number any more — its media is simply the hero. */
    const host = sectionRef.current;
    host?.style.setProperty("--tear-bottom", String(tearBottom(dims.compact, dims.keep)));
    const els = blockEls();
    const gEls = ghostEls();
    const pattern = computePattern(
      seedFor(activeRef.current),
      dims.cols,
      dims.rows,
      activeRef.current,
      dims.compact,
      dims.keep,
    );
    patternRef.current = pattern;
    const ghostLevels = computeGhostLevels(
      pattern,
      dims.cols,
      dims.rows,
      dims.compact,
      dims.keep,
    );
    ghostLevelsRef.current = ghostLevels;

    if (firstRef.current) {
      firstRef.current = false;

      const reduced = reducedRef.current;
      const openIdx = els.map((_, i) => i).filter((i) => !pattern[i]);
      const delays = computeDelays(
        seedFor(activeRef.current) + 900,
        dims.cols,
        dims.rows,
        reduced ? 0 : REVEAL_SPREAD,
      );
      const openTargets = openIdx.map((i) => els[i]);
      const revealed = once(() => {
        setWillChange(openTargets, false);
        busyRef.current = false;
      });
      setWillChange(openTargets, true);
      animate(openTargets, {
        opacity: 0,
        duration: reduced ? 0 : REVEAL_MS,
        ease: "linear",
        delay: (_t: unknown, k = 0) => (reduced ? 0 : REVEAL_LEAD) + delays[openIdx[k]],
        onComplete: revealed,
      });
      fallback(revealed, reduced ? 60 : REVEAL_TOTAL);
      // Ghosts creep in on the same stagger field as the opening tear.
      const ghostIdx = gEls.map((_, i) => i).filter((i) => ghostLevels[i] > 0);
      const ghostTargets = ghostIdx.map((i) => gEls[i]);
      setWillChange(ghostTargets, true);
      animate(ghostTargets, {
        opacity: (_t: unknown, k = 0) => ghostLevels[ghostIdx[k]],
        duration: reduced ? 0 : REVEAL_MS,
        ease: "linear",
        delay: (_t: unknown, k = 0) => (reduced ? 0 : REVEAL_LEAD) + delays[ghostIdx[k]],
        onComplete: () => setWillChange(ghostTargets, false),
      });
    } else {
      utils.remove(els);
      utils.remove(gEls);
      els.forEach((el, i) => {
        el.style.opacity = pattern[i] ? "1" : "0";
      });
      gEls.forEach((el, i) => {
        el.style.opacity = String(ghostLevels[i]);
      });
      busyRef.current = false;
    }
  }, [dims]);

  // Heal the tear shut over the current slide, swap media, tear the next open.
  const goTo = useCallback((next: number) => {
    const d = dimsRef.current;
    if (!d || busyRef.current || next === activeRef.current) return;
    busyRef.current = true;
    setCycle((c) => c + 1);
    // Nothing from a previous transition may still be pending: this one owns
    // the sheet now, and its own deadlines replace them.
    clearFallbacks();
    const els = blockEls();
    const gEls = ghostEls();
    utils.remove(els);
    utils.remove(gEls);
    const reduced = reducedRef.current;
    const closeDelays = computeDelays(seedFor(next) + 500, d.cols, d.rows, reduced ? 0 : CLOSE_SPREAD);
    /* Only blocks that aren't already fully closed need the close tween — the
       open gash plus any mid-flicker strays, typically a third of the grid
       rather than all of it. */
    const closeIdx = els.map((_, i) => i).filter((i) => els[i].style.opacity !== "1");
    const closeTargets = closeIdx.map((i) => els[i]);

    // The old halo dissolves on the same stagger field as the close.
    const ghostOutIdx = gEls
      .map((_, i) => i)
      .filter((i) => parseFloat(gEls[i].style.opacity || "0") > 0);
    const ghostOutTargets = ghostOutIdx.map((i) => gEls[i]);
    if (ghostOutTargets.length > 0) {
      setWillChange(ghostOutTargets, true);
      animate(ghostOutTargets, {
        opacity: 0,
        duration: reduced ? 60 : CLOSE_MS,
        ease: "linear",
        delay: (_t: unknown, k = 0) => closeDelays[ghostOutIdx[k]],
        onComplete: () => setWillChange(ghostOutTargets, false),
      });
    }

    const onClosed = once(() => {
      // The sheet is whole again, so swapping the media underneath is unseen.
      setActive(next);
      const pattern = computePattern(
        seedFor(next),
        d.cols,
        d.rows,
        next,
        d.compact,
        d.keep,
      );
      patternRef.current = pattern;
      const openIdx = els.map((_, i) => i).filter((i) => !pattern[i]);
      const openDelays = computeDelays(seedFor(next) + 900, d.cols, d.rows, reduced ? 0 : OPEN_SPREAD);
      const openTargets = openIdx.map((i) => els[i]);
      const opened = once(() => {
        setWillChange(openTargets, false);
        busyRef.current = false;
      });
      setWillChange(openTargets, true);
      animate(openTargets, {
        opacity: 0,
        duration: reduced ? 60 : OPEN_MS,
        ease: "linear",
        delay: (_t: unknown, k = 0) => OPEN_LEAD + openDelays[openIdx[k]],
        onComplete: opened,
      });
      fallback(opened, reduced ? 200 : OPEN_TOTAL);
      // New halo creeps in around the next gash, on the open stagger.
      const ghostLevels = computeGhostLevels(pattern, d.cols, d.rows, d.compact, d.keep);
      ghostLevelsRef.current = ghostLevels;
      const ghostInIdx = gEls.map((_, i) => i).filter((i) => ghostLevels[i] > 0);
      const ghostInTargets = ghostInIdx.map((i) => gEls[i]);
      /* A cell can sit in both halos; cancel any still-running fade-out so the
         fade-in owns it (cells only in the old halo finish on their own). */
      utils.remove(ghostInTargets);
      setWillChange(ghostInTargets, true);
      animate(ghostInTargets, {
        opacity: (_t: unknown, k = 0) => ghostLevels[ghostInIdx[k]],
        duration: reduced ? 60 : OPEN_MS,
        ease: "linear",
        delay: (_t: unknown, k = 0) => OPEN_LEAD + openDelays[ghostInIdx[k]],
        onComplete: () => setWillChange(ghostInTargets, false),
      });
    });

    if (closeTargets.length === 0) {
      onClosed();
      return;
    }
    setWillChange(closeTargets, true);
    animate(closeTargets, {
      opacity: 1,
      duration: reduced ? 60 : CLOSE_MS,
      ease: "linear",
      delay: (_t: unknown, k = 0) => closeDelays[closeIdx[k]],
      onComplete: () => {
        setWillChange(closeTargets, false);
        onClosed();
      },
    });
    fallback(onClosed, reduced ? 200 : CLOSE_TOTAL);
  }, []);

  /*
   * Only the slide on show plays. Its still is already painted underneath, so
   * the video simply fades over it once it can play smoothly — and every swap
   * happens while the sheet is closed anyway, so there is never a stalled
   * frame on screen. preload="auto" keeps the others buffering meanwhile.
   *
   * Nothing rolls under reduced motion. There is no longer a control to stop a
   * video with, so the only honest reading of that setting is that the slides
   * stay as the stills they already are.
   */
  const syncVideos = useCallback(() => {
    videos.current.forEach((el, i) => {
      if (!el) return;
      const play = i === activeRef.current && !reducedRef.current && visibleRef.current;

      if (!play) {
        el.pause();
        el.dataset.on = "false";
        return;
      }

      el.play().catch(() => {});
      /* Usually already buffered — every video preloads from mount, and the
         slide it belongs to has been sitting behind closed paper. Falls back
         to waiting rather than revealing a stalled frame, and re-checks on
         arrival in case the carousel moved on while the data did. */
      const show = () => {
        if (i === activeRef.current && !reducedRef.current) el.dataset.on = "true";
      };
      if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) show();
      else el.addEventListener("canplay", show, { once: true });
    });
  }, []);

  useEffect(() => {
    syncVideos();
  }, [active, syncVideos]);

  /*
   * Offscreen, the hero holds: no film playing to nothing, and no clock
   * counting down toward a slide nobody is looking at. Both pick up where they
   * left off on the way back.
   */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        syncVideos();
        if (entry.isIntersecting) clockRef.current?.play();
        else clockRef.current?.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncVideos]);

  /*
   * Auto-advance, and the bar that shows it coming. One clock, not two: the
   * bar's own tween is the timer — it fills over a slide's turn and starts the
   * next transition when it lands — so what the viewer reads can't drift out of
   * step with what the carousel does. Restarts on every accepted transition,
   * which is what hands control back the instant someone picks a slide.
   *
   * Under reduced motion there's no autoplay at all, so there's no countdown to
   * draw and the bar stays empty.
   */
  useEffect(() => {
    const el = timerRef.current;
    if (!ready || !el || slides.length < 2 || reducedRef.current) return;

    utils.set(el, { scaleX: 0 });
    const clock = animate(el, {
      scaleX: 1,
      duration: AUTOPLAY_MS,
      ease: "linear",
      /*
       * Deferred out of anime's own tick, and it has to be. goTo tears down
       * and rebuilds animations across hundreds of block elements — including
       * utils.remove() — and running that from inside a callback the engine
       * fires mid-iteration means mutating the list it is walking. The old
       * setInterval never hit this, because a timer callback lands on its own
       * task, well clear of the frame loop; moving the clock onto the bar's
       * tween is what first put the advance inside it. A microtask is the
       * smallest possible delay that still waits for the tick to unwind.
       */
      onComplete: () => {
        const next = (activeRef.current + 1) % slides.length;
        queueMicrotask(() => goTo(next));
      },
    });
    clockRef.current = clock;
    // Held, not merely ignored, while the hero is off screen — see the
    // observer above, which is also what resumes it.
    if (!visibleRef.current) clock.pause();

    return () => {
      clockRef.current = null;
      clock.pause();
    };
  }, [ready, cycle, goTo, slides.length]);

  // Ambient noise: blocks along the tear's edge flicker open and shut.
  useEffect(() => {
    if (!ready || reducedRef.current) return;
    const id = setInterval(() => {
      const pattern = patternRef.current;
      const d = dimsRef.current;
      if (!pattern || !d || busyRef.current || !visibleRef.current) return;
      const els = blockEls();
      const { cols, rows } = d;
      const edge: number[] = [];
      for (let i = 0; i < pattern.length; i++) {
        const x = i % cols;
        const y = (i / cols) | 0;
        const c = pattern[i];
        if (
          (x > 0 && pattern[i - 1] !== c) ||
          (x < cols - 1 && pattern[i + 1] !== c) ||
          (y > 0 && pattern[i - cols] !== c) ||
          (y < rows - 1 && pattern[i + cols] !== c)
        ) {
          edge.push(i);
        }
      }
      const gEls = ghostEls();
      const levels = ghostLevelsRef.current;
      for (let k = 0; k < 8 && edge.length > 0; k++) {
        const i = edge[(Math.random() * edge.length) | 0];
        const el = els[i];
        if (!el) continue;
        const closed = pattern[i] === 1;
        const inDelay = Math.random() * 350;
        const outDelay = 320 + Math.random() * 500;
        el.style.willChange = "opacity";
        animate(el, {
          opacity: [
            { to: closed ? 0 : 1, duration: 130, delay: inDelay },
            { to: closed ? 1 : 0, duration: 300, delay: outDelay },
          ],
          ease: "linear",
          onComplete: () => {
            el.style.willChange = "";
          },
        });
        /* A ghost riding a flickering block winks out and back on the same
           beats, so no stroke is ever left floating over the media. */
        const gEl = gEls[i];
        const level = levels ? levels[i] : 0;
        if (closed && gEl && level > 0) {
          gEl.style.willChange = "opacity";
          animate(gEl, {
            opacity: [
              { to: 0, duration: 130, delay: inDelay },
              { to: level, duration: 300, delay: outDelay },
            ],
            ease: "linear",
            onComplete: () => {
              gEl.style.willChange = "";
            },
          });
        }
      }
    }, 1200);
    return () => clearInterval(id);
  }, [ready]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const delta =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!delta) return;

      event.preventDefault();
      const next = (active + delta + slides.length) % slides.length;
      goTo(next);
      // Keep the roving focus on whichever dot is now current.
      dots.current?.querySelectorAll("button").item(next)?.focus();
    },
    [active, goTo, slides.length],
  );

  const { ref: wordRef, index: wordIndex } = useWordRotator(hero.highlights);
  /* Rendered hidden behind the visible word to hold the box open, so a short
     option swapping in for a long one doesn't reflow the sentence around it. */
  const longestWord = hero.highlights.reduce((a, b) => (b.length > a.length ? b : a));
  /* Holds the meta block at one width for every slide. Its own width is what
     the pattern keeps clear of, and a block that grew with the caption would
     mean the tear was carved to fit the previous one — the shape is decided at
     the start of a transition, before the new caption is on screen. */
  const longestCaption = hero.slides.reduce((a, b) =>
    b.caption.length > a.caption.length ? b : a,
  ).caption;

  /* Both grids' cells are kept referentially stable across re-renders: an
     `active` change every few seconds must not make React re-diff a thousand
     divs whose opacity anime.js owns imperatively anyway. */
  const blocks = useMemo(
    () =>
      dims
        ? Array.from({ length: dims.cols * dims.rows }, (_, i) => (
            <div key={i} style={{ opacity: 1 }} />
          ))
        : null,
    [dims],
  );

  const ghosts = useMemo(
    () =>
      dims
        ? Array.from({ length: dims.cols * dims.rows }, (_, i) => (
            <div key={i} style={{ opacity: 0 }} />
          ))
        : null,
    [dims],
  );

  const gridStyle = dims
    ? {
        gridTemplateColumns: `repeat(${dims.cols}, 1fr)`,
        gridTemplateRows: `repeat(${dims.rows}, 1fr)`,
      }
    : undefined;

  return (
    <header ref={sectionRef} className={styles.hero} data-ready={ready}>
      <div className={styles.media} aria-hidden={!ready}>
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            className={styles.slide}
            style={{ backgroundImage: `url("${slide.image}")` }}
            data-state={i === active ? "active" : "idle"}
            role={i === active ? "img" : undefined}
            aria-label={i === active ? slide.alt : undefined}
            aria-hidden={i === active ? undefined : true}
          >
            {/* Decorative — the slide's own role/aria-label already covers the
                accessible description, and this is purely a moving version of
                the same background. */}
            {slide.video && (
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                className={styles.slideVideo}
                src={slide.video}
                poster={slide.image}
                muted
                loop
                playsInline
                // No autoPlay: playback is started explicitly, by syncVideos
                // above, so only the slide on show ever has a running clock.
                preload="auto"
                disablePictureInPicture
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>

      {/* The paper: closed blocks hide the media, open ones are the tear. */}
      <div ref={gridRef} className={styles.blocks} aria-hidden style={gridStyle}>
        {blocks}
      </div>

      {/* The ornament that hugs the tear's lip — see computeGhostLevels. */}
      <div ref={ghostGridRef} className={styles.ghosts} aria-hidden style={gridStyle}>
        {ghosts}
      </div>

      <div className={styles.inner}>
        <div className={styles.copy} ref={copyRef}>
          <h1 className={styles.greeting} ref={greetingRef} data-intro>
            {hero.greeting}
          </h1>
          <p className={styles.tagline} ref={taglineRef} data-intro>
            {hero.tagline}{" "}
            <a href="#films" className={styles.highlight}>
              <span className={styles.word}>
                {/* Holds the box open at the width of the longest option, and —
                    being real text in flow — gives the inline-block a baseline
                    that lines up with the rest of the sentence. */}
                <span className={styles.sizer} aria-hidden>
                  {longestWord}
                </span>
                <span
                  ref={wordRef}
                  className={styles.current}
                  // Announces the new word without yanking focus, same pattern
                  // as the slide caption below.
                  aria-live="polite"
                >
                  {hero.highlights[wordIndex]}
                </span>
              </span>
            </a>
          </p>
        </div>

        <div className={styles.meta} ref={metaRef}>
          {/* Announce caption changes without yanking focus. */}
          <p className={styles.caption} aria-live="polite">
            {/* Reserves the width, in flow and never seen — the same trick the
                rotating word uses above, for the same reason. */}
            <span className={styles.captionSizer} aria-hidden>
              {longestCaption}
            </span>
            <a href={`/case-study/${slides[active].slug}`} className={styles.captionLink}>
              {slides[active].caption}
            </a>
          </p>

          <div className={styles.picker}>
            <div
              className={styles.dots}
              ref={dots}
              role="tablist"
              aria-label="Featured work"
              onKeyDown={onKeyDown}
            >
              {slides.map((slide, i) => (
                /* The button is the hit box — a comfortable one, well past the
                   11px mark it draws — and the mark inside carries the look. */
                <button
                  key={slide.image}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={slide.caption}
                  tabIndex={i === active ? 0 : -1}
                  className={styles.dot}
                  onClick={() => goTo(i)}
                >
                  <span className={styles.dotMark} data-active={i === active} />
                </button>
              ))}
            </div>

            {/* The countdown to the next slide. Decorative: the picker above
                already says which slide is showing, and the caption announces
                it when it changes. */}
            <span className={styles.timer} aria-hidden>
              <span ref={timerRef} className={styles.timerFill} />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
