import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./motion";

// The grab-and-swipe carousel from the 2026 folio (its hooks/useMediaGallery
// and the ds "Recipe 2: Media carousel"), ported nearly line for line so the
// two sites feel the same in the hand. Differences from the folio:
//  - any number of slides (the folio guarantees exactly three);
//  - "active" means the row is on screen, so autoplay only runs where the
//    visitor is looking;
//  - a press that turns into a drag swallows the click, because here the
//    media is also a link to the project.
//
// Mirrored in global.css (.carousel__track): CAROUSEL_AUTO_MS / _MANUAL_MS
// and their curves. CSS can't read these; change both together.

/** Left to drift on its own the slide is the pace of the page; asked for
 *  (a dot, a thrown swipe) it's a response to the hand and has to be quick. */
export const CAROUSEL_AUTO_MS = 700;
export const CAROUSEL_MANUAL_MS = 400;
export const CAROUSEL_REDUCED_MS = 120;
/** Distance as a share of the stage width, so a swipe reads the same on a
 *  phone and a desktop; velocity is the escape hatch for a short flick. */
export const CAROUSEL_COMMIT_RATIO = 0.2;
export const CAROUSEL_FLICK_VELOCITY = 0.45; // px per ms
export const CAROUSEL_AUTOPLAY_MS = 4200;

export type ChangeSource = "auto" | "manual";
export type Phase = "idle" | "dragging" | "settling";

interface Settle {
  to: number;
  dir: -1 | 0 | 1;
  source: ChangeSource;
}

const wrap = (i: number, count: number) => ((i % count) + count) % count;

function slideMs(source: ChangeSource) {
  if (prefersReducedMotion()) return CAROUSEL_REDUCED_MS;
  return source === "auto" ? CAROUSEL_AUTO_MS : CAROUSEL_MANUAL_MS;
}

function shortestDir(from: number, to: number, count: number): -1 | 1 {
  const forward = wrap(to - from, count);
  return forward * 2 <= count ? 1 : -1;
}

/**
 * Where slide `i` sits relative to the one on screen, in whole stage widths,
 * whichever way round the loop is shorter. There's always a slide parked just
 * past both edges, so the loop has no seam in either direction. (Needs three
 * or more slides; the component doubles a set of two.)
 */
export function relativeOffset(i: number, index: number, count: number) {
  let rel = i - index;
  if (rel * 2 > count) rel -= count;
  if (rel * 2 < -count) rel += count;
  return rel;
}

