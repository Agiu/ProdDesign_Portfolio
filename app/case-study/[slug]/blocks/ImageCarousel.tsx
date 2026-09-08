"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import styles from "../CaseStudy.module.css";

/**
 * The `image-carousel` custom block — one `src | caption` per line.
 *
 * Distinct from `carousel` (CarouselBlock.tsx), which spins a *set of peers*
 * (Steam's competing storefronts) in an orbiting ring. This is a *sequence*
 * of photos meant to be stepped through in order — site visits, process
 * shots — each with its own caption, so it reuses the paged, one-at-a-time
 * posture of QuoteCarousel.tsx (same crossfade timing, same
 * arrows-and-dots chrome) rather than that ring. It renders light, on paper,
 * since these are images meant to be seen clearly rather than text meant to
 * pop off a dark card — nav arrows sit as quiet dark chips over the image
 * itself, matching the zoom-hint affordance on standalone figures.
 */

// Matches --dur in globals.css — the fade-out half of a slide change waits
// at least this long before swapping the image/caption and fading the new
// one in (see the preload note below for the other half of that wait).
const FADE_MS = 480;

type Slide = { src: string; caption: string };

function parseSlides(content: string): Slide[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.indexOf("|");
      const src = (pipe === -1 ? line : line.slice(0, pipe)).trim();
      const caption = pipe === -1 ? "" : line.slice(pipe + 1).trim();
      return { src, caption };
    })
    .filter((slide) => slide.src);
}

export function ImageCarousel({ content }: { content: string }) {
  const slides = parseSlides(content);
  // Same split as QuoteCarousel: `index` is the target slide (drives the
  // arrows/dots immediately), `shown` is what's actually painted and only
  // catches up once the fade-out has finished.
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const visible = shown === index;
  // The frame's aspect ratio, recomputed for whichever slide is showing —
  // stepping through images of different sizes resizes the frame to match
  // rather than cropping every later slide into the first one's shape.
  const [ratio, setRatio] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const targetSrc = slides[index]?.src;

  useEffect(() => {
    if (visible || !targetSrc) return;
    let cancelled = false;
    let fadeDone = false;
    let imageReady = false;

    const advance = () => {
      if (!cancelled && fadeDone && imageReady) setShown(index);
    };

    const fadeTimer = setTimeout(() => {
      fadeDone = true;
      advance();
    }, FADE_MS);

    // Preload the target image so the swap below paints from cache. Without
    // this, assigning `src` on the visible <img> starts the fetch right as
    // it fades in — the old frame stays on screen (visibly fading back in)
    // until the new bytes finally arrive, instead of a clean crossfade.
    const preload = new Image();
    preload.onload = preload.onerror = () => {
      imageReady = true;
      advance();
    };
    preload.src = targetSrc;

    return () => {
      cancelled = true;
      clearTimeout(fadeTimer);
    };
  }, [index, visible, targetSrc]);

  // Covers a cache hit on the first image, which can finish loading (and
  // fire its load event) before this effect ever attaches.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) {
      setRatio(img.naturalWidth / img.naturalHeight);
    }
  }, []);

  if (slides.length === 0) return null;

  const slide = slides[shown];
  const hasPrev = index > 0;
  const hasNext = index < slides.length - 1;

  return (
    <figure className={styles.imageCarousel}>
      <div
        className={styles.imageCarouselFrame}
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={slide.src}
          alt={slide.caption}
          loading="lazy"
          onLoad={(e) => {
            const img = e.currentTarget;
            setRatio(img.naturalWidth / img.naturalHeight);
          }}
          className={
            visible
              ? styles.imageCarouselImg
              : `${styles.imageCarouselImg} ${styles.imageCarouselImgHidden}`
          }
        />

        {hasPrev && (
          <button
            type="button"
            className={`${styles.imageCarouselNav} ${styles.imageCarouselNavPrev}`}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous image"
          >
            <ArrowIcon className={styles.imageCarouselNavFlip} />
          </button>
        )}

        {hasNext && (
          <button
            type="button"
            className={`${styles.imageCarouselNav} ${styles.imageCarouselNavNext}`}
            onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
            aria-label="Next image"
          >
            <ArrowIcon />
          </button>
        )}
      </div>

      {slide.caption && (
        <figcaption
          className={
            visible
              ? styles.imageCarouselCaption
              : `${styles.imageCarouselCaption} ${styles.imageCarouselCaptionHidden}`
          }
        >
          {slide.caption}
        </figcaption>
      )}

      {slides.length > 1 && (
        <div className={styles.imageCarouselDots} aria-hidden>
          {slides.map((_, i) => (
            <span
              key={i}
              className={
                i === index
                  ? `${styles.imageCarouselDot} ${styles.imageCarouselDotActive}`
                  : styles.imageCarouselDot
              }
            />
          ))}
        </div>
      )}
    </figure>
  );
}
