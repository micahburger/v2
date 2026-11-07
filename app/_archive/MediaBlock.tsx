import type { Project } from "../data/site";

/**
 * Stand-in for a project's screens until the real exports arrive: a few
 * blocks in the project's own colours, arranged to hint at what the thing
 * is (a phone pair for an app, a browser for a tool, a grid for a shop).
 * Swap the inside of this for an <img> and every carousel picks it up.
 */
export default function MediaBlock({ project }: { project: Project }) {
  return (
    <div
      className={`media-block media-block--${project.shape}`}
      style={
        {
          "--mb-ink": project.ink,
          "--mb-tint": project.tint,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {project.shape === "desktop" && (
        <div className="mb-window">
          <div className="mb-bar" />
          <div className="mb-body">
            <span className="mb-col" />
            <span className="mb-col mb-col--fill" />
          </div>
        </div>
      )}
      {project.shape === "phone" && (
        <>
          <div className="mb-phone mb-phone--back" />
          <div className="mb-phone" />
        </>
      )}
      {project.shape === "pair" && (
        <>
          <div className="mb-phone mb-phone--left" />
          <div className="mb-phone mb-phone--right" />
        </>
      )}
      {project.shape === "grid" && (
        <div className="mb-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="mb-cell" />
          ))}
        </div>
      )}
    </div>
  );
}
