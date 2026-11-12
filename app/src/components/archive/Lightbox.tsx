import { useEffect, useRef } from "react";
import { archiveSrc, type ArchiveProject } from "../../data/archive";

/**
 * The larger view of one Archive screen: a native modal <dialog>, so the
 * page behind is inert, Escape closes it and focus goes back to whatever
 * opened it, all by the browser.
 *
 * Simplified (Micah, 2026-11-11: "I just want 1 click close"): the screen,
 * fitted to the window (never past its own 1600px), and nothing else. No
 * arrows, count, caption or Close pill. One click anywhere closes it, on
 * the screen or around it, with a zoom-out cursor to say so. For keyboard
 * and screen readers the whole view is one button labelled "Close larger
 * view", focused on open, so Enter or Space closes it too; the screen's
 * alt text stays on the image.
 *
 * Opens with a 200ms fade on the enter curve; no fade under reduced motion.
 */
export default function Lightbox({
  project,
  start,
  onClose,
}: {
  project: ArchiveProject;
  start: number;
  /** Called with the screen it showed, so a carousel can stay on it. */
  onClose: (index: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const hit = useRef<HTMLButtonElement>(null);
  const image = project.images[start];

  // Open as a modal, then focus the close surface. (React's autoFocus
  // would fire before showModal(), which then moves focus to the dialog.)
  // The opener is remembered and given focus back on close by hand: the
  // dialog is unmounted as it closes, which loses the browser's own focus
  // restore and drops focus on the page body.
  const opener = useRef<Element | null>(null);
  useEffect(() => {
    opener.current = document.activeElement;
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    hit.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="ax-lightbox"
      aria-label={`${project.client}: ${image.alt}`}
      onClose={() => {
        (opener.current as HTMLElement | null)?.focus?.({ preventScroll: true });
        onClose(start);
      }}
      // Clicks on the dim ground around the button land on the dialog.
      onClick={() => dialog.current?.close()}
    >
      <button
        ref={hit}
        type="button"
        className="ax-lightbox__hit"
        aria-label="Close larger view"
        onClick={(e) => {
          e.stopPropagation();
          dialog.current?.close();
        }}
      >
        <img src={archiveSrc(project.slug, image)} alt={image.alt} width={image.width} height={image.height} />
      </button>
    </dialog>
  );
}
