"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Film } from "@/content/films";
import { useReveal } from "@/components/useReveal";
import styles from "./Films.module.css";

/** YouTube's highest-res thumbnail. 404s on some videos → onError falls back. */
const maxThumb = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
/** Always present, even when maxres isn't. */
const fallbackThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const embed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

/** Thumbnail with the maxres→hq fallback and a fade once it decodes. */
function Thumb({ id, title }: { id: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(maxThumb(id));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setSrc(fallbackThumb(id))}
      className={`${styles.thumb} ${loaded ? styles.thumbLoaded : ""}`}
    />
  );
}

export function FilmGallery({ films }: { films: Film[] }) {
  const [active, setActive] = useState<number | null>(null);
  const grid = useReveal<HTMLUListElement>();

  // Where focus was before the modal opened, so it can be handed back on close.
  const opener = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const open = useCallback((index: number) => {
    opener.current = document.activeElement as HTMLElement;
    setActive(index);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    opener.current?.focus();
  }, []);

  // While the player is open: lock page scroll, close on Escape, and move
  // focus into the dialog. Restored on close / unmount.
  useEffect(() => {
    if (active === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    closeButton.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [active, close]);

  const activeFilm = active === null ? null : films[active];

  return (
    <>
      <ul ref={grid} className={`${styles.grid} reveal`}>
        {films.map((film, i) => {
          const meta = (
            <>
              <div className={styles.thumbWrap}>
                {film.youtubeId ? (
                  <>
                    <Thumb id={film.youtubeId} title={film.title} />
                    <span className={styles.play} aria-hidden>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </>
                ) : (
                  // No id yet — a quiet placeholder so the page still reads right.
                  <span className={styles.placeholder} aria-hidden>
                    Coming soon
                  </span>
                )}
              </div>

              <p className={styles.eyebrow}>
                {film.category}
                {film.year ? ` · ${film.year}` : ""}
              </p>
              <h2 className={styles.cardTitle}>{film.title}</h2>
              <p className={styles.cardDesc}>{film.description}</p>
            </>
          );

          return (
            // The demo reel (first) leads full-width; the rest fill the 2-up grid.
            <li key={film.title} className={i === 0 ? styles.featured : undefined}>
              {film.youtubeId ? (
                <button
                  type="button"
                  className={styles.card}
                  onClick={() => open(i)}
                  aria-label={`Play: ${film.title}`}
                >
                  {meta}
                </button>
              ) : (
                <div className={`${styles.card} ${styles.cardDisabled}`}>
                  {meta}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {activeFilm && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={activeFilm.title}
          onClick={close}
        >
          <button
            type="button"
            ref={closeButton}
            className={styles.close}
            onClick={close}
            aria-label="Close video"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Stop the backdrop's close-on-click from firing when the player
              itself is clicked. */}
          <div
            className={styles.player}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className={styles.iframe}
              src={embed(activeFilm.youtubeId)}
              title={activeFilm.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
