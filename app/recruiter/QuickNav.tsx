"use client";

import type { MouseEvent } from "react";
import { positions } from "@/content/recruiter";
import { positionId } from "./position-id";
import styles from "./Recruiter.module.css";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The rail's table of contents — one chip per position, in the same order
 * the rail itself runs, so scanning this row and scanning the rail land on
 * the same list read two ways. Sits above the rail rather than beside or
 * over it: it's a way in, not something to track while scrolling.
 *
 * A row of plain bordered links rather than the filled `.chip` the CTAs use
 * further down — this is navigation around the page, not a call to leave it,
 * and the two shouldn't be mistaken for each other at a glance.
 *
 * Wraps rather than scrolls at narrow widths: seven short chips run in one
 * line on any desktop measure, and a phone gets them as a few short rows
 * instead of a horizontal-scroll strip fighting the page's own vertical one.
 */
export function QuickNav() {
  const onClick = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target || reduced()) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className={styles.quickNav} aria-label="Jump to a position">
      <p className={styles.quickNavLabel}>Jump to</p>
      <ul className={styles.quickNavList}>
        {positions.map((position) => {
          const id = positionId(position);
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={styles.quickNavLink}
                onClick={onClick(id)}
              >
                {position.navLabel ?? position.org}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
