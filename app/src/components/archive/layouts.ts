import type { ComponentType } from "react";
import type { Archive } from "../../data/archive";
import type { LabState } from "../../lab";
import ArchiveIndex from "./ArchiveIndex";
import ArchiveTitles from "./ArchiveTitles";
import ArchivePanels from "./ArchivePanels";
import ArchiveScroll from "./ArchiveScroll";

/** What every Archive layout is given: the content, and only that. */
export type ArchiveLayoutProps = { archive: Archive };

/**
 * One component per ?layout= value. Typed against the lab's own list, so
 * adding an id to LAB.layout in lab.ts without a component here (or the
 * reverse) fails the build instead of rendering nothing.
 *
 *   index   the ds table index: rows that open in place (the default)
 *   titles  the ds text index: big centred names, screen behind on hover
 *   panels  the RentSpree overview: every project open, as a panel
 *   scroll  one long read, a chapter per project, with a chapter skipper
 */
export const ARCHIVE_LAYOUTS: Record<LabState["layout"], ComponentType<ArchiveLayoutProps>> = {
  index: ArchiveIndex,
  titles: ArchiveTitles,
  panels: ArchivePanels,
  scroll: ArchiveScroll,
};
