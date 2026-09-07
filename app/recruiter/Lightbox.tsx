"use client";

import { useEffect, useRef } from "react";
import type { Shot } from "@/content/recruiter";
import styles from "./Recruiter.module.css";

/** A shot plus the position it came from, which is what the viewer captions
 *  itself with once it's open. */
export type ZoomedShot = Shot & { org: string; title: string };

/**
 * One picture, full size. Deliberately not a carousel: paging belongs to the
 * strip on the page (ShotCarousel.tsx), and once a reader has zoomed into a
 * single photo the only things left to do are look at it and close it. So
 * there are no arrows here, and the arrow keys do nothing.
 *
 * Modeled on the films page's own video modal (FilmGallery.tsx): a dark
 * backdrop that closes on click, Escape closes it too, focus moves into the
 * dialog on open and back to whatever opened it on close, and page scroll is
 * locked for as long as it's up.
 */
export function Lightbox({
  shot,
  onClose,
}: {
  shot: ZoomedShot | null;
  onClose: () => void;
}) {
  const opener = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const isOpen = shot !== null;

  useEffect(() => {
    if (!isOpen) return;

    opener.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!shot) return null;

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={[shot.org, shot.caption || shot.alt].filter(Boolean).join(": ")}
      onClick={onClose}
    >
      <button
        type="button"
        ref={closeButton}
        className={styles.lightboxClose}
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Stops the backdrop's close-on-click from firing when the picture
          itself, or the caption under it, is clicked. */}
      <div className={styles.lightboxFrame} onClick={(e) => e.stopPropagation()}>
        {/* Sized to its own content rather than through next/image: these are
            arbitrary case-study photos with no known aspect ratio in common,
            and the viewer's job is to show each one at its own shape, capped
            by the viewport, not to crop it into a fixed frame the way the
            strip's own thumbnail does. Same call FilmGallery.tsx makes for
            its thumbnail, and for the same reason. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shot.src}
          alt={shot.alt}
          className={styles.lightboxImage}
        />

        <div className={styles.lightboxMeta}>
          <p className={styles.lightboxOrg}>
            {shot.org}
            {shot.title ? ` · ${shot.title}` : ""}
          </p>
          {shot.caption && (
            <p className={styles.lightboxCaption}>{shot.caption}</p>
          )}
        </div>
      </div>
    </div>
  );
}
