import { useState } from "react";
import { LAB, LabKey, LabState } from "../lab";

const TITLES: Record<LabKey, string> = {
  quilt: "Clients",
  history: "History",
};

/**
 * The switcher for the interaction explorations. Collapsed it's a single
 * pill in the corner so it stays out of screenshots; open, one segmented
 * row per section. "Replay" remounts the quilt, since its build-in only
 * fires the first time it scrolls into view.
 */
export default function LabPanel({
  lab,
  setLab,
  onReplay,
}: {
  lab: LabState;
  setLab: <K extends LabKey>(key: K, value: LabState[K]) => void;
  onReplay: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lab ${open ? "is-open" : ""}`}>
      {open && (
        <div className="lab__panel" role="group" aria-label="Interaction variants">
          {(Object.keys(LAB) as LabKey[]).map((key) => (
            <div className="lab__row" key={key}>
              <span className="lab__title">{TITLES[key]}</span>
              <div className="lab__seg" role="radiogroup" aria-label={TITLES[key]}>
                {LAB[key].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={lab[key] === option.id}
                    className={lab[key] === option.id ? "is-on" : ""}
                    onClick={() => setLab(key, option.id as LabState[typeof key])}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="lab__replay" onClick={onReplay}>
            Replay build-ins
          </button>
        </div>
      )}
      <button
        type="button"
        className="lab__toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Close" : "Lab"}
      </button>
    </div>
  );
}
