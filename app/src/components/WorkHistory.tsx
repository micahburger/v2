import { useEffect, useRef, useState } from "react";
import { jobs, type Job } from "../data/site";
import { useReducedMotion, useSeen } from "../hooks";

/**
 * Work history as the 2026 folio's resume rows (Micah, 2026-11-07), a first
 * step toward the two sites feeling like one family. A rounded logo tile
 * beside role and company, dates on the right, with the section title
 * pulled into the left half the way the folio sets "Work history" in a
 * column of its own. Set in this page's Poppins, not the folio's Proxima
 * Nova, so it sits in the page rather than pasted on. Hovering grows the
 * tile by the shared card grow token. The whole row is the link to the
 * company's site, opening in a new tab.
 *
 * This was one of three takes in the lab. Resume won and the History row
 * left the lab on 2026-11-13, taking the other two with it: Logo (the
 * live site's two-column rows, with the company's logo on a white card
 * trailing the pointer) and Timeline (a first-job-to-now ruler of tenure
 * bars above those rows). Fill and Focus were cut earlier, on 2026-11-07.
 * The jobs in data/site.ts still carry `logo`, `start` and `end` from
 * those takes; nothing reads them now.
 *
 * Keyboard focus drives the same state as hover.
 */
export default function WorkHistory() {
  const [hover, setHover] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const seen = useSeen(listRef, 0.15);
  const reduced = useReducedMotion();

  // Scrolling moves the rows out from under a still pointer without any
  // pointerleave, which would leave a tile grown under whatever scrolled
  // in. A scroll ends the hover; the next pointer move restarts it.
  useEffect(() => {
    if (hover === null) return;
    const clear = () => setHover(null);
    window.addEventListener("scroll", clear, { passive: true, once: true });
    return () => window.removeEventListener("scroll", clear);
  }, [hover]);

  return (
    <div className="history history--resume">
      <ol
        ref={listRef}
        className={`history__list ${seen || reduced ? "is-seen" : ""} ${
          hover !== null ? "has-hover" : ""
        }`}
        onPointerLeave={() => setHover(null)}
      >
        {jobs.map((job, i) => (
          <ResumeRow
            key={job.company}
            job={job}
            index={i}
            active={hover === i}
            onEnter={() => setHover(i)}
            onLeave={() => setHover((h) => (h === i ? null : h))}
          />
        ))}
      </ol>
    </div>
  );
}

/** One job. Three parts, read left to right: the tile, then what I did
 *  (role, large) over where (company and city, small and quiet), then
 *  when, set apart on the right edge. The first try stacked four lines
 *  (company in link colour, role, dates, city) beside the tile; Micah found
 *  it cluttered and unbalanced, a tall ragged block beside a short square.
 *  Two lines centre on the tile, and the dates line up down the right like
 *  a resume's.
 *
 *  The whole row is one link to the company's site. Carries .job for the
 *  stretched link, focus ring and staggered arrival. */
function ResumeRow({
  job,
  index,
  active,
  onEnter,
  onLeave,
}: {
  job: Job;
  index: number;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <li
      className={`job resume-job ${active ? "is-active" : ""}`}
      style={{ "--i": index } as React.CSSProperties}
      onPointerEnter={onEnter}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <img className="resume-job__tile" src={job.tile} alt="" />
      <p className="resume-job__role">{job.role}</p>
      <p className="resume-job__where">
        {job.href ? (
          // Stretched over the whole row by .job__link::after, so the row
          // is one big target but still a single link to a screen reader.
          <a className="job__link" href={job.href} target="_blank" rel="noreferrer">
            {job.name}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          job.name
        )}
        <span aria-hidden="true"> · </span>
        <span className="visually-hidden">, </span>
        {job.location}
      </p>
      <p className="resume-job__dates">{job.dates}</p>
    </li>
  );
}
