import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { projects } from "../../data/site";
import { DRAG_COMMIT_RATIO, DRAG_COMMIT_VELOCITY, DUR, EASE } from "../../motion";
import { useArrowKeys, useDrag } from "../../drag";
import { useOnScreen, useReducedMotion } from "../../hooks";
import MediaBlock from "../MediaBlock";
import { SplitTitle, VisitLink, pad } from "./ProjectCopy";

/**
 * WASH. The section *is* the project's colour, and changing project floods
 * the next colour in as a circle that grows from wherever the change came
 * from: the point you let go of a drag, the arrow you clicked, or the edge
 * the keyboard pushed from. So the colour change has a direction and a
 * source, rather than being a crossfade that happens to the page.
 *
 * The media slides on a track (neighbours peek in, smaller and faded), and
 * the title re-sets letter by letter as the old one leaves upward.
 */
export default function WashCarousel() {
  const [index, setIndex] = useState(0);
  // The outgoing title, kept for one exit animation, then dropped.
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const floodRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const floodAnim = useRef<Animation | null>(null);
  const onScreen = useOnScreen(sectionRef);

  const project = projects[index];

  /** Grow the next colour from (x, y), section-relative. If a flood is
   *  already running, it's committed first, so rapid clicks queue up as a
   *  stack of rings instead of snapping back. */
  const flood = useCallback(
    (color: string, x: number, y: number) => {
      const base = baseRef.current!;
      const layer = floodRef.current!;
      if (floodAnim.current) {
        base.style.backgroundColor = layer.style.backgroundColor;
        floodAnim.current.cancel();
      }
      layer.style.backgroundColor = color;
      const { width, height } = sectionRef.current!.getBoundingClientRect();
      const r = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
      const anim = layer.animate(
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { clipPath: `circle(0px at ${x}px ${y}px)` },
              { clipPath: `circle(${r}px at ${x}px ${y}px)` },
            ],
        { duration: reduced ? DUR.reduced : DUR.wash, easing: EASE.large, fill: "forwards" },
      );
      floodAnim.current = anim;
      anim.onfinish = () => {
        // Hand the colour to the base and clear the flood in the same frame,
        // so there's never a moment with neither showing it.
        base.style.backgroundColor = color;
        anim.cancel();
        if (floodAnim.current === anim) floodAnim.current = null;
      };
    },
    [reduced],
  );

  const go = useCallback(
    (next: number, origin?: { x: number; y: number }) => {
      const n = (next + projects.length) % projects.length;
      if (n === index) return;
      const rect = sectionRef.current!.getBoundingClientRect();
      // No origin (keyboard): flood from the edge the content is coming from.
      const forward = next > index;
      const o = origin
        ? { x: origin.x - rect.left, y: origin.y - rect.top }
        : { x: forward ? rect.width : 0, y: rect.height / 2 };
      flood(projects[n].color, o.x, o.y);
      setLeaving(index);
      setIndex(n);
    },
    [index, flood],
  );

  // Drop the leaving title once its exit has run (180ms, plus slack).
  useEffect(() => {
    if (leaving === null) return;
    const t = window.setTimeout(() => setLeaving(null), 260);
    return () => window.clearTimeout(t);
  }, [leaving]);

  // First paint: the base already wears the first project's colour.
  useLayoutEffect(() => {
    baseRef.current!.style.backgroundColor = projects[0].color;
  }, []);

  useArrowKeys(onScreen, () => go(index - 1), () => go(index + 1));

  const drag = useDrag({
    onStart: () => setDragging(true),
    onMove: (dx) => {
      // Rubber-band past either end so the track admits there's nothing there.
      const atEdge = (index === 0 && dx > 0) || (index === projects.length - 1 && dx < 0);
      setDragX(atEdge ? dx * 0.3 : dx);
    },
    onEnd: ({ dx, vx, x, y }) => {
      setDragging(false);
      setDragX(0);
      const width = viewportRef.current!.offsetWidth;
      const commit = Math.abs(dx) > width * DRAG_COMMIT_RATIO || Math.abs(vx) > DRAG_COMMIT_VELOCITY;
      if (!commit) return;
      const dir = dx < 0 ? 1 : -1;
      const next = index + dir;
      if (next < 0 || next >= projects.length) return;
      go(next, { x, y });
    },
  });

  return (
    <div
      ref={sectionRef}
      className="wash"
      style={{ color: project.ink } as React.CSSProperties}
      data-theme={project.ink === "#F4F1EC" ? "dark" : "light"}
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <div ref={baseRef} className="wash__base" aria-hidden="true" />
      <div ref={floodRef} className="wash__flood" aria-hidden="true" />

      <div className="wash__inner wrap">
        <div className="wash__copy">
          <div className="wash__meta label">
            <span>Featured</span>
            <span>
              {pad(index + 1)} / {pad(projects.length)}
            </span>
          </div>
          <h2 className="wash__title">
            {leaving !== null && (
              <SplitTitle key={`out-${leaving}`} text={projects[leaving].title} className="is-out" />
            )}
            <SplitTitle key={`in-${index}`} text={project.title} className="is-in" />
          </h2>
          <div className="wash__body" key={`body-${index}`}>
            <p className="label">
              {project.kind} · {project.year}
            </p>
            <p className="wash__blurb">{project.blurb}</p>
            <VisitLink project={project} />
          </div>
          <div className="wash__controls">
            <button
              type="button"
              className="round-btn"
              aria-label="Previous project"
              onClick={(e) => go(index - 1, { x: e.clientX, y: e.clientY })}
            >
              ←
            </button>
            <button
              type="button"
              className="round-btn"
              aria-label="Next project"
              onClick={(e) => go(index + 1, { x: e.clientX, y: e.clientY })}
            >
              →
            </button>
            <div className="dots" role="tablist" aria-label="Choose a project">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={p.title}
                  className={`dot ${i === index ? "is-active" : ""}`}
                  onClick={(e) => go(i, { x: e.clientX, y: e.clientY })}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          ref={viewportRef}
          className={`wash__viewport ${dragging ? "is-dragging" : ""}`}
          data-cursor="Drag"
          {...drag}
        >
          <div
            className="wash__track"
            style={{
              // Percentages here are of the track, which is the viewport's
              // width, so one step is exactly one card plus its gap.
              transform: `translate3d(calc(${-index} * (var(--wash-card) + var(--wash-gap)) + ${dragX}px), 0, 0)`,
              transition: dragging
                ? "none"
                : `transform ${reduced ? DUR.reduced : DUR.settle}ms ${EASE.settle}`,
            }}
          >
            {projects.map((p, i) => (
              <div
                key={p.id}
                className={`wash__card ${i === index ? "is-active" : ""}`}
                style={{ backgroundColor: p.surface }}
                aria-hidden={i !== index}
              >
                <MediaBlock project={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
