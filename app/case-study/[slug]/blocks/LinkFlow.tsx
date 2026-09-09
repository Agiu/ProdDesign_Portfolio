"use client";

import { createTimeline, cubicBezier, stagger, utils } from "animejs";
import { useEffect, useRef } from "react";
import styles from "../CaseStudy.module.css";

/**
 * The `flow` custom block — a user flow played rather than listed.
 *
 * This is the ForeFlight study's track-log → logbook link, which the source
 * markdown wrote as five bullets. Bullets are the wrong shape for it: the
 * argument of the feature is that a pile of recorded telemetry ends up
 * *inside* one logbook entry without the pilot retyping any of it, and a list
 * can only assert that. So the block draws the two ends — the track logs on
 * the left, the logbook entry on the right — and moves every recorded field
 * across the gap between them until the entry is full.
 *
 * Five beats, in the order the bullets had them:
 *
 *   1. the kebab on a track log row opens;
 *   2. "Link Logbook" is pressed — one press, which is the point;
 *   3. there is no entry yet, so one is created (the empty card lifts off the
 *      shell that was underneath it all along);
 *   4. every field a track log records crosses the wire and lands on its row
 *      of the entry — the fields are the ones named in the `stream` block
 *      further up the page, so the two blocks make the same claim;
 *   5. the second leg sends too, and the entry resolves to one consolidated
 *      flight rather than two fragments.
 *
 * Fixtures are authored in the fence (see parseFlow) so the numbers live in
 * the markdown next to the prose that makes the claim, not in here.
 *
 * Choreography and resting state follow TrackStream.tsx exactly, which is the
 * site's rule for this: CSS owns the pending state off `data-anim`, so the
 * block is served hidden rather than hidden by a script after first paint,
 * and both ways out of it — reduced motion, and no JS at all — settle every
 * element where it belongs, entry filled. `data-anim="done"` comes off the
 * last tween so nothing is left depending on inline styles anime happened to
 * write, and Replay puts it back to pending and measures again.
 */

const EASE = cubicBezier(0.22, 1, 0.36, 1);
/* Chips are thrown rather than eased in both directions: a quick departure
   and a long settle onto the row they fill. */
const EASE_SEND = cubicBezier(0.5, 0, 0.2, 1);

/* Same margin the site's reveal hook uses, so this trips on the same beat as
   every other block that arrives on scroll. */
const ROOT_MARGIN = "0px 0px -15% 0px";

/* Beat marks, ms from the start. Named rather than accumulated so one beat
   can be re-timed without re-deriving every beat after it. */
const T = {
  arrive: 0,
  menu: 760,
  press: 1420,
  create: 2060,
  send: 2560,
};

/* One field leaves every CHIP_GAP and is in the air for CHIP_TRAVEL — so
   several are always crossing at once. Fields arriving strictly one after
   another read as a queue being worked; overlapping, they read as a
   recording being poured across, which is what a track log is. */
const CHIP_GAP = 300;
const CHIP_TRAVEL = 520;

/* Departure points fanned across the log card rather than all taken from its
   midpoint, so two fields in the air at once are visibly two fields. */
const CHIP_FAN = 11;

/** Where the pointer starts, relative to the control it is reaching for. */
const CURSOR_APPROACH = 30;

/** Menu items either side of the one that matters — context, so the press
 *  reads as a press of *this* item rather than of the only thing on screen. */
const MENU = ["Duplicate", "Link Logbook", "Export CSV", "Delete"];
const MENU_TARGET = 1;

type Leg = { route: string; meta: string };
type Field = { label: string; value: string; from: number[] };
type Step = { title: string; note: string };

/**
 * The fence, one record per line, `kind: ...` with `|`-separated parts:
 *
 *   step:  title | note
 *   leg:   route | meta
 *   field: label | value | which leg it came from (`1`, `2` or `both`)
 *   entry: the title the logbook entry resolves to
 *
 * A bare line is a step, so the original bullet list still renders as the
 * flow's captions if one is pasted straight in; anything the fence leaves
 * out falls back to the fixtures below.
 */
