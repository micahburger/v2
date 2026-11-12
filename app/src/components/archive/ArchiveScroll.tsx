import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { archiveSrc, type Archive, type ArchiveProject } from "../../data/archive";
import { prefersReducedMotion } from "../../motion";
import Lightbox from "./Lightbox";
import ChapterSkipper from "./ChapterSkipper";
import { holdAnchor } from "./holdAnchor";


/**
 * The Archive (2026-11-11): one long read, a chapter per project, with a
 * chapter skipper. Its only layout since Micah chose it over Index, Titles
 * and Panels the same day. Built from Micah's references, loosely
 * ("it does not need to be overly structured"):
 *
 *  - Code and Theory's TIME and Thomson Reuters pages: each chapter opens
 *    on a ruled meta row of mono labels (client, year, role, project),
 *    then a big statement on the left (the hook) beside the summary; the
 *    things delivered as numbered columns under hairlines, like their
 *    "Key takeaways"; the outcome as a large word on the left with its
 *    sentence on the right, like their "Impact".
 *  - NZero: rows sitting on ruled lines, for the contents list at the
 *    top. (A team credit on ruled lines closed each chapter until Micah
 *    cut the team sections, 2026-11-11.)
 *  - Ne Geurra (negeurra.com), for how it scrolls: plain native scrolling,
 *    no smoothing. Each piece's small caption sticks at the top while its
 *    large pictures run past beside it, and the next caption pushes it off.
 *    Here the chapter's caption ("01 Collins Aerospace ( 2022 )") sticks
 *    beside its screens, and each screen is numbered 1.1, 1.2… under it.
 *    Years in parentheses are theirs too.
 *
 * Screens are shown whole and stacked, not in a carousel: on a long read
 * the scroll is the carousel. Each opens the larger view (Lightbox).
 *
 * The skipper (ChapterSkipper) follows the ds section pill: it appears once
 * the first chapter is up, says where you are, steps back and forward, and
 * opens a list to jump. Anchors: /project/archive#wwe lands
 * on that chapter; jumping writes the chapter's #slug.
 *
 * Reveal: blocks fade up 24px once as they arrive (ds Recipe 4); none
 * under reduced motion, and none until the script has run, so nothing is
 * ever left invisible.
 */
export default function ArchiveScroll({ archive }: { archive: Archive }) {
  const projects = archive.projects;
  const root = useRef<HTMLElement>(null);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [inChapters, setInChapters] = useState(false);
  const [zoom, setZoom] = useState<{ project: ArchiveProject; index: number } | null>(null);

  const jump = useCallback(
    (i: number, smooth = true) => {
      const el = chapters.current[i];
      if (!el) return;
      el.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto", block: "start" });
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, "", `${pathname}${search}#${projects[i].slug}`);
    },
    [projects],
  );

  // Arriving on #<slug>, or following a link to one while here.
  const fromHash = useCallback(() => projects.findIndex((p) => p.slug === decodeURIComponent(window.location.hash.slice(1))), [projects]);
  useLayoutEffect(() => {
    const i = fromHash();
    if (i >= 0) return holdAnchor(() => chapters.current[i]?.scrollIntoView({ block: "start" }));
  }, [fromHash]);
  useEffect(() => {
    const onHash = () => {
      const i = fromHash();
      if (i >= 0) jump(i);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [fromHash, jump]);

  // Which chapter you're in: the last one whose top has passed 40% of the
  // window. The skipper shows from when the first chapter's top is in the
  // lower part of the window until the last one's bottom has gone. A
  // scroll listener (one rAF per frame at most), like the homepage's
  // section stage.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const els = chapters.current.filter(Boolean) as HTMLElement[];
      if (!els.length) return;
      let i = 0;
      els.forEach((el, n) => {
        if (el.getBoundingClientRect().top <= vh * 0.4) i = n;
      });
      setCurrent(i);
      const firstTop = els[0].getBoundingClientRect().top;
      const lastBottom = els[els.length - 1].getBoundingClientRect().bottom;
      setInChapters(firstTop < vh * 0.7 && lastBottom > vh * 0.3);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // The reveal: armed only once this runs (so a page without script shows
  // everything), never under reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const targets = el.querySelectorAll(".axs-reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    el.classList.add("is-revealing");
    targets.forEach((t) => {
      // Already on screen at load: shown at once, not animated in.
      if (t.getBoundingClientRect().top < window.innerHeight) t.classList.add("is-in");
      else io.observe(t);
    });
    return () => io.disconnect();
  }, []);

  return (
    <section className="ax ax--scroll axs wrap" aria-label={archive.title} ref={root}>
      <p className="ax-intro">{archive.intro}</p>

      {/* Contents, on ruled lines (NZero). No chapter numbers here (Micah,
          2026-11-11): the client, project and year are the row. */}
      <ol className="axs-contents" aria-label="Chapters">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <a
              href={`#${p.slug}`}
              onClick={(e) => {
                e.preventDefault();
                jump(i);
              }}
            >
              <span className="axs-contents__client">{p.client}</span>
              <span className="axs-contents__project">{p.project}</span>
              <span className="axs-contents__year">( {p.year} )</span>
            </a>
          </li>
        ))}
      </ol>

      {projects.map((project, i) => (
        <Chapter
          key={project.slug}
          project={project}
          n={i + 1}
          chapterRef={(el) => {
            chapters.current[i] = el;
          }}
          onZoom={(index) => setZoom({ project, index })}
        />
      ))}

      <ChapterSkipper projects={projects} current={current} visible={inChapters} onJump={jump} />

      {zoom && <Lightbox project={zoom.project} start={zoom.index} onClose={() => setZoom(null)} />}
    </section>
  );
}


