import { useEffect, useRef } from "react";

// Same dot as the 2026 folio (shared token, see --cursor-* in global.css),
// plus labels: anything carrying data-cursor="Drag" / "View" grows the dot
// into a small pill that says what a press will do. That matters more here
// than on the folio, because two of the carousels are grabbed, not clicked.

const CLICKABLE = ["a[href]", "button", '[role="button"]', '[role="tab"]', "[data-cursor]"].join(",");
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const label = labelRef.current!;
    const media = window.matchMedia(FINE_POINTER);
    let enabled = false;

    function onMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      dot.classList.add("is-visible");
      const target = event.target as Element | null;
      const labelled = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const text = labelled?.dataset.cursor ?? "";
      if (label.textContent !== text) label.textContent = text;
      dot.classList.toggle("has-label", !!text);
      dot.classList.toggle("is-active", !!target?.closest?.(CLICKABLE));
    }
    function onDown(event: PointerEvent) {
      if (event.pointerType === "touch" || event.button !== 0) return;
      const target = event.target as Element | null;
      dot.classList.toggle("is-grabbing", !!target?.closest?.('[data-cursor="Drag"]'));
    }
    function onRelease() {
      dot.classList.remove("is-grabbing");
    }
    function onLeave() {
      dot.classList.remove("is-visible");
    }

    function enable() {
      if (enabled) return;
      enabled = true;
      document.documentElement.classList.add("has-custom-cursor");
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onRelease, { passive: true });
      window.addEventListener("pointercancel", onRelease, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    function disable() {
      if (!enabled) return;
      enabled = false;
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      dot.classList.remove("is-visible", "is-active", "is-grabbing", "has-label");
    }
    const sync = () => (media.matches ? enable() : disable());
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      disable();
    };
  }, []);

  return (
    <div ref={dotRef} className="custom-cursor" aria-hidden="true">
      <span ref={labelRef} className="custom-cursor__label" />
    </div>
  );
}
