import type { Position } from "@/content/recruiter";

/**
 * A position's anchor id on the rail — read by QuickNav.tsx to build its
 * links and by Timeline.tsx to set the id each entry is jumped to, so the two
 * can't drift apart from restating the same slug twice.
 *
 * Org and title both feed it, not org alone: three of the entries share an
 * org (Trinity), and org-only ids would collide and all three chips would
 * jump to whichever one happened to register its id last.
 */
export function positionId(position: Position): string {
  return `${position.org}-${position.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
