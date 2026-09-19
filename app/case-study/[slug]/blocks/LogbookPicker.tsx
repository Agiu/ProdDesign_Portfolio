"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
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
 *   - an unlink mark — a chain with a break in it — on a light red circle,
 *     on any entry that already has a track log linked to it. One mark says
 *     both things: the chain is the link that's there, the break is what a
 *     press does to it. It's the same circle, in the same spot, as the plus
 *     it replaced, so "link" and "unlink" stay one control in one place.
 *     And it's visible at rest, not revealed by hover: an earlier take showed
 *     a green check that only swapped to a red × under the pointer, which
 *     nobody on a touchscreen would ever see, and which nothing about a
 *     finished-looking check invited anyone to try. Light red, not solid,
 *     so a list with several linked rows doesn't read as a list of alarms;
 *     hover and focus deepen it to the full red, the preview of a press.
 *     Pressing it removes the link and the row returns to a plain, linkable
 *     plus — undoing a mistaken link doesn't need a trip back to whoever
 *     manages logbook entries.
 *
 * A "Linked" tag under the tail number backs the circle up in words, so the
 * state doesn't rest on the reader decoding an icon.
 *
 * Pressing the circle is silent, on purpose: the change in place *is* the
 * feedback, and it's animated so it reads as one change rather than a
 * swap — the plus turns into the chain, the row grows to make room, and the
 * tag slides down into the space it opened (all reversed on unlink). Both
 * marks and the tag stay mounted for that, toggled by CSS rather than
 * rendered conditionally, so there's something on screen to animate out.
 * Nothing takes the list's place to announce what a press just did. It's
 * one button either way — only its mark and label change — so
 * focus stays put and a keyboard user can undo a press by pressing again.
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
 * then linked (see below), built from the `new-entry` line in
 * the fence — the current track log's own route, tail and total, the ones
 * "Recent Entries" is a list of everyone *but*. The pilot whose flight had
 * nothing to link into now has something, in the same list, without a
 * screen change. It arrives in two beats: the row opens at the top of the
 * list and slides in with a plus and a "Just created" tag, then links — the
 * same plus-to-chain turn a press on the plus plays, while the tag flips
 * over to "Linked" — so the reader sees both that an entry was made and
 * that it's already linked. "Just created" belongs to that arrival only:
 * unlink the row and link it again and it says "Linked" like any other.
 *
 * Pressing a row anywhere but its circle selects it, and two small actions
 * open under "Create New Entry" for it: Delete, which collapses the row out
 * of the list, and Visit, which plays the hand-off to the logbook. Pressing
 * the row again, or any of the card's white outside the rows and actions,
 * deselects and puts them away.
 *
 * `bare`, on both this component and LogbookPickerBefore.tsx, skips the
 * outer dimmed-page wrapper (`.logbookStage`) so LogbookCompare.tsx can put
 * two modals on one shared stage instead of each drawing its own.
 */

const DISMISS_MS = 900;

/** How long a created row takes to open before it links — kept in step with
 *  `--dur` in globals.css, the duration its CSS transitions run for. */
const ENTER_MS = 480;

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
  /** The tag under a linked row's tail number. */
  connectedNote: string;
  /** The tag a row "Create New Entry" adds shows while it enters, before
   *  it links and the tag flips to `connectedNote`. */
  createdNote: string;
  secondary: string;
  /** The selected-row actions under the secondary button. */
  remove: string;
  open: string;
  /** What "open" flips to while the card hands off to the logbook. */
  opening: string;
  confirm: string;
  confirmNew: string;
};

