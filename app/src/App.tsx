import { useEffect, useState } from "react";
import { useSectionStage } from "./hooks";
import { useLab } from "./lab";
import { contact } from "./data/site";
import LabPanel from "./components/LabPanel";
import FeaturedProjects from "./components/FeaturedProjects";
import ClientQuilt from "./components/ClientQuilt";
import WorkHistory from "./components/WorkHistory";
import SiteFooter from "./components/SiteFooter";
import BackToTop from "./components/BackToTop";

/**
 * The homepage, in the live site's order: hero, select clients, work
 * history, featured projects, contact, footer. Layout is the live site's
 * Semplice grid (12 columns, 30px gutters), rebuilt in .grid in global.css.
 */
export default function App() {
  const [lab, setLab] = useLab();
  // Bumped by "Replay build-ins": a new key remounts the quilt and history,
  // which resets their once-only arrival animations.
  const [replay, setReplay] = useState(0);

  // On <html>, not a wrapper, so the palette reaches the page background
  // behind everything (including overscroll) and the fixed lab panel.
  useEffect(() => {
    document.documentElement.dataset.palette = lab.palette;
  }, [lab.palette]);

  useEffect(() => {
    document.documentElement.dataset.shift = lab.shift;
  }, [lab.shift]);

  useSectionStage();

  return (
    <>
      <main>
        {/* No header bar: the name sits over the statement as an eyebrow,
            and is the page's h1, so the page is titled by who it's about. */}
        <section className="hero wrap" data-stage="0">
          <h1 className="hero__name" tabIndex={-1}>
            Micah Lindenberger
          </h1>
          <p className="hero__statement">
            Dedicated to transforming platforms and products into intuitive, engaging experiences
            that put customers at the center.
          </p>
        </section>

        <section className="section wrap" aria-labelledby="clients-title" data-stage="0">
          <h2 id="clients-title" className="section__label">
            Select Clients
          </h2>
          <ClientQuilt key={`${lab.clients}-${replay}`} variant={lab.clients} />
        </section>

        <section className="section section--ruled wrap" aria-labelledby="history-title" data-stage="1">
          <h2 id="history-title" className="section__label">
            Work History
          </h2>
          <WorkHistory key={`${lab.history}-${replay}`} variant={lab.history} />
        </section>

        <section className="section section--featured wrap" aria-labelledby="featured-title" data-stage="2">
          <h2 id="featured-title" className="section__label">
            Featured Projects
          </h2>
          <FeaturedProjects />
        </section>

        <section className="contact wrap" data-stage="3">
          <p className="contact__text">
            Thanks for exploring my work! You’ve got questions? I’ve got answers. Reach out{" "}
            <a href={`mailto:${contact.email}`}>via email</a>. Want to know more about my story?
            Check out my{" "}
            <a href={contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            .
          </p>
        </section>
      </main>

      <div data-stage="3">
        <SiteFooter />
      </div>

      <BackToTop />
      <LabPanel lab={lab} setLab={setLab} onReplay={() => setReplay((n) => n + 1)} />
    </>
  );
}
