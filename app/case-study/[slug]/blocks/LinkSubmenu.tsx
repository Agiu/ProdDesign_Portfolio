"use client";

import { useEffect, useRef, useState, type SVGProps } from "react";
import { BookIcon, CheckIcon, CloseIcon, PlaneIcon } from "./VariantCarousel";
import styles from "../CaseStudy.module.css";

/**
 * The `submenu` custom block — the Logbook Link modal's last pass, from the
 * same Figma file as VariantCarousel.tsx's seven variants but a later frame
 * ("staged state"): drawn once rather than run along a strip, because the
 * variants compare seven readings of one prompt and this is what the winning
 * reading grew once it had to answer a question they all begged — *which*
 * track log?
 *
 * A pilot's day is rarely one flight. "Link Track Log" pressed against
 * whichever log happened to be open would silently pick the wrong leg on any
 * day with more than one, so the button opens a picker instead of acting:
 * recent track logs, then a recommended pick, and choosing any of them
 * resolves to the same confirmation the variants end on. This and that block
 * are two views of one design, which is why the modal chrome here is
 * `.variantModal` and its children rather than a second set of styles, and
 * why the plane/book/check/close glyphs are imported from there.
 *
 * Three details are the design's, not conveniences, and all three were wrong
 * in the first pass at this block:
 *
 *   1. The picker *replaces* the button rather than hanging below it — it
 *      opens at exactly the button's top edge and grows downward, past the
 *      card's own bottom edge. The button stays in the layout underneath
 *      (hidden, not unmounted) so the card doesn't change height when it
 *      opens, which is what the Figma frames show: both cards are the same
 *      130px body.
 *   2. Because it overhangs the card, the modal can't clip its overflow the
 *      way `.variantModal` does — `.submenuModal` turns that off and gives
 *      the header bar its own top radius instead. Clipping was what broke
 *      it: the picker was there, sliced off at the card's bottom edge.
 *   3. Rows are one flat scrolling column — group labels included, each row
 *      underlined, labels' rules darker than items'. The hairline down the
 *      right is a real scrollbar (the native one is hidden and this one is
 *      drawn from `scrollTop`), so its thumb says how much of the pilot's
 *      list is in view rather than decorating the corner with a fixed mark.
 *
 * Four stages, none of them sticky: `idle` (the button), `open` (the
 * picker), `confirming` (played by choosing anything, auto-reverts) and
 * `dismissed` (played by the ×, auto-reverts). Nothing plays on arrival, so
 * unlike the scroll-triggered blocks there's no pending state to wind back
 * for reduced motion — only the picker's short entrance is guarded.
 */

const CONFIRM_MS = 2200;
const DISMISS_MS = 900;

/** Floor on the drawn thumb, so a long list still leaves something to grab. */
const MIN_THUMB = 0.14;

type Stage = "idle" | "open" | "confirming" | "dismissed";

type Copy = {
  title: string;
  route: string;
  blurb: string;
  action: string;
  confirm: string;
  recentLabel: string;
  recommendedLabel: string;
};

const DEFAULT_COPY: Copy = {
  title: "Logbook Link",
  route: "",
  blurb: "",
  action: "Link Track Log",
  confirm: "",
  recentLabel: "Recent Track Logs",
  recommendedLabel: "Recommended",
};

/**
 * The fence. Scalar copy as `key: value`, plus two repeatable list keys:
 *
 *   recent:      one line per recent track log, in the order shown
 *   recommended: one line per recommended pick
 *
 * `recent-label` / `recommended-label` rename the two group headers without
 * touching the component; the design's own words ("Recent Track Logs",
 * "Recommended") are the defaults.
 */
function parseSubmenu(content: string): { copy: Copy; recent: string[]; recommended: string[] } {
  const copy = { ...DEFAULT_COPY };
  const recent: string[] = [];
  const recommended: string[] = [];

  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "recent") recent.push(value);
    else if (key === "recommended") recommended.push(value);
    else if (key === "recent-label") copy.recentLabel = value;
    else if (key === "recommended-label") copy.recommendedLabel = value;
    else if (key in copy) copy[key as keyof Copy] = value;
  }

  return { copy, recent, recommended };
}

