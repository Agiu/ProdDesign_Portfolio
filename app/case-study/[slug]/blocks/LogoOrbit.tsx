import type { ComponentType } from "react";
import {
  InstagramBadge,
  SteamBadge,
  TwitchBadge,
  XboxBadge,
  YoutubeBadge,
} from "./BrandIcons";
import styles from "../CaseStudy.module.css";

/**
 * The `logo-orbit` custom block. Stands in for a screenshot when the point is
 * "too many places to choose from" rather than any one interface — five
 * platform badges circling a shared center on two counter-rotating rings, all
 * pure CSS (see .orbit* in the stylesheet) so it needs no client JS. The
 * fence's body text becomes the figcaption, same as an image's alt text.
 */

type OrbitIcon = { key: string; angle: number; Badge: ComponentType<{ className?: string }> };

const OUTER: OrbitIcon[] = [
  { key: "instagram", angle: 0, Badge: InstagramBadge },
  { key: "xbox", angle: 120, Badge: XboxBadge },
  { key: "youtube", angle: 240, Badge: YoutubeBadge },
];

const INNER: OrbitIcon[] = [
  { key: "twitch", angle: 30, Badge: TwitchBadge },
  { key: "steam", angle: 210, Badge: SteamBadge },
];

function Ring({
  icons,
  ringClassName,
  glyphClassName,
}: {
  icons: OrbitIcon[];
  ringClassName: string;
  glyphClassName: string;
}) {
  return (
    <div className={`${styles.orbitRing} ${ringClassName}`}>
      {icons.map(({ key, angle, Badge }) => (
        <div
          key={key}
          className={styles.orbitIcon}
          style={{ "--angle": `${angle}deg` } as React.CSSProperties}
        >
          <div className={`${styles.orbitGlyph} ${glyphClassName}`}>
            <Badge className={styles.orbitBadge} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LogoOrbit({ content }: { content: string }) {
  const caption = content.trim();
  return (
    <figure className={styles.figure}>
      <div className={styles.orbitStage}>
        <span className={`${styles.orbitGuide} ${styles.orbitGuideOuter}`} aria-hidden />
        <span className={`${styles.orbitGuide} ${styles.orbitGuideInner}`} aria-hidden />
        <Ring icons={OUTER} ringClassName={styles.orbitRingOuter} glyphClassName={styles.orbitGlyphOuter} />
        <Ring icons={INNER} ringClassName={styles.orbitRingInner} glyphClassName={styles.orbitGlyphInner} />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
