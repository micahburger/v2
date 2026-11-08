import { contact, disciplines, footerLinks } from "../data/site";

const LOCATION = "New York, New York";
const TAGLINE = "Designing machines & systems since 2005";
const CREDIT = "Built in New York, New York ©2026";

/**
 * The sign-off footer: three quiet columns, then "Ciao." set enormous
 * across the full width. The ds's scale contrast (display type against
 * small, quiet labels) used as the last thing on the page. The content is
 * the live site's: name, disciplines, links, where, email, the tagline,
 * "Ciao." and the credit.
 *
 * Picked on 2026-11-07 over three other arrangements of the same content
 * (Classic, the live site's footer rebuilt; Index, a Swiss four-column
 * table; Card, an inverted panel led by the email), which left the lab.
 */
export default function SiteFooter() {
  return (
    <footer className="footer-signoff wrap">
      <div className="footer-signoff__cols grid">
        <div className="footer-signoff__who">
          <p>Micah Lindenberger</p>
          <p className="footer-muted">{TAGLINE}</p>
        </div>
        <ul className="footer-signoff__list">
          {disciplines.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <ul className="footer-signoff__list footer-signoff__links">
          {footerLinks.map((link) => (
            <li key={link.label}>
              {/* The arrow after the word, not before it: leading arrows read
                  as bullets. The page's own arrow (the featured corner's),
                  not a ➞ glyph, which Poppins doesn't have and the browser
                  filled in from another font. */}
              <a
                className="footer-signoff__link"
                href={link.href}
                {...("external" in link ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h14M12.5 5.5 19 12l-6.5 6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {"external" in link && <span className="visually-hidden"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {/* Decorative at this size; the word is still read out once. */}
      <p className="footer-signoff__ciao">Ciao.</p>
      {/* On the same three columns as the top row, so each bottom line sits
          under a column above it: where under the name, email under the
          disciplines, credit under the links. */}
      <div className="footer-signoff__base grid">
        <p>{LOCATION}</p>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <p>{CREDIT}</p>
      </div>
    </footer>
  );
}
