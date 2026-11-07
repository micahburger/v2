import { useEffect, useState } from "react";
import { useLab } from "./lab";
import { contact, disciplines, footerLinks, nav } from "./data/site";
import LabPanel from "./components/LabPanel";
import FeaturedProjects from "./components/FeaturedProjects";
import ClientQuilt from "./components/ClientQuilt";
import WorkHistory from "./components/WorkHistory";

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
        <section className="hero wrap grid">
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

        <section className="section wrap" aria-labelledby="clients-title">
          <h2 id="clients-title" className="section__label">
            Select Clients
          </h2>
          <ClientQuilt key={`${lab.quilt}-${replay}`} variant={lab.quilt} />
        </section>

        <section className="section section--ruled wrap" aria-labelledby="history-title">
          <h2 id="history-title" className="section__label">
            Work History
          </h2>
          <WorkHistory key={`${lab.history}-${replay}`} variant={lab.history} />
        </section>

        <section className="section section--featured wrap" aria-labelledby="featured-title">
          <h2 id="featured-title" className="section__label">
            Featured Projects
          </h2>
          <FeaturedProjects />
        </section>

        <section className="contact wrap">
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

      <footer className="site-footer wrap">
        <div className="site-footer__top grid">
          <div className="site-footer__who">
            <p className="site-footer__name">Micah Lindenberger</p>
            <ul className="site-footer__disciplines">
              {disciplines.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <ul className="site-footer__links">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>➞ {link.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="site-footer__bottom grid">
          <div className="site-footer__meta">
            <p>Find me in Los Angeles, CA</p>
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
            <p>Designing machines &amp; systems since 2005</p>
          </div>
          <div className="site-footer__signoff">
            <p className="site-footer__ciao">Ciao.</p>
            <p>Built in Brooklyn, NY ©2026</p>
          </div>
        </div>
      </footer>

      <LabPanel lab={lab} setLab={setLab} onReplay={() => setReplay((n) => n + 1)} />
    </>
  );
}
