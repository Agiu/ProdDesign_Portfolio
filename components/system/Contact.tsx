import { footer } from "@/content/home";
import { system } from "@/content/system";
import { RegMarks } from "./RegMarks";
import sys from "./System.module.css";
import styles from "./Contact.module.css";

/**
 * The closing frame. Bookends the hero with the same registration marks
 * (corners only), and holds the one thing a visitor should do next: write.
 */
export function Contact() {
  return (
    <footer id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className={sys.container}>
        <div className={styles.frame}>
          <RegMarks cornersOnly />

          <div className={styles.lead}>
            <h2 id="contact-title" className={styles.heading}>
              {/* Binds the last word to the one before it, so the ":]" can
                  never wrap onto a line of its own. */}
              {footer.heading.replace(/ (\S+)$/, " $1")}
            </h2>
            <p className={styles.invitation}>{footer.invitation}</p>
            <a href={`mailto:${footer.email}`} className={styles.email}>
              {footer.email}
            </a>
          </div>

          <ul className={`${sys.readout} ${styles.links}`}>
            {footer.elsewhere.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={styles.link}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {link.label} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>

          <div className={`${sys.readout} ${sys.label} ${styles.base}`}>
            <p>© {new Date().getFullYear()} Caleb Aguiar</p>
            <p aria-hidden>{system.contact.closing}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
