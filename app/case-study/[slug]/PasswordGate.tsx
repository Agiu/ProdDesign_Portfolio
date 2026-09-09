"use client";

import { useActionState } from "react";
import { unlockCaseStudy, type UnlockState } from "./unlock-action";
import styles from "./CaseStudy.module.css";

function LockIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10.5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
      <path d="M12 16.4V18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const initialState: UnlockState = {};

/**
 * The lock screen a `protected` study (see `content/home.ts`) shows in place
 * of its body until the right password is submitted. A correct submission
 * sets an httpOnly cookie (`unlock-action.ts`) scoped to this study's own
 * path, and the page re-renders itself in the same round trip — see the
 * "Mutates cookies" note in the Server Actions guide, which is why there's no
 * client-side redirect or refetch here.
 */
export function PasswordGate({ slug, title }: { slug: string; title: string }) {
  const [state, formAction, pending] = useActionState(
    unlockCaseStudy.bind(null, slug),
    initialState,
  );

  return (
    <div className={styles.lockWrap}>
      <div className={styles.lockCard}>
        <span className={styles.lockIcon}>
          <LockIcon />
        </span>
        <p className={styles.lockEyebrow}>Password Protected</p>
        <h2 className={styles.lockTitle}>{title}</h2>
        <p className={styles.lockText}>
          This write-up covers client work under NDA. Enter the password to read it.
        </p>

        <form action={formAction} className={styles.lockForm}>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="off"
            placeholder="Password"
            className={styles.lockInput}
            aria-invalid={state.error ? true : undefined}
          />
          <button type="submit" className={styles.lockSubmit} disabled={pending}>
            {pending ? "Checking…" : "Unlock"}
          </button>
        </form>

        {state.error && <p className={styles.lockError}>{state.error}</p>}
      </div>
    </div>
  );
}
