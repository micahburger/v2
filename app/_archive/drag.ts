import { useEffect, useRef } from "react";

// Pointer drag shared by the Wash and Stack carousels. Kept deliberately
// small: it reports offsets and a release velocity, and each carousel decides
// what a drag *means* (slide the track, throw a card).

export type DragEnd = {
  dx: number;
  dy: number;
  /** Horizontal release velocity in px/ms, from the last ~80ms of movement
   *  rather than the whole gesture, so a slow drag that ends in a flick
   *  still counts as a flick. */
  vx: number;
  x: number;
  y: number;
};

type Options = {
  onStart?: () => void;
  onMove: (dx: number, dy: number) => void;
  onEnd: (end: DragEnd) => void;
};

/** Moves smaller than this are a click, not a drag. Also used to swallow
 *  the click that a real drag would otherwise fire on a link inside the
 *  dragged thing. */
const CLICK_SLOP = 6;

export function useDrag(options: Options) {
  const opts = useRef(options);
  opts.current = options;
  const state = useRef<{
    id: number;
    x0: number;
    y0: number;
    samples: { x: number; t: number }[];
    dragging: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  // Escape mid-drag lets go without committing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.current?.dragging) {
        state.current = null;
        opts.current.onEnd({ dx: 0, dy: 0, vx: 0, x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    onPointerDown(e: React.PointerEvent) {
      if (e.button !== 0) return;
      state.current = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        samples: [{ x: e.clientX, t: e.timeStamp }],
        dragging: false,
      };
      suppressClick.current = false;
    },
    onPointerMove(e: React.PointerEvent) {
      const s = state.current;
      if (!s || s.id !== e.pointerId) return;
      const dx = e.clientX - s.x0;
      const dy = e.clientY - s.y0;
      if (!s.dragging) {
        if (Math.hypot(dx, dy) < CLICK_SLOP) return;
        // A mostly vertical move on touch is the page scrolling, not a swipe:
        // let it go. (touch-action: pan-y on the element keeps the browser
        // handling that scroll itself.)
        if (e.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)) {
          state.current = null;
          return;
        }
        s.dragging = true;
        suppressClick.current = true;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        opts.current.onStart?.();
      }
      s.samples.push({ x: e.clientX, t: e.timeStamp });
      if (s.samples.length > 6) s.samples.shift();
      opts.current.onMove(dx, dy);
    },
    onPointerUp(e: React.PointerEvent) {
      const s = state.current;
      state.current = null;
      if (!s || s.id !== e.pointerId || !s.dragging) return;
      const recent = s.samples.filter((p) => e.timeStamp - p.t < 80);
      const first = recent[0] ?? s.samples[0];
      const dt = Math.max(1, e.timeStamp - first.t);
      opts.current.onEnd({
        dx: e.clientX - s.x0,
        dy: e.clientY - s.y0,
        vx: (e.clientX - first.x) / dt,
        x: e.clientX,
        y: e.clientY,
      });
    },
    onPointerCancel() {
      if (state.current?.dragging) opts.current.onEnd({ dx: 0, dy: 0, vx: 0, x: 0, y: 0 });
      state.current = null;
    },
    /** Capture-phase click guard: a drag that started on a link must not
     *  also follow it. */
    onClickCapture(e: React.MouseEvent) {
      if (suppressClick.current) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick.current = false;
      }
    },
  };
}

/** Left/right arrows drive a carousel, but only while it's the thing on
 *  screen and focus isn't in a form field. */
export function useArrowKeys(active: boolean, onPrev: () => void, onNext: () => void) {
  const handlers = useRef({ onPrev, onNext });
  handlers.current = { onPrev, onNext };
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handlers.current.onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlers.current.onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
}
