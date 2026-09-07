import { footer } from "@/content/home";
import { contact } from "@/content/recruiter";
import { ArrowIcon } from "@/components/ArrowIcon";
import styles from "./Recruiter.module.css";

/**
 * The page's own closing band — this page ends here rather than running into
 * the site's shared footer ("Build with me :]"), which pitches everyone the
 * same open-ended invitation and buries the actual ask under it. This band
 * answers the three questions a hiring read arrives with instead — what
 * roles, where, and from when — and then gives the one action that follows
 * from them. Deliberately short: a page that has just spent six positions
 * making its case shouldn't close with another paragraph.
 *
 * Email and the elsewhere links come from `content/home.ts`, not from this
 * page's own content file, so the site has one address and one résumé URL,
 * even though the shared Footer component that usually reads them isn't
 * rendered here.
 *
 * A plain server component — nothing here moves.
 *
 * `data-dark-run` marks where the page's own dark ground starts — it runs
 * from here to the bottom of the page, with nothing cream after it, and
 * nothing dark after this either now that there's no footer band beneath it.
 * Same attribute the case-study pages use, and read the same way by
 * BackToTop.tsx to know when to flip a fixed ink glyph light.
 */
export function Contact() {
  const isPlaceholder = (value: string) => value.startsWith("TODO");

  return (
    <section className={styles.contact} id="contact-recruiter" data-dark-run>
      <div className={styles.contactInner}>
        <h2 className={styles.contactHeading}>{contact.heading}</h2>

        <dl className={styles.facts}>
          {contact.facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd
                className={styles.factValue}
                data-placeholder={isPlaceholder(fact.value) || undefined}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className={styles.contactNote}>{contact.note}</p>

        <div className={styles.contactActions}>
          {/* The one thing this page is asking for, so it's the one CTA that
              looks like a button rather than a link. */}
          <a href={`mailto:${footer.email}`} className={styles.contactCta}>
            Email me
            <ArrowIcon className={styles.contactArrow} />
          </a>

          <ul className={styles.contactLinks}>
            {footer.elsewhere.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={styles.contactLink}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
