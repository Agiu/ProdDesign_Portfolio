"use client";

import { preload } from "react-dom";
import { animate, cubicBezier } from "animejs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hero } from "@/content/home";
import { useParallax } from "./useParallax";
import { useFractalFill } from "./useFractalFill";
import { useTape } from "./useTape";
import { useWordRotator } from "./useWordRotator";
import styles from "./Hero.module.css";

const AUTOPLAY_MS = 6000;
const VIDEO_FADE_MS = 600;
const EASE = cubicBezier(0.22, 1, 0.36, 1);

/*
 * Tiles are positioned in percentages, so adjacent edges rasterize to device
 * pixels independently and rounding can leave a hairline gap between neighbours
 * — the darker layer behind then shows through as thin seams as the fill sweeps
 * left. Bleeding every tile outward by a fixed sub-pixel amount makes neighbours
 * overlap instead of butt, closing the seam. Same trick the live-video clip
 * already uses on its rects (see useFractalFill.ts); the image scales with the
 * tile, so it still fills to the (now-overlapping) edge. Fixed px, not a percent
 * scale, so the overlap is uniform whatever the tile's size.
 */
const TILE_BLEED = 0.75;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Hero() {
  const media = useParallax<HTMLDivElement>();
  const slides = hero.slides;

  const sources = useMemo(() => slides.map((s) => s.image), [slides]);

  // The slides are CSS backgrounds, so there's no <Image priority> to lean on.
  preload(sources[0], { as: "image", fetchPriority: "high" });

  /*
   * A slide's video (if it has one) starts autoplaying — muted, so browsers
   * allow it without a user gesture — the moment it mounts, and just sits
   * hidden at opacity 0 underneath the poster while it buffers. That means
   * revealing it is purely a visual fade, never a playback restart: by the
   * time the tile assembly below finishes, it's usually already rolling.
   */
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  /*
   * The motion toggle. State drives the button's label; the ref is what the
   * callbacks consult, so flipping it doesn't change revealVideo's identity
   * and needlessly re-run the transition effect that depends on it. When off,
   * every video is paused — which also makes useFractalFill's live-video check
   * (`!video.paused`) fall back to assembling stills.
   */
  const [motionOn, setMotionOn] = useState(true);
  const motionRef = useRef(true);

  const revealVideo = useCallback(
    (index: number) => {
      const src = slides[index]?.video;
      const el = videos.current[index];
      if (!src || !el || reduced() || !motionRef.current) return;

      const fadeIn = () => {
        animate(el, { opacity: 1, duration: VIDEO_FADE_MS, ease: EASE });
      };

      // Usually already true — the tile assembly gives it a couple of seconds'
      // head start to buffer. Falls back to waiting if the connection is slow,
      // rather than revealing a still-stalled frame.
      if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        fadeIn();
      } else {
        el.addEventListener("canplay", fadeIn, { once: true });
      }
    },
    [slides],
  );

  /*
   * The outgoing slide stays visible beneath the assembling one — the tiles
   * build up over it. So we track which slide we just left, not only the one
   * we're on.
   */
  const [{ active, previous }, setSlide] = useState({ active: 0, previous: 0 });
  const {
    slides: slideRefs,
    assembly,
    tiles,
  } = useFractalFill(active, previous, sources, revealVideo, videos);

  // Focus is treated as hover, so the tape parts for keyboard users too.
  const [hovered, setHovered] = useState<number | null>(null);
  const tape = useTape(slides.length, active, hovered);

  const go = useCallback((next: number) => {
    setSlide((s) =>
      s.active === next ? s : { active: next, previous: s.active },
    );
  }, []);

  // Pausing fades every video out to its fallback still, then halts playback;
  // resuming restarts them all (muted, so no gesture needed) and fades the
  // active slide's back in once it can play.
  const toggleMotion = useCallback(() => {
    const next = !motionRef.current;
    motionRef.current = next;
    setMotionOn(next);

    videos.current.forEach((el) => {
      if (!el) return;
      if (next) {
        el.play().catch(() => {});
      } else {
        animate(el, {
          opacity: 0,
          duration: VIDEO_FADE_MS,
          ease: EASE,
          onComplete: () => el.pause(),
        });
      }
    });

    if (next) revealVideo(active);
  }, [active, revealVideo]);

  // Autoplay is a nicety, not the point — any interaction hands control back.
  const [paused, setPaused] = useState(false);

  const { ref: wordRef, index: wordIndex } = useWordRotator(hero.highlights);
  // Rendered hidden behind the visible word to hold the box open, so a short
  // option swapping in for a long one doesn't reflow the sentence around it.
  const longestWord = hero.highlights.reduce((a, b) =>
    b.length > a.length ? b : a,
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(
      () =>
        setSlide((s) => ({
          active: (s.active + 1) % slides.length,
          previous: s.active,
        })),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const ticks = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const delta =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!delta) return;

      event.preventDefault();
      const next = (active + delta + slides.length) % slides.length;
      go(next);
      // Keep the roving focus on whichever tick is now current.
      ticks.current?.querySelectorAll("button").item(next)?.focus();
    },
    [active, go, slides.length],
  );

  return (
    <header
      className={styles.hero}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.media} ref={media}>
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={styles.slide}
            style={{ backgroundImage: `url("${slide.image}")` }}
            data-state={
              i === active ? "active" : i === previous ? "previous" : "idle"
            }
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
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                disablePictureInPicture
                aria-hidden
              />
            )}
          </div>
        ))}

        {/*
         * The assembly. Each tile is a window clipped to its own patch of the
         * frame, and inside it sits a full-size, cover-fitted copy of the
         * incoming image pushed back into place with negative offsets. So every
         * tile shows exactly the slice of the picture that belongs to it, at
         * exactly the crop the finished slide will use — no aspect maths, and
         * nothing to drift out of step with `background-size: cover`.
         *
         * The tile set is built on the client from the frame's measured aspect
         * ratio, so it's empty on the server and on first paint. That's fine:
         * there is no transition to show until a slide actually changes.
         *
         * One assembly, reused for every transition; the URL swaps on --img.
         */}
        <div className={styles.assembly} ref={assembly} aria-hidden>
          {tiles.map((t, i) => (
            <span
              key={i}
              className={styles.tile}
              style={{
                left: `calc(${t.x * 100}% - ${TILE_BLEED}px)`,
                top: `calc(${t.y * 100}% - ${TILE_BLEED}px)`,
                width: `calc(${t.w * 100}% + ${TILE_BLEED * 2}px)`,
                height: `calc(${t.h * 100}% + ${TILE_BLEED * 2}px)`,
              }}
            >
              <span
                className={styles.tileImage}
                style={{
                  // Blow the image up to the full frame, then shove this tile's
                  // corner back to the origin.
                  width: `${(1 / t.w) * 100}%`,
                  height: `${(1 / t.h) * 100}%`,
                  left: `${(-t.x / t.w) * 100}%`,
                  top: `${(-t.y / t.h) * 100}%`,
                }}
              />
              <span className={styles.cap} data-cap />
            </span>
          ))}
        </div>
      </div>
      <div className={styles.scrim} aria-hidden />

      {slides.some((s) => s.video) && (
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.motionToggle}
            onClick={toggleMotion}
            aria-pressed={motionOn}
            aria-label={
              motionOn ? "Pause background videos" : "Play background videos"
            }
          >
            <span aria-hidden>{motionOn ? "❚❚" : "▶"}</span>
          </button>
        </div>
      )}

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.greeting}>{hero.greeting}</h1>
          <p className={styles.tagline}>
            {hero.tagline}{" "}
            <a href="#films" className={styles.highlight}>
              <span className={styles.word}>
                {/* Holds the box open at the width of the longest option, and —
                    being real text in flow — gives the inline-block a baseline
                    that lines up with the rest of the sentence. */}
                <span className={styles.ghost} aria-hidden>
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

        <div className={styles.meta}>
          {/* Announce caption changes without yanking focus. */}
          <p className={styles.caption} aria-live="polite">
            <a href={`/case-study/${slides[active].slug}`} className={styles.captionLink}>
              {slides[active].caption}
            </a>
          </p>

          <div
            className={styles.ticks}
            ref={ticks}
            role="tablist"
            aria-label="Featured work"
            onKeyDown={onKeyDown}
          >
            {slides.map((slide, i) => (
              /*
               * The button is the hit box and never moves. Everything that does
               * move lives on .tickInner inside it — see the note in useTape.ts.
               */
              <button
                key={slide.image}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={slide.caption}
                tabIndex={i === active ? 0 : -1}
                className={styles.tick}
                data-active={i === active}
                onClick={() => go(i)}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                <span
                  ref={(el) => {
                    tape.inners.current[i] = el;
                  }}
                  className={styles.tickInner}
                >
                  <span
                    ref={(el) => {
                      tape.strips.current[i] = el;
                    }}
                    className={styles.strip}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
