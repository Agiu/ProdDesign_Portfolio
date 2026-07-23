"use client";

import { animate, cubicBezier, utils } from "animejs";
import { useEffect, useRef, useState, type RefObject } from "react";

/** A tile, as fractions of the frame. */
export type Tile = { x: number; y: number; w: number; h: number };

/** Rows of root cells. Columns are derived from the frame's aspect ratio. */
const BASE_ROWS = 3;
/** How many times a root cell may subdivide. */
const MAX_SUB = 2;

/** Time for the fill front to cross from the right edge to the left. */
const SPREAD = 820;
/** How far the fractal noise can pull a tile off that front, either way. */
const JITTER = 460;
/** Extra lag on the smallest tiles, so coarse blocks land before fine detail. */
const REFINE = 200;
/** How long an individual tile takes to snap into place. */
const TILE_MS = 420;
/** How long a tile sits as a solid black block after landing, before resolving. */
const CAP_HOLD = 90;
/** How long that block then takes to dissolve into the image. */
const CAP_FADE = 320;

/*
 * A horizontal drift layered over the fill: the outgoing image slides off to
 * the left while the incoming one settles in from the right, both moving the
 * same way (right → left) as the fill front itself. It's carried by the whole
 * incoming presentation moving as one — the assembly and the active slide it
 * hands off to — so the drift is seamless across the handoff.
 */
/** How far a slide travels as it enters/leaves, as a share of the frame width. */
const SLIDE_SHIFT = 0.06;
/** Beat after the fill begins before the drift starts, so motion trails the reveal. */
const SLIDE_DELAY = 180;
/** How long the drift takes to settle — well inside the fill so it lands before handoff. */
const SLIDE_MS = 1100;

/** Aspect change needed before the tile set is worth rebuilding. */
const ASPECT_EPSILON = 0.08;

const EASE = cubicBezier(0.22, 1, 0.36, 1);

/** Deterministic hash — the same frame always produces the same tiling. */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/* ---------------------------------------------------------------------------
 * The tiles: a quadtree over an aspect-aware root grid.
 *
 * A quadtree alone subdivides in *fraction* space, so every tile inherits the
 * frame's aspect ratio — letterboxed slabs on an ultrawide, tall columns on a
 * phone. So the root cells are laid out as a grid whose column count is derived
 * from the measured aspect ratio, making each root cell roughly square. Halving
 * preserves that, so every tile at every depth stays roughly square, at any
 * resolution.
 *
 * The tile *count* falls out of the same maths: a wide viewport gets more
 * columns and so more tiles, a narrow one fewer. Tile size stays constant
 * instead of the grid being stretched to fit.
 * ------------------------------------------------------------------------- */
function splitChance(depth: number) {
  if (depth >= MAX_SUB) return 0;
  return depth === 0 ? 0.7 : 0.5;
}

export function buildTiles(aspect: number): Tile[] {
  const rows = BASE_ROWS;
  const cols = Math.max(1, Math.round(BASE_ROWS * aspect));
  const cw = 1 / cols;
  const ch = 1 / rows;

  const out: Tile[] = [];

  const walk = (x: number, y: number, w: number, h: number, depth: number) => {
    const stop =
      depth >= MAX_SUB ||
      hash(x * 1000 + depth * 7.3, y * 1000 - depth * 3.1) > splitChance(depth);

    if (stop) {
      out.push({ x, y, w, h });
      return;
    }

    const hw = w / 2;
    const hh = h / 2;
    walk(x, y, hw, hh, depth + 1);
    walk(x + hw, y, hw, hh, depth + 1);
    walk(x, y + hh, hw, hh, depth + 1);
    walk(x + hw, y + hh, hw, hh, depth + 1);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      walk(c * cw, r * ch, cw, ch, 0);
    }
  }

  return out;
}

/* ---------------------------------------------------------------------------
 * The timing: fractal Brownian motion.
 *
 * Plain random delays give TV static — every tile independent, no structure at
 * any scale. fBm sums value noise over four octaves, each at double the
 * frequency and half the amplitude, so the field is self-similar: broad swells
 * with finer detail riding on them. That's what makes the fill advance as
 * organic clustered fronts rather than a straight edge or a fizz of noise.
 *
 * It's sampled in *fraction* space, so the pattern is the same shape on any
 * screen — a wide monitor sees more of the same field, not a stretched one.
 * ------------------------------------------------------------------------- */
function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  // Smoothstep, so cells blend instead of showing the lattice.
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number) {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;

  for (let octave = 0; octave < 4; octave++) {
    sum += amplitude * valueNoise(x * frequency, y * frequency);
    frequency *= 2;
    amplitude *= 0.5;
  }

  return sum; // ~0..1
}

/** Which way the fill front travels across the frame. */
export type FillDirection = "left" | "right" | "down" | "up";

