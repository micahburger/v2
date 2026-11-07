import { useEffect, useRef, useState } from "react";
import { projects } from "../../data/site";
import { useArrowKeys } from "../../drag";
import { inertProps, useOnScreen } from "../../hooks";
import MediaBlock from "../MediaBlock";
import { SplitTitle, VisitLink, pad } from "./ProjectCopy";

/** How long the pointer has to rest on a strip before it opens. Without it,
 *  sweeping across the row to reach the far strip opens every one on the
 *  way, and the row churns under the pointer. */
const HOVER_INTENT_MS = 110;

/**
 * STRIPS. Every project is on screen at once as a vertical band of its own
 * colour; the open one takes most of the width and the rest fold down to a
 * spine with a number and a sideways title. Hovering (or clicking, or the
 * arrows) hands the width to another band. Nothing slides off-screen, so
 * the visitor always sees how many there are and what's next.
 *
 * Under 900px the row turns into a column: spines become 76px bars and the
 * open one grows downward.
 */
export default function StripsCarousel() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref);
  const intent = useRef<number>();
  const fine = useRef(window.matchMedia("(hover: hover) and (pointer: fine)").matches);

  useEffect(() => () => window.clearTimeout(intent.current), []);

  useArrowKeys(
    onScreen,
    () => setActive((a) => Math.max(0, a - 1)),
    () => setActive((a) => Math.min(projects.length - 1, a + 1)),
  );

  return (
    <div className="strips-wrap wrap" ref={ref}>
      <div className="section__head">
        <h2 className="section__title">Featured projects</h2>
        <span className="label">Hover, click or use ← →</span>
      </div>
      <div className="strips" role="group" aria-roledescription="carousel" aria-label="Featured projects">
        {projects.map((p, i) => {
          const open = i === active;
          return (
            <div
              key={p.id}
              className={`strip ${open ? "is-open" : ""}`}
              style={{ backgroundColor: p.color, color: p.ink } as React.CSSProperties}
              onPointerEnter={() => {
                if (!fine.current || open) return;
                window.clearTimeout(intent.current);
                intent.current = window.setTimeout(() => setActive(i), HOVER_INTENT_MS);
              }}
              onPointerLeave={() => window.clearTimeout(intent.current)}
            >
              {/* The spine is the strip's button while it's folded. Once open,
                  it hides so the visit link is the only thing to press. */}
              <button
                type="button"
                className="strip__spine"
                aria-expanded={open}
                aria-label={`${p.title}, ${p.kind}`}
                tabIndex={open ? -1 : 0}
                onClick={() => setActive(i)}
              >
                <span className="label">{pad(i + 1)}</span>
                <span className="strip__spine-title">{p.title}</span>
              </button>

              <div className="strip__content" aria-hidden={!open} {...inertProps(!open)}>
                <div className="strip__copy">
                  <span className="label">
                    {pad(i + 1)} · {p.kind}
                  </span>
                  <h3 className="strip__title">
                    {open ? <SplitTitle key={`t-${active}`} text={p.title} className="is-in" /> : p.title}
                  </h3>
                  <p className="strip__blurb">{p.blurb}</p>
                  <VisitLink project={p} />
                </div>
                <div className="strip__media" style={{ backgroundColor: p.surface }}>
                  <MediaBlock project={p} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