export function LinkSubmenu({ content }: { content: string }) {
  const { copy, recent, recommended } = parseSubmenu(content);
  const [stage, setStage] = useState<Stage>("idle");

  const actionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  // The drawn scrollbar, as two fractions of the scroll region's own height:
  // how much of the list is in view, and how far down it starts. Null when
  // everything fits, in which case no bar is drawn at all.
  const [thumb, setThumb] = useState<{ size: number; offset: number } | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Both temporary stages revert on their own — a reader who pressed
  // something and moved on shouldn't come back to a card stuck confirming or
  // stuck dismissed.
  const flash = (next: Stage, ms: number) => {
    clearTimer();
    setStage(next);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setStage("idle");
    }, ms);
  };

  useEffect(() => clearTimer, []);

  // A press outside the picker closes it without choosing anything, and so
  // does Escape — the same as any menu. Focus moves into the list on open
  // (the trigger is hidden underneath the panel, so leaving focus on it
  // would strand a keyboard reader on something they can't see) and back to
  // the trigger when it closes.
  useEffect(() => {
    if (stage !== "open") return;

    actionRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (!actionRef.current?.contains(e.target as Node)) setStage("idle");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setStage("idle");
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [stage]);

  // The hairline down the right of the panel. Read from the scroll region
  // rather than computed from the item count, so it stays honest if the copy
  // in the fence grows or the card is re-scaled.
  useEffect(() => {
    // Only meaningful while the panel is mounted; the value left behind when
    // it closes is never rendered, so there's nothing to reset here.
    if (stage !== "open") return;
    const el = scrollerRef.current;
    if (!el) return;

    const measure = () => {
      const { scrollHeight, clientHeight, scrollTop } = el;
      if (scrollHeight - clientHeight < 1) {
        setThumb(null);
        return;
      }
      setThumb({
        size: Math.max(MIN_THUMB, clientHeight / scrollHeight),
        offset: scrollTop / scrollHeight,
      });
    };

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [stage]);

  if (!copy.route) return null;

  const pick = () => flash("confirming", CONFIRM_MS);
  const hasPicker = recent.length > 0 || recommended.length > 0;
  const open = stage === "open";

  const group = (label: string, items: string[]) =>
    items.length > 0 && (
      <div className={styles.submenuGroup} role="group" aria-label={label}>
        <p className={styles.submenuGroupLabel}>{label}</p>
        <ul className={styles.submenuList}>
          {items.map((route, i) => (
            <li key={`${label}-${i}`}>
              <button type="button" role="menuitem" className={styles.submenuItem} onClick={pick}>
                {route}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className={styles.submenuStage}>
      <div
        className={`${styles.variantModal} ${styles.submenuModal}`}
        data-state={stage === "dismissed" ? "dismissed" : "idle"}
      >
        <div className={styles.variantBar}>
          <span className={styles.variantBarTitle}>{copy.title}</span>
          <button
            type="button"
            className={styles.variantClose}
            onClick={() => flash("dismissed", DISMISS_MS)}
            aria-label={`Dismiss the ${copy.title} modal`}
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.variantBody}>
          <p className={styles.variantGlyphs} aria-hidden>
            <PlaneIcon />
            <LinkIcon className={styles.submenuLinkIcon} />
            <BookIcon />
          </p>

          <p className={styles.variantRoute}>{copy.route}</p>
          <span className={styles.variantRule} aria-hidden />
          <p className={styles.variantBlurb}>{copy.blurb}</p>

          <div className={styles.submenuAction} ref={actionRef} data-open={open || undefined}>
            {stage === "confirming" ? (
              <>
                <span className={styles.variantConfirmBar}>
                  <CheckIcon />
                </span>
                <p className={styles.variantConfirmNote}>{copy.confirm}</p>
              </>
            ) : (
              <button
                type="button"
                ref={triggerRef}
                className={styles.variantAction}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setStage((s) => (s === "open" ? "idle" : "open"))}
                disabled={!hasPicker}
              >
                {copy.action}
                {hasPicker && (
                  <ChevronIcon className={styles.submenuChevron} data-open={open || undefined} />
                )}
              </button>
            )}

            {open && hasPicker && (
              <div className={styles.submenuPanel} role="menu">
                <div className={styles.submenuScroll} ref={scrollerRef}>
                  {group(copy.recentLabel, recent)}
                  {group(copy.recommendedLabel, recommended)}
                </div>

                {thumb && (
                  <span className={styles.submenuScrollTrack} aria-hidden>
                    <span
                      className={styles.submenuScrollThumb}
                      style={{
                        height: `${thumb.size * 100}%`,
                        top: `${thumb.offset * 100}%`,
                      }}
                    />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * Two glyphs unique to this pass, not carried by VariantCarousel.tsx's set:
 * boxicons:link (rotated 45° in the file itself, which is why it's rotated
 * here rather than drawn pre-rotated) between the plane and the book, and
 * the caret on the button that the variants' plain "Link Track Log" never
 * had — the one visible sign, before a press, that this one opens something.
 */

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" fill="none" aria-hidden focusable="false" className={className}>
      <path
        d="M4.11667 7.65C3.88229 7.88408 3.56458 8.01557 3.23333 8.01557C2.90208 8.01557 2.58438 7.88408 2.35 7.65C2.11592 7.41562 1.98443 7.09792 1.98443 6.76667C1.98443 6.43542 2.11592 6.11771 2.35 5.88333L3.52917 4.70417L2.94167 4.11667L1.7625 5.29583C1.37224 5.68668 1.15305 6.21643 1.15305 6.76875C1.15305 7.32107 1.37224 7.85082 1.7625 8.24167C2.17083 8.64583 2.7 8.85 3.2375 8.85C3.775 8.85 4.30417 8.64583 4.7125 8.24167L5.89167 7.0625L5.30417 6.475L4.125 7.65417L4.11667 7.65ZM5.29583 1.75833L4.11667 2.9375L4.70417 3.525L5.88333 2.34583C6.11771 2.11175 6.43542 1.98027 6.76667 1.98027C7.09792 1.98027 7.41563 2.11175 7.65 2.34583C7.88408 2.58021 8.01557 2.89792 8.01557 3.22917C8.01557 3.56042 7.88408 3.87812 7.65 4.1125L6.47083 5.29167L7.05833 5.87917L8.2375 4.7C8.62776 4.30915 8.84695 3.77941 8.84695 3.22708C8.84695 2.67476 8.62776 2.14501 8.2375 1.75417C7.84666 1.36391 7.31691 1.14471 6.76458 1.14471C6.21226 1.14471 5.68251 1.36391 5.29167 1.75417L5.29583 1.75833Z"
        fill="currentColor"
      />
      <path
        d="M7.0625 3.525L6.76667 3.23333L6.475 2.9375L4.70417 4.70417L2.9375 6.475L3.23333 6.76667L3.525 7.0625L5.29583 5.29583L7.0625 3.525Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 5.50001 3.64052"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
      {...rest}
    >
      <path
        d="M0.250006 0.250006L2.75001 3.25001L5.25001 0.250006"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
