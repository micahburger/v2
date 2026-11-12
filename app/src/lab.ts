import { useCallback, useEffect, useState } from "react";

// The "lab" is how the explorations live side by side: a colour palette for
// the whole page, an optional section-by-section colour shift on scroll, the
// client logos as a quilt or a drifting marquee, and three takes on the work
// history, switched from a small panel. Each list leads with its default.
// Defaults (Micah, 2026-11-07): Clay, Dusk, Marquee, Resume. Paper, Off,
// Quilt and Timeline were the live site's look and the earlier defaults.
// Settled and out of the lab: the footer (sign-off) and how a featured
// project reads as a link (Corner); the first featured-project carousels
// are parked in app/_archive.
// The choice rides in the query string only, so a link to "graphite with the
// logo history" is shareable and a plain link always gets the defaults. (It
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
  history: [
    { id: "resume", label: "Resume" },
    { id: "timeline", label: "Timeline" },
    { id: "logo", label: "Logo" },
  ],
  // Case studies' closing section (Micah, 2026-11-08): numbers in a row
  // over the learnings, a two-column ledger, or one sentence of results.
  outcomes: [
    { id: "stats", label: "Stats" },
    { id: "ledger", label: "Ledger" },
    { id: "statement", label: "Statement" },
  ],
  // The Archive's layouts (/project/archive, 2026-11-11), each a pattern
  // from the design system: Index (table index, the default), Titles (text
  // index), Panels (the RentSpree overview's chapter panels). A new take is
  // a new entry here plus a component in components/archive/layouts.ts; the
  // content (archive-data.json) stays as it is.
  layout: [
    { id: "index", label: "Index" },
    { id: "titles", label: "Titles" },
    { id: "panels", label: "Panels" },
  ],
} as const;

/** Which lab rows each page shows; the rest don't apply there. */
export const HOME_LAB: LabKey[] = ["palette", "shift", "clients", "history"];
export const CASE_LAB: LabKey[] = ["outcomes"];
export const ARCHIVE_LAB: LabKey[] = ["layout"];

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
    (Object.keys(lab) as LabKey[]).forEach((key) => params.set(key, lab[key]));
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [lab]);

  const setLab = useCallback(<K extends LabKey>(key: K, value: LabState[K]) => {
    setLabState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return [lab, setLab] as const;
}
