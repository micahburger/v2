import { useEffect, useRef, type ReactNode } from "react";
import { useReveal } from "../reveal";
import { LabKey, LabState } from "../lab";
import LabPanel from "./LabPanel";
import SiteFooter from "./SiteFooter";
import BackToTop from "./BackToTop";
import { markReturnHome } from "../homeScroll";

/**
 * The frame every case study page shares: the locked Back to home pill, the
 * title, the page's content, then the homepage's sign-off footer, the
 * back-to-top button and (where the page has variants) the lab pill.
 *
 * Lifted out of CaseStudy.tsx on 2026-11-11 so the Archive (/project/archive)
 * wears exactly the Opendoor page's header, navigation and footer rather
 * than a copy of them. No scroll shift on any of them; the case studies
 * are always Night, while the Archive follows the lab's colour (index.html
 * and main.tsx set both before the first paint).
 */
export default function CaseShell({
  name,
  title,
  labKeys,
  lab,
  setLab,
  children,
}: {
  /** Short name, for the document title. */
  name: string;
  title: ReactNode;
  /** The lab rows this page offers; none, and there's no lab pill. */
  labKeys: LabKey[];
  lab: LabState;
  setLab: <K extends LabKey>(key: K, value: LabState[K]) => void;
  children: ReactNode;
}) {
  // The shared scroll reveal (reveal.ts) for everything marked data-reveal
  // in the page, case study blocks and the Archive's alike.
  const main = useRef<HTMLElement>(null);
  useReveal(main);

  // The ds's "{Project} · Micah Lindenberger", with a middle dot for the
  // dash (no em dashes anywhere, titles included).
  useEffect(() => {
    document.title = `${name} · Micah Lindenberger`;
  }, [name]);

  // Read at the click, like the homepage's links in: the lab rewrites the
  // query in an effect, after this render.
  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = `/${window.location.search}`;
    // A plain click comes back to where the homepage was left (homeScroll.ts);
    // a middle or modified click opens home in a new tab, at the top.
    const plain = e.type === "click" && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    if (plain) markReturnHome();
  };

  return (
    <div className="cs-page">
      {/* A pill, not the name (Micah, 2026-11-08): it says what it does.
          Stands in until a proper case-study nav lets you jump between
          projects.

          Locked on scroll (Micah, 2026-11-10), the same on every case study,
          the applicant experience page included: it rests above the title,
          then sticks 24px from the top as the page goes up under it. It's
          its own sticky bar, outside the header, because sticky only holds
          inside its parent; inside the header it would let go as soon as the
          title scrolled away. .cs-page holds the footer too, so it stays put
          all the way to the bottom.

          It reads just "Back" (Micah, 2026-11-11; it was "Back to home").
          Screen readers still get where it goes from the aria-label, which
          starts with the visible word so voice control ("click Back")
          still finds it. The applicant experience page matches. */}
      <nav className="cs-bar wrap" aria-label="Site">
        <a className="cs-home" href="/" aria-label="Back to home" onClick={goHome} onAuxClick={goHome}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M19 12H5M11.5 5.5 5 12l6.5 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </a>
      </nav>

      <main className="cs" ref={main}>
        <header className="cs-hero wrap">
          <h1 className="cs-hero__title" tabIndex={-1}>
            {title}
          </h1>
        </header>
        {children}
        {/* No "Back to all work" link at the end any more (Micah,
            2026-11-10): the locked Back to home pill is on screen the
            whole way down, so a second way home only repeated it. */}
      </main>

      <SiteFooter />
      <BackToTop />
      {labKeys.length > 0 && <LabPanel keys={labKeys} lab={lab} setLab={setLab} />}
    </div>
  );
}
