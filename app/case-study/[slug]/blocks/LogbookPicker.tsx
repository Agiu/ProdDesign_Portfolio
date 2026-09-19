"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../CaseStudy.module.css";

/**
 * The `logbook` custom block — where the whole thread lands, refined twice
 * after the first pass shipped. `LogbookPickerBefore.tsx` and
 * `LogbookCompare.tsx` exist to show that first pass and this one side by
 * side, so `parseLogbook`, `Entry`/`Copy` and two of the three glyphs below
 * (`CheckGlyph`, `CloseGlyph` — `PlusGlyph` is this design's own, nothing
 * before it drew a plus) are exported rather than kept file-local — the same
 * reuse VariantCarousel.tsx sets up for its own icons.
 *
 * That first pass still asked for two presses: tick a row, then press "Add
 * to Logbook Entry" to act on it. The second press never did anything a
 * single one couldn't — picking a row *is* the decision — so the primary
 * button is gone. Each row now carries its own small action instead, back on
 * the left where the old checkbox sat:
 *
 *   - a plus in a circle, grey rather than the action blue everything else
 *     on the card gets, on any entry this track log can link to — "add",
 *     not "confirm an add" (that's what a check would say), which is the
 *     whole point: pressing it *is* the add, no separate confirm step after
 *     it. Grey, not blue, so it doesn't compete with green for "the thing
 *     that means done" once a row is linked.
 *   - a check, filled, on any entry that already has a track log linked to
 *     it — "linked" reads as a state, not an unavailable one, so it's a
 *     check rather than a static ×. Hovering (or focusing) it swaps the
 *     mark to a red × and the fill to match: the preview of what a press
 *     does. Pressing it removes the link and the row returns to a plain,
 *     linkable plus — undoing a mistaken link doesn't need a trip back to
 *     whoever manages logbook entries.
 *
 * Pressing either mark is silent, on purpose: the icon swap *is* the
 * feedback, so nothing takes the list's place to announce what a press just
 * did.
 *
 * The two rows this demo marks already-linked are the same two legs
 * VariantCarousel through LinkFlow.tsx spent the section before consolidating
 * into one entry — so a reader who scrolled straight down arrives here and
 * finds the case study's own earlier claim already reflected in the data,
 * and can unlink either one (and relink it) to see both sides of that
 * action.
 *
 * The other change: "Recommended Entries" isn't behind a "Show More" button
 * any more, it's further down the same list. Recent and Recommended sit in
 * one scrolling region (a fixed height, so the list doesn't grow the card),
 * and scrolling *is* what reveals the recommended group — the same claim a
 * "Show More" press used to make, made by the list itself instead of a
 * control bolted onto it. The scrollbar is real, drawn from the region's own
 * `scrollTop` the same way LinkSubmenu.tsx's picker draws its — the native
 * one is hidden and this one says how much of the list is actually below.
 *
 * "Create New Entry" doesn't confirm either, and it doesn't leave the card
 * for wherever an entry actually gets created — it does the thing the
 * button says, right there: a fresh row lands at the top of Recent Entries,
 * already linked (green check, filled), built from the `new-entry` line in
 * the fence — the current track log's own route, tail and total, the ones
 * "Recent Entries" is a list of everyone *but*. The pilot whose flight had
 * nothing to link into now has something, in the same list, without a
 * screen change.
 *
 * `bare`, on both this component and LogbookPickerBefore.tsx, skips the
 * outer dimmed-page wrapper (`.logbookStage`) so LogbookCompare.tsx can put
 * two modals on one shared stage instead of each drawing its own.
 */

const DISMISS_MS = 900;

/** Floor on the drawn scrollbar thumb, so a long list still leaves
 *  something to grab. */
const MIN_THUMB = 0.16;

type Stage = "idle" | "dismissed";

export type Entry = {
  route: string;
  tail: string;
  date: string;
  total: string;
  connected: boolean;
  /** Set only on a row "Create New Entry" adds, and only in the browser —
   *  a stable identity that doesn't depend on the row's position in the
   *  list, so creating a second entry doesn't shift every row under it to
   *  a new React key and remount them. Fence-parsed rows never carry one;
   *  their key is built from their own content instead (see `rows` below). */
  id?: string;
};

