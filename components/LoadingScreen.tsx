"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, cubicBezier, utils } from "animejs";
import { buildTiles, delayFor, type Tile } from "./useFractalFill";
import styles from "./LoadingScreen.module.css";

/**
 * Site intro loader in the spirit of Marathon's dot-matrix boot symbol: a
 * pixel Seattle skyline (Space Needle centre) rises from the dark, its window
 * lights twinkling and the whole mass slowly breathing, wrapped in a faint
 * field of atmospheric noise. When loading completes the lights sputter out
 * one by one — the city going dark — and then the black field itself breaks
 * apart along the hero's fractal-tile front (useFractalFill's exact geometry
 * and timing, run in reverse) to reveal the site beneath. anime.js drives
 * every layer.
 *
 * Lives in the root layout, so it plays on a hard load and stays put (as null)
 * across in-app navigations. It only plays once per browser tab session —
 * reloading or opening another page in the same tab skips it; closing the tab
 * (or opening a new one) clears the flag, so it's ready to play again.
 */

const SESSION_KEY = "ca-loader-shown";

function hasPlayedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Storage blocked (e.g. private mode) — fail open and just play it.
    return false;
  }
}

function markPlayedThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Nothing to do — worst case it replays next page in this tab.
  }
}

// Runs before paint on the client (unlike useEffect), so a repeat visit within
// the same tab session never flashes the loader before it's hidden. Falls
// back to useEffect during SSR, where useLayoutEffect would warn and no-op.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Deterministic jitter — identical on server and client, so no hydration drift. */
function seed(i: number, salt: number) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

type Cell = { c: number; r: number };

/* ---- Scene geometry ------------------------------------------------------
 * One 53×24 grid, three layers: the skyline silhouette, its window lights,
 * and a faint atmospheric noise scattered through every unoccupied cell.
 */
const COLS = 53;
const ROWS = 24;

/*
 * The Space Needle, hand-drawn at double resolution: antenna (beacon on the
 * tip), flared saucer, long stem, splayed legs. Each entry is one row (top to
 * bottom); values are column offsets from NEEDLE_X. It spans rows 4–23, so it
 * stands a head taller than everything else on the skyline.
 */
const NEEDLE_X = 23;
const NEEDLE_TOP = 4;
const NEEDLE_ROWS: number[][] = [
  [3],
  [3],
  [2, 3, 4],
  [1, 2, 3, 4, 5],
  [0, 1, 2, 3, 4, 5, 6],
  [1, 2, 3, 4, 5],
  [2, 4],
  [3],
  [3],
  [3],
  [3],
  [3],
  [3],
  [2, 4],
  [2, 4],
  [2, 4],
  [1, 5],
  [1, 5],
  [0, 6],
  [0, 6],
];

/* Towers flanking the Needle: x, width, height in rows up from the ground.
 * The 16-row tower is the Columbia Center of the bunch. */
const BUILDINGS = [
  { x: 0, w: 5, h: 7 },
  { x: 6, w: 4, h: 10 },
  { x: 11, w: 6, h: 14 },
  { x: 18, w: 4, h: 8 },
  { x: 31, w: 5, h: 16 },
  { x: 37, w: 4, h: 9 },
  { x: 42, w: 5, h: 12 },
  { x: 48, w: 5, h: 6 },
];

const STRUCTURE: Cell[] = [];
const LIGHTS: Cell[] = [];

NEEDLE_ROWS.forEach((cols, i) => {
  const r = NEEDLE_TOP + i;
  cols.forEach((dx) => {
    // The antenna tip is the tower's beacon; the widest saucer row keeps two
    // observation-deck lights at its rim.
    const isLight = i === 0 || (i === 4 && (dx === 1 || dx === 5));
    (isLight ? LIGHTS : STRUCTURE).push({ c: NEEDLE_X + dx, r });
  });
});

BUILDINGS.forEach(({ x, w, h }, b) => {
  for (let i = 0; i < h; i++) {
    const r = ROWS - 1 - i;
    for (let dx = 0; dx < w; dx++) {
      const c = x + dx;
      // Roof rows stay solid; below them, a seeded scatter of cells glow as
      // lit windows instead of silhouette.
      const isWindow = i < h - 1 && seed(c * 47 + r * 13, b + 11) < 0.42;
      (isWindow ? LIGHTS : STRUCTURE).push({ c, r });
    }
  }
});

// Atmospheric noise: a sparse scatter through every cell the city doesn't
// occupy — sky, gaps between towers — flickering at the edge of visibility.
const occupied = new Set([...STRUCTURE, ...LIGHTS].map(({ c, r }) => `${c},${r}`));
const AMBIENT: Cell[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (occupied.has(`${c},${r}`)) continue;
    if (seed(c * 29 + r * 23, 31) < 0.08) AMBIENT.push({ c, r });
  }
}

