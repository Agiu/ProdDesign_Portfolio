"use client";

import { useEffect, useRef } from "react";

/**
 * Fraction of the host's height that the media may drift downward.
 * This MUST stay in sync with the media element's vertical overflow in CSS
 * (`top: -30%; height: 160%`) — drift beyond the overflow exposes a bare edge.
 */
const DRIFT = 0.3;

/**
 * Which stretch of scroll the drift is measured across.
 *
 *   - "pinned": 0 at the top of the document, ramping to 1 once the page has
 *     scrolled by the host's own full height. Right for a host that starts the
 *     page filling the viewport — it has nowhere to arrive "from below", so the
 *     drift is anchored purely to scrolling past the top.
 *
 *     It reads window.scrollY rather than the host's own box, which for a host
 *     sitting at the top of the document is the same number — but only one of
 *     the two keeps meaning something once that host is `position: sticky`. A
 *     pinned hero's box does not move, so measured off itself its drift would
 *     freeze for precisely the stretch of scroll the pin exists to fill.
 *   - "transit": 0 the moment the host first appears at the bottom of the
 *     viewport, 1 the moment it fully exits at the top — the drift runs for
 *     the host's entire time on screen, in both directions. Right for a
 *     section further down the page, which scrolls in from below as well as
 *     out above.
 */
type Variant = "pinned" | "transit";

/**
 * Parallax: the returned ref's element drifts down as its parent scrolls past,
 * so the media appears to move slower than the page. "transit" works for a host
 * anywhere in the document, measuring off the host's own position in the
 * viewport; "pinned" is for one that starts at the very top and measures off
 * the scroll position directly. See the variants above.
 */
export function useParallax<T extends HTMLElement>(
  variant: Variant = "pinned",
  /**
   * Set false to stand the drift down — for a host whose media is sized to its
   * own box rather than to an oversized one, where there is no overhang to
   * spend and any movement would expose a bare edge. Toggling it back off
   * clears the transform this wrote, so CSS owns the element again.
   */
  enabled = true,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    if (!enabled) {
      el.style.transform = "";
      host.style.removeProperty("--parallax-y");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = -1;

    const update = () => {
      frame = 0;
      const height = host.offsetHeight;

      const raw =
        variant === "pinned"
          ? // How far the page has scrolled, in host-heights. See above: the
            // host is assumed to start at the top of the document, and may be
            // pinned there rather than scrolling away. Note this branch reads
            // no geometry off the host, so it never forces a layout mid-scroll.
            window.scrollY / height
          : // Where the host sits between "just entering at the bottom" and
            // "just exited at the top" — 0 and 1 respectively — so the drift
            // spans its whole time in the viewport either direction.
            1 -
            (host.getBoundingClientRect().top + height) /
              (window.innerHeight + height);
      const progress = Math.min(Math.max(raw, 0), 1);

      // Once pinned at either end there's nothing left to move.
      if (progress === last) return;
      last = progress;

      const y = (progress * DRIFT * height).toFixed(2);
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      /*
       * Also published on the host, so a sibling that has to travel with the
       * media can read it without being nested inside it — for a host whose
       * overlay must stay pixel-locked to the media while sitting in a
       * different stacking context from it. No consumer today; any that
       * appears should default it, since reduced motion returns before this
       * ever runs.
       */
      host.style.setProperty("--parallax-y", `${y}px`);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [variant, enabled]);

  return ref;
}
