import { useEffect, useRef, useState } from "react";
import { archiveSrc, type ArchiveProject } from "../../data/archive";
import { prefersReducedMotion } from "../../motion";

/** Width of the floating preview, the ds table index's 300px. */
const WIDTH = 300;

/**
 * The lead image of the row under the pointer, floating beside it: the ds
 * "table index" preview (Recipe 10), 28px right of and 120px above the
 * pointer, eased toward it at .18 a frame, fading in over 250ms and growing
 * from .92 to 1 over 400ms on the enter curve.
 *
 * Mouse and trackpad only ((hover: hover) and (pointer: fine)): on a touch
 * screen there's no hover, and a tap opens the row anyway. Under reduced
 * motion it sits beside the pointer with no easing or growth, and only
 * fades. It flips to the pointer's left near the right edge, and keeps
 * inside the window top and bottom.
 *
 * The five previews (640px WebP, about 20KB each) are fetched up front so
 * the first hover isn't an empty box.
 */
export default function HoverPreview({
  project,
  preload,
}: {
  /** The row being hovered, when it's closed; undefined hides the preview. */
  project: ArchiveProject | undefined;
  preload: ArchiveProject[];
}) {
  const [fine] = useState(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  // The last project shown, kept through the fade-out so the box doesn't
  // empty while it's still visible.
  const [shown, setShown] = useState(project);
  const box = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0, seen: false });

  useEffect(() => {
    if (project) setShown(project);
  }, [project]);

  useEffect(() => {
    if (!fine) return;
    preload.forEach((p) => {
      const img = new Image();
      img.src = archiveSrc(p.slug, p.images[0], "preview");
    });
  }, [fine, preload]);

  // Track the pointer always (a couple of numbers per move); run the easing
  // loop only while a preview is up.
  useEffect(() => {
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      target.current.seen = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine]);

  const visible = Boolean(project);
  useEffect(() => {
    if (!fine || !visible || !shown) return;
    const el = box.current;
    if (!el) return;
    const ratio = shown.images[0].height / shown.images[0].width;
    const height = WIDTH * ratio;
    const reduced = prefersReducedMotion();
    const place = () => {
      const { x: px, y: py } = target.current;
      let x = px + 28;
      if (x + WIDTH > window.innerWidth - 16) x = px - 28 - WIDTH;
      const y = Math.min(Math.max(16, py - 120), window.innerHeight - height - 16);
      return { x, y };
    };
    // Start where it should be, so it doesn't fly in from the corner.
    let { x, y } = place();
    let raf = 0;
    const tick = () => {
      const next = place();
      const k = reduced ? 1 : 0.18;
      x += (next.x - x) * k;
      y += (next.y - y) * k;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [fine, visible, shown]);

  if (!fine || !shown) return null;
  const lead = shown.images[0];
  return (
    <div className="ax-preview" ref={box} aria-hidden="true">
      <div className={`ax-preview__card ${visible ? "is-visible" : ""}`}>
        <img
          src={archiveSrc(shown.slug, lead, "preview")}
          alt=""
          width={WIDTH}
          height={Math.round(WIDTH * (lead.height / lead.width))}
        />
      </div>
    </div>
  );
}
