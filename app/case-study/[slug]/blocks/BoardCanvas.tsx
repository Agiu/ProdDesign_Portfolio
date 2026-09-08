"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FigureImage } from "../FigureImage";
import styles from "../CaseStudy.module.css";

/**
 * The `board` custom block — `src | title | context` per line, rendered as a
 * pannable, zoomable jam board of pinned notes rather than a figure stack.
 *
 * The point is the mess. These are four people's concepts for the same brief,
 * made in parallel and pulling in different directions — a vertical run of
 * captioned figures reads them as a sequence of decisions, which is exactly
 * what they weren't. Scattered across one surface at angles, they read as
 * what the section says they were: a wall of competing ideas nobody had
 * reconciled yet.
 *
 * Interaction, in order of how much it's worth:
 *   - drag anywhere to pan; buttons, ctrl/trackpad-pinch wheel, or a
 *     two-finger touch pinch to zoom;
 *   - click a note for its context, and from there the standard
 *     click-to-zoom lightbox every other case-study image has (FigureImage).
 *
 * Two deliberate restraints on that. Plain wheel is left alone — a canvas
 * that eats the scroll wheel traps a reader mid-article — so only ctrl-wheel
 * (which is also what a trackpad pinch sends) zooms. And `touch-action:
 * pan-y` on the viewport (see .boardViewport) leaves vertical swipes to the
 * page, so a phone can still scroll past this; horizontal drags pan it, and
 * that same property is what stops the browser's own native pinch-zoom (of
 * the whole page) from fighting the two-finger handling implemented here.
 *
 * Every note is a real <button>, so none of the above is load-bearing:
 * tabbing to a note and hitting Enter opens the same context panel that a
 * click does, without any pan or zoom involved.
 *
 * `data-nav-fade` is read by Toc.tsx — the sticky Navigation rail sits in the
 * column this breaks out of, so it fades out while the board is on screen
 * (see PersonaCarousel.tsx, which does the same, and the layout effect below
 * for why the bleed itself is measured rather than a `calc()`).
 */

type Note = { src: string; title: string; body: string };

function parseNotes(content: string): Note[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src = "", title = "", body = ""] = line
        .split("|")
        .map((part) => part.trim());
      return { src, title, body };
    })
    .filter((note) => note.src);
}

/** FNV-1a string hash → 32-bit seed. Same pair as ListBlock.tsx. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Board geometry, in canvas units (CSS px at scale 1). The grid is the part
   that guarantees notes never cover each other; the jitter is what stops it
   looking like a grid. CELL is deliberately larger than NOTE — that slack is
   what the jitter spends. */
const NOTE = { w: 264, h: 252 };
const CELL = { w: 330, h: 318 };
const PAD = 72;
const JITTER = { x: 30, y: 22, rot: 5.5 };
const SCALE = { min: 0.3, max: 2.5 };
/** Floor for the opening view only — see `fit`. Pinching can still go lower. */
const FIT_MIN = 0.5;
const TINTS = 5;
/** Base cell sizes (at scale 1) for .boardGrid's two background-image
 *  layers — the dot pattern, then the two line layers, which share a size.
 *  Kept here, not just in the CSS, so the pan/zoom tracking below can't
 *  drift out of step with the pattern it's supposed to be scaling. */
const GRID = { dot: 96, line: 24 };

type Placed = Note & { x: number; y: number; rot: number; tint: number };

/**
 * Deterministic placement — seeded off the block's own text, so the scatter
 * is stable between server and client (no hydration mismatch) and stable
 * across renders, while still differing from any other board on the site.
 */
