import type { CSSProperties } from "react";
import { Icon } from "./Icon";
import styles from "../CaseStudy.module.css";

/**
 * The `carousel` custom block — one `Name | Icon | URL` per line.
 *
 * Steam (3.md) is the only case study that uses it, for its list of
 * competing storefronts — a set of peers rather than a sequence to step
 * through one at a time (that's what `quotes` is for). So instead of a
 * paged carousel this renders the Figma-adjacent "circle of revolving
 * brands": a ring of dark chips that slowly orbits a shared centre, each
 * chip counter-rotating so its icon and label stay upright as the ring
 * turns. Hovering or focusing the ring pauses the spin so an item can
 * actually be read and clicked; every chip is a real link.
 *
 * A plain server component — the motion is pure CSS (two synced,
 * opposite-direction `animation`s), no client JS needed. Reduced-motion
 * users get the blanket override in globals.css, which collapses both
 * animations to a single, effectively static frame.
 */

type Item = { name: string; icon: string; href: string };

function parseItems(content: string): Item[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", icon = "", href = ""] = line
        .split("|")
        .map((p) => p.trim());
      return { name, icon, href };
    })
    .filter((item) => item.name && item.href);
}

export function CarouselBlock({ content }: { content: string }) {
  const items = parseItems(content);
  if (items.length === 0) return null;

  return (
    <div className={styles.carousel}>
      <div
        className={styles.carouselRing}
        style={{ "--count": items.length } as CSSProperties}
      >
        {items.map((item, i) => {
          const external = item.href.startsWith("http");
          return (
            <a
              key={`${item.name}-${i}`}
              href={item.href}
              className={styles.carouselItem}
              style={{ "--i": i } as CSSProperties}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
            >
              <span className={styles.carouselChip}>
                {item.icon && (
                  <Icon name={item.icon} className={styles.carouselIcon} />
                )}
                <span className={styles.carouselLabel}>{item.name}</span>
              </span>
            </a>
          );
        })}
        <span className={styles.carouselHub} aria-hidden />
      </div>
    </div>
  );
}
