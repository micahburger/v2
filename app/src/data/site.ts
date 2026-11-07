// All the homepage's content, transcribed from the live micahburger.com
// (Semplice) so the rebuild starts as a faithful copy. Copy in quotes below
// is the live site's own wording; only the first four featured projects
// are new.
//
// Company logos (public/img/logos), gathered 2026-11-06:
//   rentspree.svg, hudson-rouge.png   from each company's own site header
//   opendoor.svg, raytheon-technologies.svg   Wikimedia Commons (Opendoor's
//                        own site draws its logo in script; Raytheon
//                        Technologies is the name Micah worked under, the
//                        site is now RTX)
//   code-and-theory.svg  read out of codeandtheory.com's header in a browser
//                        (the site blocks scripted downloads), paths rounded
//   Tip or Skip and Hanson Digital have no logo source: both companies are
//   gone (hansondigital.com today is an unrelated SF print studio).
//
// Images live in public/img. Their sources, for when they need re-exporting:
//   hero-palm.jpg        ds-assets/photo.jpg (live uses a palm video loop)
//   logoquilt2024.png    ds-assets/logoquilt2024.png
//   lattice-1..5.jpg     prtfolio images/9, 7, 4, 8, 6.jpg (live order)
//   opendoor-1..6.jpg    ds-assets/projectslideshow4, 5, 6, 2, 3, 9.jpg
//   *-4up.gif            ds-assets/*-4up.gif
//   *-gallery.jpg        ds-assets/*-Gallery.jpg, standing in for the
//                        Lincoln, Rockwell and WWE 4-up GIFs, not in ds-assets
//   rental-application, folio-2026, corner-bodega.jpg
//                        screenshots of those live sites, until real exports

export type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "slideshow"; images: { src: string; alt: string }[] };

export type Featured = {
  id: string;
  /** Linked inline at the start of the paragraph, as on the live site. */
  name: string;
  /** Everything after the name. Leading space included where the live copy
   *  runs straight on ("Lattice is…"), omitted where it doesn't. */
  rest: string;
  href: string;
  media: Media;
};

const img = (src: string, alt: string): Media => ({ kind: "image", src: `/img/${src}`, alt });
const slides = (prefix: string, count: number, alt: string): Media => ({
  kind: "slideshow",
  images: Array.from({ length: count }, (_, i) => ({
    src: `/img/${prefix}-${i + 1}.jpg`,
    alt: `${alt}, ${i + 1} of ${count}`,
  })),
});

export const featured: Featured[] = [
  {
    id: "corner-bodega",
    name: "Corner Bodega",
    rest: " is a zine and print publisher founded in New York and LA in 2019. A rebuild of its shop and artist pages as a fast, static site.",
    href: "https://cornerbodega.micahburger.com",
    media: img("corner-bodega.jpg", "Corner Bodega home page"),
  },
  {
    id: "rental-application",
    name: "Rental application",
    rest: " A case study on redesigning the RentSpree rental application, from the first form field through payment and final submission.",
    href: "https://applicants.micahburger.com",
    media: img("rental-application.jpg", "Rental application redesign case study"),
  },
  {
    id: "lattice",
    name: "Lattice",
    rest: " is an interactive design explorer for shaping digital art direction. Mix typography, color, layout, spacing, and content to create live compositions, with a Creative Guide that explains the thinking behind each choice.",
    href: "https://lattice2026.micahburger.com/",
    media: slides("lattice", 5, "Lattice"),
  },
  {
    id: "folio-2026",
    name: "2026 Mini portfolio",
    rest: " Four product chapters and a resume, built as a slide deck on desktop and a scrolling page on a phone.",
    href: "https://2026folio.micahburger.com",
    media: img("folio-2026.jpg", "2026 mini portfolio, applicant experience chapter"),
  },
  {
    id: "opendoor",
    name: "Opendoor",
    rest: " wanted to create a cohesive, flexible experience for home sellers, integrating the option to list on the market with Opendoor’s cash offer.",
    href: "https://micahburger.com/project/opendoor",
    media: slides("opendoor", 6, "Opendoor seller experience"),
  },
  {
    id: "lincoln",
    name: "Lincoln.com",
    rest: " sought a fresh experience to engage shoppers with their latest luxury lineup. My mission was to redesign the popular “Build and Price” feature, where users customize and bring their dream Lincoln vehicle to life.",
    href: "https://micahburger.com/project/lincoln",
    media: img("lincoln-gallery.jpg", "Lincoln Build and Price"),
  },
  {
    id: "infinity",
    name: "Infinity Thermostat",
    rest: " I led a creative team to design a digital thermostat and app for Infinity, Carrier’s premium smart home brand, with the goal of modernizing their legacy app and wall controller for a more seamless digital experience.",
    href: "https://micahburger.com/project/infinity",
    media: img("carrier-4up.gif", "Infinity thermostat and app"),
  },
  {
    id: "bbc",
    name: "BBC News Stream",
    rest: " Collaborating with the BBC News digital team, we designed a video-led news experience to engage and expand their user base, focusing on an intuitive platform that prioritized video content to capture and retain attention.",
    href: "https://micahburger.com/project/bbc",
    media: img("bbc-4up.gif", "BBC News Stream"),
  },
  {
    id: "rockwell",
    name: "Rockwell Group",
    rest: " A leading interior design firm, sought to reinvent how they showcased their hospitality projects. The objective was to craft an engaging and dynamic experience that would drive exploration across their diverse hotel portfolio.",
    href: "https://micahburger.com/project/rockwell",
    media: img("rockwell-gallery.jpg", "Rockwell Group hospitality portfolio"),
  },
  {
    id: "aba",
    name: "American Bar Association",
    rest: " A collaborative discovery process with the American Bar digital team led to the creation of a new design language that would seamlessly extend across multiple platforms, balancing appeal to both younger and older audiences.",
    href: "https://micahburger.com/project/aba",
    media: img("aba-4up.gif", "American Bar Association design language"),
  },
  {
    id: "wwe",
    name: "WWE",
    rest: " sought to reinvent WWE.com to reflect the future of wrestling entertainment. We designed a bold, dynamic experience that matched the brand’s powerful image.",
    href: "https://micahburger.com/project/wwe",
    media: img("wwe-gallery.jpg", "WWE.com redesign"),
  },
];

