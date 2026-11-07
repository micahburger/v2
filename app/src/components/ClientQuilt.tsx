import { useRef } from "react";
import { clients } from "../data/site";
import { useReducedMotion, useSeen } from "../hooks";

/** Tiles per row. Also the shape of logoquilt2024.png (four across, three
 *  down), which is what makes a slice of it line up with a tile. */
const COLS = 4;
const QUILT_ROWS = 3;

/**
 * The client logos, four to a row.
 *
 * Most tiles are a slice of logoquilt2024.png, the single image the live
 * site uses, cut out with background-position so each logo can move on its
 * own. Logos added since (RentSpree, Carrier) are their own files in the
 * same box, flattened to the quilt's one colour by CSS, so they sit in the
 * set as if they'd always been in the picture. Every tile is independent,
 * so the order is free: see `clients` in data/site.ts.
 *
 * The build-in is the "wave" Micah picked out of the lab: tiles rise in a
 * diagonal sweep from the top-left, once, when the quilt first comes on
 * screen. A last, short row is centred (flex, not grid) so it reads as a
 * finished row rather than a gap.
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
      aria-label={`Client logos: ${clients.map((c) => c.name).join(", ")}`}
    >
      {clients.map((client, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        // One diagonal (row + col) every 70ms.
        const delay = { "--d": `${(row + col) * 70}ms` } as React.CSSProperties;

        if ("src" in client) {
          return (
            <span key={client.name} className="quilt__tile quilt__tile--file" aria-hidden="true" style={delay}>
              <img className="quilt__logo" src={client.src} alt="" draggable={false} />
            </span>
          );
        }
        const qCol = client.quilt % COLS;
        const qRow = Math.floor(client.quilt / COLS);
        return (
          <span
            key={client.name}
            className="quilt__tile quilt__tile--slice"
            aria-hidden="true"
            style={{
              ...delay,
              backgroundPosition: `${(qCol / (COLS - 1)) * 100}% ${(qRow / (QUILT_ROWS - 1)) * 100}%`,
            }}
          />
        );
      })}
    </div>
  );
}