/**
 * When a tile arrives. The front sweeps across the frame; fBm ruffles its edge;
 * small tiles trail the big ones, like a render resolving coarse to fine.
 *
 * `aspect` stretches the noise sampling horizontally so the blobs stay round on
 * a wide frame instead of being smeared across it — independent of which way
 * the front travels, so it's shared across all directions.
 *
 * `direction` defaults to the hero's leftward sweep. Exported (with
 * `buildTiles`) so the loading screen's exit can dissolve its black field along
 * this exact front — the same transition, run in reverse, in any direction.
 */
export function delayFor(
  t: Tile,
  widest: number,
  aspect: number,
  direction: FillDirection = "left",
) {
  const cx = t.x + t.w / 2;
  const cy = t.y + t.h / 2;

  // 0 where the front starts, 1 where it ends — so a tile's position along the
  // axis sets when it lands (or, run in reverse, when it leaves).
  const front =
    direction === "left"
      ? 1 - cx
      : direction === "right"
        ? cx
        : direction === "down"
          ? cy
          : 1 - cy; // up
  const noise = fbm(cx * 5.2 * aspect, cy * 5.2);
  const refine = (1 - t.w / widest) * REFINE;

  return Math.max(0, front * SPREAD + (noise - 0.5) * JITTER + refine);
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The hero's slide transition: the incoming image assembles itself out of
 * fractal tiles, filling in from the right and advancing leftward.
 *
 * Tiles are built on the client from the frame's measured aspect ratio, so they
 * are rendered empty on the server — no hydration mismatch, and nothing to see
 * before the first transition anyway.
 *
 * `onRevealed`, if given, fires with the slide index the instant that slide's
 * still image is fully in place — on first mount, after a reduced-motion snap,
 * and after the tile build completes. This hook has no idea what a caller does
 * with that (it's how Hero.tsx knows when it's safe to fade a video in over the
 * now-settled poster); it only promises "the picture just finished landing."
 */
export function useFractalFill(
  active: number,
  previous: number,
  sources: string[],
  onRevealed?: (index: number) => void,
  /**
   * A slide's video element, if it has one — parallel to `sources`, indexed
   * the same way. When the incoming slide's video is already buffered enough
   * to play, the tiles skip the static duplicate and uncover the live,
   * already-playing video directly instead of assembling a picture that then
   * separately crossfades to video once settled.
   */
  videos?: RefObject<(HTMLVideoElement | null)[]>,
) {
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const assembly = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);

  /*
   * Measure the frame and build a tile set that suits its shape. Rebuilt only
   * when the aspect ratio moves materially — a resize that merely scales the
   * frame needs no new tiles, since they're stored as fractions.
   */
  useEffect(() => {
    const grid = assembly.current;
    if (!grid) return;

    let lastAspect = -1;

    const rebuild = () => {
      const { width, height } = grid.getBoundingClientRect();
      if (!width || !height) return;

      const aspect = width / height;
      if (Math.abs(aspect - lastAspect) < ASPECT_EPSILON) return;

      lastAspect = aspect;
      setTiles(buildTiles(aspect));
    };

    rebuild();
    const observer = new ResizeObserver(rebuild);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  /*
   * `tiles` is a dependency below, so this effect also fires when the tile set
   * is rebuilt. Keying off the slide index — rather than a plain mounted flag —
   * means a rebuild (or a resize) resolves quietly instead of replaying the
   * transition at someone mid-scroll.
   */
  const lastActive = useRef(-1);

  useEffect(() => {
    const target = slides.current[active];
    const grid = assembly.current;
    if (!target || !grid) return;

    const changed = lastActive.current !== -1 && lastActive.current !== active;
    lastActive.current = active;

    const prevSlide = slides.current[previous];

    // Outgoing stays lit beneath the build; everything else is dark. A clip
    // left over from an interrupted live-video reveal is cleared here too. Any
    // leftover drift is zeroed so a slide never re-enters a transition offset.
    slides.current.forEach((el, i) => {
      if (!el) return;
      el.style.clipPath = "";
      utils.set(el, {
        opacity: i === active || i === previous ? 1 : 0,
        translateX: 0,
      });
    });
    utils.set(grid, { translateX: 0 });

    if (!changed || reduced() || tiles.length === 0) {
      utils.set(target, { opacity: 1 });
      utils.set(grid, { opacity: 0 });
      onRevealed?.(active);
      return;
    }

    /*
     * If the incoming slide's video is already playing and buffered, the tiles
     * uncover the live footage instead of assembling a still: the slide is lit
     * at full opacity but clipped to nothing, and the clip region grows
     * tile-by-tile along the same fractal front (see `unclipping` below). The
     * active slide stacks above the outgoing one, so without the clip it would
     * cover the whole frame the instant the transition starts — the video
     * showing on both sides of the front at once.
     *
     * Otherwise, the original path: the incoming slide stays dark and the
     * tiles carry a picture of it until they're done.
     */
    const liveVideo = videos?.current?.[active];
    const isLive = Boolean(
      liveVideo &&
        !liveVideo.paused &&
        liveVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA,
    );

    if (isLive) {
      utils.set(target, { opacity: 1 });
      utils.set(liveVideo!, { opacity: 1 });
      target.style.clipPath = "inset(100%)";
      grid.style.removeProperty("--img");
    } else {
      utils.set(target, { opacity: 0 });
      grid.style.setProperty("--img", `url("${sources[active]}")`);
    }
    utils.set(grid, { opacity: 1 });

    const { width, height } = grid.getBoundingClientRect();
    const aspect = width && height ? width / height : 1;
    const widest = Math.max(...tiles.map((t) => t.w));
    const delayOf = (i: number) => {
      const t = tiles[i];
      return t ? delayFor(t, widest, aspect) : 0;
    };

    /*
     * The horizontal drift. The incoming presentation — the assembly plus the
     * active slide it will hand off to — starts one shift-width right and eases
     * to rest; the outgoing slide beneath eases the same distance left. Each
     * edge the drift exposes is covered by the other layer during the crossover
     * (the incoming's left by the still-lit outgoing, the outgoing's right by
     * the incoming, since the fill front travels leftward), so no dark frame
     * edge shows. Px, from the measured width, so the travel reads the same on
     * any screen. Held at rest through reduced motion by the earlier snap.
     */
    const shift = width * SLIDE_SHIFT;
    utils.set([target, grid], { translateX: shift });
    const driftIn = animate([target, grid], {
      translateX: 0,
      duration: SLIDE_MS,
      delay: SLIDE_DELAY,
      ease: EASE,
    });
    const driftOut = prevSlide
      ? animate(prevSlide, {
          translateX: -shift,
          duration: SLIDE_MS,
          delay: SLIDE_DELAY,
          ease: EASE,
        })
      : null;

    const nodes = Array.from(grid.children) as HTMLElement[];
    // Same order as `tiles`, so index i is tiles[i] for both.
    const caps = nodes
      .map((tile) => tile.querySelector<HTMLElement>("[data-cap]"))
      .filter(Boolean) as HTMLElement[];

    utils.set(nodes, { opacity: 0, scale: 0.55 });
    // Every tile arrives capped — a solid block, not a slice of picture yet.
    utils.set(caps, { opacity: 1 });

    /*
     * The live-video clip. Each tile's patch of the slide is admitted into the
     * clip region at the moment its cap has fully landed — so the swap from
     * outgoing image to live video always happens under a solid black block,
     * and the cap then dissolves into footage that was already there. A 0.5px
     * bleed on every rect keeps sub-pixel rounding from opening seams between
     * neighbours (same trick as the loader's exit wipe).
     */
    let unclipping: ReturnType<typeof animate> | null = null;
    if (isLive) {
      const landAt = tiles.map((_, i) => delayOf(i) + TILE_MS);
      const span = Math.max(...landAt) + 1;
      const rect = (t: Tile) => {
        const x = t.x * width - 0.5;
        const y = t.y * height - 0.5;
        const w = t.w * width + 1;
        const h = t.h * height + 1;
        return `M${x} ${y}h${w}v${h}h${-w}Z`;
      };

      let admitted = 0;
      const clock = { t: 0 };
      unclipping = animate(clock, {
        t: span,
        duration: span,
        ease: "linear",
        onUpdate: () => {
          const arrived = landAt.reduce(
            (n, at) => (at <= clock.t ? n + 1 : n),
            0,
          );
          if (arrived === admitted) return;
          admitted = arrived;
          const d = tiles
            .filter((_, i) => landAt[i] <= clock.t)
            .map(rect)
            .join("");
          target.style.clipPath = d ? `path("${d}")` : "inset(100%)";
        },
        // Every tile has landed, so the union covers the whole frame —
        // dropping the clip changes nothing visually and frees the compositor.
        onComplete: () => {
          target.style.clipPath = "";
        },
      });
    }

    const building = animate(nodes, {
      opacity: [0, 1],
      scale: [0.55, 1],
      duration: TILE_MS,
      ease: EASE,
      // anime.js declares these params optional, so they must be optional here.
      delay: (_target?: unknown, index?: number) => delayOf(index ?? 0),
    });

    /*
     * Each cap dissolves on its own clock, shortly after its own tile has
     * landed — so the image resolves out of black in the fill's wake, tile by
     * tile, rather than the whole frame clearing at once.
     */
    const dissolving = animate(caps, {
      opacity: 0,
      duration: CAP_FADE,
      ease: EASE,
      delay: (_target?: unknown, index?: number) =>
        delayOf(index ?? 0) + TILE_MS + CAP_HOLD,

      /*
       * The handoff hangs off *this* animation, not the tile build: the caps
       * outlive the tiles, and dropping the assembly when the last tile landed
       * would guillotine the dissolves still in flight.
       */
      onComplete: () => {
        utils.set(target, { opacity: 1 });
        target.style.clipPath = "";
        utils.set(grid, { opacity: 0 });
        onRevealed?.(active);
      },
    });

    return () => {
      building.pause();
      dissolving.pause();
      unclipping?.pause();
      driftIn.pause();
      driftOut?.pause();
    };
  }, [active, previous, sources, tiles, onRevealed, videos]);

  return { slides, assembly, tiles };
}
