import { useEffect, useLayoutEffect, useRef } from "react";
import type { ArchiveProject } from "../../data/archive";
import { useSeen } from "../../hooks";
import { prefersReducedMotion } from "../../motion";
import { ArchiveMedia, ArchiveSummary } from "./ArchiveDetail";
import type { ArchiveLayoutProps } from "./layouts";
import { holdAnchor } from "./holdAnchor";

/**
 * ?layout=panels (2026-11-11): the RentSpree overview's way of showing
 * several projects at a glance (/project/rentspree, the `chapter` blocks),
 * applied to the Archive. Every project is open: a rounded panel with the
 * client, project, year and roles over the summary on the left, its screens
 * on the right. Nothing to click to read; you scroll.
 *
 * The RentSpree panels are each in their project's own colour. The Archive
 * has no colours for these, so each panel is the same quiet lift of the
 * page (the brief card's 5% wash), which also keeps the page in one
 * lighting mode.
 *
 * Anchors still work: #<slug> brings that panel under the locked bar on
 * arrival and when a link to it is followed here. A panel's carousel mounts
 * when the panel first nears the screen, so the page doesn't load all
 * twenty-four screens up front.
 */
export default function ArchivePanels({ archive }: ArchiveLayoutProps) {
  const projects = archive.projects;

  useLayoutEffect(() => {
    if (projects.some((p) => p.slug === decodeURIComponent(window.location.hash.slice(1)))) {
      return holdAnchor(() => scrollToHash(projects, false));
    }
  }, [projects]);

  useEffect(() => {
    const onHash = () => scrollToHash(projects, true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [projects]);

  return (
    <section className="ax ax--panels wrap" aria-label={archive.title}>
      <p className="ax-intro">{archive.intro}</p>
      <div className="axp-list">
        {projects.map((project) => (
          <ProjectPanel key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}

function scrollToHash(projects: ArchiveProject[], smooth: boolean) {
  const slug = decodeURIComponent(window.location.hash.slice(1));
  if (!projects.some((p) => p.slug === slug)) return;
  // scrollIntoView honours the panel's scroll-margin-top (the locked bar).
  document.getElementById(slug)?.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto", block: "start" });
}

function ProjectPanel({ project }: { project: ArchiveProject }) {
  const ref = useRef<HTMLElement>(null);
  const near = useSeen(ref, 0.01);
  return (
    <article id={project.slug} ref={ref} className="axp-panel" aria-labelledby={`${project.slug}-title`}>
      <div className="axp-panel__text">
        <h2 className="axp-title" id={`${project.slug}-title`}>
          {project.client}
        </h2>
        <p className="axp-meta">
          {project.project} · {project.year}
        </p>
        <p className="axp-roles">{project.role.join(" · ")}</p>
        <ArchiveSummary project={project} />
      </div>
      <div className="axp-panel__media">
        <ArchiveMedia project={project} ready={near} />
      </div>
    </article>
  );
}
