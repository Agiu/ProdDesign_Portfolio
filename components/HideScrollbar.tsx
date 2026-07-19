"use client";

import { useEffect } from "react";

/**
 * Hides the browser scrollbar while this component is mounted — the home
 * page only wants it (the design reads as full-bleed sections without the
 * bar's visual noise), not the rest of the site. Toggles a class on <html>
 * rather than hiding it globally in globals.css, so other routes keep their
 * native scrollbar. Scrolling itself is untouched, just the indicator.
 */
export function HideScrollbar() {
  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
    };
  }, []);

  return null;
}
