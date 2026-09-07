import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { openSauceTwo } from "./fonts";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css";

/* Fallback for glyphs outside Open Sauce Two's latin subset. */
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Caleb Aguiar — UX Designer & Software Engineer",
  description:
    "UX Designer and Software Engineer with a love for storytelling. Case studies in interaction design, AI, and social good.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSauceTwo.variable} ${sans.variable}`}>
      <body>
        {/* Without JS none of the three things that clear these ever runs:
            useReveal.ts for .reveal's blocks, Hero.tsx for the name and
            tagline, PageTransition.tsx for the cream curtain over the lot.
            Left alone, the page would be a blank sheet. */}
        <noscript>
          <style>{`
            .reveal, [data-intro] { opacity: 1 !important; transform: none !important; }
            [data-curtain] { opacity: 0 !important; }
          `}</style>
        </noscript>
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
