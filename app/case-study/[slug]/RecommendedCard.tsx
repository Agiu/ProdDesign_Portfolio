"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import type { CaseStudy } from "@/content/home";
import { ArrowIcon } from "@/components/ArrowIcon";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import styles from "./CaseStudy.module.css";

/**
 * One card in a case study's "Recommended Case Studies" footer.
 *
 * The only reason this is a client component rather than plain markup in
 * page.tsx: a study marked `comingSoon` opens `ComingSoonModal` instead of
 * navigating to what would otherwise be a barren page — the same heads-up
 * the homepage grid (CaseCard.tsx) and the recruiter timeline's chips give
 * it. Still a real `<Link>` either way, same as those two — only a plain
 * click is intercepted, so a ctrl/cmd-click still opens the real page in a
 * new tab.
 */
export function RecommendedCard({ study }: { study: CaseStudy }) {
  const [open, setOpen] = useState(false);
  const comingSoon = study.comingSoon;

  const onClick = comingSoon
    ? (e: MouseEvent) => {
        e.preventDefault();
        setOpen(true);
      }
    : undefined;

  return (
    <>
      <Link
        href={`/case-study/${study.slug}`}
        className={styles.recItem}
        onClick={onClick}
        /* Keeps PageTransition's capture-phase interceptor off this link so
           the click above lands — see the note in PageTransition.tsx. */
        data-no-curtain={comingSoon ? "" : undefined}
      >
        <span className={styles.recEyebrow}>{study.discipline}</span>
        <h3 className={styles.recTitle}>
          {study.title}
          <ArrowIcon className={styles.recArrow} />
        </h3>
        <p className={styles.recDesc}>{study.summary}</p>
      </Link>
      {comingSoon && (
        <ComingSoonModal
          open={open}
          onClose={() => setOpen(false)}
          title={study.title}
          figmaUrl={comingSoon.figmaUrl}
          seeInsteadHref={`/case-study/${comingSoon.seeInstead}`}
          seeInsteadLabel={comingSoon.seeInsteadTitle}
        />
      )}
    </>
  );
}
