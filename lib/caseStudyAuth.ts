import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Password gate for case studies marked `protected` in `content/home.ts`
 * (currently just ForeFlight — real client work, so the write-up sits behind
 * a password rather than being world-readable).
 *
 * The cookie never carries the password itself. It carries a hash of it,
 * salted with the study's own slug so a leaked cookie for one protected
 * study can't be replayed against another. Rotate access at any time by
 * changing the env var — every existing cookie stops validating the moment
 * the expected hash changes.
 */

const PASSWORD_ENV_PREFIX = "CASE_STUDY_PASSWORD_";

export function cookieNameFor(slug: string): string {
  return `cs-auth-${slug}`;
}

function envPasswordFor(slug: string): string | undefined {
  const key = `${PASSWORD_ENV_PREFIX}${slug.toUpperCase().replace(/-/g, "_")}`;
  return process.env[key];
}

function tokenFor(slug: string, password: string): string {
  return createHash("sha256").update(`${slug}:${password}`).digest("hex");
}

/** Constant-time compare of two possibly-different-length strings. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True if the cookie value on hand matches the current password for `slug`. */
export function isUnlocked(slug: string, cookieValue: string | undefined): boolean {
  const expected = envPasswordFor(slug);
  if (!expected || !cookieValue) return false;
  return safeEqual(cookieValue, tokenFor(slug, expected));
}

/**
 * Checks a submitted password against the one configured for `slug`.
 * Returns the cookie token to set on success, or `null` on a wrong password
 * or a study with no password configured at all.
 */
export function checkPassword(slug: string, submitted: string): string | null {
  const expected = envPasswordFor(slug);
  if (!expected || !submitted) return null;
  return safeEqual(submitted, expected) ? tokenFor(slug, expected) : null;
}
