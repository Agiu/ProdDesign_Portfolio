"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import type { Shot } from "@/content/recruiter";
import { NdaPlate } from "./NdaPlate";
import type { ZoomedShot } from "./Lightbox";
import styles from "./Recruiter.module.css";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One shot, in whichever of its three states: an image, a redacted NDA
 * plate, or an ordinary "still to add" placeholder.
 *
 * Only a real image is a button. There is nothing for the viewer to open on
 * a placeholder or an NDA plate, so those render as plain frames.
 */
function ShotContent({
  shot,
  org,
  title,
  onZoom,
}: {
  shot: Shot;
  org: string;
  title: string;
  onZoom: (shot: ZoomedShot) => void;
}) {
  if (shot.src) {
    return (
      <>
        <button
          type="button"
          className={styles.shotButton}
          onClick={() => onZoom({ ...shot, org, title })}
          aria-label={`View larger: ${shot.caption || shot.alt || org}`}
        >
          <span className={styles.shotFrame}>
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(max-width: 560px) 90vw, (max-width: 820px) 45vw, 320px"
              className={styles.shotImage}
            />
          </span>
        </button>
        {shot.caption && <p className={styles.shotCaption}>{shot.caption}</p>}
      </>
    );
  }

  if (shot.nda) {
    return (
      <>
        <NdaPlate />
        {shot.caption && <p className={styles.shotCaption}>{shot.caption}</p>}
      </>
    );
  }

  return (
    <>
      <div className={styles.shotFrame} data-placeholder>
        <span className={styles.shotPlaceholder}>Image</span>
      </div>
      {shot.caption && (
        <p className={styles.shotCaption} data-placeholder>
          {shot.caption}
        </p>
      )}
    </>
  );
}

/**
 * A position's shots, laid out as a strip that shows three at a time (two on
 * a tablet, one on a phone) with arrows to page through anything past that.
 * A position can carry as many shots as its story needs without the page
 * growing a row taller for every one of them.
 *
 * The strip is a real horizontally-scrolling element with scroll snapping,
 * not a transform on a track. Three things fall out of that, all of them
 * things a transform would have cost work to get back: a touch screen can
 * swipe it natively, the column count can live entirely in the stylesheet
 * (so the first paint is already right at every width, with no measuring
 * pass to correct it), and the arrows can read where they are from the
 * element's own scroll position rather than from a count of columns JS would
 * otherwise have to keep in step with CSS.
 *
 * So the arrows here only appear when the strip actually overflows, and each
 * one disappears at its end of the run. A position with three shots or fewer
 * shows no arrows at all, because there is nothing behind the edge to reach.
 */
export function ShotCarousel({
  shots,
  org,
  title,
  onZoom,
}: {
  shots: Shot[];
  org: string;
  title: string;
  onZoom: (shot: ZoomedShot) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;

    /* A pixel of slack at either end: scrollLeft lands on fractional values
       at some zoom levels and device pixel ratios, and an arrow that never
       quite disappears at the end of the run is worse than one that goes a
       pixel early. */
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflowing(max > 1);
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft >= max - 1);

      /* How tall a picture is, published to the stylesheet so the arrows can
         sit on the middle of one. It can't be worked out in CSS: the frame's
         height comes from its aspect ratio against a width that is itself a
         fraction of this strip, and a percentage in `top` resolves against
         height, not width. Centring the arrows on the strip instead was a
         near miss — the captions under the pictures drag that centre a line
         or two below the middle of the photograph.

         The frame is always the first item's first child: the button that
         wraps a real photo (a block, so exactly as tall as the frame in it),
         or the plate itself for an NDA card or a placeholder. */
      const frame = el.firstElementChild?.firstElementChild;
      if (frame instanceof HTMLElement && root.current) {
        root.current.style.setProperty(
          "--shot-frame-h",
          `${frame.offsetHeight}px`,
        );
      }
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    /* Re-measures when the column count changes under it — the breakpoints
       that decide it are in the stylesheet, so this is how the arrows hear
       about a resize. */
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [shots.length]);

  if (shots.length === 0) return null;

  /* One shot per press rather than a whole screenful: every item is a snap
     point, so a single step always lands square instead of leaving a photo
     half out of the frame. */
  const page = (direction: 1 | -1) => {
    const el = strip.current;
    if (!el) return;

    const item = el.firstElementChild as HTMLElement | null;
    if (!item) return;

    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({
      left: direction * (item.offsetWidth + gap),
      behavior: reduced() ? "auto" : "smooth",
    });
  };

  return (
    <div className={styles.shotCarousel} ref={root}>
      <ul className={styles.shotStrip} ref={strip}>
        {shots.map((shot, i) => (
          <li key={shot.src || `placeholder-${i}`} className={styles.shotItem}>
            <ShotContent shot={shot} org={org} title={title} onZoom={onZoom} />
          </li>
        ))}
      </ul>

      {overflowing && !atStart && (
        <button
          type="button"
          className={`${styles.shotNav} ${styles.shotNavPrev}`}
          onClick={() => page(-1)}
          aria-label="Previous photos"
        >
          {/* Reuse the site arrow, flipped, so left and right match exactly.
              Same trick the case studies' own quote carousel uses. */}
          <ArrowIcon className={styles.shotNavFlip} />
        </button>
      )}

      {overflowing && !atEnd && (
        <button
          type="button"
          className={`${styles.shotNav} ${styles.shotNavNext}`}
          onClick={() => page(1)}
          aria-label="More photos"
        >
          <ArrowIcon />
        </button>
      )}
    </div>
  );
}
