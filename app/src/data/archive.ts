// The Archive (/project/archive, 2026-11-11): five earlier case studies kept
// as short previews instead of standalone pages, as the old WordPress site
// (micahburger.com) is retired. Carrier (Infinity) and Lincoln stay full
// case studies in caseStudies.ts and aren't here.
//
// The content is archive-data.json, and only that: the page (ArchiveScroll)
// reads it through this module, so a different layout later would be a new
// component, never a second copy of the words. This file types the JSON and
// works out image URLs; it holds no copy of its own.
//
// Copy rules (Micah's brief): summarize, don't retell. A client, year and
// role list; a one-line hook; two or three sentences of summary; at most
// three things delivered; an outcome ONLY when the source page states one.
// FPO's is the only one shown: WWE's and ABA's pages stated one too, but
// Micah dropped those sections (2026-11-11); BBC and Rockwell never had one. A fact
// the source doesn't give is "[TBD]", shown as is, never guessed. No team
// credit: there was one line each until Micah cut the team sections
// across the pages (2026-11-11).
//
// Years are Micah's (2026-11-11), since none of the old pages gave one: the
// first four were at Code and Theory (BBC and Rockwell 2015, ABA 2016, WWE
// 2017), FPO at Raytheon (2022). Projects are listed newest first, the way
// an index with a year column reads.
//
// Sources, read 2026-11-11: micahburger.com/project/{wwe,bbc,rockwell,aba,
// fpo}.
//
// Images (public/img/archive/<slug>/), the 4 or 5 strongest per project,
// lead image first. Downloaded from the live site's wp-content/uploads
// (that site is going away, so nothing here hotlinks it), converted to
// <file>.webp at 1600px on the long side, q82: the page shows screens up to
// about 800px wide, so this covers that at 2x and the larger view on a
// laptop. (640px and 192px copies served the Index layout's hover preview
// and row thumbnails; they went with it.)
// Sources by slug, in order:
//   wwe       WWE-4, WWE-10, WWE-3, WWE-11, WWE-9
//   bbc       BBC-3, BBC-4, BBC-6, BBC-Skinny-2, BBC-8
//   rockwell  Rockwell-2, Rockwell-5, Rockwell-3, Rockwell-skinny2
//   aba       ABA-2, ABA-10, ABA-11, ABA-7, ABA-3
//   fpo       FPO-Intro4, FPO-Portrait2, Flight-phase-overview,
//             Focus-Feature-4, fpo-dispatcher-4
// Left out as near-duplicates or weaker: WWE-7/5/6/13 and the WWE skinny
// set, BBC-7 (BBC-8 again) and BBC-Skinny-4, Rockwell-6 (Rockwell-2 on a
// laptop) and Rockwell-skinny1, ABA-9/5/8/4 and the ABA skinny set, FPO's
// Grid-4, experience map (unreadable small), feature-features2, style guide
// (very tall) and onboarding.

import data from "./archive-data.json";

export type ArchiveImage = {
  file: string;
  alt: string;
  /** Intrinsic size of the full image, so its box is held before it loads. */
  width: number;
  height: number;
};

export type ArchiveProject = {
  /** Also the anchor: /project/archive#<slug> opens this one. */
  slug: string;
  client: string;
  project: string;
  year: string;
  role: string[];
  hook: string;
  summary: string;
  /** Three at most. */
  delivered: string[];
  /** Only when the source states one. */
  outcome: string | null;
  /** Lead image first. */
  images: ArchiveImage[];
};

export type Archive = {
  title: string;
  intro: string;
  projects: ArchiveProject[];
};

export const archive: Archive = data;

/** The URL of an archive image. */
export function archiveSrc(slug: string, image: ArchiveImage) {
  return `/img/archive/${slug}/${image.file}.webp`;
}
