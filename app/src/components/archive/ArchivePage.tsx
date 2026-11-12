import { useEffect } from "react";
import { ARCHIVE_LAB, useLab } from "../../lab";
import { archive } from "../../data/archive";
import CaseShell from "../CaseShell";
import { ARCHIVE_LAYOUTS } from "./layouts";

/**
 * /project/archive (2026-11-11): five earlier case studies as short
 * previews, in the Opendoor page's frame (CaseShell): the locked Back to
 * home pill, the title, the sign-off footer.
 *
 * How it's laid out is a lab choice, ?layout=, like the homepage's
 * ?palette= or the case studies' ?outcomes=: the lab reads it, the pill
 * switches it, and a plain link gets the first entry in lab.ts's list.
 * Every layout gets the same content (data/archive.ts, from
 * archive-data.json) and nothing else.
 */
export default function ArchivePage() {
  const [lab, setLab] = useLab();
  // The colour follows the lab, as on the homepage (App.tsx), so the
  // palette picked there carries through and can be changed here. Set on
  // <html> so it reaches the page ground, overscroll and fixed controls.
  useEffect(() => {
    document.documentElement.dataset.palette = lab.palette;
  }, [lab.palette]);
  const Layout = ARCHIVE_LAYOUTS[lab.layout];
  return (
    <CaseShell name={archive.title} title={archive.title} labKeys={ARCHIVE_LAB} lab={lab} setLab={setLab}>
      <Layout archive={archive} />
    </CaseShell>
  );
}
