/**
 * Simplified brand badges for the LogoOrbit block — a colored disc plus a
 * hand-drawn glyph evoking each mark, not exact trademarked artwork (the same
 * spirit as Icon.tsx's hand-rolled Lucide-alike set).
 */

type BadgeProps = { className?: string };

export function TwitchBadge({ className }: BadgeProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="24" fill="#9146FF" />
      {/* Body: square but for the clipped bottom-right and the chat tab that
          drops out of the bottom-left. */}
      <path
        d="M17 13h17v13l-6 6h-4l-4 4v-4h-5V15Z"
        fill="#fff"
      />
      <rect x="21.4" y="18" width="2.6" height="7" fill="#9146FF" />
      <rect x="27" y="18" width="2.6" height="7" fill="#9146FF" />
    </svg>
  );
}

export function InstagramBadge({ className }: BadgeProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
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
    </svg>
  );
}

export function XboxBadge({ className }: BadgeProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
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
    </svg>
  );
}

export function SteamBadge({ className }: BadgeProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* The tail runs past the disc and is cut off by it, so the bottom-left
          reads as a filled edge rather than a wedge stopping in mid-air. */}
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
        <path d="M16.6 26.7-6 23-6 28.5 17.3 31.1Z" fill="#fff" />
      </g>
      <path d="M17.5 31 29.5 18" stroke="#fff" strokeWidth="5.4" strokeLinecap="round" />
      <circle cx="29.5" cy="18" r="5.9" fill="#171A21" stroke="#fff" strokeWidth="3.7" />
      <circle cx="17.5" cy="31" r="3.6" fill="#171A21" stroke="#fff" strokeWidth="2.8" />
    </svg>
  );
}

export function YoutubeBadge({ className }: BadgeProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* A disc like the rest of the set rather than the wordmark's rounded
          rectangle, which broke out of the circular chip it sits in. */}
      <circle cx="24" cy="24" r="24" fill="#FF0000" />
      <path d="M20 16.5 33 24 20 31.5Z" fill="#fff" />
    </svg>
  );
}
