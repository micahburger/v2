import { useEffect } from "react";
import { ARCHIVE_LAB, useLab } from "../../lab";
import { archive } from "../../data/archive";
import CaseShell from "../CaseShell";
import ArchiveScroll from "./ArchiveScroll";

/**
 * /project/archive (2026-11-11): five earlier case studies as short
 * previews, in the case study frame (CaseShell): the locked Back pill, the
 * title, the sign-off footer.
 *
 * One layout, the long read with a chapter skipper (ArchiveScroll). Four
 * were tried in the lab that day (Scroll, Index, Titles, Panels); Micah
 * kept Scroll and the others were removed. The content is archive-data.json
 * alone (data/archive.ts), so a different layout later is a new component
 * over the same data.
 *
 * The colour follows the lab, as on the homepage (App.tsx), so the palette
 * picked there carries through and can be changed here; it's the only lab
 * row on this page.
 */
export default function ArchivePage() {
  const [lab, setLab] = useLab();
  // Set on <html> so it reaches the page ground, overscroll and fixed
  // controls.
  useEffect(() => {
    document.documentElement.dataset.palette = lab.palette;
  }, [lab.palette]);
  return (
    <CaseShell name={archive.title} title={archive.title} labKeys={ARCHIVE_LAB} lab={lab} setLab={setLab}>
      <ArchiveScroll archive={archive} />
    </CaseShell>
  );
}