export type Copy = {
  title: string;
  heading: string;
  blurb: string;
  group: string;
  recommendedGroup: string;
  connectedNote: string;
  secondary: string;
  confirm: string;
  confirmNew: string;
};

const DEFAULT_COPY: Copy = {
  title: "Add to Logbook",
  heading: "Select a Logbook entry",
  blurb: "",
  group: "Recent Entries",
  recommendedGroup: "Recommended Entries",
  connectedNote: "Already linked",
  secondary: "Create New Entry",
  confirm: "",
  confirmNew: "",
};

/**
 * The fence. Scalar copy as `key: value`, plus three row keys, all the same
 * shape:
 *
 *   entry:       route | tail number and type | date | total time | [linked]
 *   recommended: the same, for the group revealed by scrolling
 *   new-entry:   the same, minus the fifth field — this track log's own
 *                identity, used to build the row "Create New Entry" adds
 *
 * The fifth field on `entry`/`recommended` is optional and only ever means
 * one thing — the literal word `linked` marks a row already connected to a
 * logbook entry, which is what draws its check filled rather than a plus.
 */
export function parseLogbook(
  content: string,
): { copy: Copy; entries: Entry[]; recommended: Entry[]; newEntry: Entry | null } {
  const copy = { ...DEFAULT_COPY };
  const entries: Entry[] = [];
  const recommended: Entry[] = [];
  let newEntry: Entry | null = null;

  const parseRow = (value: string): Entry | null => {
    const [route = "", tail = "", date = "", total = "", flag = ""] = value
      .split("|")
      .map((part) => part.trim());
    if (!route) return null;
    return { route, tail, date, total, connected: flag.toLowerCase() === "linked" };
  };

  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "entry") {
      const row = parseRow(value);
      if (row) entries.push(row);
    } else if (key === "recommended") {
      const row = parseRow(value);
      if (row) recommended.push(row);
    } else if (key === "new-entry") {
      newEntry = parseRow(value);
    } else if (key === "recommended-group") {
      copy.recommendedGroup = value;
    } else if (key === "connected-note") {
      copy.connectedNote = value;
    } else if (key === "confirm-new") {
      copy.confirmNew = value;
    } else if (key in copy) {
      copy[key as keyof Copy] = value;
    }
  }

  return { copy, entries, recommended, newEntry };
}

