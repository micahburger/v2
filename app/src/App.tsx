import { useEffect, useState } from "react";
import { useLab } from "./lab";
import { contact, nav } from "./data/site";
import LabPanel from "./components/LabPanel";
import FeaturedProjects from "./components/FeaturedProjects";
import ClientQuilt from "./components/ClientQuilt";
import WorkHistory from "./components/WorkHistory";
import SiteFooter from "./components/SiteFooter";

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
      {/* Not fixed: it sits at the top of the page and scrolls away. */}
      <header className="site-header wrap">
        <div className="site-header__bar">
          <a className="site-header__name" href="/">
            M Lindenberger
          </a>
          <nav className="site-header__nav" aria-label="Projects">
            {nav.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero wrap grid" data-stage="0">
          <img
            className="hero__media"
            src="/img/hero-palm.jpg"
            alt="Palm fronds against a pale sky"
            width={800}
            height={533}
          />
          <h1 className="hero__statement">
            Dedicated to transforming platforms and products into intuitive, engaging experiences
            that put customers at the center.
          </h1>
        </section>

        <section className="section wrap" aria-labelledby="clients-title" data-stage="0">
          <h2 id="clients-title" className="section__label">
            Select Clients
          </h2>
          <ClientQuilt key={`quilt-${replay}`} />
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
            Thanks for exploring my work! You’ve got questions? I’m all ears—reach out{" "}
            <a href={`mailto:${contact.email}`}>via email</a>. Want to know more about my story?
            Check out my{" "}
            <a href={contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>{" "}
            and let’s connect!
          </p>
        </section>
      </main>

      <div data-stage="3">
        <SiteFooter variant={lab.footer} />
      </div>

      <LabPanel lab={lab} setLab={setLab} onReplay={() => setReplay((n) => n + 1)} />
    </>
  );
}

/**
 * Which part of the page the visitor is in, written to <html data-stage>
 * for the scroll colour shift (see "section shift" in global.css): the last
 * element marked data-stage whose top has passed the middle of the
 * viewport. Because it's "last one passed", the gaps between sections keep
 * the stage of the section above, so the colour changes once per section
 * rather than flickering at the seams.
 *
 * A scroll listener (one rAF per frame at most) rather than an
 * IntersectionObserver: it's the same answer computed directly, and it
 * keeps working where observers are throttled, such as background tabs.
 * Runs whether or not a shift is on, so switching it on mid-page lands on
 * the right colour straight away.
 */
function useSectionStage() {
  useEffect(() => {
    const root = document.documentElement;
    // :not(html): the stage is written to <html data-stage>, which would
    // otherwise match too and feed its own last value back in.
    const marks = [...document.querySelectorAll<HTMLElement>("[data-stage]:not(html)")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 2;
      let stage = "0";
      for (const el of marks) {
        if (el.getBoundingClientRect().top <= line) stage = el.dataset.stage ?? stage;
      }
      // At the very bottom the footer can be too short to reach the middle
      // line; reaching the end of the page counts as being in it.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        stage = marks[marks.length - 1]?.dataset.stage ?? stage;
      }
      if (root.dataset.stage !== stage) root.dataset.stage = stage;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}
