"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CaseStudy.module.css";

/**
 * Plain <img> — see BlockView's comment in page.tsx for why markdown body
 * images skip next/image. It paints in raw as bytes stream by default; this
 * holds it at opacity 0 until actually loaded, then cross-fades it in.
 *
 * Unlike next/image (FadeImage.tsx), a plain <img> has no built-in handling
 * for a cache hit that completes before this component's onLoad attaches —
 * it's server-rendered with `src` already set, so the browser can finish
 * loading it before hydration. Checked once on mount to cover that case.
 *
 * Clicking it opens the same image full-size in a lightbox — case studies
 * lean on screenshots and diagrams dense enough that the inline width alone
 * isn't always enough to actually read them.
 */
export function FigureImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  const close = useCallback(() => {
    setZoomed(false);
    trigger.current?.focus();
  }, []);

  // While zoomed: lock page scroll, close on Escape, move focus into the dialog.
  useEffect(() => {
    if (!zoomed) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    closeButton.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [zoomed, close]);

  return (
    <>
      <button
        type="button"
        ref={trigger}
        className={styles.figureButton}
        onClick={() => setZoomed(true)}
        aria-label={`Zoom in: ${alt || "case study image"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={[className, styles.fadeImage, loaded && styles.loaded]
            .filter(Boolean)
            .join(" ")}
        />
        <span className={styles.zoomHint} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 4v14M4 11h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            />
          </svg>
        </span>
      </button>

      {zoomed && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Case study image"}
          onClick={close}
        >
          <button
            type="button"
            ref={closeButton}
            className={styles.lightboxClose}
            onClick={close}
            aria-label="Close"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
