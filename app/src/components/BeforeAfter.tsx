import { useRef, useState } from "react";
import type { Img } from "../data/caseStudies";

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * The same screen before and after, one over the other, with a handle to
 * wipe between them: the ds "Before and after" pattern (Recipe 10), which
 * the live Opendoor page did with a Semplice slider.
 *
 * The after image is the top layer, clipped from the left to the handle,
 * so the before shows left of the line and the after right of it, matching
 * the tags in the corners. Grabbing anywhere tracks the pointer 1:1; a
 * plain click glides the line to where you clicked on the drag-settle curve
 * instead of jumping. Horizontal drags are ours, vertical ones still scroll
 * the page (touch-action: pan-y).
 *
 * The real control is a visually hidden range input, so arrow keys and
 * screen readers work it; the handle drawn on the image is its picture,
 * and shows the focus ring when the input has focus.
 */
export default function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: Img;
  after: Img;
  beforeLabel: string;
  afterLabel: string;
}) {
  const [pos, setPos] = useState(50);
  // True while a click (not a drag) is gliding the line to where it landed.
  const [settling, setSettling] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; startX: number; moved: boolean } | null>(null);

  const posAt = (clientX: number) => {
    const rect = boxRef.current!.getBoundingClientRect();
    return clamp(((clientX - rect.left) / rect.width) * 100);
  };

  return (
    <div
      ref={boxRef}
      className={`compare ${settling ? "is-settling" : ""}`}
      style={{ "--pos": `${pos}%`, aspectRatio: `${after.width} / ${after.height}` } as React.CSSProperties}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { id: e.pointerId, startX: e.clientX, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
        setSettling(true);
        setPos(posAt(e.clientX));
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        // A few pixels of travel before it counts as a drag, so a click
        // with a shaky hand still glides.
        if (!d.moved && Math.abs(e.clientX - d.startX) < 4) return;
        d.moved = true;
        setSettling(false);
        setPos(posAt(e.clientX));
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onTransitionEnd={() => setSettling(false)}
    >
      <img src={before.src} alt={before.alt} width={before.width} height={before.height} loading="lazy" decoding="async" draggable={false} />
      <img
        className="compare__after"
        src={after.src}
        alt={after.alt}
        width={after.width}
        height={after.height}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <span className="compare__tag compare__tag--before" aria-hidden="true">
        {beforeLabel}
      </span>
      <span className="compare__tag compare__tag--after" aria-hidden="true">
        {afterLabel}
      </span>
      <span className="compare__handle" aria-hidden="true">
        <span className="compare__knob">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M9 6.5 3.5 12 9 17.5M15 6.5l5.5 5.5-5.5 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <input
        className="visually-hidden"
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(pos)}
        aria-label={`Wipe between ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
        aria-valuetext={`${Math.round(pos)}% ${beforeLabel.toLowerCase()}`}
        onChange={(e) => {
          setSettling(false);
          setPos(Number(e.target.value));
        }}
      />
    </div>
  );
}
