"use client";

import { useEffect, useRef, useState } from "react";
import { films, type Film } from "@/content/films";
import { system } from "@/content/system";
import sys from "./System.module.css";
import styles from "./FilmReel.module.css";

const thumb = (id: string, size: "maxresdefault" | "hqdefault") =>
  `https://i.ytimg.com/vi/${id}/${size}.jpg`;

const embed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

/** YouTube's maxres poster, falling back to hq where a video has none. */
function Poster({ film }: { film: Film }) {
  const [src, setSrc] = useState(thumb(film.youtubeId, "maxresdefault"));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setSrc(thumb(film.youtubeId, "hqdefault"))}
      className={styles.posterImage}
    />
  );
}

function FilmCard({
  film,
  lead,
  onPlay,
}: {
  film: Film;
  lead: boolean;
  onPlay: (film: Film) => void;
}) {
  const detail = [film.category, film.year].filter(Boolean).join(", ");

  return (
    <button
      type="button"
      className={`${styles.card} ${lead ? styles.lead : styles.side}`}
      onClick={() => onPlay(film)}
      aria-label={`Play ${film.title}`}
    >
      <span className={`${sys.duotone} ${styles.poster}`}>
        <Poster film={film} />
        <span className={`${sys.readout} ${styles.play}`} aria-hidden>
          <span className={styles.glyph} />
          Play
        </span>
      </span>
      <span className={styles.caption}>
        <span className={styles.title}>{film.title}</span>
        <span className={`${sys.readout} ${sys.label}`}>{detail}</span>
      </span>
    </button>
  );
}

/**
 * A curated handful of films, each at rest under its poster. Nothing plays
 * until it's pressed; then it plays in a focused native <dialog> (which brings
 * Escape to close, focus containment, and focus return for free). The iframe
 * only exists while the dialog is open, so closing it stops playback.
 */
export function FilmReel() {
  const selection = system.films.selection
    .map((id) => films.find((film) => film.youtubeId === id))
    .filter((film): film is Film => Boolean(film));
  const total = films.filter((film) => film.youtubeId).length;

  const [active, setActive] = useState<Film | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (active && !el.open) el.showModal();
    if (!active && el.open) el.close();
  }, [active]);

  const [lead, ...rest] = selection;
  if (!lead) return null;

  return (
    <section id="films" className={sys.section} aria-labelledby="films-title">
      <div className={sys.container}>
        <div className={sys.sectionHead}>
          <h2 id="films-title" className={sys.sectionTitle}>
            {system.films.heading}
          </h2>
          <a href={system.films.archive.href} className={`${sys.readout} ${styles.archive}`}>
            {system.films.archive.label} ({total})
          </a>
        </div>

        <p className={styles.intro}>{system.films.intro}</p>

        <div className={styles.reel}>
          <FilmCard film={lead} lead onPlay={setActive} />
          <ul className={styles.list}>
            {rest.map((film) => (
              <li key={film.youtubeId}>
                <FilmCard film={film} lead={false} onPlay={setActive} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={active?.title ?? "Film"}
        onClose={() => setActive(null)}
        onClick={(event) => {
          // A click on the dialog itself, not the player, is a click on the
          // backdrop around it.
          if (event.target === event.currentTarget) setActive(null);
        }}
      >
        {active && (
          <div className={styles.player}>
            <div className={`${sys.readout} ${styles.playerBar}`}>
              <span>{active.title}</span>
              <button
                type="button"
                className={styles.close}
                onClick={() => setActive(null)}
                autoFocus
              >
                Close
              </button>
            </div>
            <div className={styles.screen}>
              <iframe
                className={styles.iframe}
                src={embed(active.youtubeId)}
                title={active.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              />
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
