"use client";

import Link from "next/link";
import { footer } from "@/content/home";
import { greeting } from "@/content/recruiter";
import { useStretchingWordRotator } from "./useStretchingWordRotator";
import { useDarkGround } from "./useDarkGround";
import styles from "./Recruiter.module.css";

/**
 * The title, and the two links a hiring read wants before anything else.
 *
 * The greeting is one sentence with one moving part, set across two lines on
 * purpose: "Hi <word>," and then "I'm Caleb" under it. The break is explicit
 * rather than wherever the text happens to wrap, because the word rotating
 * above it changes width — a soft wrap would let "I'm Caleb" hop on and off
 * the first line as the word grows and shrinks, which is a second thing
 * moving on the page for every one thing actually meant to.
 *
 * The word rotates through `greeting.salutations` — every one of them a name
 * for the person reading it, so the sentence reads the same whichever is
 * showing. Unlike the homepage tagline's word (useWordRotator.ts), which
 * holds its box open at the longest option's width so the sentence around it
 * never moves, this one stretches: the box animates to each word's own width
 * as it fades in, so a short word doesn't leave a run of blank space sitting
 * under the comma (see useStretchingWordRotator.ts). Reduced motion still
 * gets a stable frame — the rotation itself simply stops, on whichever word
 * it was on.
 */
export function RecruiterHero() {
  const { box, word, index } = useStretchingWordRotator(greeting.salutations);
  // Fixed rather than in flow (see .back), so it rides over whatever the
  // reader has scrolled to — including, eventually, the page's own dark
  // ground at the foot of it.
  const onDark = useDarkGround("top");

  const resume = footer.elsewhere.find((link) => link.label === "Résumé");

  return (
    <header className={styles.hero} id="top">
      <Link
        href="/"
        className={styles.back}
        data-ground={onDark ? "dark" : "paper"}
        aria-label="Back to home"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M19 12H5m0 0 6 6m-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <h1>
        <span className={styles.lead}>
          Hi,{" "}
          <span ref={box} className={styles.word}>
            <span ref={word} className={styles.current} aria-live="polite">
              {greeting.salutations[index]}
            </span>
          </span>
        </span>
        <br />
      </h1>

      <p className={styles.intro}>{greeting.intro}</p>

      {/* Deliberately quiet, and deliberately here anyway: the contact band at
          the foot of the page is where the ask is made, but a recruiter who
          only wants the PDF shouldn't have to scroll the whole résumé to find
          it. Both read from content/home.ts, so there's one email and one
          résumé URL on the site. */}
      <p className={styles.shortcuts}>
        <a href={`mailto:${footer.email}`} className={styles.shortcut}>
          {footer.email}
        </a>
        {resume && (
          <a
            href={resume.href}
            className={styles.shortcut}
            target="_blank"
            rel="noreferrer noopener"
          >
            Résumé (PDF)
          </a>
        )}
      </p>
    </header>
  );
}
