"use server";

import { cookies } from "next/headers";
import { checkPassword, cookieNameFor } from "@/lib/caseStudyAuth";

export type UnlockState = { error?: string };

/** Bound to a study's slug by PasswordGate.tsx via a closure. */
export async function unlockCaseStudy(
  slug: string,
  _prevState: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const password = String(formData.get("password") ?? "");
  const token = checkPassword(slug, password);
  if (!token) return { error: "That password isn't right." };

  const store = await cookies();
  store.set(cookieNameFor(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/case-study/${slug}`,
    maxAge: 60 * 60 * 24 * 180,
  });

  return {};
}
