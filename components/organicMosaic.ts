/**
 * The shared machinery behind every block mosaic on the site — the footer's
 * corner clusters (footerBlocks.ts) and the case-study break's strip
 * (breakBlocks.ts).
 *
 * A mosaic is laid out in grid units of the smallest square. `a` is the offset
 * from the corner the cluster is anchored to (so a right-corner block measures
 * `a` from the right edge) and `b` is always the offset from the bottom.
 * Everything is anchored rather than placed, which lets a container be any size
 * and still land the mosaic where it belongs.
 *
 * `base` cells are drawn by hand. `grow` cells are derived from them: every
 * empty cell orthogonally touching a filled one is a candidate growth site, so
 * new blocks can only ever accrete onto the existing shape — a mosaic thickens
 * and thins along its own edge instead of sprouting islands.
 */

export type Cell = { a: number; b: number; s: number };
export type Corner = "left" | "right";

/** A candidate growth cell, plus the edge it should scale up out of. */
export type GrownCell = Cell & { origin: string };

/** How far out from the anchor corner growth is allowed to reach, per axis. */
export type Reach = { a: number; b: number };

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
 * `a` runs from whichever edge the cluster is anchored to (`right` for a
 * right-corner cluster, `left` for a left one), so which screen direction a
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

/** Deterministic — the same mosaic on the server and the client. */
export function seed(n: number, salt: number) {
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

/**
 * Empty cells touching the mosaic's edge — where it's allowed to grow. Capped
 * per axis by `reach`, so a strip can be free to spread sideways without also
 * being free to grow four storeys tall.
 */
export function growAround(
  blocks: Cell[],
  reach: Reach,
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

      if (na < 0 || nb < 0 || na > reach.a || nb > reach.b) continue;
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
