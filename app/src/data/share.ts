// What a link to each page looks like when it's shared: Slack, iMessage,
// LinkedIn and search results (Micah, 2026-11-11: "per case study there
// should be one"). The title, description and 1200×630 card for every
// page anyone can land on.
//
// These have to be in the HTML the server sends, not set by the app:
// link-preview crawlers don't run JavaScript. So vite.config.ts (the
// shareHead plugin) writes them into index.html for the homepage and, at
// build time, into a copy of it per case study (project/<slug>.html),
// which .htaccess serves for /project/<slug>. The applicant experience is
// plain HTML and carries its own copy of these tags in its <head>; keep
// that one in step by hand.
//
// Plain data with no imports, so vite.config.ts can read it too. Titles
// match what CaseShell sets as the document title. The cards are in
// public/og: each project's homepage cover cropped to 1200×630, and the
// homepage and Archive as a grid of four covers on Clay.

export const SITE_URL = "https://micahburger.com";
export const SITE_NAME = "Micah Lindenberger";

export type SharePage = {
  /** The path a visitor lands on, as the app routes it. */
  path: string;
  title: string;
  description: string;
  /** In public/og. */
  image: string;
};

export const SHARE_HOME: SharePage = {
  path: "/",
  title: "Micah Lindenberger",
  description: "Micah Lindenberger, product designer. Case studies, prototypes and work history.",
  image: "home.jpg",
};

/** Keyed by case study slug (/project/<slug>). */
export const SHARE_PAGES: Record<string, SharePage> = {
  rentspree: {
    path: "/project/rentspree",
    title: "RentSpree · Micah Lindenberger",
    description:
      "Recent product work at RentSpree across the rental workflow: the applicant experience, requesting an application, messaging and the Rental Assistant.",
    image: "rentspree.jpg",
  },
  opendoor: {
    path: "/project/opendoor",
    title: "Opendoor · Micah Lindenberger",
    description:
      "I led the redesign of Opendoor’s seller experience so sellers could compare their options, understand their offer, and know what would happen next.",
    image: "opendoor.jpg",
  },
  lincoln: {
    path: "/project/lincoln",
    title: "Lincoln · Micah Lindenberger",
    description:
      "I redesigned Lincoln’s Build and Price, one of the most visited parts of the site, so shoppers could configure and price their own Lincoln on any screen.",
    image: "lincoln.jpg",
  },
  infinity: {
    path: "/project/infinity",
    title: "Infinity · Micah Lindenberger",
    description:
      "The app and wall controller for Carrier’s Infinity smart home system, redesigned so homeowners could install, monitor and manage their system and their energy use.",
    image: "infinity.jpg",
  },
  archive: {
    path: "/project/archive",
    title: "Archive · Micah Lindenberger",
    description:
      "Earlier work for Collins Aerospace, WWE, the American Bar Association, BBC News and Rockwell Group.",
    image: "archive.jpg",
  },
};

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The <head> tags for one page: title, description, canonical, Open Graph, X. */
export function shareHead(page: SharePage) {
  const url = SITE_URL + page.path;
  const image = `${SITE_URL}/og/${page.image}`;
  const title = escape(page.title);
  const description = escape(page.description);
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");
}
