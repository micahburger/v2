import { Fragment } from "react";
import type { Project } from "../../data/site";

/** Title split into per-letter spans so the carousels can stagger them.
 *  Words stay in their own inline-block so a line never breaks mid-word,
 *  and the real title rides in aria-label because screen readers would
 *  otherwise spell it out one letter at a time. */
export function SplitTitle({ text, className = "" }: { text: string; className?: string }) {
  let n = 0;
  return (
    <span className={`split ${className}`} aria-label={text}>
      {text.split(" ").map((word, w) => (
        // The space sits *between* the word boxes, as a plain text node: a
        // trailing space inside an inline-block is collapsed away, which
        // glued "Corner Bodega" into one word wherever it fit on a line.
        <Fragment key={w}>
          {w > 0 && " "}
          <span className="split__word" aria-hidden="true">
            {[...word].map((ch, c) => (
              <span className="split__char" key={c} style={{ "--i": n++ } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

export function VisitLink({ project }: { project: Project }) {
  return (
    <a className="visit" href={project.href} target="_blank" rel="noreferrer" data-cursor="View">
      Visit project
      <span className="visit__arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}
