"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./ComingSoonModal.module.css";

/**
 * The interstitial a "coming soon" case study opens instead of its own
 * (currently barren) page. Reused from every place a study can be clicked
 * into — the homepage grid, a position's "Read case study" chip, another
 * study's "Recommended" footer — so the choice reads the same everywhere:
 * go look at the work-in-progress Figma file, wait and check back later, or
 * see a finished study instead.
 *
 * Same dialog mechanics as the case-study lightbox (FigureImage.tsx): fixed
 * overlay, Escape to close, focus moved onto the close button, body scroll
 * locked while open. A separate component rather than sharing that one
 * because this is reached from three unrelated route trees with no client
 * state in common — only the markup and behaviour are shared.
 */
export function ComingSoonModal({
  open,
  onClose,
  title,
  figmaUrl,
  seeInsteadHref,
  seeInsteadLabel,
}: {
  open: boolean;
  onClose: () => void;
  /** The unfinished study's own title, e.g. "Creating a Searching Suite for Trinity University". */
  title: string;
  figmaUrl: string;
  seeInsteadHref: string;
  /** The finished study's title, offered as the alternative. */
  seeInsteadLabel: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
      onClick={onClose}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          ref={closeRef}
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            />
          </svg>
        </button>

        <p className={styles.eyebrow}>Work in Progress</p>
        <h2 id="coming-soon-title" className={styles.title}>
          {title} isn&rsquo;t finished yet
        </h2>
        <p className={styles.body}>
          The design file below has some flows fully explored and others
          still in wireframes.
        </p>

        <a
          href={figmaUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.figmaLink}
        >
          View the Figma File
        </a>

        <p className={styles.prompt}>
          Would you like to wait and check back another time, or see a
          finished case study instead?
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.waitButton} onClick={onClose}>
            Wait, I&rsquo;ll come back later
          </button>
          <Link href={seeInsteadHref} className={styles.seeButton}>
            See {seeInsteadLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
