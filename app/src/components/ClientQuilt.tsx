import { useEffect, useRef } from "react";
import { clients } from "../data/site";
import { useReducedMotion, useSeen } from "../hooks";

type Variant = "static" | "wave" | "assemble" | "flap";

const COLS = 4;
const ROWS = 3;

/**
 * The client logos, from the one image the live site uses
 * (logoquilt2024.png: four across, three down, on the page colour).
 *
 * Rather than one <img>, the image is cut into twelve tiles with
 * background-position, so each logo can move on its own. With no gap
 * between tiles, "static" is pixel-for-pixel the original image. The
 * build-ins to choose between:
 *  - WAVE: tiles rise in a diagonal sweep from the top-left, once.
 *  - ASSEMBLE: tiles start scattered and tilted and the scroll itself pulls
 *    them into the grid. Scroll back up and they come apart again.
 *  - FLAP: tiles swing down from their top edge in a shuffled order, like a
 *    split-flap board.
 */
export default function ClientQuilt({ variant }: { variant: Variant }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useSeen(gridRef, 0.25);
  const reduced = useReducedMotion();

  useAssemble(gridRef, variant === "assemble" && !reduced);

  return (
    <div
      ref={gridRef}
      className={`quilt quilt--${variant} ${seen || reduced ? "is-seen" : ""}`}
      role="img"
      aria-label={`Client logos: ${clients.join(", ")}`}
    >
      {clients.map((name, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const delay =
          variant === "wave" ? (row + col) * 70 : variant === "flap" ? ((i * 5) % 12) * 60 : 0;
        return (
          <span
            key={name}
            className="quilt__tile"
            aria-hidden="true"
            style={
              {
                "--d": `${delay}ms`,
                backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/** Deterministic pseudo-random in [-1, 1] per tile and axis, so the scatter
 *  is the same on every visit rather than a new mess each time. */
function jitter(i: number, axis: number) {
  const x = Math.sin(i * 12.9898 + axis * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/**
 * Scroll-linked assembly. Progress runs from 0 when the quilt's top meets
 * the bottom of the viewport to 1 when it's 30% of the way down. Each tile
 * gets its own window inside that range (staggered by a stable random
 * amount) so they arrive one by one instead of as a slab.
 *
 * Written straight to style in a rAF, not through React state: this runs on
 * every scroll frame.
 */
function useAssemble(ref: React.RefObject<HTMLDivElement>, on: boolean) {
  useEffect(() => {
    const grid = ref.current;
    if (!grid || !on) return;
    const tiles = [...grid.querySelectorAll<HTMLElement>(".quilt__tile")];
    const spread = Math.min(window.innerWidth * 0.12, 160);
    const plan = tiles.map((_, i) => ({
      x: jitter(i, 1) * spread,
      y: 60 + Math.abs(jitter(i, 2)) * 120,
      r: jitter(i, 3) * 10,
      s: (jitter(i, 4) + 1) * 0.2,
    }));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = grid.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.7)));
      tiles.forEach((t, i) => {
        const { x, y, r, s } = plan[i];
        const local = Math.min(1, Math.max(0, (p - s) / 0.6));
        const e = 1 - Math.pow(1 - local, 3);
        const k = 1 - e;
        t.style.transform = `translate3d(${x * k}px, ${y * k}px, 0) rotate(${r * k}deg) scale(${0.9 + 0.1 * e})`;
        t.style.opacity = String(Math.min(1, e * 1.4));
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      tiles.forEach((t) => {
        t.style.transform = "";
        t.style.opacity = "";
      });
    };
  }, [ref, on]);
}
