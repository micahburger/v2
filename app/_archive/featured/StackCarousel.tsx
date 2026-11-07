import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { projects } from "../../data/site";
import { DRAG_COMMIT_RATIO, DRAG_COMMIT_VELOCITY, DUR, EASE } from "../../motion";
import { useArrowKeys, useDrag } from "../../drag";
import { inertProps, useOnScreen, useReducedMotion } from "../../hooks";
import MediaBlock from "../MediaBlock";
import { VisitLink, pad } from "./ProjectCopy";

/** How far a thrown card travels before it turns around and tucks under. */
const THROW_OUT_MS = 300;
/** Cards behind the top one: vertical step and scale step per layer. */
const STEP_Y = 22;
const STEP_SCALE = 0.05;
/** Layers past this are parked invisibly at the back. */
const VISIBLE_LAYERS = 4;

type Phase =
  | { kind: "idle" }
  | { kind: "out"; id: string; dir: 1 | -1 }
  | { kind: "in-start"; id: string }; // prev: card parked off-screen left, about to land

/**
 * STACK. The projects are a physical deck. Grab the top card and throw it;
 * it sails off, then curls back round and slides *under* the deck, so the
 * order is never lost: the card you threw is always at the bottom, and the
 * deck's depth shows how many are left. Previous pulls the bottom card back
 * out from the left and drops it on top.
 *
 * The drag follows the pointer 1:1 with a rotation proportional to the
 * offset, like holding a card by its bottom edge.
 */
export default function StackCarousel() {
  // order[0] is the top card.
  const [order, setOrder] = useState(() => projects.map((p) => p.id));
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const top = projects.find((p) => p.id === order[0])!;
  const topIndex = projects.indexOf(top);

  const next = useCallback(
    (dir: 1 | -1 = -1) => {
      if (phase.kind !== "idle") return;
      const id = order[0];
      if (reduced) {
        setOrder((o) => [...o.slice(1), o[0]]);
        return;
      }
      setPhase({ kind: "out", id, dir });
      timer.current = window.setTimeout(() => {
        setOrder((o) => [...o.slice(1), o[0]]);
        setPhase({ kind: "idle" });
      }, THROW_OUT_MS);
    },
    [order, phase, reduced],
  );

  const prev = useCallback(() => {
    if (phase.kind !== "idle") return;
    const id = order[order.length - 1];
    if (reduced) {
      setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
      return;
    }
    // Park the bottom card off to the left *on top* with no transition; the
    // layout effect below then lets it land in the top slot.
    setPhase({ kind: "in-start", id });
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  }, [order, phase, reduced]);

  // The parked position has to reach the page before the landing starts, or
  // the browser only ever sees the end state and the card just appears.
  // Reading offsetWidth forces that layout synchronously. (A double rAF
  // does the same job but never fires in a background tab, which strands the
  // card off-screen.)
  useLayoutEffect(() => {
    if (phase.kind !== "in-start") return;
    void cardRef.current?.offsetWidth;
    setPhase({ kind: "idle" });
  }, [phase]);

  useArrowKeys(onScreen, prev, () => next(-1));

  const dragHandlers = useDrag({
    onMove: (dx, dy) => phase.kind === "idle" && setDrag({ dx, dy }),
    onEnd: ({ dx, vx }) => {
      setDrag(null);
      const width = cardRef.current?.offsetWidth ?? 800;
      if (Math.abs(dx) > width * DRAG_COMMIT_RATIO || Math.abs(vx) > DRAG_COMMIT_VELOCITY) {
        next(dx < 0 ? -1 : 1);
      }
    },
  });

  return (
    <div className="stack-wrap wrap" ref={ref}>
      <div className="section__head">
        <h2 className="section__title">Featured projects</h2>
        <span className="label">
          {pad(topIndex + 1)} / {pad(projects.length)}
        </span>
      </div>

      <div className="stack" role="group" aria-roledescription="carousel" aria-label="Featured projects">
        {projects.map((p) => {
          const layer = order.indexOf(p.id);
          const isTop = layer === 0;
          let transform = `translate3d(0, ${-layer * STEP_Y}px, 0) scale(${1 - layer * STEP_SCALE})`;
          let transition = `transform ${reduced ? DUR.reduced : 520}ms ${EASE.settle}, opacity 300ms ease`;
          let z = projects.length - layer;
          let opacity = layer < VISIBLE_LAYERS ? 1 : 0;

          if (isTop && drag) {
            transform = `translate3d(${drag.dx}px, ${drag.dy * 0.15}px, 0) rotate(${drag.dx * 0.025}deg)`;
            transition = "none";
          }
          if (phase.kind === "out" && phase.id === p.id) {
            // Out past the edge, still on top, then (after THROW_OUT_MS) the
            // order flips and the same card glides to the bottom slot,
            // passing *under* the deck because its z-index dropped first.
            transform = `translate3d(${phase.dir * 115}%, -40px, 0) rotate(${phase.dir * 10}deg)`;
            transition = `transform ${THROW_OUT_MS}ms ${EASE.exit}`;
          }
          if (phase.kind === "in-start" && phase.id === p.id) {
            transform = `translate3d(-115%, -40px, 0) rotate(-10deg)`;
            transition = "none";
            z = projects.length + 1;
          }

          return (
            <div
              key={p.id}
              ref={isTop ? cardRef : undefined}
              className={`stack__card ${isTop ? "is-top" : ""}`}
              style={{
                backgroundColor: p.color,
                color: p.ink,
                transform,
                transition,
                zIndex: z,
                opacity,
              }}
              aria-hidden={!isTop}
              {...inertProps(!isTop)}
              data-cursor={isTop ? "Drag" : undefined}
              {...(isTop ? dragHandlers : {})}
            >
              <div className="stack__copy">
                <span className="label">
                  {pad(projects.indexOf(p) + 1)} · {p.kind}
                </span>
                <h3 className="stack__title">{p.title}</h3>
                <p className="stack__blurb">{p.blurb}</p>
                <VisitLink project={p} />
              </div>
              <div className="stack__media" style={{ backgroundColor: p.surface }}>
                <MediaBlock project={p} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="stack__controls">
        <button type="button" className="round-btn" aria-label="Previous project" onClick={prev}>
          ←
        </button>
        <span className="label">Drag or throw the card</span>
        <button type="button" className="round-btn" aria-label="Next project" onClick={() => next(-1)}>
          →
        </button>
      </div>
    </div>
  );
}
