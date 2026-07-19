import type { Metadata } from "next";
import Link from "next/link";
import { films, filmsPage } from "@/content/films";
import { Footer } from "@/components/Footer";
import { FilmGallery } from "./FilmGallery";
import styles from "./Films.module.css";

export const metadata: Metadata = {
  title: "Video & Multimedia — Caleb Aguiar",
  description: filmsPage.intro,
};

export default function FilmsPage() {
  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <Link href="/#films" className={styles.back} aria-label="Back to home">
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
          <h1 className={styles.heading}>{filmsPage.heading}</h1>
          <p className={styles.intro}>{filmsPage.intro}</p>
        </header>

        <FilmGallery films={films} />
      </main>
      <Footer />
    </>
  );
}