export function useCarousel({ count, active }: { count: number; active: boolean }) {
  // The index the track's geometry is built around. During a settle this is
  // still the *outgoing* slide: slides hold still and only the track moves,
  // so it can't catch up until the track resets (see commit).
  const [index, setIndexState] = useState(0);
  const indexRef = useRef(0);
  const [settle, setSettle] = useState<Settle | null>(null);
  const settleRef = useRef<Settle | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Set when a press turned into a drag, so the click that follows the
   *  release doesn't also follow the link the media sits inside. */
  const suppressClick = useRef(false);

  // What's being shown: the incoming slide from the moment a settle starts,
  // so the dots move with the slide rather than after it lands.
  const activeIndex = settle ? settle.to : index;

  const clearCommit = useCallback(() => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = null;
  }, []);

  /** Lands the track: the committed index moves to the target and the track
   *  offset returns to zero in the same render, so the two cancel out on
   *  screen. Doing either alone is a full-width jump. */
  const commit = useCallback(() => {
    clearCommit();
    const pending = settleRef.current;
    if (!pending) return;
    settleRef.current = null;
    indexRef.current = pending.to;
    setIndexState(pending.to);
    setSettle(null);
    setDragX(0);
  }, [clearCommit]);

  const startSettle = useCallback(
    (to: number, dir: -1 | 0 | 1, source: ChangeSource) => {
      const next = { to, dir, source };
      settleRef.current = next;
      setSettle(next);
      setIsDragging(false);
      clearCommit();
      commitTimer.current = setTimeout(commit, slideMs(source));
    },
    [clearCommit, commit],
  );

  /** One step round the loop. A settle in flight lands first, so a fast run
   *  of dot clicks never compounds offsets. */
  const step = useCallback(
    (dir: -1 | 1, source: ChangeSource) => {
      if (count <= 1) return;
      if (settleRef.current) commit();
      startSettle(wrap(indexRef.current + dir, count), dir, source);
    },
    [commit, count, startSettle],
  );

  const goTo = useCallback(
    (target: number) => {
      if (count <= 1) return;
      const to = wrap(target, count);
      const from = settleRef.current ? settleRef.current.to : indexRef.current;
      if (to === from) return;
      step(shortestDir(from, to, count), "manual");
    },
    [count, step],
  );

  // ---- drag ---------------------------------------------------------------

  const gesture = useRef<{
    pointerId: number;
    startX: number;
    base: number;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);

  /** The track's live x offset mid-transition, so grabbing a moving track
   *  picks it up where it is instead of snapping it. */
  function liveOffset() {
    const el = trackRef.current;
    if (!el) return 0;
    const t = getComputedStyle(el).transform;
    if (!t || t === "none") return 0;
    try {
      return new DOMMatrixReadOnly(t).m41;
    } catch {
      return 0;
    }
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (count <= 1) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const base = settleRef.current ? liveOffset() : 0;
      clearCommit();
      settleRef.current = null;
      setSettle(null);
      suppressClick.current = false;
      gesture.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        base,
        lastX: e.clientX,
        lastT: e.timeStamp,
        velocity: 0,
      };
      setDragX(base);
      setIsDragging(true);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [clearCommit, count],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    // Sampled per move: what makes a flick is the speed at release, not the
    // average over a drag that may have paused halfway.
    const dt = e.timeStamp - g.lastT;
    if (dt > 0) g.velocity = (e.clientX - g.lastX) / dt;
    g.lastX = e.clientX;
    g.lastT = e.timeStamp;
    if (Math.abs(e.clientX - g.startX) > 4) suppressClick.current = true;
    // One width either way: past that there's no slide to drag into view.
    const width = trackRef.current?.offsetWidth || 1;
    setDragX(Math.max(-width, Math.min(width, g.base + (e.clientX - g.startX))));
  }, []);

  const endGesture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const g = gesture.current;
      if (!g || g.pointerId !== e.pointerId) return;
      gesture.current = null;
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      const width = trackRef.current?.offsetWidth || 1;
      const offset = Math.max(-width, Math.min(width, g.base + (e.clientX - g.startX)));
      const travelled = Math.abs(offset) > width * CAROUSEL_COMMIT_RATIO;
      // A flick only counts in the direction it's moving: a drag left that
      // snaps back right at the last moment shouldn't advance.
      const flicked =
        Math.abs(g.velocity) > CAROUSEL_FLICK_VELOCITY && Math.sign(g.velocity) === Math.sign(offset);
      // A press that never moved: straight back to rest, and the click goes
      // through to the link.
      if (offset === 0) {
        setIsDragging(false);
        return;
      }
      // pointercancel = the browser took over (a vertical scroll on a phone).
      if (cancelled || !(travelled || flicked)) {
        startSettle(indexRef.current, 0, "manual");
        return;
      }
      const dir: -1 | 1 = offset < 0 ? 1 : -1;
      startSettle(wrap(indexRef.current + dir, count), dir, "manual");
    },
    [count, startSettle],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => endGesture(e, false), [endGesture]);
  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => endGesture(e, true),
    [endGesture],
  );
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick.current = false;
    }
  }, []);

  // ---- autoplay -----------------------------------------------------------

  // Restarts its dwell on every change (whoever caused it), so a swipe is
  // never immediately followed by an auto-advance, and holds off entirely
  // while the track is in hand or the row is off screen.
  //
  // `playing` is the same condition, handed out so the active dot can show
  // the dwell counting down (CarouselDots). The dot restarts its fill on
  // exactly the changes that re-arm this timer (activeIndex, playing), so
  // the two stay in step without the dot reading the timer itself.
  const playing = active && count > 1 && !isDragging && !prefersReducedMotion();
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => step(1, "auto"), CAROUSEL_AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [playing, step, activeIndex]);

  useEffect(() => clearCommit, [clearCommit]);

  const phase: Phase = isDragging ? "dragging" : settle ? "settling" : "idle";

  return {
    index,
    activeIndex,
    phase,
    playing,
    /** px while in hand, otherwise a whole-width step the settle animates to. */
    offset: isDragging ? `${dragX}px` : settle ? `${settle.dir * -100}%` : "0px",
    source: settle?.source ?? "auto",
    trackRef,
    goTo,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture },
  };
}
