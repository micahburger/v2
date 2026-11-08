import { useRef } from "react";
import { clients, type ClientLogo } from "../data/site";
import { useOnScreen, useReducedMotion, useSeen } from "../hooks";

/** Tiles per row. Also the shape of logoquilt2024.png (four across, three
 *  down), which is what makes a slice of it line up with a tile. */
const COLS = 4;
const QUILT_ROWS = 3;

/** Seconds for one tile's width to pass in the marquee. The whole loop is
 *  this times the number of logos, so adding a client keeps the speed the
 *  same rather than speeding the belt up. ~60px/s at desktop tile sizes:
 *  slow enough to read each logo as it goes by, quick enough to see it's
 *  moving. */
const MARQUEE_SECONDS_PER_TILE = 5;

/** The quilt image doesn't centre its logos in their cells: measured off
 *  logoquilt2024.png, the top row's logos centre at about 62% of the cell's
 *  height, the middle row's at 50%, the bottom row's at 40%. In the quilt
 *  that's invisible (each row is its own line). Put in one line by the
 *  marquee, it made the belt wobble, so there each slice is moved by this
 *  much of its own height to bring its logo to the middle. */
const ROW_SHIFT = ["-12%", "0%", "10%"];

const LABEL =`Client logos: ${clients.map((c) => c.name).join(", ")}`;

/**
 * The client logos, in two takes for the lab.
 *
 * Most tiles are a slice of logoquilt2024.png, the single image the live
 * site uses, cut out with background-position so each logo can move on its
 * own. Logos added since (RentSpree, Carrier) are their own files in the
 * same box, flattened to the quilt's one colour by CSS, so they sit in the
 * set as if they'd always been in the picture. Every tile is independent,
 * so the order is free: see `clients` in data/site.ts.
 *
 *  - QUILT: four to a row. The build-in is the "wave" Micah picked out of
 *    the lab: tiles rise in a diagonal sweep from the top-left, once, when
 *    the quilt first comes on screen. A last, short row is centred (flex,
 *    not grid) so it reads as a finished row rather than a gap.
 *  - MARQUEE (Micah, 2026-11-07): every logo in one row, drifting slowly
 *    right to left on an endless loop. Same tile size as the quilt, run
 *    edge to edge of the window, so about four to five show at a time.
 */
export default function ClientQuilt({ variant }: { variant: "quilt" | "marquee" }) {
  return variant === "marquee" ? <Marquee /> : <Quilt />;
}

function Quilt() {
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useSeen(gridRef, 0.25);
  const reduced = useReducedMotion();

  return (
    <div ref={gridRef} className={`quilt ${seen || reduced ? "is-seen" : ""}`} role="img" aria-label={LABEL}>
      {clients.map((client, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        // One diagonal (row + col) every 70ms.
        return <Tile key={client.name} client={client} style={{ "--d": `${(row + col) * 70}ms` } as React.CSSProperties} />;
      })}
    </div>
  );
}

/**
 * The belt is the logo list twice over, slid left by exactly one copy's
 * width (-50% of the track) and then snapped back: at the snap the second
 * copy sits where the first began, so the loop has no seam. Pure CSS
 * keyframes on transform, so it runs on the compositor and costs nothing
 * per frame.
 *
 * It only runs while it's on screen (no point animating a belt nobody can
 * see) and holds still under the pointer, so a logo can be looked at
 * without chasing it. Under reduced motion it doesn't move at all and
 * becomes a row you can scroll sideways instead.
 */
function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, 0.25);
  const onScreen = useOnScreen(ref, 0);
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`marquee ${seen || reduced ? "is-seen" : ""} ${onScreen ? "is-running" : ""}`}
      role="img"
      aria-label={LABEL}
      style={{ "--marquee-duration": `${clients.length * MARQUEE_SECONDS_PER_TILE}s` } as React.CSSProperties}
    >
      <div className="marquee__track">
        {[0, 1].map((copy) =>
          clients.map((client) => <Tile key={`${copy}-${client.name}`} client={client} />),
        )}
      </div>
    </div>
  );
}

/** One logo in the quilt's box: a slice of the quilt image, or its own file. */
function Tile({ client, style }: { client: ClientLogo; style?: React.CSSProperties }) {
  if ("src" in client) {
    return (
      <span className="quilt__tile quilt__tile--file" aria-hidden="true" style={style}>
        <img className="quilt__logo" src={client.src} alt="" draggable={false} />
      </span>
    );
  }
  const qCol = client.quilt % COLS;
  const qRow = Math.floor(client.quilt / COLS);
  return (
    <span
      className="quilt__tile quilt__tile--slice"
      aria-hidden="true"
      style={
        {
          ...style,
          backgroundPosition: `${(qCol / (COLS - 1)) * 100}% ${(qRow / (QUILT_ROWS - 1)) * 100}%`,
          "--row-shift": ROW_SHIFT[qRow],
        } as React.CSSProperties
      }
    />
  );
}
