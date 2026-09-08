"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import { useDarkGround } from "./useDarkGround";
import styles from "./Recruiter.module.css";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The way back to the greeting, once there's enough of the rail below the
 * fold to make scrolling back up for it a chore. Fixed to the right edge of
 * the viewport rather than the page — it's chrome for reading the résumé,
 * not part of what's being read, so it never travels with the content.
 *
 * Appears once the hero (`#top`) has fully scrolled past, via an
 * IntersectionObserver rather than a fixed pixel threshold, so it holds up if
 * the hero's own height ever changes. Left running rather than disconnected
 * after the first flip — unlike useReveal's one-shot observer, this has to
 * keep answering "is the hero on screen right now" for as long as the page
 * does.
 *
 * Tracks the ground under it the same way the case-study BackLink does: this
 * page ends on a dark run (the contact band, then the footer — see
 * `data-dark-run` on Contact.tsx), and a plain dark glyph would vanish the
 * moment that run reaches it. The tracking itself is shared with the fixed
 * back link at the other end of the screen — see useDarkGround.ts.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const onDark = useDarkGround("bottom");

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting),
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const top = document.getElementById("top");
    if (!top || reduced()) return;

    event.preventDefault();
    top.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <a
      href="#top"
      className={styles.toTop}
      data-visible={visible || undefined}
      data-ground={onDark ? "dark" : "paper"}
      onClick={onClick}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowIcon className={styles.toTopIcon} />
    </a>
  );
}
