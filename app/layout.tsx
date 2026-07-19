import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { openSauceTwo } from "./fonts";
import { LoadingScreen } from "@/components/LoadingScreen";
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
        {/* Without JS, useReveal.ts never runs — nothing would ever lift
            .reveal's blocks out of their hidden resting state. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <LoadingScreen />
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