function parseFlow(content: string) {
  const steps: Step[] = [];
  const legs: Leg[] = [];
  const fields: Field[] = [];
  let entry = "";

  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^(step|leg|field|entry)\s*:\s*(.*)$/i);
    const kind = match ? match[1].toLowerCase() : "step";
    const parts = (match ? match[2] : line).split("|").map((part) => part.trim());

    if (kind === "entry") {
      entry = parts[0];
    } else if (kind === "leg") {
      legs.push({ route: parts[0], meta: parts[1] ?? "" });
    } else if (kind === "field") {
      // "both" is how a field that has to be reconciled across legs — total
      // time, most obviously — is written; it sends one chip from each.
      const source = (parts[2] ?? "1").toLowerCase();
      const leg = Math.max(0, (Number(source) || 1) - 1);
      fields.push({
        label: parts[0],
        value: parts[1] ?? "",
        from: source === "both" ? [0, 1] : [leg],
      });
    } else {
      steps.push({ title: parts[0], note: parts[1] ?? "" });
    }
  }

  const resolvedLegs = legs.length ? legs : FALLBACK.legs;
  return {
    steps: steps.length ? steps : FALLBACK.steps,
    legs: resolvedLegs,
    // A field can't be sent from a leg that isn't there.
    fields: (fields.length ? fields : FALLBACK.fields).map((field) => ({
      ...field,
      from: field.from.filter((leg) => leg < resolvedLegs.length),
    })),
    entry: entry || FALLBACK.entry,
  };
}

