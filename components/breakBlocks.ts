import { growAround, type Cell } from "./organicMosaic";

/**
 * The mosaic on the "more case studies" break — the footer's idiom (see
 * organicMosaic.ts) reduced to ornament scale: one cluster, anchored bottom
 * left inside its own box, so it stands on the hairline rule like a skyline
 * rather than floating beside it.
 *
 * Every block anchors to the left, so there's no `corner` to carry here the
 * way FOOTER_BLOCKS does.
 */
export type BreakBlock = Cell & {
  kind: "base" | "grow";
  /** transform-origin for a "grow" block — see FooterBlock. */
  origin?: string;
};

/**
 * Deliberately gap-toothed. A solid 12-unit bar with a skyline on top reads as
 * a rule with decoration; leaving a3, a7 and a10 empty at ground level makes it
 * a cluster instead — and hands the growth pass somewhere to fill back in, so
 * the strip visibly closes and opens along its own baseline.
 */
const BASE: Cell[] = [
  { a: 0, b: 0, s: 2 },
  { a: 2, b: 0, s: 1 },
  { a: 4, b: 0, s: 3 },
  { a: 7, b: 1, s: 1 },
  { a: 8, b: 0, s: 2 },
  { a: 11, b: 0, s: 1 },
];

/* Reach is capped much harder on `b` than on `a`: the strip is allowed to
   spread along the rule, but a cluster four storeys tall would stop reading as
   a divider and start competing with the cards. */
const GROW = growAround(BASE, { a: 11, b: 3 }, 7, 5, "left");

/** Base blocks first, then growth — the animation hook relies on that order. */
export const BREAK_BLOCKS: BreakBlock[] = [
  ...BASE.map((c) => ({ ...c, kind: "base" as const })),
  ...GROW.map((c) => ({ ...c, kind: "grow" as const })),
];

export const BREAK_BASE_COUNT = BASE.length;

/** The box the cluster is anchored inside, in grid units — `a`'s reach plus the
    widest block that can sit at it, and the same for `b`. */
export const BREAK_COLUMNS = 12;
export const BREAK_ROWS = 4;
