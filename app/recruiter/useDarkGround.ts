"use client";

import { useEffect, useState } from "react";

/**
 * Whether the page's own dark run — the contact band and the footer under
 * it, marked `data-dark-run` on Contact.tsx — has reached a fixed element
 * sitting near `edge` of the viewport. Shared by every fixed control on this
 * page that has to flip tone crossing that boundary (BackToTop.tsx,
 * RecruiterHero.tsx's own back link), so "how close is close enough" can't
 * drift between them.
 *
 * `edge` matters because the two controls that use this sit at opposite ends
 * of the screen: a bottom-anchored one (BackToTop) is on dark ground the
 * moment the run's leading edge reaches the bottom of the viewport, while a
 * top-anchored one (the back link) isn't until the run has swallowed the
 * whole screen, top included.
 */
export function useDarkGround(edge: "top" | "bottom") {
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const dark = document.querySelector<HTMLElement>("[data-dark-run]");
      if (!dark) return;
      const sampleY = edge === "top" ? 24 : window.innerHeight - 24;
      setOnDark(dark.getBoundingClientRect().top < sampleY);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [edge]);

  return onDark;
}