function layout(notes: Note[], seed: number) {
  // Four across before wrapping, rather than a square-ish grid: the viewport
  // this lands in is always far wider than it is tall (see .boardViewport's
  // height clamp), and a square board fitted into it wastes most of the width
  // on empty surface either side.
  const cols = Math.max(1, Math.min(notes.length, 4));
  const rows = Math.ceil(notes.length / cols);
  const rand = mulberry32(seed);

  const placed: Placed[] = notes.map((note, i) => ({
    ...note,
    x: PAD + (i % cols) * CELL.w + (rand() * 2 - 1) * JITTER.x,
    y: PAD + Math.floor(i / cols) * CELL.h + (rand() * 2 - 1) * JITTER.y,
    rot: (rand() * 2 - 1) * JITTER.rot,
    tint: i % TINTS,
  }));

  return {
    placed,
    width: PAD * 2 + (cols - 1) * CELL.w + NOTE.w,
    height: PAD * 2 + (rows - 1) * CELL.h + NOTE.h,
  };
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

type View = { x: number; y: number; scale: number };

export function BoardCanvas({ content }: { content: string }) {
  const notes = parseNotes(content);
  const { placed, width, height } = layout(notes, hashString(content));

  const board = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const noteButtons = useRef<(HTMLButtonElement | null)[]>([]);

  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [active, setActive] = useState<number | null>(null);
  // Measured left edge of the content column — see PersonaCarousel.tsx for
  // why the bleed can't be a `calc()` on this layout.
  const [inset, setInset] = useState<number | null>(null);

  // Set once the reader has panned or zoomed, so a later resize re-fits the
  // board only while they haven't taken it somewhere themselves.
  const touched = useRef(false);
  // Whether the current drag has travelled far enough to actually pan —
  // below the threshold it's still a press-in-progress, gated so a frame of
  // sub-pixel jitter mid-click doesn't start a pan.
  const moved = useRef(false);
  // Every pointer currently down on the viewport, keyed by id. Its size is
  // what tells a single finger's pan from a two-finger pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ id: number; startX: number; startY: number } | null>(
    null,
  );
  const pinch = useRef<{ dist: number; mx: number; my: number } | null>(null);

  useLayoutEffect(() => {
    const el = board.current;
    const column = el?.closest<HTMLElement>(`.${styles.content}`);
    if (!column) return;

    const measure = () => setInset(column.getBoundingClientRect().left);
    measure();

    window.addEventListener("resize", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(column);

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  /**
   * Whole board centred in the viewport, never enlarged past 1:1.
   *
   * Floored at FIT_MIN rather than at SCALE.min: on a phone the true
   * fit-everything scale is around 0.25, where a note is a stamp and the
   * labels are unreadable. Better to open at a size worth looking at, showing
   * the middle of the board, and let the reader pan out to the rest — which
   * is what a board does on a small screen anyway.
   */
  const fit = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    if (!vw || !vh) return;

    const scale = clamp(
      Math.min((vw - 32) / width, (vh - 32) / height),
      FIT_MIN,
      1,
    );
    setView({
      x: (vw - width * scale) / 2,
      y: (vh - height * scale) / 2,
      scale,
    });
  }, [width, height]);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!touched.current) fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  /*
   * Zoom is attached by hand rather than through onWheel because it has to be
   * a non-passive listener to preventDefault, and React's own wheel handler
   * is registered passive. Plain wheel deliberately falls through to the page.
   */
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      touched.current = true;

      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;

      setView((v) => {
        const scale = clamp(v.scale * factor, SCALE.min, SCALE.max);
        const k = scale / v.scale;
        // Keep whatever sits under the pointer under the pointer.
        return { x: px - (px - v.x) * k, y: py - (py - v.y) * k, scale };
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Escape closes the context panel, and focus goes back to the note it came
  // from so a keyboard reader doesn't get dropped at the top of the document.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const index = active;
      setActive(null);
      noteButtons.current[index]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  if (notes.length === 0) return null;

  const zoomBy = (factor: number) => {
    const el = viewport.current;
    if (!el) return;
    touched.current = true;
    const px = el.clientWidth / 2;
    const py = el.clientHeight / 2;
    setView((v) => {
      const scale = clamp(v.scale * factor, SCALE.min, SCALE.max);
      const k = scale / v.scale;
      return { x: px - (px - v.x) * k, y: py - (py - v.y) * k, scale };
    });
  };

  /*
   * setPointerCapture retargets every event that follows a captured
   * pointer — including the browser's own click — to the element that
   * called it. Capturing unconditionally on every press (the previous
   * version of this) meant the zoom buttons' own clicks got hijacked and
   * fired on .boardViewport instead of the button, i.e. never ran their
   * handler. So: a *first* pointer that lands on a button is left alone
   * entirely — never captured, never added to `pointers` — and the button's
   * native click behaves exactly as it would outside this component. A
   * second finger always joins the gesture regardless of what it lands on,
   * because at that point it's a pinch, not a tap.
   */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (active !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (
      pointers.current.size === 0 &&
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }

    viewport.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      drag.current = null;
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mx: (a.x + b.x) / 2,
        my: (a.y + b.y) / 2,
      };
    } else if (pointers.current.size === 1) {
      moved.current = false;
      drag.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Two fingers: pinch-zoom, anchored at their midpoint, with the
    // midpoint's own movement carried through as a pan — so a pinch that
    // drifts sideways zooms and pans in one motion, the way a map app does.
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const p = pinch.current;

      touched.current = true;
      moved.current = true;

      setView((v) => {
        const cx = (p.mx - v.x) / v.scale;
        const cy = (p.my - v.y) / v.scale;
        const scale = clamp(v.scale * (dist / p.dist), SCALE.min, SCALE.max);
        return { x: mx - cx * scale, y: my - cy * scale, scale };
      });

      pinch.current = { dist, mx, my };
      return;
    }

    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;

    // Below the threshold this is still a press in progress, measured from
    // the original touch point rather than frame to frame, so a slow drift
    // past it doesn't take several frames longer to register than a fast one.
    if (!moved.current && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) <= 4) {
      return;
    }

    moved.current = true;
    touched.current = true;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    if (viewport.current?.hasPointerCapture?.(e.pointerId)) {
      viewport.current.releasePointerCapture(e.pointerId);
    }

    if (pointers.current.size >= 2) {
      // A third finger let go mid-pinch — reseed against whichever two
      // are still down instead of stopping the gesture.
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mx: (a.x + b.x) / 2,
        my: (a.y + b.y) / 2,
      };
      drag.current = null;
    } else if (pointers.current.size === 1) {
      // One finger lifted out of a pinch — hand off to a single-finger pan
      // with the remaining finger rather than stopping dead.
      pinch.current = null;
      const [[id, p]] = pointers.current;
      drag.current = { id, startX: p.x, startY: p.y };
      moved.current = true;
    } else {
      pinch.current = null;
      drag.current = null;
    }
  };

  const note = active === null ? null : placed[active];

  return (
    <div
      className={styles.board}
      data-nav-fade
      ref={board}
      style={inset !== null ? { marginLeft: `${-inset}px` } : undefined}
    >
      <div
        className={styles.boardViewport}
        ref={viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="group"
        aria-label="Concept board — drag to pan, or open a note for its context"
      >
        {/*
          Everything pannable lives inside this one masked stage — see
          .boardStage — so the grid and the notes fade out together right
          where overflow would otherwise clip a note mid-image.
        */}
        <div className={styles.boardStage}>
          {/*
            Tracks .boardCanvas's own transform by hand (same view.x/y/scale)
            instead of sharing that transform directly — see the comment on
            .boardGrid for why: this box's own edges have to stay put at the
            viewport's, so the stage's mask keeps fading the same real
            distance in from the edge regardless of pan or zoom.
          */}
          <div
            className={styles.boardGrid}
            aria-hidden
            style={{
              backgroundPosition: `${view.x}px ${view.y}px`,
              backgroundSize: [GRID.dot, GRID.line, GRID.line]
                .map((base) => `${base * view.scale}px ${base * view.scale}px`)
                .join(", "),
            }}
          />

          <div
            className={styles.boardCanvas}
            style={{
              width,
              height,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            }}
          >
            {placed.map((item, i) => (
              <button
                key={`${item.src}-${i}`}
                type="button"
                ref={(el) => {
                  noteButtons.current[i] = el;
                }}
                className={styles.boardNote}
                style={
                  {
                    "--x": `${item.x}px`,
                    "--y": `${item.y}px`,
                    "--rot": `${item.rot}deg`,
                    "--tint": `var(--board-tint-${item.tint})`,
                  } as CSSProperties
                }
                onClick={() => setActive(i)}
                aria-label={`Open ${item.title || "concept"}`}
              >
                <span className={styles.boardNoteFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className={styles.boardNoteImg}
                  />
                </span>
                {item.title && (
                  <span className={styles.boardNoteLabel}>{item.title}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.boardTools}>
          <p className={styles.boardHint}>Drag to pan · ⌘/ctrl + scroll to zoom</p>
          <div className={styles.boardZoom}>
            <button
              type="button"
              className={styles.boardZoomButton}
              onClick={() => zoomBy(1 / 1.3)}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className={styles.boardZoomButton}
              onClick={() => {
                touched.current = false;
                fit();
              }}
            >
              Fit
            </button>
            <button
              type="button"
              className={styles.boardZoomButton}
              onClick={() => zoomBy(1.3)}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>

        {/* Sibling of the canvas, never a child of it: the canvas carries a
            transform, and a transformed ancestor would trap the lightbox's
            own `position: fixed` inside this box. */}
        {note && (
          <div
            className={styles.boardDetail}
            role="dialog"
            aria-modal="true"
            aria-label={note.title || "Concept"}
            onClick={() => setActive(null)}
          >
            <div
              className={styles.boardDetailCard}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.boardDetailClose}
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              </button>

              <FigureImage
                src={note.src}
                alt={note.body || note.title}
                className={styles.boardDetailImg}
              />

              <div className={styles.boardDetailText}>
                {note.title && (
                  <h4 className={styles.boardDetailTitle}>{note.title}</h4>
                )}
                {note.body && (
                  <p className={styles.boardDetailBody}>{note.body}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
