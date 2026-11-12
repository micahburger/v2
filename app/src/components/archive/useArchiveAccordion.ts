import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ArchiveProject } from "../../data/archive";
import { prefersReducedMotion } from "../../motion";

/**
 * One-open-at-a-time projects for the Archive layouts that open a project
 * in place (Index, Titles). Lifted out of ArchiveIndex on 2026-11-11 when a
 * second layout needed the same rules:
 *
 * - Only one project is open; opening one closes the other.
 * - Opening scrolls its item up under the locked Back to home bar (the
 *   item's scroll-margin-top, in CSS).
 * - Each project is an anchor: opening writes #<slug> (replaceState, so
 *   rows don't fill the back button), closing clears it, and arriving on
 *   /project/archive#<slug>, or following a link to one while here, opens
 *   that project.
 * - A panel's carousel mounts the first time it opens and then stays, so
 *   closed projects don't load their screens and reopening doesn't reset.
 * - A closed panel is `inert`: out of the tab order and hidden from screen
 *   readers, while its height can still animate (which `hidden` can't).
 *
 * The layout supplies the markup and passes `itemRef(slug)` to each item
 * (what scrolls into view) and `panelRef(slug)` to each panel (what folds).
 */
export function useArchiveAccordion(projects: ArchiveProject[]) {
  const slugFromHash = useCallback(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    return projects.some((p) => p.slug === slug) ? slug : null;
  }, [projects]);

  const [open, setOpen] = useState<string | null>(slugFromHash);
  const [mounted, setMounted] = useState<Set<string>>(() => new Set(open ? [open] : []));
  const items = useRef(new Map<string, HTMLElement>());
  const panels = useRef(new Map<string, HTMLElement>());

  /**
   * Brings an item to the top, just under the locked bar. When the project
   * being closed (`closing`) is above this one, what it still has left to
   * fold comes off the target, measured at the moment the scroll starts:
   * with the animation that's nearly its full height, and the scroll and
   * the fold finish together in the right place; under reduced motion it
   * has already folded, so it's nothing. (Measuring before the fold began
   * double-counted it whenever the fold was instant.) The lists turn scroll
   * anchoring off for the same reason.
   */
  const scrollToItem = useCallback((slug: string, smooth: boolean, closing: string | null = null) => {
    const el = items.current.get(slug);
    if (!el) return;
    let stillToFold = 0;
    const prevItem = closing ? items.current.get(closing) : undefined;
    const prevPanel = closing ? panels.current.get(closing) : undefined;
    if (prevItem && prevPanel && prevItem.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
      stillToFold = prevPanel.getBoundingClientRect().height;
    }
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - margin - stillToFold;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
  }, []);

  const writeHash = (slug: string | null) => {
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${search}${slug ? `#${slug}` : ""}`);
  };

  // The open project as of the last render, for the hash listener (set up
  // once, so it would otherwise see a stale `open`).
  const openRef = useRef(open);
  openRef.current = open;

  const show = useCallback(
    (slug: string, closing: string | null) => {
      setOpen(slug);
      setMounted((prev) => (prev.has(slug) ? prev : new Set(prev).add(slug)));
      // A frame later: the new state is laid out and the old panel's fold
      // has just begun.
      requestAnimationFrame(() => scrollToItem(slug, true, closing && closing !== slug ? closing : null));
    },
    [scrollToItem],
  );

  const toggle = (slug: string) => {
    if (open === slug) {
      setOpen(null);
      writeHash(null);
      return;
    }
    show(slug, open);
    writeHash(slug);
  };

  // Arriving on #<slug>: open from the first render (nothing to animate
  // from), brought into view once laid out. The browser's own jump to the
  // anchor can't do it: the list isn't in the DOM yet when it tries.
  useLayoutEffect(() => {
    if (open) scrollToItem(open, false);
    // First render only.
  }, []);

  useEffect(() => {
    const onHash = () => {
      const slug = slugFromHash();
      if (slug) show(slug, openRef.current);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [show, slugFromHash]);

  useEffect(() => {
    panels.current.forEach((panel, slug) => {
      panel.inert = slug !== open;
    });
  }, [open]);

  const register = (map: Map<string, HTMLElement>, slug: string) => (el: HTMLElement | null) => {
    if (el) map.set(slug, el);
    else map.delete(slug);
  };

  return {
    open,
    mounted,
    toggle,
    itemRef: (slug: string) => register(items.current, slug),
    panelRef: (slug: string) => register(panels.current, slug),
  };
}
