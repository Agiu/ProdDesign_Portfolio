"use client";

import { footer } from "@/content/home";
import { BASE_COUNT, FOOTER_BLOCKS } from "./footerBlocks";
import { useOrganicBlocks } from "./useOrganicBlocks";
import { useReveal } from "./useReveal";
import styles from "./Footer.module.css";

const u = (n: number) => `calc(${n} * var(--u))`;

export function Footer() {
  const blocks = useOrganicBlocks(BASE_COUNT, FOOTER_BLOCKS.length);
  const reveal = useReveal<HTMLDivElement>();

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.mosaic} aria-hidden>
        {FOOTER_BLOCKS.map((b, i) => (
          <span
            key={i}
            ref={(el) => {
              blocks.current[i] = el;
            }}
            className={styles.block}
            data-kind={b.kind}
            style={{
              // Anchored to whichever corner it belongs to, so the footer can be
              // any height and the mosaic still lands in place.
              [b.corner === "right" ? "right" : "left"]: u(b.a),
              bottom: u(b.b),
              width: u(b.s),
              height: u(b.s),
              // Grow blocks scale up from the edge where they touch the
              // mosaic (footerBlocks.ts), so they read as sprouting from it
              // rather than swelling in from nowhere. Overrides the CSS
              // class's centred default; base blocks don't set this and just
              // keep that default, which is inert since they never scale.
              transformOrigin: b.origin,
            }}
            data-corner={b.corner}
          />
        ))}
      </div>

      <div ref={reveal} className={`${styles.inner} reveal`}>
        <div className={styles.lead}>
          <h2 className={styles.heading}>{footer.heading}</h2>
          <p className={styles.invitation}>{footer.invitation}</p>
          <a href={`mailto:${footer.email}`} className={styles.email}>
            {footer.email}
          </a>
        </div>

        <div className={styles.columns}>
          <div>
            <h3 className={styles.label}>Elsewhere</h3>
            <ul className={styles.links}>
              {footer.elsewhere.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={styles.link}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.label}>Now</h3>
            <dl className={styles.now}>
              {footer.now.map((item) => (
                <div key={item.label} className={styles.nowRow}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className={styles.base}>
          <p>© {new Date().getFullYear()} Caleb Aguiar</p>
        </div>
      </div>
    </footer>
  );
}
