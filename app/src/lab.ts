import { useCallback, useEffect, useState } from "react";

// The "lab" is how the explorations live side by side: a colour palette for
// the whole page, an optional section-by-section colour shift on scroll and
// two takes on the work history, switched from a small panel. "Paper" is
// the live site's colour; the history defaults to "Timeline", Micah's pick
// so far. (The client quilt was settled on its wave build-in and the footer
// on the sign-off, and both left the lab; the first featured-project
// carousels are parked in app/_archive.)
// The choice rides in the query string only, so a link to "graphite with the
// logo history" is shareable and a plain link always gets the
// defaults. (It used to also remember the last pick in localStorage; that
// kept serving stale picks after the defaults changed, so it went.) Once a take wins, delete the others and this file.

export const LAB = {
  palette: [
    { id: "paper", label: "Paper" },
    { id: "graphite", label: "Graphite" },
    { id: "forest", label: "Forest" },
    { id: "clay", label: "Clay" },
  ],
  shift: [
    { id: "off", label: "Off" },
    { id: "saturate", label: "Saturate" },
    { id: "drift", label: "Drift" },
    { id: "dusk", label: "Dusk" },
  ],
  history: [
    { id: "timeline", label: "Timeline" },
    { id: "logo", label: "Logo" },
  ],
} as const;

export type LabKey = keyof typeof LAB;
export type LabState = { [K in LabKey]: (typeof LAB)[K][number]["id"] };

function isValid<K extends LabKey>(key: K, value: unknown): value is LabState[K] {
  return LAB[key].some((option) => option.id === value);
}

export function readLab(): LabState {
  const state: LabState = { palette: "paper", shift: "off", history: "timeline" };
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
    // Old links may still carry ?footer=; the footer left the lab, so drop it.
    params.delete("footer");
    (Object.keys(lab) as LabKey[]).forEach((key) => params.set(key, lab[key]));
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [lab]);

  const setLab = useCallback(<K extends LabKey>(key: K, value: LabState[K]) => {
    setLabState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return [lab, setLab] as const;
}