const DEFAULT_COPY: Copy = {
  title: "Add to Logbook",
  heading: "Select a Logbook entry",
  blurb: "",
  group: "Recent Entries",
  recommendedGroup: "Recommended Entries",
  connectedNote: "Linked",
  createdNote: "Just created",
  secondary: "Create New Entry",
  remove: "Delete",
  open: "Visit",
  opening: "Opening…",
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
    } else if (key === "created-note") {
      copy.createdNote = value;
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
  // Where each just-created row is in its entrance, keyed by its `id`:
  // "collapsed" for the one frame it's mounted at zero height, "open" while
  // it grows in, still showing the plus. Dropped from here once it's open,
  // which is what flips it to linked — so the link animates the same way a
  // press on the plus would. Absent means the row is fully in.
  const [entering, setEntering] = useState<Record<string, "collapsed" | "open">>({});
  // The row a press on its body has selected — what the actions under
  // "Create New Entry" act on. One at a time; null hides the actions.
  const [selected, setSelected] = useState<string | null>(null);
  // Rows "Delete Entry" has taken out: `leaving` while they collapse,
  // `deleted` once they're gone and no longer rendered at all.
  const [leaving, setLeaving] = useState<Record<string, true>>({});
  const [deleted, setDeleted] = useState<Record<string, true>>({});
  // True while "Go to Entry" shows its hand-off label, before the card goes.
  const [opening, setOpening] = useState(false);
  // Every frame and timeout the row animations schedule, so an unmount
  // mid-animation doesn't leave one firing into a component that's gone.
  const motionTimers = useRef(new Set<number>());

  const timer = useRef<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // The drawn scrollbar, as two fractions of the scroll region's own height:
  // how much of the list is in view, and how far down it starts. Null when
  // everything fits (nothing to scroll to, so nothing to draw). `more` is
  // whether any of the list is still below the fold — what the fade at the
  // region's bottom edge shows for.
  const [thumb, setThumb] = useState<{ size: number; offset: number; more: boolean } | null>(
    null,
  );

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  useEffect(() => {
    const timers = motionTimers.current;
    return () => {
      for (const id of timers) {
        window.clearTimeout(id);
        window.cancelAnimationFrame(id);
      }
    };
  }, []);

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
        more: scrollTop + clientHeight < scrollHeight - 1,
      });
    };

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // The groups too: rows growing in and collapsing out change how much is
    // below the fold over a whole animation, not just when a row is added.
    for (const group of el.children) observer.observe(group);

    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [stage, entries.length, recommended.length, created.length, deleted]);

  if (entries.length === 0 && recommended.length === 0) return null;

  // Link and unlink are the same write, opposite value — no confirmation
  // screen for either, just the row's own mark changing under the pointer.
  const setConnected = (key: string, connected: boolean) =>
    setOverrides((current) => ({ ...current, [key]: connected }));

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const after = (ms: number, run: () => void) => {
    const id = window.setTimeout(() => {
      motionTimers.current.delete(id);
      run();
    }, ms);
    motionTimers.current.add(id);
  };

  // Pressing a selected row again deselects it, so the actions can be put
  // away without reaching for anything else.
  const select = (key: string) => setSelected((current) => (current === key ? null : key));

  // So does a press anywhere else on the card's white — the header, the
  // heading, the gaps between groups — anything that isn't a row or one of
  // the actions (each marked `data-keeps-selection`), the way clicking off a
  // selection works anywhere else.
  const deselectOutside = (event: MouseEvent) => {
    if ((event.target as Element).closest("[data-keeps-selection]")) return;
    setSelected(null);
  };

  // No confirm step, like everything else on the card: the row collapsing
  // out of the list (the created row's entrance, run backwards) is the
  // feedback. The actions close at the same time, having nothing left to
  // act on.
  const remove = () => {
    if (!selected) return;
    const key = selected;
    setSelected(null);
    const drop = () => setDeleted((current) => ({ ...current, [key]: true }));
    if (reducedMotion()) return drop();
    setLeaving((current) => ({ ...current, [key]: true }));
    after(ENTER_MS, drop);
  };

  // There's no logbook to go to from a case study, so the hand-off is
  // played rather than made: the button flips to its "opening" label, then
  // the card steps back the way the header's × dismisses it, and comes back
  // with nothing selected.
  const open = () => {
    if (!selected || opening) return;
    setOpening(true);
    after(ENTER_MS * 2, () => {
      setOpening(false);
      setSelected(null);
      flash("dismissed", DISMISS_MS);
    });
  };

  // No confirmation here either — the new row appearing at the top of
  // Recent Entries, already linked, is the confirmation.
  const create = () => {
    if (!newEntry) return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `created-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setCreated((current) => [{ ...newEntry, connected: true, id }, ...current]);

    // The row lands at the top of the list, which may be scrolled out of
    // view — bring it back so the entrance is actually seen.
    scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    if (reducedMotion()) return;

    // Mounted collapsed; opened two frames later (one to commit the collapsed
    // style, one to transition away from it); linked once it's fully open.
    const setPhase = (phase: "collapsed" | "open" | null) =>
      setEntering((current) => {
        const next = { ...current };
        if (phase) next[id] = phase;
        else delete next[id];
        return next;
      });
    const later = (register: number) => motionTimers.current.add(register);

    setPhase("collapsed");
    later(
      window.requestAnimationFrame(() =>
        later(
          window.requestAnimationFrame(() => {
            setPhase("open");
            later(window.setTimeout(() => setPhase(null), ENTER_MS));
          }),
        ),
      ),
    );
  };

  // A stable key per row: content for anything parsed from the fence (which
  // never changes shape), the row's own `id` for anything "Create New Entry"
  // added — never position, or prepending a created row would hand every
  // row under it a new key and remount it.
  const rowKey = (label: string, entry: Entry) =>
    entry.id ?? `${label}-${entry.route}-${entry.tail}-${entry.date}-${entry.total}`;

  const rows = (label: string, all: Entry[]) => {
    const list = all.filter((entry) => !deleted[rowKey(label, entry)]);
    return list.length > 0 && (
      <div className={styles.logbookGroupBlock}>
        <p className={styles.logbookGroup}>{label}</p>
        <ul className={styles.logbookList}>
          {list.map((entry) => {
            const key = rowKey(label, entry);
            const phase = entry.id ? entering[entry.id] : undefined;
            // A created row entering the list shows as unlinked until it's in.
            const isConnected = !phase && (overrides[key] ?? entry.connected);
            const collapsed = phase === "collapsed" || leaving[key];

            return (
              <li
                key={key}
                className={styles.logbookRow}
                data-collapsed={collapsed || undefined}
                inert={leaving[key]}
              >
                <div className={styles.logbookRowClip}>
                  <div
                    className={styles.logbookPick}
                    data-selected={selected === key || undefined}
                    data-keeps-selection
                  >
                    <button
                      type="button"
                      className={styles.logbookRowAction}
                      data-variant={isConnected ? "connected" : "link"}
                      onClick={() => setConnected(key, !isConnected)}
                      aria-label={
                        isConnected
                          ? `Unlink this track log from ${entry.route}`
                          : `Link this track log to ${entry.route}`
                      }
                    >
                      <span className={styles.logbookRowIconPlus} aria-hidden>
                        <PlusGlyph />
                      </span>
                      <span className={styles.logbookRowIconUnlink} aria-hidden>
                        <UnlinkGlyph />
                      </span>
                    </button>

                    <span className={styles.logbookWhat}>
                      {/* The whole row's select target: this button's
                          ::after stretches over the row, under the circle,
                          so a press anywhere but the circle selects. */}
                      <button
                        type="button"
                        className={styles.logbookSelect}
                        onClick={() => select(key)}
                        aria-pressed={selected === key}
                        aria-label={`${entry.route}, ${entry.date}`}
                      >
                        <span className={styles.logbookRoute}>{entry.route}</span>
                      </button>
                      {entry.tail && <span className={styles.logbookTail}>{entry.tail}</span>}
                      <span
                        className={styles.logbookLinkedReveal}
                        data-open={isConnected || phase ? true : undefined}
                        aria-hidden={!isConnected}
                      >
                        <span className={styles.logbookLinkedClip}>
                          <span
                            className={styles.logbookLinkedTag}
                            data-label={phase ? "created" : "linked"}
                          >
                            {entry.id && (
                              <span className={styles.logbookLinkedCreated}>
                                {copy.createdNote}
                              </span>
                            )}
                            <span className={styles.logbookLinkedLinked}>
                              {copy.connectedNote}
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>

                    <span className={styles.logbookWhen}>
                      {entry.date && <span className={styles.logbookDate}>{entry.date}</span>}
                      {entry.total && <span className={styles.logbookTotal}>{entry.total}</span>}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const modal = (
    <div className={styles.logbookModal} data-state={stage} onClick={deselectOutside}>
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

          {/* Fades out once the list is scrolled to its end — there's
              nothing left for it to point at. */}
          <span
            className={styles.logbookScrollFade}
            data-visible={thumb?.more || undefined}
            aria-hidden
          />

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

        {/* The same reveal the rows use — a 0fr → 1fr track with the
            buttons sliding down into it — so selecting a row opens a space
            under "Create New Entry" rather than the buttons popping in. */}
        <div
          className={styles.logbookActionsReveal}
          data-open={selected ? true : undefined}
          inert={!selected}
        >
          <div className={styles.logbookActionsClip}>
            <div className={styles.logbookActions} data-keeps-selection>
              <button type="button" className={styles.logbookDelete} onClick={remove}>
                {copy.remove}
              </button>
              <button
                type="button"
                className={styles.logbookOpen}
                onClick={open}
                data-label={opening ? "opening" : "open"}
                aria-live="polite"
              >
                <span className={styles.logbookOpenIdle} aria-hidden={opening}>
                  {copy.open}
                </span>
                <span className={styles.logbookOpenBusy} aria-hidden={!opening}>
                  {copy.opening}
                </span>
              </button>
            </div>
          </div>
        </div>
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
 * away) — a plus for "add this one," the row action's resting mark, and a
 * broken chain for "this is linked; press to unlink it." All but the chain
 * are a couple of straight strokes, and the chain is two rounded links and
 * the break marks between them, all drawn at the weight the header and
 * the action blue carry, so there's no icon library to pull in for this.
 * `CheckGlyph` and `CloseGlyph` are exported for LogbookPickerBefore.tsx,
 * which draws the same header chrome and the same confirmation check;
 * `PlusGlyph` and `UnlinkGlyph` aren't — that pass never drew either.
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

function UnlinkGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M18.8 12.3 L20.5 10.5 A5 5 0 0 0 13.5 3.5 L11.8 5.2 M5.2 11.7 L3.5 13.5 A5 5 0 0 0 10.5 20.5 L12.2 18.8 M8 2 L8 5 M2 8 L5 8 M16 19 L16 22 M19 16 L22 16"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
