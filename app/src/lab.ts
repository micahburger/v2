import { useCallback, useEffect, useState } from "react";

// The "lab" is how the explorations live side by side: a colour palette for
// the whole page, an optional section-by-section colour shift on scroll, and
// the client logos as a quilt or a drifting marquee, switched from a small
// panel. Each list leads with its default.
// Defaults (Micah, 2026-11-07): Clay, Dusk, Marquee. Paper, Off and Quilt
// were the live site's look and the earlier defaults.
// Settled and out of the lab: the footer (sign-off), how a featured project
// reads as a link (Corner) and the work history (Resume, 2026-11-13; its
// History row also offered Timeline and Logo); the first featured-project
// carousels are parked in app/_archive.
// The choice rides in the query string only, so a link to "graphite with the
// quilt" is shareable and a plain link always gets the defaults. (It
// used to also remember the last pick in localStorage; that kept serving
// stale picks after the defaults changed, so it went.) Once a take wins,
// delete the others and this file.

export const LAB = {
  palette: [
    { id: "clay", label: "Clay" },
    { id: "paper", label: "Paper" },
    { id: "graphite", label: "Graphite" },
    { id: "forest", label: "Forest" },
  ],
  shift: [
    { id: "dusk", label: "Dusk" },
    { id: "off", label: "Off" },
    { id: "saturate", label: "Saturate" },
    { id: "drift", label: "Drift" },
  ],
  clients: [
    { id: "marquee", label: "Marquee" },
    { id: "quilt", label: "Quilt" },
  ],
  // Case studies' closing section (Micah, 2026-11-08): numbers in a row
  // over the learnings, a two-column ledger, or one sentence of results.
  outcomes: [
    { id: "stats", label: "Stats" },
    { id: "ledger", label: "Ledger" },
    { id: "statement", label: "Statement" },
  ],
  // (The Archive had a Layout row here, 2026-11-11: Scroll, Index, Titles
  // and Panels. Micah settled on Scroll the same day and the rest went;
  // see components/archive/ArchiveScroll.tsx.)
} as const;

/** Which lab rows each page shows; the rest don't apply there. */
export const HOME_LAB: LabKey[] = ["palette", "shift", "clients"];
export const CASE_LAB: LabKey[] = ["outcomes"];
// The Archive takes the homepage's colour too (Micah, 2026-11-11: "I like
// the idea of the color carrying through"), unlike the case studies, which
// stay on Night.
export const ARCHIVE_LAB: LabKey[] = ["palette"];

export type LabKey = keyof typeof LAB;
export type LabState = { [K in LabKey]: (typeof LAB)[K][number]["id"] };

function isValid<K extends LabKey>(key: K, value: unknown): value is LabState[K] {
  return LAB[key].some((option) => option.id === value);
}

export function readLab(): LabState {
  // Each list's first entry, so the order above is the one place a default
  // is set.
  const state = Object.fromEntries(
    (Object.keys(LAB) as LabKey[]).map((key) => [key, LAB[key][0].id]),
  ) as LabState;
  const params = new URLSearchParams(window.location.search);
  (Object.keys(LAB) as LabKey[]).forEach((key) => {
    const value = params.get(key);
    if (isValid(key, value)) (state as Record<LabKey, string>)[key] = value;
  });
  return state;
}

export function useLab() {
  const [lab, setLabState] = useState<LabState>(readLab);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Old links may still carry ?footer= or ?links=; both left the lab.
    params.delete("footer");
    params.delete("links");
    // And ?layout=, the Archive's, settled on Scroll (2026-11-11), and
    // ?history=, settled on Resume (2026-11-13).
    params.delete("layout");
    params.delete("history");
    (Object.keys(lab) as LabKey[]).forEach((key) => params.set(key, lab[key]));
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [lab]);

  const setLab = useCallback(<K extends LabKey>(key: K, value: LabState[K]) => {
    setLabState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return [lab, setLab] as const;
}
