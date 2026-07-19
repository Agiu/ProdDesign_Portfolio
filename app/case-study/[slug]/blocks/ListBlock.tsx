import { Icon } from "./Icon";
import styles from "../CaseStudy.module.css";

/**
 * The Figma "List Component" — shared by the `insights`, `hmw` and `rules`
 * blocks.
 *
 * A stack of dark horizontal cards. `insights` lines are `Title | Description |
 * Icon` (icon on the left, title + description to its right); `hmw` and `rules`
 * lines are a single plain sentence each (no icon, no title). The
 * pixel-square ornament sits in a corner that's *randomized per card* but,
 * per the Figma note, never repeats the previous card's corner and never lands
 * directly above/below its neighbour's. Placement is seeded off the block's
 * text so it's deterministic (stable HTML, varied between blocks).
 *
 * A plain server component — static content, no client JS.
 */

type Corner = "tl" | "tr" | "bl" | "br";
const CORNERS: Corner[] = ["tl", "tr", "bl", "br"];

type Item = { title: string; description: string; icon: string } | { text: string };

function parseItems(content: string): Item[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length === 1) return { text: parts[0] };
      const [title = "", description = "", icon = ""] = parts;
      return { title, description, icon };
    });
}

/** FNV-1a string hash → 32-bit seed. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG so a given block always lays out the same way. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A corner for each card that never repeats the previous card's corner and
 * never sits vertically adjacent to it — i.e. if the card above put its
 * ornament in a *bottom* corner, this card can't use the *top* corner on that
 * same side, since the two would touch across the gap between cards.
 */
function pickCorners(count: number, seed: number): Corner[] {
  const rand = mulberry32(seed);
  const out: Corner[] = [];
  let prev: Corner | null = null;
  for (let i = 0; i < count; i++) {
    const blocked = new Set<Corner>();
    if (prev) {
      blocked.add(prev);
      if (prev === "bl") blocked.add("tl");
      if (prev === "br") blocked.add("tr");
    }
    const options = CORNERS.filter((c) => !blocked.has(c));
    const corner = options[Math.floor(rand() * options.length)];
    out.push(corner);
    prev = corner;
  }
  return out;
}

function Ornament({ corner }: { corner: Corner }) {
  return (
    <span className={styles.cardListOrnament} data-corner={corner} aria-hidden>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function ListBlock({ content }: { content: string }) {
  const items = parseItems(content);
  if (items.length === 0) return null;

  const corners = pickCorners(items.length, hashString(content));

  return (
    <div className={styles.cardList}>
      {items.map((item, i) => {
        const corner = corners[i];
        if ("text" in item) {
          return (
            <div key={i} className={styles.cardListItem}>
              <p className={styles.cardListText}>{item.text}</p>
              <Ornament corner={corner} />
            </div>
          );
        }
        return (
          <div key={i} className={styles.cardListItem}>
            {item.icon && (
              <Icon name={item.icon} className={styles.cardListIcon} />
            )}
            <div className={styles.cardListBody}>
              {item.title && (
                <h4 className={styles.cardListTitle}>{item.title}</h4>
              )}
              {item.description && (
                <p className={styles.cardListDesc}>{item.description}</p>
              )}
            </div>
            <Ornament corner={corner} />
          </div>
        );
      })}
    </div>
  );
}
