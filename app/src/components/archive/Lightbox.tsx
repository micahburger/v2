import { useEffect, useRef, useState } from "react";
import { archiveSrc, type ArchiveProject } from "../../data/archive";
import Arrow from "./Arrow";

/**
 * The larger view of one Archive screen: a native modal <dialog>, so focus
 * is trapped inside, Escape closes it, the page behind is inert, and focus
 * goes back to whatever opened it, all by the browser.
 *
 * The screen fits the window (never past its own 1600px), with the count,
 * arrows (and arrow keys) to step through the project's screens, and its
 * alt text as a caption. A click on the dim ground around the screen
 * closes it. Opens with a 200ms fade on the enter curve; no fade under
 * reduced motion.
 */
export default function Lightbox({
  project,
  start,
  onClose,
}: {
  project: ArchiveProject;
  start: number;
  /** Called with the screen it was on, so the carousel can follow. */
  onClose: (index: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(start);
  const count = project.images.length;
  const image = project.images[index];
  const step = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

  // Open as a modal, then put focus on Close. React's autoFocus can't do
  // that here: it focuses on mount, and showModal() then moves focus to
  // the dialog itself.
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    closeButton.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="ax-lightbox"
      aria-label={`${project.client}: screen ${index + 1} of ${count}`}
      onClose={() => onClose(index)}
      onClick={(e) => {
        // The dialog itself is the dim ground; the screen and controls are
        // inside it. A click that lands on the ground closes.
        if (e.target === e.currentTarget) dialog.current?.close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
      }}
    >
      <figure className="ax-lightbox__figure">
        <img
          key={image.file}
          src={archiveSrc(project.slug, image)}
          alt={image.alt}
          width={image.width}
          height={image.height}
        />
        <figcaption className="ax-lightbox__caption">{image.alt}</figcaption>
      </figure>
      <div className="ax-lightbox__bar">
        <button type="button" className="ax-arrow" aria-label="Previous screen" onClick={() => step(-1)}>
          <Arrow dir={-1} />
        </button>
        <p className="ax-count" aria-live="polite">
          {index + 1} / {count}
        </p>
        <button type="button" className="ax-arrow" aria-label="Next screen" onClick={() => step(1)}>
          <Arrow dir={1} />
        </button>
        <button type="button" className="ax-lightbox__close" ref={closeButton} onClick={() => dialog.current?.close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}