/** The header links, as on the live site. */
export const nav = [
  { label: "Opendoor", href: "https://micahburger.com/project/opendoor" },
  { label: "Carrier", href: "https://micahburger.com/project/infinity" },
  { label: "Lincoln", href: "https://micahburger.com/project/lincoln" },
  { label: "Rockwell", href: "https://micahburger.com/project/rockwell" },
  { label: "BBC", href: "https://micahburger.com/project/bbc" },
];

/** The twelve logos in logoquilt2024.png, left to right, top to bottom.
 *  The quilt is one image; these names are its alt text, and they let the
 *  build-in variants cut it into per-logo tiles. */
export const clients = [
  "Opendoor",
  "Comcast",
  "American Bar Association",
  "BBC News",
  "Vanity Fair",
  "WWE",
  "Lincoln",
  "New York State",
  "MIT Sloan School of Management",
  "Tory Burch",
  "Collins Aerospace",
  "American Express",
];

export type Job = {
  /** As displayed: the live site sets these in capitals. */
  company: string;
  role: string;
  dates: string;
  location: string;
  href?: string;
  /** Logo for the hover card, from public/img/logos. Any colours in the
   *  file are flattened to black by CSS, so official colour files are fine.
   *  Without one, the card sets the company name in type instead. */
  logo?: string;
  /** Placeholder brand colour for the Fill/Timeline hover variants only. */
  color: string;
  ink: string;
  /** For tenure and the timeline: ISO year-month, `null` for current. */
  start: string;
  end: string | null;
};

export const jobs: Job[] = [
  { company: "RENTSPREE", logo: "/img/logos/rentspree.svg", role: "Sr. Staff Product Designer", dates: "Mar 2025 - Present", location: "New York, NY", href: "https://www.rentspree.com/", color: "#2B5CE6", ink: "#FFFFFF", start: "2025-03", end: null },
  { company: "OPENDOOR", logo: "/img/logos/opendoor.svg", role: "Staff Product Designer", dates: "Feb 2022 - Dec 2024", location: "Los Angeles, CA", href: "https://www.opendoor.com/", color: "#3D6DF2", ink: "#FFFFFF", start: "2022-02", end: "2024-12" },
  { company: "RAYTHEON TECHNOLOGY", logo: "/img/logos/raytheon-technologies.svg", role: "Product Design Manager", dates: "Sept 2018 - Jan 2022", location: "Brooklyn, New York", href: "https://www.rtx.com/", color: "#D7263D", ink: "#FFFFFF", start: "2018-09", end: "2022-01" },
  { company: "HUDSON ROUGE", logo: "/img/logos/hudson-rouge.png", role: "Design Director", dates: "Apr 2017 - Sept 2018", location: "NYC, New York", href: "https://www.hudsonrouge.com/", color: "#7A1F2B", ink: "#FFFFFF", start: "2017-04", end: "2018-09" },
  { company: "CODE & THEORY", logo: "/img/logos/code-and-theory.svg", role: "Senior Product Design", dates: "Feb 2013 - Mar 2017", location: "NYC, New York", href: "https://www.codeandtheory.com/", color: "#141414", ink: "#F5F1EB", start: "2013-02", end: "2017-03" },
  { company: "TIP OR SKIP (START UP)", role: "Founding Designer", dates: "April 2012 - Feb 2013", location: "NYC, New York", href: "https://ecosystem.freewayphx.com/companies/tip_or_skip", color: "#F2A93B", ink: "#141414", start: "2012-04", end: "2013-02" },
  { company: "HANSON DIGITAL", role: "Product Designer", dates: "Aug 2010 - Apr 2012", location: "Maumee, Ohio", color: "#2E7D6B", ink: "#FFFFFF", start: "2010-08", end: "2012-04" },
];

export const contact = {
  email: "micahmicahdesign@gmail.com",
  linkedin: "https://www.linkedin.com/in/micahburger/",
};

export const disciplines = [
  "Product Design",
  "Interaction Design",
  "Art Direction",
  "Creative Strategy",
  "Illustration",
];

/** Footer links. The live site points Home/Shop/Illustration at a stale
 *  temp-domain URL; these use the real domain. */
export const footerLinks = [
  { label: "Home", href: "https://micahburger.com/" },
  { label: "Shop", href: "https://micahburger.com/project/shop" },
  { label: "Illustration", href: "https://micahburger.com/project/subway-people" },
  { label: "Insta", href: "https://www.instagram.com/micahburger/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/micahburger/" },
];
