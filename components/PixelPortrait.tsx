"use client";

import { animate, cubicBezier } from "animejs";
import { useEffect, useRef } from "react";
import styles from "./PixelPortrait.module.css";

/*
 * The ladder of block sizes the portrait is drawn at, coarsest first.
 *
 * Discrete rungs rather than one continuously shrinking number, and that is the
 * whole trick: a block size easing smoothly from 56 to 1 reads as a blur being
 * pulled into focus, where stepping between whole sizes reads as pixels — each
 * generation of squares visibly giving way to a finer one.
 *
 * Every rung has to be worth a step. The ladder stops short of 2px because at
 * the size this is drawn a 2px block is indistinguishable from the photograph,
 * and rungs you can't tell apart still cost time — the effect would spend its
 * back half apparently finished. So it ends 5, 3, 1 and gives that time to the
 * coarse end, where a single step changes the most.
 */
const LEVELS = [56, 40, 30, 22, 16, 11, 8, 5, 3, 1];

/** Where it settles once it has arrived and nothing is hovering the section. */
const REST = 4;
/** The photograph itself. */
const SHARP = LEVELS.length - 1;

/** Coarse blocks resolving down to REST as the section is scrolled into. */
const ARRIVE = 900;
/** REST to the photograph and back, under the pointer. Quicker: it is
    answering a hand, not a scroll. */
const RESOLVE = 650;

/*
 * Nearly linear, and deliberately not the site's usual ease-out. A curve that
 * front-loads its travel spends almost all of it on the finest rungs, where the
 * blocks are too small to see change — the coarse generations, which are the
 * ones worth watching, would flash past in the first fifty milliseconds. Even
 * time per rung is what makes the ladder legible.
 */
const EASE = cubicBezier(0.4, 0.1, 0.3, 0.9);

/**
 * A portrait that arrives as pixels and resolves into a photograph under the
 * reader's pointer.
 *
 * Drawn on a canvas rather than filtered in CSS because the effect is
 * literally pixels: the image is squashed down to a few dozen of them and blown
 * back up with interpolation off, so every block is a real average of what it
 * covers. `filter: blur()` would only make it soft, and there is no CSS filter
 * that quantises.
 */
export function PixelPortrait({ src, alt }: { src: string; alt: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* The rung currently drawn, as a fraction: the tween writes it and the
     painter rounds it. A ref, and an object, so the animation can own it
     without a re-render per frame. */
  const rung = useRef({ at: 0 });

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const buffer = document.createElement("canvas");
    const bufferCtx = buffer.getContext("2d");
    if (!frame || !canvas || !ctx || !bufferCtx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* No pointer to hover with, so there would be no way back to the
       photograph. It resolves on arrival instead and stays resolved. */
    const untouchable = !window.matchMedia("(hover: hover)").matches;

    const image = new Image();
    let ready = false;
    let arrived = false;
    let hovered = false;
    let tween: ReturnType<typeof animate> | null = null;
    /* What the canvas currently holds, so a tween frame that rounds to the same
       rung as the last one costs nothing — which is most of them. */
    let drawn = -1;

    /*
     * `cover`, worked out by hand: drawImage has no object-fit, and the crop
     * has to be recomputed at whatever size is being drawn — the visible canvas
     * one moment, the thirty-odd pixels of the buffer the next.
     */
    const cover = (context: CanvasRenderingContext2D, w: number, h: number) => {
      const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      context.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const paint = () => {
      const { width, height } = canvas;
      if (!ready || !width || !height) return;

      const block = LEVELS[Math.round(rung.current.at)];
      if (block === drawn) return;
      drawn = block;

      if (block <= 1) {
        ctx.imageSmoothingEnabled = true;
        cover(ctx, width, height);
        return;
      }

      /*
       * Squash onto the buffer, then blow the buffer back up with smoothing
       * off. Note the downscale keeps its smoothing: a block should be the
       * average of everything under it, not one pixel sampled out of the
       * middle, or the coarse rungs come out as confetti rather than a face.
       */
      const w = Math.max(1, Math.round(width / block));
      const h = Math.max(1, Math.round(height / block));
      buffer.width = w;
      buffer.height = h;
      bufferCtx.imageSmoothingEnabled = true;
      cover(bufferCtx, w, h);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buffer, 0, 0, w, h, 0, 0, width, height);
    };

    const travel = (to: number, ms: number) => {
      if (reduced) {
        rung.current.at = to;
        paint();
        return;
      }

      tween?.pause();
      tween = animate(rung.current, {
        at: to,
        duration: ms,
        ease: EASE,
        onUpdate: paint,
      });
    };

    /* The backing store follows the box at device resolution, capped at 2x —
       past that the blocks are drawn from more pixels than any screen shows. */
    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (!w || !h || (canvas.width === w && canvas.height === h)) return;

      canvas.width = w;
      canvas.height = h;
      /* Resizing clears the canvas, so the cache has to admit it holds
         nothing — otherwise the next frame at the same rung skips the redraw
         and leaves the box blank. */
      drawn = -1;
      paint();
    };

    const box = new ResizeObserver(measure);
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        arrived = true;
        /* Reduced motion goes straight to the settled state, which here is the
           photograph — the same thing the class does everywhere else. */
        travel(reduced || untouchable || hovered ? SHARP : REST, ARRIVE);
      },
      /* A little inside the viewport, so the pixels are already working by the
         time the portrait is properly on screen. */
      { rootMargin: "0px 0px -10% 0px" },
    );

    /* Pointer events rather than mouse ones, so a stylus counts and a touch
       does not — a tap would otherwise leave the portrait stuck resolved with
       no way to hand it back. */
    const enter = () => {
      hovered = true;
      /* Before it has arrived there is nothing to resolve, and the arrival
         reads `hovered` for itself — so a pointer that beats the scroll in
         isn't lost, it just waits its turn. */
      if (arrived) travel(SHARP, RESOLVE);
    };

    const leave = () => {
      hovered = false;
      if (arrived) travel(REST, RESOLVE);
    };

    const start = () => {
      ready = true;
      box.observe(canvas);
      measure();
      seen.observe(canvas);
      if (!untouchable) {
        frame.addEventListener("pointerenter", enter);
        frame.addEventListener("pointerleave", leave);
      }
    };

    image.decoding = "async";
    image.src = src;
    if (image.complete) start();
    else image.addEventListener("load", start, { once: true });

    return () => {
      tween?.pause();
      box.disconnect();
      seen.disconnect();
      image.removeEventListener("load", start);
      frame.removeEventListener("pointerenter", enter);
      frame.removeEventListener("pointerleave", leave);
    };
  }, [src]);

  return (
    <div ref={frameRef} className={styles.frame}>
      <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={alt} />

      {/* Without the script the canvas is a blank box, so the photograph itself
          stands in. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={styles.fallback} />
      </noscript>
    </div>
  );
}
