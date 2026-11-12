import type { ComponentType } from "react";
import type { Archive } from "../../data/archive";
import type { LabState } from "../../lab";
import ArchiveIndex from "./ArchiveIndex";

/** What every Archive layout is given: the content, and only that. */
export type ArchiveLayoutProps = { archive: Archive };

/**
 * One component per ?layout= value. Typed against the lab's own list, so
 * adding an id to LAB.layout in lab.ts without a component here (or the
 * reverse) fails the build instead of rendering nothing.
 */
export const ARCHIVE_LAYOUTS: Record<LabState["layout"], ComponentType<ArchiveLayoutProps>> = {
  index: ArchiveIndex,
};
