import { useEffect, useRef, useState } from "react";
import type { ArchiveProject } from "../../data/archive";
import Arrow from "./Arrow";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The chapter skipper for ?layout=scroll: the ds "section pill nav"
 * (long-form register), on v2's chips. A pill at the bottom centre (the Lab
 * pill has the left corner, back-to-top the right) reading "02 / 05 · WWE",
 * with arrows for the chapter before and after. Pressing the label opens
 * the list of chapters above it to jump to any one; Escape or a click
 * elsewhere closes it, and choosing one closes it too.
 *
 * It's there only while you're among the chapters: hidden over the intro
 * and the contents (which already list them) and past the last chapter
 * into the footer. While hidden it's inert, so it's out of the tab order.
 *
 * Mono numbers in the label font, like the ds pill; the name in the body
 * face. Rises 12px and fades in on the enter curve; leaves faster.
 */
export default function ChapterSkipper({
  projects,
  current,
  visible,
  onJump,
}: {
  projects: ArchiveProject[];
  current: number;
  visible: boolean;
  onJump: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const count = projects.length;

  useEffect(() => {
    if (nav.current) nav.current.inert = !visible;
    if (!visible) setOpen(false);
  }, [visible]);

  // Escape and clicks outside close the list.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!nav.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const go = (i: number) => {
    setOpen(false);
    onJump(Math.max(0, Math.min(count - 1, i)));
  };

  return (
    <nav ref={nav} className={`axs-skip ${visible ? "is-visible" : ""} ${open ? "is-open" : ""}`} aria-label="Chapters">
      {open && (
        <ol className="axs-skip__list" id="axs-skip-list">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <a
                href={`#${p.slug}`}
                aria-current={i === current ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(i);
                }}
              >
                <span className="axs-num">{pad(i + 1)}</span>
                <span className="axs-skip__client">{p.client}</span>
                <span className="axs-skip__year">{p.year}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
      <div className="axs-skip__bar">
        <button type="button" className="axs-skip__step" aria-label="Previous chapter" disabled={current === 0} onClick={() => go(current - 1)}>
          <Arrow dir={-1} />
        </button>
        <button
          type="button"
          className="axs-skip__label"
          aria-expanded={open}
          aria-controls="axs-skip-list"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="axs-num">
            {pad(current + 1)} / {pad(count)}
          </span>
          <span className="axs-skip__name">{projects[current]?.client}</span>
        </button>
        <button
          type="button"
          className="axs-skip__step"
          aria-label="Next chapter"
          disabled={current === count - 1}
          onClick={() => go(current + 1)}
        >
          <Arrow dir={1} />
        </button>
      </div>
    </nav>
  );
}
