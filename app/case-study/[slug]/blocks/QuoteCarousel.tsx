"use client";

import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import styles from "../CaseStudy.module.css";

/**
 * The `quotes` custom block — one `Quote text | Attribution` per line.
 *
 * Renders the Figma "quotes" widget: a carousel of dark cards, one shown at a
 * time, with the nav arrows sitting *inside* the card, flush to its left/right
 * edges (no border on the side touching the card boundary — that edge is
 * already drawn by the card itself). Per the Figma notes, an arrow only
 * appears when there's another quote in that direction (none on the left of
 * the first, none on the right of the last). Both arrow gutters are reserved
 * constantly, so the text keeps steady margins and doesn't jump around as the
 * arrows come and go. Each arrow hit crossfades the text: fade out, swap the
 * content, fade in — rather than changing it instantly under the fixed frame.
 */

// Matches --dur in globals.css — the fade-out half of a quote change waits
// this long before swapping content and fading the new quote in.
const FADE_MS = 480;

type Quote = { text: string; name: string };

function parseQuotes(content: string): Quote[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Attribution is the last pipe-separated field, so the quote itself may
      // safely contain a stray "|".
      const parts = line.split("|");
      const name = parts.length > 1 ? parts.pop()!.trim() : "";
      return { text: parts.join("|").trim(), name };
    });
}

export function QuoteCarousel({ content }: { content: string }) {
  const quotes = parseQuotes(content);
  // `index` is the target quote (drives the arrows/dots immediately);
  // `shown` is what's actually painted, and only catches up once the
  // fade-out has finished — see the effect below.
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const visible = shown === index;

  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => setShown(index), FADE_MS);
    return () => clearTimeout(t);
  }, [index, visible]);

  if (quotes.length === 0) return null;

  const quote = quotes[shown];
  const hasPrev = index > 0;
  const hasNext = index < quotes.length - 1;

  return (
    <div className={styles.quoteCarousel}>
      <figure className={styles.quoteCard}>
        <span className={styles.quoteOrnament} aria-hidden>
          <i />
          <i />
          <i />
        </span>

        {/* The text block. Both arrow gutters are reserved constantly (see
            .quoteInner) so its margins stay put from quote to quote; only
            opacity animates, driven by whether `shown` has caught up. */}
        <div
          className={
            visible
              ? styles.quoteInner
              : `${styles.quoteInner} ${styles.quoteInnerHidden}`
          }
        >
          {quote.name && (
            <figcaption className={styles.quoteName}>{quote.name}</figcaption>
          )}
          {/* Guarantees clearance from the name above even when the card is
              short — see .quoteBody in the stylesheet. */}
          <div className={styles.quoteBody}>
            <span className={styles.quoteMark} aria-hidden>
              &ldquo;
            </span>
            <blockquote className={styles.quoteText}>{quote.text}</blockquote>
          </div>
        </div>

        {hasPrev && (
          <button
            type="button"
            className={`${styles.quoteNav} ${styles.quoteNavPrev}`}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous quote"
          >
            {/* Reuse the site arrow, flipped, so left/right match exactly. */}
            <ArrowIcon className={styles.quoteNavFlip} />
          </button>
        )}

        {hasNext && (
          <button
            type="button"
            className={`${styles.quoteNav} ${styles.quoteNavNext}`}
            onClick={() => setIndex((i) => Math.min(quotes.length - 1, i + 1))}
            aria-label="Next quote"
          >
            <ArrowIcon />
          </button>
        )}
      </figure>

      {quotes.length > 1 && (
        <div className={styles.quoteDots} aria-hidden>
          {quotes.map((_, i) => (
            <span
              key={i}
              className={
                i === index
                  ? `${styles.quoteDot} ${styles.quoteDotActive}`
                  : styles.quoteDot
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
