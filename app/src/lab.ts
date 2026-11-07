import { useCallback, useEffect, useState } from "react";

// The "lab" is how the interaction explorations live side by side: the
// client quilt and the work history each have a few takes, and a small panel
// switches between them. "Static" is the live site as it is today; the
// history defaults to "Logo", which Micah asked for directly. (The
// featured-project carousels were parked in app/_archive.)
// The choice rides in the query string only, so a link to "the flap quilt
// with the timeline history" is shareable and a plain link always gets the
// defaults. (It used to also remember the last pick in localStorage; that
// kept serving stale picks after the defaults changed, so it went.) Once a take wins, delete the others and this file.

export const LAB = {
  quilt: [
    { id: "static", label: "Static" },
    { id: "wave", label: "Wave" },
    { id: "assemble", label: "Assemble" },
    { id: "flap", label: "Flap" },
  ],
  history: [
    { id: "static", label: "Static" },
    { id: "logo", label: "Logo" },
    { id: "fill", label: "Fill" },
    { id: "focus", label: "Focus" },
    { id: "timeline", label: "Timeline" },
  ],
} as const;

export type LabKey = keyof typeof LAB;
export type LabState = { [K in LabKey]: (typeof LAB)[K][number]["id"] };

function isValid<K extends LabKey>(key: K, value: unknown): value is LabState[K] {
  return LAB[key].some((option) => option.id === value);
}

function read(): LabState {
  const state: LabState = { quilt: "static", history: "logo" };
  const params = new URLSearchParams(window.location.search);
  (Object.keys(LAB) as LabKey[]).forEach((key) => {
    const value = params.get(key);
    if (isValid(key, value)) (state as Record<LabKey, string>)[key] = value;
  });
  return state;
}

export function useLab() {
  const [lab, setLabState] = useState<LabState>(read);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    (Object.keys(lab) as LabKey[]).forEach((key) => params.set(key, lab[key]));
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }, [lab]);

  const setLab = useCallback(<K extends LabKey>(key: K, value: LabState[K]) => {
    setLabState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return [lab, setLab] as const;
}
