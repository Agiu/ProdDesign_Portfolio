/**
 * Simplified brand badges for the LogoOrbit block — a colored disc plus a
 * hand-drawn glyph evoking each mark, not exact trademarked artwork (the same
 * spirit as Icon.tsx's hand-rolled Lucide-alike set).
 *
 * Each badge is a `<g>` drawn into a 48×48 box with its origin at the box's
 * top-left, not a standalone `<svg>`: LogoOrbit composes the whole diagram —
 * badges, connector lines and hub — inside one root SVG so the lines and the
 * marks share a coordinate space and can be positioned against each other.
 */

type BadgeProps = { className?: string };

export function TwitchBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      <circle cx="24" cy="24" r="24" fill="#9146FF" />
      {/* Body: square but for the clipped bottom-right and the chat tab that
          drops out of the bottom-left. */}
      <path d="M17 13h17v13l-6 6h-4l-4 4v-4h-5V15Z" fill="#fff" />
      <rect x="21.4" y="18" width="2.6" height="7" fill="#9146FF" />
      <rect x="27" y="18" width="2.6" height="7" fill="#9146FF" />
    </g>
  );
}

export function InstagramBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      <defs>
        <linearGradient id="ig-grad" x1="4" y1="44" x2="44" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FEC053" />
          <stop offset="0.35" stopColor="#F2203E" />
          <stop offset="0.68" stopColor="#CC2A9E" />
          <stop offset="1" stopColor="#6559CA" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#ig-grad)" />
      <rect x="14" y="14" width="20" height="20" rx="6" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="24" cy="24" r="5.2" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="30.5" cy="17.5" r="1.4" fill="#fff" />
    </g>
  );
}

export function XboxBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      <circle cx="24" cy="24" r="24" fill="#107C10" />
      {/* One filled four-pointed star, not two strokes crossing: the arms have
          to taper to points and bulge through the middle, which is what
          separates the real mark from a uniform-width close ✕. The lower arms
          run longer than the upper pair and the whole X sits slightly high in
          the disc, both as on the sphere. */}
      <path
        d="M7.9 9.7Q13.4 10.7 24.0 17.8Q34.6 10.7 40.1 9.7Q38.0 14.4 29.4 23.2Q37.0 35.3 38.2 41.3Q33.2 38.6 24.0 28.6Q14.8 38.6 9.8 41.3Q11.0 35.3 18.6 23.2Q10.0 14.4 7.9 9.7Z"
        fill="#fff"
      />
    </g>
  );
}

export function SteamBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      {/* The tail runs out to the disc's edge and is cut off by it, so the
          bottom-left reads as a filled edge rather than a wedge stopping in
          mid-air. It stops at x=0 rather than overshooting into negative
          space: clipping hides the overshoot visually, but not from the
          geometry bounding box, and LogoOrbit centres each badge on that box
          (`transform-box: fill-box`) — an asymmetric box would land this one
          off-centre from the rest. */}
      <defs>
        <clipPath id="steam-disc">
          <circle cx="24" cy="24" r="24" />
        </clipPath>
      </defs>
      <circle cx="24" cy="24" r="24" fill="#171A21" />
      {/* The pin: big ring top-right, small ring below it, a bar between the
          two, and the tail off to the lower-left. Drawn back-to-front so the
          rings sit over the bar and tail. */}
      <g clipPath="url(#steam-disc)">
        <path d="M16.6 26.7 0 23 0 28.5 17.3 31.1Z" fill="#fff" />
      </g>
      <path d="M17.5 31 29.5 18" stroke="#fff" strokeWidth="5.4" strokeLinecap="round" />
      <circle cx="29.5" cy="18" r="5.9" fill="#171A21" stroke="#fff" strokeWidth="3.7" />
      <circle cx="17.5" cy="31" r="3.6" fill="#171A21" stroke="#fff" strokeWidth="2.8" />
    </g>
  );
}

export function YoutubeBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      {/* A disc like the rest of the set rather than the wordmark's rounded
          rectangle, which broke out of the circular chip it sits in. */}
      <circle cx="24" cy="24" r="24" fill="#FF0000" />
      <path d="M20 16.5 33 24 20 31.5Z" fill="#fff" />
    </g>
  );
}

export function PlayStationBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      {/* The four face buttons in their controller arrangement rather than the
          PS monogram — at chip size the monogram turns to mush, while the
          shapes stay readable and are just as unmistakably PlayStation. */}
      <circle cx="24" cy="24" r="24" fill="#0070D1" />
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 10.8 28.6 18.8H19.4Z" />
        <circle cx="34.4" cy="24" r="4" />
        <path d="M21 30 27 36M27 30 21 36" />
        <rect x="9.6" y="20.1" width="7.8" height="7.8" rx="1" />
      </g>
    </g>
  );
}

export function RedditBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      {/* Snoo reduced to its silhouette: the wide head, the two ear discs that
          break its outline, and the antenna. */}
      <circle cx="24" cy="24" r="24" fill="#FF4500" />
      <path d="M24 18.6 28.6 12.6" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="30.2" cy="11.6" r="2.6" fill="#fff" />
      <circle cx="13.6" cy="25.6" r="3.7" fill="#fff" />
      <circle cx="34.4" cy="25.6" r="3.7" fill="#fff" />
      <ellipse cx="24" cy="27.4" rx="11" ry="8.4" fill="#fff" />
      <circle cx="20" cy="26.4" r="2.1" fill="#FF4500" />
      <circle cx="28" cy="26.4" r="2.1" fill="#FF4500" />
      <path
        d="M19.4 31.4Q24 34.6 28.6 31.4"
        fill="none"
        stroke="#FF4500"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </g>
  );
}

export function DiscordBadge({ className }: BadgeProps) {
  return (
    <g className={className}>
      {/* The hub of the diagram, so it gets the most careful silhouette in the
          set: the rounded head, the flared tabs dropping out of both bottom
          corners, and the shallow curve between them that reads as the jaw. */}
      <circle cx="24" cy="24" r="24" fill="#5865F2" />
      <path
        d="M24 12.4q-7.2 0-11.4 2.4-4.6 6.6-5.2 14.6 0 0 3.3 3.4 3.6 2.1 6.4 2.6l1.9-3.2q-2-.6-3.4-1.7 6.4 3 15.2 0-1.4 1.1-3.4 1.7l1.9 3.2q2.8-.5 6.4-2.6 3.3-3.4 3.3-3.4-.6-8-5.2-14.6Q31.2 12.4 24 12.4Z"
        fill="#fff"
      />
      <ellipse cx="18.9" cy="26" rx="2.6" ry="3.2" fill="#5865F2" />
      <ellipse cx="29.1" cy="26" rx="2.6" ry="3.2" fill="#5865F2" />
    </g>
  );
}
