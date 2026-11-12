import { useState } from "react";
import { archiveSrc, isTbd, type ArchiveProject } from "../../data/archive";
import HoverPreview from "./HoverPreview";
import { ArchivePanel, Chevron } from "./ArchiveDetail";
import { useArchiveAccordion } from "./useArchiveAccordion";
import type { ArchiveLayoutProps } from "./layouts";

/**
 * ?layout=index, the first Archive layout (2026-11-11): an interactive index.
 *
 * A short intro, then one row per project: client and project, disciplines,
 * year, and a chevron. It's the ds's "table index" pattern (Recipe 10):
 * rows on hairlines, and on a fine pointer the lead image follows the cursor
 * over a closed row. A row is a real button; pressing it opens the project
 * in place, summary on the left and its screens on the right, and closes
 * whichever was open. Opening, anchors and the fold are the shared
 * accordion's (useArchiveAccordion).
 *
 * Revised the same day (Micah): the row thumbnail only shows on phones,
 * where there's no hover preview; on desktop the preview already shows the
 * lead image and the two together were one picture too many. The plus that
 * turned into a cross is a chevron that flips. Type down a step (the --ax-*
 * tokens on .ax).
 */
export default function ArchiveIndex({ archive }: ArchiveLayoutProps) {
  const projects = archive.projects;
  const { open, mounted, toggle, itemRef, panelRef } = useArchiveAccordion(projects);
  const [hovered, setHovered] = useState<string | null>(null);
  const previewProject = hovered && hovered !== open ? projects.find((p) => p.slug === hovered) : undefined;

  return (
    <section className="ax ax--index wrap" aria-label={archive.title}>
      <p className="ax-intro">{archive.intro}</p>

      <ul className="ax-list">
        {projects.map((project) => {
          const isOpen = project.slug === open;
          return (
            <li key={project.slug} id={project.slug} className={`ax-item ${isOpen ? "is-open" : ""}`} ref={itemRef(project.slug)}>
              <h2 className="ax-item__heading">
                <button
                  type="button"
                  className="ax-row"
                  id={`${project.slug}-row`}
                  aria-expanded={isOpen}
                  aria-controls={`${project.slug}-panel`}
                  // Spelled out, because the row's parts are separate boxes
                  // and its text alone reads as one run-on word
                  // ("WWEWWE.com redesignSenior…"). Same words, in order.
                  aria-label={`${project.client}, ${project.project}. ${project.role.join(", ")}. ${isTbd(project.year) ? "Year to be confirmed" : project.year}`}
                  onClick={() => toggle(project.slug)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(project.slug)}
                  onPointerLeave={() => setHovered((h) => (h === project.slug ? null : h))}
                >
                  <RowContent project={project} />
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

      <HoverPreview project={previewProject} preload={projects} />
    </section>
  );
}

function RowContent({ project }: { project: ArchiveProject }) {
  const lead = project.images[0];
  return (
    <>
      {/* Phones only (CSS): there's no hover preview on touch. */}
      <span className="ax-row__thumb">
        <img
          src={archiveSrc(project.slug, lead, "thumb")}
          alt=""
          width={96}
          height={Math.round((96 * lead.height) / lead.width)}
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="ax-row__name">
        <span className="ax-row__client">{project.client}</span>
        <span className="ax-row__project">{project.project}</span>
      </span>
      <span className="ax-row__role">{project.role.join(" · ")}</span>
      <span className={`ax-row__year ${isTbd(project.year) ? "is-tbd" : ""}`}>{project.year}</span>
      <span className="ax-row__icon">
        <Chevron />
      </span>
    </>
  );
}