type ChapterProps = {
  project: ArchiveProject;
  n: number;
  onZoom: (index: number) => void;
  /** Not `ref`: React 18 keeps that prop for itself. */
  chapterRef: (el: HTMLElement | null) => void;
};

function Chapter({ project, n, onZoom, chapterRef }: ChapterProps) {
  return (
    <article id={project.slug} ref={chapterRef} className="axs-chapter" aria-labelledby={`${project.slug}-title`}>
      {/* The meta row (TIME, Thomson Reuters). No chapter number (Micah,
          2026-11-11); the skipper says where you are. */}
      <dl className="axs-meta axs-reveal">
        <div>
          <dt>Client</dt>
          <dd id={`${project.slug}-title`}>{project.client}</dd>
        </div>
        <div>
          <dt>Project</dt>
          <dd>{project.project}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{project.year}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{project.role.join(" · ")}</dd>
        </div>
      </dl>

      {/* Statement left, story right. */}
      <div className="axs-lead axs-reveal">
        <h2 className="axs-statement">{project.hook}</h2>
        <p className="axs-summary">{project.summary}</p>
      </div>

      {/* Screens beside a sticky caption (Ne Geurra). */}
      <div className="axs-gallery">
        <p className="axs-caption" aria-hidden="true">
          <span>
            {project.client} <span className="axs-caption__year">( {project.year} )</span>
          </span>
          <span className="axs-caption__project">{project.project}</span>
        </p>
        <ol className="axs-shots">
          {project.images.map((image, k) => (
            <li key={image.file} className={`axs-shot axs-reveal ${image.height > image.width ? "is-portrait" : ""}`}>
              <button type="button" className="axs-shot__button" onClick={() => onZoom(k)} aria-label={`View larger: ${image.alt}`}>
                <img
                  src={archiveSrc(project.slug, image)}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <p className="axs-shot__caption">
                <span className="axs-num">
                  {n}.{k + 1}
                </span>
                {image.alt}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Key takeaways (TIME): what was designed, as columns under
          hairlines. Unnumbered, with the copy level with the label (Micah,
          2026-11-11). */}
      <div className="axs-takeaways axs-reveal">
        <h3 className="axs-label">What I designed</h3>
        <ul>
          {project.delivered.map((item) => (
            <li key={item}>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Impact (TIME), only where the source stated one. */}
      {project.outcome && (
        <div className="axs-impact axs-reveal">
          <h3 className="axs-impact__title">Outcome</h3>
          <p className="axs-impact__text">{project.outcome}</p>
        </div>
      )}
    </article>
  );
}
