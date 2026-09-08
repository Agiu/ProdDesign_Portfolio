"use client";

import { useState } from "react";
import { FigureImage } from "../FigureImage";
import styles from "../CaseStudy.module.css";

/**
 * The `compare` custom block — `src | caption | label` per line (label
 * optional, e.g. `Discovery` / `Buy` for Sauhee's two concepts — falls back
 * to a plain 1-based number if omitted). Built for the case image-carousel
 * doesn't suit: a small set of independent takes meant to be weighed against
 * each other rather than stepped through in sequence. A segmented control
 * picks the view — every image side by side, or any one of them alone at
 * full size — rather than paging arrows implying an order that isn't there.
 * No autoplay, no crossfade timer; the reader chooses and it just shows what
 * they asked for.
 *
 * The lone-image view renders through FigureImage (the same component
 * standalone markdown images use) rather than a plain `<img>`, so it gets
 * the same click-to-zoom lightbox — a single image here is meant to be
 * inspected closely, the same as any other case-study screenshot. The
 * side-by-side view stays plain `<img>`: the point there is the two set
 * next to each other, not either one blown up.
 */

type Slide = { src: string; caption: string; label: string };

function parseSlides(content: string): Slide[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src = "", caption = "", label = ""] = line
        .split("|")
        .map((part) => part.trim());
      return { src, caption, label };
    })
    .filter((slide) => slide.src);
}

type Mode = "side" | number;

export function ImageCompare({ content }: { content: string }) {
  const slides = parseSlides(content);
  const [mode, setMode] = useState<Mode>("side");

  if (slides.length === 0) return null;

  return (
    <div className={styles.compare}>
      <div
        className={styles.compareControls}
        role="tablist"
        aria-label="Comparison view"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "side"}
          className={
            mode === "side"
              ? `${styles.compareControl} ${styles.compareControlActive}`
              : styles.compareControl
          }
          onClick={() => setMode("side")}
        >
          Side by side
        </button>
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={mode === i}
            className={
              mode === i
                ? `${styles.compareControl} ${styles.compareControlActive}`
                : styles.compareControl
            }
            onClick={() => setMode(i)}
          >
            {slide.label || i + 1}
          </button>
        ))}
      </div>

      {mode === "side" ? (
        <div className={styles.compareSide}>
          {slides.map((slide, i) => (
            <figure key={i} className={styles.comparePane}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.caption}
                loading="lazy"
                className={styles.compareImg}
              />
              {slide.caption && (
                <figcaption className={styles.compareCaption}>
                  {slide.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      ) : (
        <figure className={styles.compareSingle}>
          <FigureImage
            src={slides[mode].src}
            alt={slides[mode].caption}
            className={styles.compareImg}
          />
          {slides[mode].caption && (
            <figcaption className={styles.compareCaption}>
              {slides[mode].caption}
            </figcaption>
          )}
        </figure>
      )}
    </div>
  );
}
