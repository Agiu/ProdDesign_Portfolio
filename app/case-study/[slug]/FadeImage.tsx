"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import styles from "./CaseStudy.module.css";

/**
 * next/image paints in raw as bytes stream by default. This holds it at
 * opacity 0 until the image has actually finished loading, then cross-fades
 * it in (styles.fadeImage / .loaded in CaseStudy.module.css).
 *
 * No extra handling needed for a cache hit: next/image's own onLoad already
 * accounts for an image that finished loading before the handler attached
 * (image-component.js checks `img.complete` on ref-mount and fires onLoad
 * synthetically), unlike the plain <img> in FigureImage.tsx.
 */
export function FadeImage({ className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    // `alt` is required on ImageProps and passed through via `...props`;
    // the a11y rule can't see through the spread to verify that statically.
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...props}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={[className, styles.fadeImage, loaded && styles.loaded]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
