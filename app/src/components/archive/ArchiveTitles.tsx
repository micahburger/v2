import { useState } from "react";
import { archiveSrc, isTbd } from "../../data/archive";
import { ArchivePanel, Chevron } from "./ArchiveDetail";
import { useArchiveAccordion } from "./useArchiveAccordion";
import type { ArchiveLayoutProps } from "./layouts";

/**
 * ?layout=titles (2026-11-11): the ds "text index" (Recipe 10), for a
 * handful of projects. The clients' names set large and centred, nothing
 * else on the line but a quiet project and year under each.
 *
 * On a fine pointer, hovering (or focusing) a name dims the others to 20%
 * and brings that project's lead screen up behind the type: opacity to .9,
 * scale .96 to 1, 400ms on the enter curve. The names sit on the screen
 * with mix-blend-mode: difference, so they stay legible over light and dark
 * pictures alike. Pressing a name opens the project in place below it,
 * exactly as the Index does (the shared accordion and panel), and the
 * backdrop steps away while one is open.
 *
 * Type is Poppins 400 at the ds's text-index size (it specifies Instrument
 * Sans 600, which this site doesn't load; no synthesised weights).
 */
export default function ArchiveTitles({ archive }: ArchiveLayoutProps) {
  const projects = archive.projects;
  const { open, mounted, toggle, itemRef, panelRef } = useArchiveAccordion(projects);
  const [fine] = useState(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  const [pointed, setPointed] = useState<string | null>(null);
  // Nothing lights up while a project is open: the backdrop would sit
  // behind its summary.
  const lit = open ? null : pointed;

  return (
    <section className="ax ax--titles wrap" aria-label={archive.title}>
      <p className="ax-intro">{archive.intro}</p>

      <div className={`axt ${lit ? "has-lit" : ""}`}>
        {fine && (
          <div className="axt-backdrop" aria-hidden="true">
            {projects.map((project) => (
              <img
                key={project.slug}
                className={project.slug === lit ? "is-lit" : ""}
                src={archiveSrc(project.slug, project.images[0])}
                alt=""
                width={project.images[0].width}
                height={project.images[0].height}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        )}

        <ul className="axt-list">
          {projects.map((project) => {
            const isOpen = project.slug === open;
            return (
              <li
                key={project.slug}
                id={project.slug}
                className={`axt-item ${project.slug === lit ? "is-lit" : ""} ${isOpen ? "is-open" : ""}`}
                ref={itemRef(project.slug)}
              >
                <h2 className="axt-item__heading">
                  <button
                    type="button"
                    className="axt-title"
                    id={`${project.slug}-row`}
                    aria-expanded={isOpen}
                    aria-controls={`${project.slug}-panel`}
                    aria-label={`${project.client}, ${project.project}. ${isTbd(project.year) ? "Year to be confirmed" : project.year}`}
                    onClick={() => toggle(project.slug)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setPointed(project.slug)}
                    onPointerLeave={() => setPointed((p) => (p === project.slug ? null : p))}
                    onFocus={() => setPointed(project.slug)}
                    onBlur={() => setPointed((p) => (p === project.slug ? null : p))}
                  >
                    <span className="axt-title__client">{project.client}</span>
                    <span className="axt-title__meta">
                      {project.project} · {project.year}
                      <Chevron />
                    </span>
                  </button>
                </h2>
                <ArchivePanel
                  project={project}
                  open={isOpen}
                  carousel={mounted.has(project.slug)}
                  labelledBy={`${project.slug}-row`}
                  panelRef={panelRef(project.slug)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