const FALLBACK = {
  steps: [
    { title: "Open the kebab", note: "On any track log row" },
    { title: "Press “Link Logbook”", note: "One press, no matching screen" },
    { title: "No entry yet? One is created", note: "" },
    { title: "Telemetry crosses over", note: "Every recorded field" },
    { title: "Legs consolidate", note: "Two track logs, one entry" },
  ] as Step[],
  legs: [
    { route: "Leg 1", meta: "Track log" },
    { route: "Leg 2", meta: "Track log" },
  ] as Leg[],
  fields: [
    { label: "Telemetry", value: "recorded", from: [0] },
    { label: "Distance", value: "recorded", from: [1] },
  ] as Field[],
  entry: "Logbook entry",
};

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function LinkFlow({ content }: { content: string }) {
  const { steps, legs, fields, entry } = parseFlow(content);

  const ref = useRef<HTMLDivElement>(null);
  const running = useRef<{ pause: () => void } | null>(null);

  /* Every chip that will cross: one per (field, source leg) pair. Each one
     carries the row it fills and the leg it left, so the timeline reads its
     own route off the node instead of the markup and the choreography
     keeping two lists of the same thing in step. */
  const sends = fields.flatMap((field, row) =>
    field.from.map((leg) => ({ field, row, leg })),
  );

  /* Replay: the same build, measured again — the panel may have reflowed
     since the first pass, and a chip aimed at a stale row would miss. */
  const play = () => {
    const el = ref.current;
    if (!el) return;
    running.current?.pause();
    reset(el);
    running.current = build(el, steps.length);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;

    const observer = new IntersectionObserver(
      ([visible]) => {
        if (!visible.isIntersecting) return;
        observer.disconnect();
        running.current = build(el, steps.length);
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      running.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.flow} data-anim="pending" ref={ref}>
      <div className={styles.flowStage} data-stage>
        {/* Source: the track logs, as the web app lists them. */}
        <div className={styles.flowSide}>
          <p className={styles.flowColLabel} data-row>
            Track logs
          </p>
          {legs.map((leg, i) => (
            <div key={i} className={styles.flowLog} data-row data-leg={i}>
              <span className={styles.flowLogRoute}>{leg.route}</span>
              <span className={styles.flowLogMeta}>{leg.meta}</span>
              {/* A `data-value` like any other: held back until it is true,
                  then revealed by the leg's own [data-linked] state. */}
              <span className={styles.flowLinked} data-value>
                Linked
              </span>
              {/* Only the first row carries the menu — the flow is one row's
                  kebab, and two open menus would read as two flows. */}
              {i === 0 && (
                <>
                  <span className={styles.flowKebab} data-kebab aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={styles.flowMenu} data-menu aria-hidden>
                    {MENU.map((item, m) => (
                      <span
                        key={item}
                        className={styles.flowMenuItem}
                        {...(m === MENU_TARGET ? { "data-menu-item": "link" } : {})}
                      >
                        {item}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* The gap the data crosses. Decorative: the chips carry the meaning
            and the entry beside it states the outcome in text. */}
        <div className={styles.flowWire} data-row aria-hidden>
          <span className={styles.flowWireLine} />
        </div>

        {/* Target: the logbook entry, filled by what arrives. */}
        <div className={styles.flowSide}>
          <p className={styles.flowColLabel} data-row>
            Logbook entry
          </p>
          <div className={styles.flowEntry} data-row data-entry>
            <span className={styles.flowEntryTitle} data-value data-entry-title>
              {entry}
            </span>
            <span className={styles.flowEntryGhost} data-ghost aria-hidden>
              Untitled entry
            </span>
            <dl className={styles.flowRows}>
              {fields.map((field, i) => (
                <div key={i} className={styles.flowRow} data-field-row={i}>
                  <dt className={styles.flowRowLabel}>{field.label}</dt>
                  <dd className={styles.flowRowValue} data-value data-field-value={i}>
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className={styles.flowEntryFoot} data-value data-entry-foot>
              {legs.length} track logs linked · {fields.length} fields filled from telemetry
            </p>
            {/* The state before beat 3: nothing to link to yet. Opaque, and
                laid over the finished shell, so the shell can arrive with
                everything else and still go unseen until it is created. */}
            <span className={styles.flowEmpty} data-empty aria-hidden>
              No logbook entry — one is created for you
            </span>
          </div>
        </div>

        {/* Chips and pointer belong to the panel, not to either column,
            because they travel between them. */}
        {sends.map((send, i) => (
          <span
            key={i}
            className={styles.flowChip}
            data-chip
            data-chip-row={send.row}
            data-chip-leg={send.leg}
            aria-hidden
          >
            <b>{send.field.label}</b>
            {send.field.value}
          </span>
        ))}
        <span className={styles.flowCursor} data-cursor aria-hidden />
      </div>

      <ol className={styles.flowSteps}>
        {steps.map((step, i) => (
          <li key={i} className={styles.flowStep} data-step={i} data-row>
            <span className={styles.flowStepTitle}>{step.title}</span>
            {step.note && <span className={styles.flowStepNote}>{step.note}</span>}
          </li>
        ))}
      </ol>

      <button type="button" className={styles.flowReplay} data-flow-replay onClick={play}>
        Replay the flow
      </button>
    </div>
  );
}

/* ---- choreography ------------------------------------------------------ */

/** Everything a tween touches, cleared back to the served state. */
function reset(el: HTMLElement) {
  const moved = el.querySelectorAll<HTMLElement>(
    "[data-row],[data-value],[data-chip],[data-cursor],[data-menu],[data-empty],[data-ghost],[data-entry],[data-kebab]",
  );
  utils.remove(moved);
  // None of these carry authored inline styles — everything on them was
  // written by a tween — so dropping the attribute is the whole cleanup.
  moved.forEach((node) => node.removeAttribute("style"));
  el.querySelectorAll<HTMLElement>("[data-leg]").forEach((n) => delete n.dataset.linked);
  el.querySelectorAll<HTMLElement>("[data-step]").forEach((n) => delete n.dataset.active);
  el.querySelectorAll<HTMLElement>("[data-field-row]").forEach((n) => delete n.dataset.filled);
  const target = el.querySelector<HTMLElement>("[data-menu-item='link']");
  if (target) delete target.dataset.hot;
  delete el.dataset.wire;
  el.dataset.anim = "pending";
}

type Box = { x: number; y: number; w: number; h: number; cx: number; cy: number };

function build(el: HTMLElement, stepCount: number) {
  const one = (sel: string) => el.querySelector<HTMLElement>(sel);
  const all = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));

  /* Chips and the pointer are absolutely positioned inside the stage, so the
     stage — not the block — is the coordinate space their left/top live in. */
  const stage = one("[data-stage]") ?? el;

  /* Measured with the arrival offset lifted (see the `measure` state in the
     CSS): the pending state holds every row 14px low, and a chip aimed at a
     row's pending position would land 14px off the value it fills, since by
     the time it flies the rows have settled. */
  el.dataset.anim = "measure";
  const host = stage.getBoundingClientRect();
  const at = (node: HTMLElement): Box => {
    const r = node.getBoundingClientRect();
    return {
      x: r.left - host.left,
      y: r.top - host.top,
      w: r.width,
      h: r.height,
      cx: r.left - host.left + r.width / 2,
      cy: r.top - host.top + r.height / 2,
    };
  };

  const rows = all("[data-row]");
  const legCards = all("[data-leg]");
  const chips = all("[data-chip]");
  const stepNodes = all("[data-step]");
  const cursor = one("[data-cursor]");
  const kebab = one("[data-kebab]");
  const menu = one("[data-menu]");
  const menuItem = one("[data-menu-item='link']");
  const empty = one("[data-empty]");
  const ghost = one("[data-ghost]");
  const entryCard = one("[data-entry]");
  const title = one("[data-entry-title]");
  const foot = one("[data-entry-foot]");

  /* Every box the timeline needs, taken in one pass while the layout is
     settled — after this the block goes back to pending and nothing else is
     measured, so a tween can never read a position mid-tween. */
  const kebabBox = kebab ? at(kebab) : null;
  const menuBox = menuItem ? at(menuItem) : null;
  /** One flight per chip: where it leaves, where it lands, when, what it
   *  fills. A chip whose ends are missing (a field pointing at a leg that
   *  isn't rendered) simply doesn't fly. */
  const flights = chips.flatMap((chip) => {
    const row = Number(chip.dataset.chipRow ?? 0);
    const leg = Number(chip.dataset.chipLeg ?? 0);
    const from = legCards[leg];
    const to = one(`[data-field-value="${row}"]`);
    if (!from || !to) return [];
    return [
      {
        chip,
        to,
        row,
        leg,
        start: T.send + row * CHIP_GAP,
        src: at(from),
        dst: at(to),
        size: { w: chip.offsetWidth, h: chip.offsetHeight },
      },
    ];
  });
  el.dataset.anim = "pending";

  /** Light the step whose beat we are on, and only that one. */
  const step = (i: number) => {
    const index = Math.min(i, stepCount - 1);
    stepNodes.forEach((node) => {
      if (Number(node.dataset.step) === index) node.dataset.active = "true";
      else delete node.dataset.active;
    });
  };

  const tl = createTimeline({
    defaults: { ease: EASE },
    onComplete: () => {
      el.dataset.anim = "done";
      delete el.dataset.wire;
    },
  });

  // 1 — the panel arrives, on the same reveal as every other block.
  tl.add(
    rows,
    { opacity: [0, 1], translateY: [14, 0], duration: 560, delay: stagger(60) },
    T.arrive,
  );

  // 2 — the kebab. The pointer comes in from below-right, the way a hand
  //     arrives at a control it was not already resting on.
  if (cursor && kebab && kebabBox) {
    const k = kebabBox;
    tl.add(
      cursor,
      {
        opacity: [0, 1],
        translateX: [k.cx + CURSOR_APPROACH, k.cx],
        translateY: [k.cy + CURSOR_APPROACH, k.cy],
        duration: 460,
      },
      T.menu - 460,
    );
    tl.call(() => step(0), T.menu - 460);
    tl.add(cursor, { scale: [1, 0.68], duration: 110 }, T.menu);
    tl.add(cursor, { scale: 1, duration: 200 }, T.menu + 110);
    tl.add(kebab, { opacity: [0.55, 1], duration: 160 }, T.menu);
  }
  if (menu) {
    tl.add(
      menu,
      { opacity: [0, 1], translateY: [-6, 0], scaleY: [0.9, 1], duration: 300 },
      T.menu + 90,
    );
  }

  // 3 — the press. This is the whole feature, so the beat is short and
  //     nothing else on the panel moves during it.
  if (cursor && menuItem && menuBox) {
    const m = menuBox;
    tl.add(cursor, { translateX: m.cx, translateY: m.cy, duration: 430 }, T.press - 470);
    tl.call(() => {
      menuItem.dataset.hot = "true";
      step(1);
    }, T.press - 200);
    tl.add(cursor, { scale: [1, 0.68], duration: 110 }, T.press);
    tl.add(cursor, { scale: 1, duration: 200 }, T.press + 110);
  }
  if (menu) tl.add(menu, { opacity: 0, translateY: -4, duration: 240 }, T.press + 220);
  if (cursor) tl.add(cursor, { opacity: 0, duration: 260 }, T.press + 340);

  // 4 — nothing to link to, so an entry is made. The empty card lifts off
  //     the shell, which was built and blank underneath it.
  if (empty) tl.add(empty, { opacity: [1, 0], duration: 400 }, T.create);
  if (entryCard) tl.add(entryCard, { scale: [0.985, 1], duration: 560 }, T.create);
  tl.call(() => {
    step(2);
    el.dataset.wire = "flowing";
  }, T.create);

  // 5 — the crossing. Every chip is placed at its own leg's edge and flown
  //     to the row it fills, and the value appears only when its chip lands,
  //     so the entry fills at exactly the rate the data arrives.
  const departure = new Map<number, number>();
  flights.forEach(({ chip, to, row, leg, start, src, dst, size }) => {
    // Leaves the log card's trailing edge, lands just short of the value it
    // becomes — on a stacked (narrow) layout that same pair of points reads
    // as a fall rather than a crossing, which is still the right story.
    // Both ends held inside the stage, which clips: on a narrow, stacked
    // layout the log card runs the full width, so a chip leaving its trailing
    // edge would start off-panel, and one aimed at the left edge of a
    // right-aligned value would finish off it.
    const startX = Math.min(src.x + src.w - 20, host.width - size.w - 8);
    const startY = src.cy + ((row % 3) - 1) * CHIP_FAN;
    const endX = Math.max(8, dst.x - size.w - 8);
    const endY = dst.cy;

    chip.style.left = `${startX}px`;
    chip.style.top = `${startY - size.h / 2}px`;

    tl.add(
      chip,
      {
        opacity: [0, 1],
        translateX: [0, endX - startX],
        translateY: [0, endY - startY],
        duration: CHIP_TRAVEL,
        ease: EASE_SEND,
      },
      start,
    );
    // Out again as it lands, so the value it deposits is what remains.
    tl.add(chip, { opacity: 0, duration: 180 }, start + CHIP_TRAVEL - 180);

    tl.call(() => {
      const rowNode = one(`[data-field-row="${row}"]`);
      if (rowNode) rowNode.dataset.filled = "true";
      step(3);
    }, start + CHIP_TRAVEL - 60);
    tl.add(
      to,
      { opacity: [0, 1], translateX: [10, 0], duration: 340 },
      start + CHIP_TRAVEL - 60,
    );

    // A leg lights the moment it first sends — that is when leg 2 joins in,
    // and it is the only cue that this entry is built out of two logs.
    const first = departure.get(leg);
    if (first === undefined || start < first) departure.set(leg, start);
  });

  departure.forEach((start, leg) => {
    const card = legCards[leg];
    if (card) tl.call(() => (card.dataset.linked = "true"), Math.max(0, start - 140));
  });

  // 6 — settled: two logs, one flight, and the entry says so in its own head.
  const lastLanding = flights.reduce((max, flight) => Math.max(max, flight.start), T.send);
  const settle = lastLanding + CHIP_TRAVEL + 120;
  tl.call(() => step(4), settle);
  if (ghost) tl.add(ghost, { opacity: [1, 0], duration: 300 }, settle);
  if (title) tl.add(title, { opacity: [0, 1], translateY: [6, 0], duration: 460 }, settle);
  if (foot) tl.add(foot, { opacity: [0, 1], duration: 460 }, settle + 140);

  return tl;
}
