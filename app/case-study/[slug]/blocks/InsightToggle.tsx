"use client";

import { useState } from "react";
import { CardList, parseItems } from "./ListBlock";
import styles from "../CaseStudy.module.css";

/**
 * The `insight-toggle` custom block — two `## Label` sections, each holding
 * `insights`-style lines, with a pair of tabs that swap which one's card
 * stack is shown. Used where a research-findings section wants to separate
 * (e.g.) user-oriented insights from business-oriented ones without forcing
 * the reader to scroll past both.
 *
 * A client component only because the tab state lives in the browser; the
 * card rendering itself is the same `CardList` the plain `insights` block
 * uses.
 */

type Section = { label: string; content: string };

function parseSections(content: string): Section[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const heading = line.trim().match(/^##\s+(.+)$/);
    if (heading) {
      current = { label: heading[1].trim(), content: "" };
      sections.push(current);
    } else if (current) {
      current.content += line + "\n";
    }
  }
  return sections;
}

export function InsightToggle({ content }: { content: string }) {
  const sections = parseSections(content);
  const [active, setActive] = useState(0);
  if (sections.length === 0) return null;

  return (
    <div className={styles.insightToggle}>
      <div className={styles.insightToggleTabs} role="tablist">
        {sections.map((section, i) => (
          <button
            key={section.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={styles.insightToggleTab}
            data-active={active === i || undefined}
            onClick={() => setActive(i)}
          >
            {section.label}
          </button>
        ))}
      </div>
      <CardList items={parseItems(sections[active].content)} />
    </div>
  );
}
