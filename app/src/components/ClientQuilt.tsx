import { useRef } from "react";
import { clients } from "../data/site";
import { useReducedMotion, useSeen } from "../hooks";

const COLS = 4;
const ROWS = 3;

/**
 * The client logos, from the one image the live site uses
 * (logoquilt2024.png: four across, three down, on the page colour).
 *
 * Rather than one <img>, the image is cut into twelve tiles with
 * background-position, so each logo can move on its own; with no gap
 * between tiles they add back up to exactly the original image.
 *
 * The build-in is the "wave" Micah picked out of the lab (2026-11-07, over
 * a static image, a scroll-linked assemble and a split-flap): the tiles
 * rise in a diagonal sweep from the top-left, once, when the quilt first
 * comes on screen.
 */
export default function ClientQuilt() {
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useSeen(gridRef, 0.25);
  const reduced = useReducedMotion();

  return (
    <div
      ref={gridRef}
      className={`quilt ${seen || reduced ? "is-seen" : ""}`}
      role="img"
      aria-label={`Client logos: ${clients.join(", ")}`}
    >
      {clients.map((name, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        return (
          <span
            key={name}
            className="quilt__tile"
            aria-hidden="true"
            style={
              {
                // One diagonal (row + col) every 70ms.
                "--d": `${(row + col) * 70}ms`,
                backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
