/**
 * The footer mosaic, in grid units of the smallest square.
 *
 * `base` blocks are the staircase from the Figma. `grow` blocks are derived from
 * them: every empty cell orthogonally touching a filled one is a candidate
 * growth site, so new blocks can only ever accrete onto the existing shape — the
 * mosaic thickens and thins along its own edge instead of sprouting islands.
 *
 * `a` is the offset from the corner the block is anchored to, so a right-corner
 * block measures `a` from the right edge. Everything is anchored rather than
 * placed, which lets the footer be any height and still land the mosaic in its
 * corners.
 */
export type FooterBlock = {
  corner: "left" | "right";
  a: number;
  b: number;
  s: number;
  kind: "base" | "grow";
  /** transform-origin for a "grow" block — the edge it touches its neighbour
      on, so it scales up from that point rather than from its centre. Unset
      on "base" blocks, which never scale. */
  origin?: string;
};

type Cell = { a: number; b: number; s: number };
type Corner = "left" | "right";
type GrownCell = Cell & { origin: string };

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/**
 * `da`/`db` is the step, in grid units, from a growth cell toward the
 * neighbour it's attached to — so the neighbour sits back along (-da, -db).
 * That's the edge the block should grow out of, expressed as a
 * transform-origin percentage pair.
 *
 * `a` runs from whichever edge the cluster is anchored to (`right` for the
 * right-corner cluster, `left` for the left one), so which screen direction a
 * growing `a` moves in depends on the corner — hence threading `corner`
 * through here rather than hardcoding one mapping.
 */
function originFor(corner: Corner, da: number, db: number): string {
  let x = 50;
  let y = 50;

  if (da !== 0) {
    // `right: u(a)` (right cluster) or `left: u(a)` (left cluster): either way,
    // a larger `a` moves the block away from its own cluster's anchor edge —
    // rightward for the left cluster, leftward for the right one. So whether
    // "the neighbour has a larger `a`" puts it on screen-left or screen-right
    // flips with which edge the cluster is anchored to.
    const neighbourHasLargerA = da > 0;
    const cornerIsLeft = corner === "left";
    x = neighbourHasLargerA !== cornerIsLeft ? 0 : 100;
  }

  if (db !== 0) {
    // `b` is always distance from the bottom, for both corners: a larger `b`
    // is higher on screen, so a neighbour there touches this block's top edge.
    y = db > 0 ? 0 : 100;
  }

  return `${x}% ${y}%`;
}

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

/** Deterministic — the same mosaic on the server and the client. */
function seed(n: number, salt: number) {
  const x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function occupied(blocks: Cell[]) {
  const set = new Set<string>();
  for (const block of blocks) {
    for (let i = 0; i < block.s; i++) {
      for (let j = 0; j < block.s; j++) {
        set.add(`${block.a + i},${block.b + j}`);
      }
    }
  }
  return set;
}

/** Empty cells touching the mosaic's edge — where it's allowed to grow. */
function candidates(
  blocks: Cell[],
  reach: number,
  limit: number,
  salt: number,
  corner: Corner,
): GrownCell[] {
  const filled = occupied(blocks);
  const seen = new Set<string>();
  const out: GrownCell[] = [];

  for (const key of filled) {
    const [a, b] = key.split(",").map(Number);

    for (const [da, db] of DIRECTIONS) {
      const na = a + da;
      const nb = b + db;
      const k = `${na},${nb}`;

      if (na < 0 || nb < 0 || na > reach || nb > reach) continue;
      if (filled.has(k) || seen.has(k)) continue;

      seen.add(k);
      // (da, db) is the step from the filled cell to this one, so the filled
      // cell sits back along (-da, -db) — that's the edge this block touches
      // it on, and so the edge it should grow out of.
      out.push({ a: na, b: nb, s: 1, origin: originFor(corner, -da, -db) });
    }
  }

  // Deterministic shuffle, then take a handful — the whole rim at once would
  // just be a second solid layer.
  return out
    .map((cell) => ({ cell, key: seed(cell.a * 31 + cell.b, salt) }))
    .sort((x, y) => x.key - y.key)
    .slice(0, limit)
    .map(({ cell }) => cell);
}

const RIGHT_GROW = candidates(RIGHT_BASE, 13, 14, 1, "right");
const LEFT_GROW = candidates(LEFT_BASE, 5, 4, 2, "left");

/** Base blocks first, then growth — the animation hook relies on that order. */
export const FOOTER_BLOCKS: FooterBlock[] = [
  ...RIGHT_BASE.map((c) => ({ ...c, corner: "right" as const, kind: "base" as const })),
  ...LEFT_BASE.map((c) => ({ ...c, corner: "left" as const, kind: "base" as const })),
  ...RIGHT_GROW.map((c) => ({ ...c, corner: "right" as const, kind: "grow" as const })),
  ...LEFT_GROW.map((c) => ({ ...c, corner: "left" as const, kind: "grow" as const })),
];

export const BASE_COUNT = RIGHT_BASE.length + LEFT_BASE.length;
