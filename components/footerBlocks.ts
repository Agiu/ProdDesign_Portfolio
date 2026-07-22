import { growAround, type Cell } from "./organicMosaic";

/**
 * The footer mosaic, in grid units of the smallest square — two corner
 * clusters staircasing out of the bottom edges. See organicMosaic.ts for how
 * the grid, the anchoring and the `grow` derivation work.
 */
export type FooterBlock = Cell & {
  corner: "left" | "right";
  kind: "base" | "grow";
  /** transform-origin for a "grow" block — the edge it touches its neighbour
      on, so it scales up from that point rather than from its centre. Unset
      on "base" blocks, which never scale. */
  origin?: string;
};

const RIGHT_BASE: Cell[] = [
  { a: 0, b: 0, s: 4 },
  { a: 0, b: 4, s: 4 },
  { a: 0, b: 10, s: 1 },
  { a: 2, b: 8, s: 2 },
  { a: 4, b: 0, s: 4 },
  { a: 4, b: 4, s: 1 },
  { a: 6, b: 6, s: 2 },
  { a: 8, b: 0, s: 2 },
  { a: 8, b: 4, s: 2 },
  { a: 10, b: 0, s: 1 },
  { a: 10, b: 6, s: 1 },
];

const LEFT_BASE: Cell[] = [
  { a: 0, b: 2, s: 2 },
  { a: 2, b: 0, s: 2 },
];

const RIGHT_GROW = growAround(RIGHT_BASE, { a: 13, b: 13 }, 14, 1, "right");
const LEFT_GROW = growAround(LEFT_BASE, { a: 5, b: 5 }, 4, 2, "left");

/** Base blocks first, then growth — the animation hook relies on that order. */
export const FOOTER_BLOCKS: FooterBlock[] = [
  ...RIGHT_BASE.map((c) => ({ ...c, corner: "right" as const, kind: "base" as const })),
  ...LEFT_BASE.map((c) => ({ ...c, corner: "left" as const, kind: "base" as const })),
  ...RIGHT_GROW.map((c) => ({ ...c, corner: "right" as const, kind: "grow" as const })),
  ...LEFT_GROW.map((c) => ({ ...c, corner: "left" as const, kind: "grow" as const })),
];

export const BASE_COUNT = RIGHT_BASE.length + LEFT_BASE.length;
