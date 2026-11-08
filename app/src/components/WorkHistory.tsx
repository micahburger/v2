import { useEffect, useRef, useState } from "react";
import { jobs, type Job } from "../data/site";
import { useReducedMotion, useSeen } from "../hooks";

type Variant = "logo" | "timeline";

/**
 * Work history in the live site's layout: dates and location in the left
 * half, company (a link, in capitals) over the role in the right half. In
 * both takes the whole row is the link to the company's site, opening in a
 * new tab. The hover ideas layered on top:
 *  - LOGO: the company's logo, in black on a white card, floats beside the
 *    pointer while it's over that row. (Micah's ask.)
 *  - TIMELINE: a first-job-to-now ruler above the list where every job is
 *    a span, all one colour. Hovering a row raises its span in the text
 *    colour and lightens the row; hovering a span does the same.
 *
 * Fill (the row flooding with a brand colour) and Focus (the other rows
 * stepping back while a tenure bar drew out) were tried and cut from the
 * lab on 2026-11-07.
 *
 * Keyboard focus drives the same state as hover.
 */
export default function WorkHistory({ variant }: { variant: Variant }) {
  const [hover, setHover] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const seen = useSeen(listRef, 0.15);
  const reduced = useReducedMotion();

  // Scrolling moves the rows out from under a still pointer without any
  // pointerleave, which would leave the hover card floating over whatever
  // scrolled in. A scroll ends the hover; the next pointer move restarts it.
  useEffect(() => {
    if (hover === null) return;
    const clear = () => setHover(null);
    window.addEventListener("scroll", clear, { passive: true, once: true });
    return () => window.removeEventListener("scroll", clear);
  }, [hover]);

  return (
    <div className={`history history--${variant}`}>
      {variant === "timeline" && <Timeline hover={hover} setHover={setHover} />}
      <ol
        ref={listRef}
        className={`history__list ${seen || reduced ? "is-seen" : ""} ${
          hover !== null ? "has-hover" : ""
        }`}
        onPointerLeave={() => setHover(null)}
      >
        {jobs.map((job, i) => (
          <Row
            key={job.company}
            job={job}
            index={i}
            active={hover === i}
            onEnter={() => setHover(i)}
            onLeave={() => setHover((h) => (h === i ? null : h))}
          />
        ))}
      </ol>
      {variant === "logo" && <LogoCard job={hover === null ? null : jobs[hover]} />}
    </div>
  );
}

function Row({
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
      className={`job grid ${active ? "is-active" : ""}`}
      style={{ "--i": index } as React.CSSProperties}
      onPointerEnter={onEnter}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <div className="job__when">
        <p className="job__dates">{job.dates}</p>
        <p className="job__where">{job.location}</p>
      </div>
      <div className="job__what">
        <p className="job__company">
          {job.href ? (
            // Stretched over the whole row by .job__link::after, so the row
            // is one big target but still a single link to a screen reader.
            <a className="job__link" href={job.href} target="_blank" rel="noreferrer">
              {job.company}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : (
            job.company
          )}
        </p>
        <p className="job__role">{job.role}</p>
      </div>
    </li>
  );
}

/** The card that trails the pointer in LOGO. One element for the whole
 *  list, eased toward the pointer each frame (lerp .18) so it lags like
 *  something with weight instead of being glued to the cursor.
 *
 *  Every logo renders up front and only the current one shows, so moving
 *  between rows never waits on an image request. */
function LogoCard({ job }: { job: Job | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useRef(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  // Keep showing the last job while the card fades out, rather than blanking.
  const [last, setLast] = useState<Job | null>(job);
  useEffect(() => {
    if (job) setLast(job);
  }, [job]);

  useEffect(() => {
    if (!fine.current) return;
    const el = ref.current!;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let first = true;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX + 28;
      target.y = e.clientY - 120;
      if (first) {
        pos.x = target.x;
        pos.y = target.y;
        first = false;
      }
    };
    const tick = () => {
      const k = reduced ? 1 : 0.18;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (!fine.current) return null;
  return (
    <div ref={ref} className={`follow-card ${job ? "is-on" : ""}`} aria-hidden="true">
      <div className="follow-card__inner follow-card__inner--logo">
        {jobs.map((j) =>
          j.logo ? (
            <img
              key={j.company}
              src={j.logo}
              alt=""
              className={`follow-card__logo ${j === last ? "is-current" : ""}`}
            />
          ) : (
            <span
              key={j.company}
              className={`follow-card__logo follow-card__wordmark ${j === last ? "is-current" : ""}`}
            >
              {j.company}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

/** Year as a decimal, from "YYYY-MM" (null = this month). */
function toYear(value: string | null) {
  const [y, m] = value ? value.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  return y + (m - 1) / 12;
}

// The ruler runs from the first job's start to this month, not from round
// years: that's what puts Hanson's bar flush with the "Work History" title
// on the left and RentSpree's flush with the content edge on the right.
const T0 = Math.min(...jobs.map((j) => toYear(j.start)));
const T1 = toYear(null);

function at(value: string | null) {
  return ((toYear(value) - T0) / (T1 - T0)) * 100;
}

function Timeline({
  hover,
  setHover,
}: {
  hover: number | null;
  setHover: (i: number | null) => void;
}) {
  // Every four years, from the first even year inside the range. 2012 to
  // 2024 keeps every label clear of both ends, where a centred label would
  // otherwise hang past the content edge.
  const ticks: number[] = [];
  for (let y = Math.ceil(T0 / 2) * 2; y < T1 - 1; y += 4) ticks.push(y);
  return (
    <div className="timeline" aria-hidden="true" onPointerLeave={() => setHover(null)}>
      <div className="timeline__track">
        {jobs.map((job, i) => {
          const left = at(job.start);
          const width = at(job.end) - left;
          return (
            <span
              key={job.company}
              className={`timeline__span ${hover === i ? "is-active" : ""}`}
              style={
                {
                  left: `${left}%`,
                  width: `${width}%`,
                } as React.CSSProperties
              }
              onPointerEnter={() => setHover(i)}
            >
              <span className="timeline__label">{job.company}</span>
            </span>
          );
        })}
      </div>
      <div className="timeline__ticks">
        {ticks.map((y) => (
          <span key={y} style={{ left: `${((y - T0) / (T1 - T0)) * 100}%` }}>
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}