export function LogbookPicker({ content, bare }: { content: string; bare?: boolean }) {
  const { copy, entries, recommended, newEntry } = parseLogbook(content);

  const [stage, setStage] = useState<Stage>("idle");
  // Per-row overrides of the fence's own `connected` flag, keyed the same
  // way the row's own React key is built. A row's *fence* connection never
  // changes — link/unlink only ever write here, so either press can be
  // taken back by pressing the row's mark again.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  // Rows "Create New Entry" has added this visit, newest first — everything
  // else about the list lives in the fence, but these don't exist until a
  // press creates them.
  const [created, setCreated] = useState<Entry[]>([]);

  const timer = useRef<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // The drawn scrollbar, as two fractions of the scroll region's own height:
  // how much of the list is in view, and how far down it starts. Null when
  // everything fits (nothing to scroll to, so nothing to draw).
  const [thumb, setThumb] = useState<{ size: number; offset: number } | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  // Dismissed reverts on its own, as in the two blocks above — a reader who
  // closed the card and moved on shouldn't come back to one stuck hidden.
  const flash = (next: Stage, ms: number) => {
    clearTimer();
    setStage(next);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setStage("idle");
    }, ms);
  };

  // Read from the scroll region rather than computed from the row count, so
  // it stays honest if the fence's own lists grow or the card is re-scaled.
  useEffect(() => {
    if (stage !== "idle") return;
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
  }, [stage, entries.length, recommended.length, created.length]);

  if (entries.length === 0 && recommended.length === 0) return null;

  // Link and unlink are the same write, opposite value — no confirmation
  // screen for either, just the row's own mark changing under the pointer.
  const setConnected = (key: string, connected: boolean) =>
    setOverrides((current) => ({ ...current, [key]: connected }));

  // No confirmation here either — the new row appearing at the top of
  // Recent Entries, already linked, is the confirmation.
  const create = () => {
    if (!newEntry) return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `created-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setCreated((current) => [{ ...newEntry, connected: true, id }, ...current]);
  };

  // A stable key per row: content for anything parsed from the fence (which
  // never changes shape), the row's own `id` for anything "Create New Entry"
  // added — never position, or prepending a created row would hand every
  // row under it a new key and remount it.
  const rowKey = (label: string, entry: Entry) =>
    entry.id ?? `${label}-${entry.route}-${entry.tail}-${entry.date}-${entry.total}`;

  const rows = (label: string, list: Entry[]) =>
    list.length > 0 && (
      <div className={styles.logbookGroupBlock}>
        <p className={styles.logbookGroup}>{label}</p>
        <ul className={styles.logbookList}>
          {list.map((entry) => {
            const key = rowKey(label, entry);
            const isConnected = overrides[key] ?? entry.connected;

            return (
              <li key={key} className={styles.logbookRow}>
                <div className={styles.logbookPick}>
                  <button
                    type="button"
                    className={styles.logbookRowAction}
                    data-variant={isConnected ? "connected" : "link"}
                    onClick={() => setConnected(key, !isConnected)}
                    aria-label={
                      isConnected
                        ? `${entry.route}: remove this link`
                        : `Link this track log to ${entry.route}`
                    }
                  >
                    {isConnected ? (
                      <>
                        <span className={styles.logbookRowIconLinked} aria-hidden>
                          <CheckGlyph />
                        </span>
                        <span className={styles.logbookRowIconUnlink} aria-hidden>
                          <CloseGlyph />
                        </span>
                      </>
                    ) : (
                      <PlusGlyph />
                    )}
                  </button>

                  <span className={styles.logbookWhat}>
                    <span className={styles.logbookRoute}>{entry.route}</span>
                    {entry.tail && <span className={styles.logbookTail}>{entry.tail}</span>}
                    {isConnected && (
                      <span className={styles.logbookLinkedTag}>
                        {entry.id ? "Newly created" : copy.connectedNote}
                      </span>
                    )}
                  </span>

                  <span className={styles.logbookWhen}>
                    {entry.date && <span className={styles.logbookDate}>{entry.date}</span>}
                    {entry.total && <span className={styles.logbookTotal}>{entry.total}</span>}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );

  const modal = (
    <div className={styles.logbookModal} data-state={stage}>
      <div className={styles.logbookBar}>
        <span className={styles.logbookBarTitle}>{copy.title}</span>
        <button
          type="button"
          className={styles.logbookClose}
          onClick={() => flash("dismissed", DISMISS_MS)}
          aria-label={`Dismiss the ${copy.title} dialog`}
        >
          <CloseGlyph />
        </button>
      </div>

      <div className={styles.logbookBody}>
        <p className={styles.logbookHeading}>{copy.heading}</p>
        {copy.blurb && <p className={styles.logbookBlurb}>{copy.blurb}</p>}

        <div className={styles.logbookScrollWrap}>
          <div className={styles.logbookScroll} ref={scrollerRef}>
            {rows(copy.group, [...created, ...entries])}
            {rows(copy.recommendedGroup, recommended)}
          </div>

          {thumb && (
            <span className={styles.logbookScrollTrack} aria-hidden>
              <span
                className={styles.logbookScrollThumb}
                style={{
                  height: `${thumb.size * 100}%`,
                  top: `${thumb.offset * 100}%`,
                }}
              />
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.logbookSecondary}
          onClick={create}
          disabled={!newEntry}
        >
          {copy.secondary}
        </button>
      </div>
    </div>
  );

  if (bare) return modal;

  return <div className={styles.logbookStage}>{modal}</div>;
}

/*
 * Plain marks rather than icons from a set: a check for "link this one" (or
 * "this one's linked"), an × for "remove it" — reused for the header's own
 * dismiss ×, since it's the same mark meaning the same thing (this goes
 * away) — and a plus for "add this one," the row action's resting mark.
 * Each is a couple of straight strokes, drawn at the weight the header and
 * the action blue carry, so there's no icon library to pull in for this.
 * `CheckGlyph` and `CloseGlyph` are exported for LogbookPickerBefore.tsx,
 * which draws the same header chrome and the same confirmation check;
 * `PlusGlyph` isn't — that pass never drew one.
 */

export function CloseGlyph() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden focusable="false">
      <path
        d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
      <path
        d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
      <path
        d="M8 2.5 L8 13.5 M2.5 8 L13.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
