"use client";

import { animate, cubicBezier } from "animejs";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./PageTransition.module.css";

/*
 * Half the dip. The curtain fades up to white over FADE, the route commits
 * behind it, then it fades back out over FADE — so a navigation reads as one
 * ~2×FADE "fade to white, fade back in" beat rather than an abrupt cut.
 */
const FADE = 320;
/* Symmetric in-out, so the two halves of the dip mirror each other. */
const EASE = cubicBezier(0.4, 0, 0.2, 1);

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A white curtain that dips across every in-app navigation: fade to white,
 * swap the route underneath, fade back in. Lives in the root layout so it
 * survives across route changes and is always mounted to animate.
 *
 * It works by intercepting internal cross-page link clicks itself (capture
 * phase, before Next's <Link> handler) and routing them client-side, rather
 * than wrapping every link in a component. That's what lets it cover the two
 * link styles the site actually uses interchangeably — plain <a> (which would
 * otherwise hard-reload) and <Link> — with one piece, and keep the curtain
 * mounted across the swap so both halves of the dip are smooth.
 *
 * Deliberately left alone: same-page hash anchors (#films, the TOC), external
 * links, mailto/tel, downloads, new-tab/modified clicks, and — under reduced
 * motion — everything (links just behave natively, no curtain).
 */
export function PageTransition() {
  const curtain = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // True from the start of a fade-to-white until the matching fade-back-out
  // completes. Gates the pathname effect so a route change we *didn't* drive
  // (the browser back/forward button) doesn't flash the curtain.
  const navigating = useRef(false);

  useEffect(() => {
    if (reduced()) return;

    const onClick = (event: MouseEvent) => {
      // Let anything already handled, or a deliberate new-tab/download intent,
      // pass through untouched.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as Element)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(href, window.location.href);
      // External, mailto:, tel:, etc. — different origin, leave it be.
      if (url.origin !== window.location.origin) return;
      // Same page: a pure hash/scroll link (or a no-op). Let the browser
      // scroll; a curtain here would blink for no navigation.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      if (navigating.current) return;

      const el = curtain.current;
      const dest = url.pathname + url.search + url.hash;
      if (!el) {
        router.push(dest);
        return;
      }

      navigating.current = true;
      el.style.pointerEvents = "auto";
      animate(el, {
        opacity: [0, 1],
        duration: FADE,
        ease: EASE,
        // Commit the route only once the curtain is fully white, so the swap
        // (and the destination's load latency) happens entirely unseen.
        onComplete: () => router.push(dest),
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The other half: once the new route has committed (pathname changed), fade
  // the curtain back out. Skipped unless *we* raised it, so the initial load
  // and back/forward navigations don't get a phantom flash.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!navigating.current) return;

    const el = curtain.current;
    if (!el) return;

    animate(el, {
      opacity: [1, 0],
      duration: FADE,
      ease: EASE,
      onComplete: () => {
        el.style.pointerEvents = "none";
        navigating.current = false;
      },
    });
  }, [pathname]);

  return <div ref={curtain} className={styles.curtain} aria-hidden />;
}
