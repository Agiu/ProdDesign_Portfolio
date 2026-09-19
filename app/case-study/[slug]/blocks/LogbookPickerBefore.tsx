"use client";

import { useEffect, useRef, useState } from "react";
import { CheckGlyph, CloseGlyph, parseLogbook, type Entry } from "./LogbookPicker";
import styles from "../CaseStudy.module.css";

/**
 * The "before" half of `logbook-compare` (LogbookCompare.tsx) — a preserved
 * snapshot of the *first* pass at the `logbook` block, kept around
 * specifically so the case study can show the interaction change rather
 * than just assert it in prose. It reads the exact same fence content as
 * LogbookPicker.tsx (via the shared `parseLogbook`) and renders it the way
 * that first pass did:
 *
 *   - a checkbox on the left of each row, one row pickable at a time —
 *     ticking a different row clears whatever was ticked before it;
 *   - a primary "Add to Logbook Entry" button under the list, disabled
 *     until something is picked, which is the second press the current
 *     design removed;
 *   - "Show More" to reveal the rest of Recent Entries, rather than the
 *     current design's scrolling list with Recommended further down it.
 *
 * It deliberately ignores two fields `parseLogbook` returns: `recommended`
 * (that group didn't exist yet at this stage) and each entry's `connected`
 * flag (neither did the idea of an already-linked row) — folding either in
 * would misrepresent what this pass actually looked like. `bare` matches
 * LogbookPicker.tsx's own prop, so LogbookCompare.tsx can seat both modals
 * on one shared stage.
 */

const CONFIRM_MS = 2600;
const DISMISS_MS = 900;

/** Rows shown before "Show More" — the number this pass drew. */
const VISIBLE = 4;

const PRIMARY_LABEL = "Add to Logbook Entry";
const MORE_LABEL = "Show More";
const LESS_LABEL = "Show Less";

type Stage = "idle" | "confirming" | "dismissed";

export function LogbookPickerBefore({ content, bare }: { content: string; bare?: boolean }) {
  const { copy, entries } = parseLogbook(content);

  const [stage, setStage] = useState<Stage>("idle");
  const [picked, setPicked] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [outcome, setOutcome] = useState<{ headline: string; note: string } | null>(null);

  const timer = useRef<number | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const flash = (next: Stage, ms: number) => {
    clearTimer();
    setStage(next);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setStage("idle");
      setOutcome(null);
    }, ms);
  };

  const toggle = (i: number) => setPicked((current) => (current === i ? null : i));

  if (entries.length === 0) return null;

  const shown = expanded ? entries : entries.slice(0, VISIBLE);
  const hasMore = entries.length > VISIBLE;

  const add = () => {
    if (picked === null) return;
    setOutcome({ headline: `${entries[picked].route} linked`, note: copy.confirm });
    flash("confirming", CONFIRM_MS);
  };

  const create = () => {
    setOutcome({ headline: copy.confirmNew, note: copy.confirm });
    flash("confirming", CONFIRM_MS);
  };

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

        {stage === "confirming" && outcome ? (
          <div className={styles.logbookDone} role="status">
            <span className={styles.logbookDoneMark} aria-hidden>
              <CheckGlyph />
            </span>
            {outcome.headline && <p className={styles.logbookDoneHeadline}>{outcome.headline}</p>}
            {outcome.note && <p className={styles.logbookDoneNote}>{outcome.note}</p>}
          </div>
        ) : (
          <>
            {copy.group && <p className={styles.logbookGroup}>{copy.group}</p>}

            <ul className={styles.logbookList} data-active={picked !== null || undefined}>
              {shown.map((entry: Entry, i) => (
                <li
                  key={`${entry.route}-${i}`}
                  className={styles.logbookRow}
                  data-picked={picked === i || undefined}
                >
                  <label className={styles.logbookPick}>
                    <input
                      type="checkbox"
                      className={styles.logbookCheck}
                      checked={picked === i}
                      onChange={() => toggle(i)}
                    />
                    <span className={styles.logbookWhat}>
                      <span className={styles.logbookRoute}>{entry.route}</span>
                      {entry.tail && <span className={styles.logbookTail}>{entry.tail}</span>}
                    </span>
                    <span className={styles.logbookWhen}>
                      {entry.date && <span className={styles.logbookDate}>{entry.date}</span>}
                      {entry.total && <span className={styles.logbookTotal}>{entry.total}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            {hasMore && (
              <button
                type="button"
                className={styles.logbookMore}
                aria-expanded={expanded}
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? LESS_LABEL : MORE_LABEL}
              </button>
            )}

            <button
              type="button"
              className={styles.logbookPrimary}
              onClick={add}
              disabled={picked === null}
            >
              {PRIMARY_LABEL}
            </button>
            <button type="button" className={styles.logbookSecondary} onClick={create}>
              {copy.secondary}
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (bare) return modal;

  return <div className={styles.logbookStage}>{modal}</div>;
}
