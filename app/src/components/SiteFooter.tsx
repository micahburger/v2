import { contact, disciplines, footerLinks } from "../data/site";

type Variant = "classic" | "signoff" | "index" | "card";

const LOCATION = "Los Angeles, CA";
const TAGLINE = "Designing machines & systems since 2005";
const CREDIT = "Built in New York, New York ©2026";

/**
 * Four footers with the same content, for the lab. The content is the live
 * site's: name, disciplines, links, where, email, the tagline, "Ciao." and
 * the credit. Only the arrangement changes.
 *
 *  - CLASSIC: the live site's footer, as rebuilt.
 *  - SIGN-OFF: three quiet columns, then "Ciao." set enormous across the
 *    full width. The ds's scale contrast (display type against small, quiet
 *    labels) used as the last thing on the page.
 *  - INDEX: a Swiss-style four-column table, each column with a small label
 *    and a hairline over it, the colophon in a thin bar underneath.
 *  - CARD: an inverted panel with the media's 28px corners, led by the
 *    email address in large type, since getting in touch is the point.
 */
export default function SiteFooter({ variant }: { variant: Variant }) {
  if (variant === "signoff") return <SignOff />;
  if (variant === "index") return <Index />;
  if (variant === "card") return <Card />;
  return <Classic />;
}

function Links({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {footerLinks.map((link) => (
        <li key={link.label}>
          <a href={link.href}>➞ {link.label}</a>
        </li>
      ))}
    </ul>
  );
}

function Email({ className }: { className?: string }) {
  return (
    <a className={className} href={`mailto:${contact.email}`}>
      {contact.email}
    </a>
  );
}

function Classic() {
  return (
    <footer className="site-footer footer-classic wrap">
      <div className="site-footer__top grid">
        <div className="site-footer__who">
          <p className="site-footer__name">Micah Lindenberger</p>
          <ul className="site-footer__disciplines">
            {disciplines.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <Links className="site-footer__links" />
      </div>
      <div className="site-footer__bottom grid">
        <div className="site-footer__meta">
          <p>Find me in {LOCATION}</p>
          <p>
            <Email />
          </p>
          <p>{TAGLINE}</p>
        </div>
        <div className="site-footer__signoff">
          <p className="site-footer__ciao">Ciao.</p>
          <p>{CREDIT}</p>
        </div>
      </div>
    </footer>
  );
}

function SignOff() {
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
        <Links className="footer-signoff__list footer-signoff__links" />
      </div>
      {/* Decorative at this size; the word is still read out once. */}
      <p className="footer-signoff__ciao">Ciao.</p>
      <div className="footer-signoff__base">
        <p>{LOCATION}</p>
        <Email />
        <p>{CREDIT}</p>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <footer className="footer-index wrap">
      <div className="footer-index__cols grid">
        <div className="footer-index__col">
          <p className="footer-index__name">Micah Lindenberger</p>
          <p className="footer-muted">{TAGLINE}</p>
        </div>
        <div className="footer-index__col">
          <p className="footer-index__label">Practice</p>
          <ul>
            {disciplines.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="footer-index__col">
          <p className="footer-index__label">Elsewhere</p>
          <Links />
        </div>
        <div className="footer-index__col">
          <p className="footer-index__label">Contact</p>
          <p>{LOCATION}</p>
          <Email />
        </div>
      </div>
      <div className="footer-index__bar">
        <p>Ciao.</p>
        <p>{CREDIT}</p>
      </div>
    </footer>
  );
}

function Card() {
  return (
    <footer className="footer-card wrap">
      <div className="footer-card__panel">
        <div className="footer-card__top">
          <p className="footer-card__ciao">Ciao.</p>
          <Links className="footer-card__links" />
        </div>
        <div className="footer-card__mail">
          <p className="footer-card__label">Say hello</p>
          <a className="footer-card__email" href={`mailto:${contact.email}`}>
            {contact.email}
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
        <div className="footer-card__bottom">
          <p>{disciplines.join(" · ")}</p>
          <p>
            {LOCATION} · {TAGLINE}
          </p>
          <p>{CREDIT}</p>
        </div>
      </div>
    </footer>
  );
}
