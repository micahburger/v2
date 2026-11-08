import { contact, disciplines, footerLinks } from "../data/site";

const LOCATION = "Los Angeles, CA";
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
              <a href={link.href}>➞ {link.label}</a>
            </li>
          ))}
        </ul>
      </div>
      {/* Decorative at this size; the word is still read out once. */}
      <p className="footer-signoff__ciao">Ciao.</p>
      <div className="footer-signoff__base">
        <p>{LOCATION}</p>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <p>{CREDIT}</p>
      </div>
    </footer>
  );
}
