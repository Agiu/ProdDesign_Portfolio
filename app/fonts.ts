import localFont from "next/font/local";

/*
 * Open Sauce Two, self-hosted from /public. Full latin-subset family across
 * 300-900 in normal and italic — no glyph gaps, so it doesn't need the
 * fallback-splicing that Söhne (Klim's trial cut) required.
 */
export const openSauceTwo = localFont({
  src: [
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-300-italic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-500-italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-600-italic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-700-italic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-800-italic.woff2",
      weight: "800",
      style: "italic",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-900-normal.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/OpenSauceTwo/open-sauce-two-latin-900-italic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-open-sauce",
  display: "swap",
});
