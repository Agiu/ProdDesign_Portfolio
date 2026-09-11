"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/markdown";
import styles from "./CaseStudy.module.css";

// Matches the breakpoint where the rail is a sticky sidebar rather than a
// static block stacked above the content (see .nav in CaseStudy.module.css) —
// below it there's no overlap for a full-bleed block to fade the rail for.
const DESKTOP = "(min-width: 761px)";

/**
 * The "Navigation" rail. Sticky beside the content, it tracks which section is
 * in view and marks it active — the same scroll-spy behaviour the Figma shows
 * (one item dark and bold, the rest muted).
 */
export function Toc({ toc }: { toc: TocEntry[] }) {
  const [active, setActive] = useState(toc[0]?.id ?? "");
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the topmost heading currently intersecting the upper band of
        // the viewport, so the active item advances as you scroll down.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  /*
   * Full-bleed blocks (PersonaCarousel.tsx's `[data-nav-fade]`) run the full
   * width of the viewport, straight through the column this rail sits in —
   * so rather than let the two collide, the rail fades out while one is in
   * view and comes back once it's scrolled past. Desktop-only: below
   * `DESKTOP` the rail isn't sticky beside the content anyway (it's a static
   * block stacked above it), so there's nothing for a full-bleed block to
   * overlap.
   */
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-fade]"),
    );
    if (!targets.length) return;

    const desktop = window.matchMedia(DESKTOP);
    const intersecting = new Set<Element>();
    const apply = () => setFaded(desktop.matches && intersecting.size > 0);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target);
        else intersecting.delete(entry.target);
      }
      apply();
    });
    targets.forEach((el) => observer.observe(el));
    desktop.addEventListener("change", apply);

    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", apply);
    };
  }, []);

  return (
    <nav
      className={faded ? `${styles.nav} ${styles.navFaded}` : styles.nav}
      aria-label="On this page"
      aria-hidden={faded || undefined}
    >
      <ul className={styles.navList}>
        {toc.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={
                entry.id === active ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
              aria-current={entry.id === active ? "true" : undefined}
              tabIndex={faded ? -1 : undefined}
            >
              {entry.eyebrow}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