const EASE = cubicBezier(0.22, 1, 0.36, 1);
const BREATHE = cubicBezier(0.45, 0, 0.55, 1);
const SNUFF = cubicBezier(0.6, 0, 0.85, 0.2);

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);
  // The exit wipe's tile set: state renders it, the ref feeds the animation
  // maths (the effect closure would otherwise see the stale first-render []).
  const [tiles, setTiles] = useState<Tile[]>([]);
  const tilesBuilt = useRef<Tile[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLParagraphElement>(null);
  const structRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lightRef = useRef<(HTMLSpanElement | null)[]>([]);
  const ambientRef = useRef<(HTMLSpanElement | null)[]>([]);
  const tileRef = useRef<(HTMLSpanElement | null)[]>([]);

  useIsomorphicLayoutEffect(() => {
    // Gate first, before any DOM setup — this runs before the browser paints,
    // so a repeat visit within the same tab session never flashes the loader.
    if (hasPlayedThisSession()) {
      setVisible(false);
      return;
    }
    markPlayedThisSession();

    // Build the exit wipe's tiles from the viewport's shape — the same
    // aspect-aware quadtree the hero assembles its slides from.
    const built = buildTiles(window.innerWidth / Math.max(1, window.innerHeight));
    tilesBuilt.current = built;
    setTiles(built);

    const structure = structRef.current.filter(Boolean) as HTMLSpanElement[];
    const lights = lightRef.current.filter(Boolean) as HTMLSpanElement[];
    const ambient = ambientRef.current.filter(Boolean) as HTMLSpanElement[];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MIN_MS = reduce ? 500 : 3000;

    document.documentElement.style.overflow = "hidden";
    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    if (!loaded) window.addEventListener("load", onLoad);

    utils.set(structure, { opacity: 0 });
    utils.set(lights, { opacity: 0, scale: 0.6 });
    utils.set(ambient, { opacity: 0 });

    let breathe: ReturnType<typeof animate> | null = null;
    let twinkle: ReturnType<typeof animate> | null = null;

    // Skyline: the silhouette rises from the ground, row by row, then the
    // whole mass settles into a slow luminance breathe.
    const rise = animate(structure, {
      opacity: (_t?: unknown, i?: number) => [0, 0.26 + seed(i ?? 0, 4) * 0.12],
      duration: reduce ? 1 : 420,
      ease: EASE,
      delay: reduce
        ? 0
        : (_t?: unknown, i?: number) =>
            (ROWS - 1 - STRUCTURE[i ?? 0].r) * 40 + seed(i ?? 0, 5) * 120,
      onComplete: () => {
        if (reduce) return;
        breathe = animate(structure, {
          opacity: (_t?: unknown, i?: number) => 0.14 + seed(i ?? 0, 14) * 0.3,
          duration: (_t?: unknown, i?: number) => 1600 + seed(i ?? 0, 15) * 2200,
          delay: (_t?: unknown, i?: number) => seed(i ?? 0, 16) * 900,
          ease: BREATHE,
          loop: true,
          alternate: true,
        });
      },
    });

    // Windows flick on scattered across the city, then settle into a twinkle.
    const glow = animate(lights, {
      opacity: (_t?: unknown, i?: number) => [0, 0.7 + seed(i ?? 0, 6) * 0.3],
      scale: [0.6, 1],
      duration: reduce ? 1 : 260,
      ease: EASE,
      delay: reduce ? 0 : (_t?: unknown, i?: number) => 480 + seed(i ?? 0, 7) * 900,
      onComplete: () => {
        if (reduce) return;
        twinkle = animate(lights, {
          opacity: (_t?: unknown, i?: number) => 0.22 + seed(i ?? 0, 8) * 0.3,
          duration: (_t?: unknown, i?: number) => 350 + seed(i ?? 0, 9) * 900,
          delay: (_t?: unknown, i?: number) => seed(i ?? 0, 10) * 600,
          ease: BREATHE,
          loop: true,
          alternate: true,
        });
      },
    });

    // Atmosphere: faint noise cells drifting in and out of visibility, always.
    const flicker = reduce
      ? null
      : animate(ambient, {
          opacity: (_t?: unknown, i?: number) => [0, 0.05 + seed(i ?? 0, 17) * 0.13],
          duration: (_t?: unknown, i?: number) => 500 + seed(i ?? 0, 18) * 1400,
          delay: (_t?: unknown, i?: number) => seed(i ?? 0, 19) * 1500,
          ease: BREATHE,
          loop: true,
          alternate: true,
        });

    const start = performance.now();
    let raf = 0;
    let done = false;

    const finish = () => {
      setVisible(false);
      document.documentElement.style.overflow = "";
    };

    /*
     * The finale: the black field breaks apart along the hero's fractal front.
     * The solid background is swapped for its tiled copy — visually identical,
     * so the cut is invisible — then the tiles leave exactly the way the
     * hero's arrive (same quadtree, same fBm delay field, same ease and
     * duration), uncovering the already-rendered hero beneath.
     */
    const startWipe = () => {
      const overlay = overlayRef.current;
      const tileEls = tileRef.current.filter(Boolean) as HTMLSpanElement[];
      const wipeTiles = tilesBuilt.current;

      if (!overlay) return finish();
      if (reduce || tileEls.length === 0 || wipeTiles.length === 0) {
        animate(overlay, {
          opacity: 0,
          duration: reduce ? 160 : 420,
          ease: EASE,
          onComplete: finish,
        });
        return;
      }

      utils.set(tileEls, { opacity: 1, scale: 1 });
      overlay.style.background = "transparent";
      // The page is live the moment it starts showing through.
      overlay.style.pointerEvents = "none";

      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const widest = Math.max(...wipeTiles.map((t) => t.w));

      animate(tileEls, {
        opacity: 0,
        scale: 0.55,
        duration: 420,
        ease: EASE,
        // Reversed handoff, flowing downward: the top tiles leave first so the
        // black field drains top-to-bottom, uncovering the hero beneath.
        delay: (_t?: unknown, i?: number) =>
          delayFor(wipeTiles[i ?? 0], widest, aspect, "down"),
        onComplete: finish,
      });
    };

    const runExit = () => {
      breathe?.pause();
      twinkle?.pause();
      flicker?.pause();

      // The readout bows out with the city, so the wipe carries no text.
      if (readoutRef.current) {
        animate(readoutRef.current, {
          opacity: 0,
          duration: reduce ? 1 : 260,
          ease: EASE,
        });
      }
      // The atmosphere clears…
      animate(ambient, {
        opacity: 0,
        duration: reduce ? 1 : 200,
        ease: SNUFF,
        delay: reduce ? 0 : (_t?: unknown, i?: number) => seed(i ?? 0, 20) * 300,
      });
      // …the city goes dark, each window sputtering out on its own beat…
      animate(lights, {
        opacity: 0,
        scale: 0.5,
        duration: reduce ? 1 : 240,
        ease: SNUFF,
        delay: reduce ? 0 : (_t?: unknown, i?: number) => seed(i ?? 0, 11) * 520,
      });
      // …and the silhouette dissolves behind them, handing off to the wipe.
      animate(structure, {
        opacity: 0,
        duration: reduce ? 1 : 380,
        ease: EASE,
        delay: reduce ? 0 : (_t?: unknown, i?: number) => 260 + seed(i ?? 0, 12) * 340,
        onComplete: startWipe,
      });
    };

    const tick = (now: number) => {
      const t = Math.min((now - start) / MIN_MS, 1);
      const shown = loaded ? t : Math.min(t, 0.9);
      setPct(Math.round(shown * 100));
      if (t >= 1 && loaded && !done) {
        done = true;
        runExit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      rise.pause();
      glow.pause();
      breathe?.pause();
      twinkle?.pause();
      flicker?.pause();
      window.removeEventListener("load", onLoad);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className={styles.matrix} aria-hidden>
        {AMBIENT.map(({ r, c }, i) => (
          <span
            key={`a-${r}-${c}`}
            ref={(el) => {
              ambientRef.current[i] = el;
            }}
            className={styles.ambient}
            style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
          />
        ))}
        {STRUCTURE.map(({ r, c }, i) => (
          <span
            key={`s-${r}-${c}`}
            ref={(el) => {
              structRef.current[i] = el;
            }}
            className={styles.structure}
            style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
          />
        ))}
        {LIGHTS.map(({ r, c }, i) => (
          <span
            key={`l-${r}-${c}`}
            ref={(el) => {
              lightRef.current[i] = el;
            }}
            className={styles.light}
            style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
          />
        ))}
      </div>
      <p className={styles.readout} ref={readoutRef}>
        <span className={styles.label}>Connecting</span>
        <span className={styles.pct}>{String(pct).padStart(3, "0")}</span>
      </p>

      {/* The exit wipe: a tiled copy of the black field, hidden until the
          hand-off, then dissolved along the hero's fractal front. */}
      <div className={styles.wipe} aria-hidden>
        {tiles.map((t, i) => (
          <span
            key={i}
            ref={(el) => {
              tileRef.current[i] = el;
            }}
            className={styles.wipeTile}
            style={{
              // A hairline of overlap on every edge: adjacent tiles round their
              // shared border to different device pixels, and with nothing but
              // the live page behind this transparent-backed grid, that gap
              // reads as a visible seam. Bleeding same-colour tile into
              // same-colour tile hides it.
              left: `calc(${t.x * 100}% - 0.5px)`,
              top: `calc(${t.y * 100}% - 0.5px)`,
              width: `calc(${t.w * 100}% + 1px)`,
              height: `calc(${t.h * 100}% + 1px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
