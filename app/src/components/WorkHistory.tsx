import { useEffect, useRef, useState } from "react";
import { jobs, type Job } from "../data/site";
import { formatTenure, monthsBetween, useReducedMotion, useSeen } from "../hooks";

type Variant = "static" | "logo" | "fill" | "focus" | "timeline";

const tenure = jobs.map((j) => monthsBetween(j.start, j.end));
const longest = Math.max(...tenure);

/**
 * Work history in the live site's layout: dates and location in the left
 * half, company (a link, in capitals) over the role in the right half.
 * "static" is exactly that. In every take the whole row is the link to the
 * company's site, opening in a new tab. The hover ideas layered on top:
 *  - LOGO: the company's logo, in black on a white card, floats beside the
 *    pointer while it's over that row. (Micah's ask.)
 *  - FILL: the row floods with the company's colour from the bottom up, and
 *    a small card trails the pointer with the company and how long I was
 *    there.
 *  - FOCUS: the other rows step back, the hovered role nudges right, and a
 *    bar draws out under it showing tenure against the longest job.
 *  - TIMELINE: a 2010-to-now ruler above the list where every job is a
 *    span. Hovering a row lights its span and vice versa.
 *
 * Keyboard focus drives the same state as hover.
 */
export default function WorkHistory({ variant }: { variant: Variant }) {
  const [hover, setHover] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const seen = useSeen(listRef, 0.15);
  const reduced = useReducedMotion();
  const interactive = variant !== "static";

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
        className={`history__list ${seen || reduced || !interactive ? "is-seen" : ""} ${
          hover !== null ? "has-hover" : ""
        }`}
        onPointerLeave={() => setHover(null)}
      >
        {jobs.map((job, i) => (
          <Row
            key={job.company}
            job={job}
            index={i}
            active={interactive && hover === i}
            onEnter={() => interactive && setHover(i)}
            onLeave={() => setHover((h) => (h === i ? null : h))}
          />
        ))}
      </ol>
      {(variant === "fill" || variant === "logo") && (
        <FollowCard job={hover === null ? null : jobs[hover]} kind={variant} />
      )}
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
      style={
        {
          "--brand": job.color,
          "--brand-ink": job.ink,
          "--i": index,
        } as React.CSSProperties
      }
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
        <span className="job__tenure" aria-hidden="true">
          <span className="job__bar" style={{ "--w": tenure[index] / longest } as React.CSSProperties} />
          <span className="job__tenure-text">{formatTenure(tenure[index])}</span>
        </span>
      </div>
    </li>
  );
}

/** The card that trails the pointer in LOGO and FILL. One element for the
 *  whole list, eased toward the pointer each frame (lerp .18) so it lags
 *  like something with weight instead of being glued to the cursor.
 *
 *  LOGO renders every logo up front and only shows the current one, so
 *  moving between rows never waits on an image request. */
function FollowCard({ job, kind }: { job: Job | null; kind: "logo" | "fill" }) {
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
  if (kind === "logo") {
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
  return (
    <div ref={ref} className={`follow-card ${job ? "is-on" : ""}`} aria-hidden="true">
      {last && (
        <div className="follow-card__inner" style={{ backgroundColor: last.color, color: last.ink }}>
          <span className="follow-card__name">{last.company}</span>
          <span className="follow-card__tenure">
            {formatTenure(monthsBetween(last.start, last.end))}
          </span>
        </div>
      )}
    </div>
  );
}

const T0 = 2010;
const T1 = new Date().getFullYear() + 1;

function at(value: string | null) {
  const d = value ? value.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  return ((d[0] + (d[1] - 1) / 12 - T0) / (T1 - T0)) * 100;
}

function Timeline({
  hover,
  setHover,
}: {
  hover: number | null;
  setHover: (i: number | null) => void;
}) {
  const ticks: number[] = [];
  for (let y = T0; y <= T1; y += 4) ticks.push(y);
  return (
    <div className="timeline" aria-hidden="true" onPointerLeave={() => setHover(null)}>
      <div className="timeline__track">
        {jobs.map((job, i) => {
          const left = at(job.start);
          const width = at(job.end) - left;
          return (
            <span
              key={job.company}
              className={`timeline__span ${hover === i ? "is-active" : ""} ${
                hover !== null && hover !== i ? "is-dim" : ""
              }`}
              style={
                {
                  left: `${left}%`,
                  width: `${width}%`,
                  "--brand": job.color,
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
