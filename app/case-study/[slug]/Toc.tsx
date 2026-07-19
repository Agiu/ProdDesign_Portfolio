"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/markdown";
import styles from "./CaseStudy.module.css";

/**
 * The "Navigation" rail. Sticky beside the content, it tracks which section is
 * in view and marks it active — the same scroll-spy behaviour the Figma shows
 * (one item dark and bold, the rest muted).
 */
export function Toc({ toc }: { toc: TocEntry[] }) {
  const [active, setActive] = useState(toc[0]?.id ?? "");

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

  return (
    <nav className={styles.nav} aria-label="On this page">
      <p className={styles.navLabel}>Navigation</p>
      <ul className={styles.navList}>
        {toc.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={
                entry.id === active ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
              aria-current={entry.id === active ? "true" : undefined}
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
