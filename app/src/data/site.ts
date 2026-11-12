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
//   logoquilt2024.png    ds-assets/logoquilt2024.png
// Carousel sets, all 16:9, resized to 1400px wide. Each starts on the frame
// the live page opens on (the -Gallery still), then the case-study screens:
//   lattice-1..5         prtfolio images/9, 7, 4, 8, 6.jpg (live order)
//   opendoor-1..6        ds-assets/projectslideshow4, 5, 6, 2, 3, 9
//   lincoln-1..5         Lincoln-Gallery, Lincoln13, 10, 14, 11-CaseStudy
//   infinity-1..4        Carrier-Gallery, Infinity-Therm-9, then -10 and -6
//                        (2026-11-11, from the case study's own images in
//                        public/img/infinity: the in-home and dark-mode
//                        shots)
//   bbc-1..3             BBC-Gallery, BBC-8, BBC-9
//   rockwell-1..4        Rockwell-Gallery, -3, -4, -5 (cropped from 4:3)
//   aba-1..6             Aba-Gallery, ABA-1, -8, -10, -13, -6
//   wwe-1..6             WWE-Gallery, WWE-1-1, -12, -10, -13, -9
//   bodega-, rental-, folio-*
//                        screenshots of those live sites (home page first,
//                        then artist pages / case-study sections / folio
//                        chapters), until real exports exist
//   rental-hand          except this one (2026-11-10): the hand holding
//                        the phone, applicants-site/img/closing.jpg, set on
//                        a 1316x740 ground of its own edge colour (#161417)
//                        with the side edges faded in. It replaced a capture
//                        of the old scramble title, retired from that page.
//                        A new name, not rental-1, so week-long image caches
//                        can't keep serving the old picture.

export type Slide = {
  src: string;
  alt: string;
  /** Where clicking this slide goes, when it isn't the row's own link (the
   *  Archive row, whose slides are each a different project). */
  href?: string;
};

export type Media = { kind: "image"; src: string; alt: string } | { kind: "carousel"; images: Slide[] };

export type Featured = {
  id: string;
  /** Linked inline at the start of the paragraph, as on the live site. */
  name: string;
  /** Everything after the name. Leading space included where the live copy
   *  runs straight on ("Lattice is…"), omitted where it doesn't. */
  rest: string;
  /** Omitted for a row that isn't one project (Archive): the name is then
   *  plain text and the links live in `group`. A path ("/project/…") is a
   *  case study on this site and opens in the same tab. */
  href?: string;
  /** Projects gathered into this row, linked inline after `rest`. */
  group?: { label: string; href: string }[];
  media: Media;
};

const slides = (prefix: string, count: number, alt: string): Media => ({
  kind: "carousel",
  images: Array.from({ length: count }, (_, i) => ({
    src: `/img/${prefix}-${i + 1}.jpg`,
    alt: `${alt}, ${i + 1} of ${count}`,
  })),
});

// Order (Micah, 2026-11-07): the 2026 folio leads, then the rental
// application, Lattice and Opendoor, then the rest as before, with the
// oldest four grouped into Archive. Corner Bodega is out for now; its entry
// and images (bodega-1..3) are kept below / in public/img for when it
// comes back.
export const featured: Featured[] = [
  {
    // Was the "2026 Mini portfolio" row, linking out to the folio's own
    // site. Since 2026-11-10 the same four chapters are a case study here
    // (/project/rentspree), so the row opens that in place and is named for
    // it; the Applicant experience row below is the long read on the first.
    id: "rentspree",
    name: "RentSpree",
    rest: " Recent product work across the rental workflow, in four projects: the applicant experience, requesting an application, messaging and the Rental Assistant.",
    href: "/project/rentspree",
    media: slides("folio", 4, "RentSpree product work"),
  },
  {
    // Named for the page it opens (retitled 2026-11-10) and for the
    // RentSpree chapter that leads into it, so the one project has one name
    // everywhere. Since 2026-11-11 the page lives here, as static files in
    // public/project/applicant-experience (it was its own site at
    // applicants.micahburger.com, which now redirects), so it opens in
    // place like the other case studies. The trailing slash matters: the
    // page's css/, js/ and img/ links are relative to it.
    id: "applicant-experience",
    name: "Applicant experience",
    rest: " The full RentSpree case study on the rental application: four predictable steps, a review before reports are pulled, and payment moved after that review.",
    href: "/project/applicant-experience/",
    // Listed by hand rather than slides("rental", 3): the first slide got a
    // new file name with its new picture. Images are cached for a week
    // (max-age=604800), so a browser that had the old rental-1.jpg kept
    // showing the retired scramble title under the same URL.
    media: {
      kind: "carousel",
      images: [
        { src: "/img/rental-hand.jpg", alt: "The application overview on a phone, held in a hand" },
        { src: "/img/rental-2.jpg", alt: "Applicant experience case study, 2 of 3" },
        { src: "/img/rental-3.jpg", alt: "Applicant experience case study, 3 of 3" },
      ],
    },
  },
  {
    id: "lattice",
    name: "Lattice",
    rest: " is an interactive design explorer for shaping digital art direction. Mix typography, color, layout, spacing, and content to create live compositions, with a Creative Guide that explains the thinking behind each choice.",
    href: "https://lattice2026.micahburger.com/",
    media: slides("lattice", 5, "Lattice"),
  },
  {
    id: "opendoor",
    name: "Opendoor",
    // Follows the case study's opening (revised 2026-11-10).
    rest: " was adding ‘List with Opendoor’ alongside its cash offer. I led the redesign of the seller experience so sellers could compare the two options, understand their offer, and know what would happen next.",
    // The v2 case study (components/CaseStudy.tsx), the first one built here.
    href: "/project/opendoor",
    media: slides("opendoor", 6, "Opendoor seller experience"),
  },
  {
    id: "lincoln",
    name: "Lincoln.com",
    // Follows the case study's opening, like Opendoor's (2026-11-11).
    rest: " needed a new way to introduce shoppers to Lincoln’s luxury lineup. I redesigned Build and Price, one of the most visited parts of the site, so shoppers could configure and price their own Lincoln on any screen.",
    // The v2 case study since 2026-11-11 (was the live Semplice page).
    href: "/project/lincoln",
    media: slides("lincoln", 5, "Lincoln Build and Price"),
  },
  {
    id: "infinity",
    name: "Infinity Thermostat",
    rest: " I led the creative team that redesigned the app and wall controller for Infinity, Carrier’s premium smart home system, so homeowners could easily install, monitor and manage their system and their energy use.",
    // The v2 case study since 2026-11-11 (was the live Semplice page).
    href: "/project/infinity",
    media: slides("infinity", 4, "Infinity thermostat and app"),
  },
  {
    // The older case studies, gathered (Micah, 2026-11-07: "time to figure
    // out how to group" them). Since 2026-11-11 they live on one page here,
    // /project/archive, as previews, and the old WordPress pages are being
    // retired: the name opens the Archive, each client opens its own
    // project there (/project/archive#<slug>, already expanded), and so does
    // each slide. Collins Aerospace (FPO) joined them then; it was an
    // unlisted page on the old site. Their fuller image sets (wwe-2..6
    // etc.) are still in public/img; the Archive has its own in
    // public/img/archive. Listed newest first, the Archive's own order
    // (2022, 2017, 2016, 2015, 2015).
    id: "archive",
    name: "Archive",
    rest: " Earlier work for ",
    href: "/project/archive",
    group: [
      { label: "Collins Aerospace", href: "/project/archive#fpo" },
      { label: "WWE", href: "/project/archive#wwe" },
      { label: "the American Bar Association", href: "/project/archive#aba" },
      { label: "BBC News", href: "/project/archive#bbc" },
      { label: "Rockwell Group", href: "/project/archive#rockwell" },
    ],
    media: {
      kind: "carousel",
      images: [
        { src: "/img/fpo-1.jpg", alt: "Collins Aerospace Flight Profile Optimizer", href: "/project/archive#fpo" },
        { src: "/img/wwe-1.jpg", alt: "WWE.com redesign", href: "/project/archive#wwe" },
        { src: "/img/aba-1.jpg", alt: "American Bar Association design language", href: "/project/archive#aba" },
        { src: "/img/bbc-1.jpg", alt: "BBC News Stream", href: "/project/archive#bbc" },
        { src: "/img/rockwell-1.jpg", alt: "Rockwell Group hospitality portfolio", href: "/project/archive#rockwell" },
      ],
    },
  },
];

/** Off the page for now (see the order note above). */
export const parked: Featured[] = [
  {
    id: "corner-bodega",
    name: "Corner Bodega",
    rest: " is a zine and print publisher founded in New York and LA in 2019. A rebuild of its shop and artist pages as a fast, static site.",
    href: "https://cornerbodega.micahburger.com",
    media: slides("bodega", 3, "Corner Bodega"),
  },
];

/**
 * The Select Clients logos, in display order (four to a row). Most are cut
 * out of logoquilt2024.png, the single image the live site uses: `quilt`
 * is the logo's position in that image, left to right, top to bottom
 * (0 Opendoor … 11 American Express). Logos added since have their own
 * file instead (`src`), flattened to the quilt's one colour by CSS.
 */
export type ClientLogo = { name: string } & ({ quilt: number } | { src: string });

export const clients: ClientLogo[] = [
  { name: "RentSpree", src: "/img/logos/rentspree.svg" },
  { name: "Opendoor", quilt: 0 },
  // Carrier: one-colour version of Wikimedia Commons' "Logo of the Carrier
  // Corporation.svg", the script cut out of the oval (see the file).
  { name: "Carrier", src: "/img/logos/carrier.svg" },
  { name: "Comcast", quilt: 1 },
  { name: "American Bar Association", quilt: 2 },
  { name: "BBC News", quilt: 3 },
  { name: "Vanity Fair", quilt: 4 },
  { name: "WWE", quilt: 5 },
  { name: "Lincoln", quilt: 6 },
  { name: "New York State", quilt: 7 },
  { name: "MIT Sloan School of Management", quilt: 8 },
  { name: "Tory Burch", quilt: 9 },
  { name: "Collins Aerospace", quilt: 10 },
  { name: "American Express", quilt: 11 },
];

export type Job = {
  /** As displayed: the live site sets these in capitals. */
  company: string;
  /** The company in ordinary case, for the Resume take, which sets it as a
   *  small line over the role the way the 2026 folio's resume does. */
  name: string;
  role: string;
  dates: string;
  location: string;
  href?: string;
  /** Logo for the hover card, from public/img/logos. Any colours in the
   *  file are flattened to black by CSS, so official colour files are fine.
   *  Without one, the card sets the company name in type instead. */
  logo?: string;
  /** The rounded app-icon tile from the 2026 folio's resume
   *  (public/img/workhistory), used by the Resume take. The folio had five;
   *  Hanson's is its "h." from hansoninc.com and Tip or Skip's is made up,
   *  both white on black to sit with Hudson Rouge and Code & Theory. */
  tile: string;
  /** For the timeline: ISO year-month, `null` for current. */
  start: string;
  end: string | null;
};

export const jobs: Job[] = [
  { company: "RENTSPREE", name: "RentSpree", tile: "/img/workhistory/rentspree.png", logo: "/img/logos/rentspree.svg", role: "Sr. Staff Product Designer", dates: "Mar 2025 - Present", location: "New York, NY", href: "https://www.rentspree.com/", start: "2025-03", end: null },
  { company: "OPENDOOR", name: "Opendoor", tile: "/img/workhistory/opendoor.png", logo: "/img/logos/opendoor.svg", role: "Staff Product Designer", dates: "Feb 2022 - Dec 2024", location: "Los Angeles, CA", href: "https://www.opendoor.com/", start: "2022-02", end: "2024-12" },
  { company: "RAYTHEON TECHNOLOGY", name: "Raytheon Technologies", tile: "/img/workhistory/raytheon.png", logo: "/img/logos/raytheon-technologies.svg", role: "Product Design Manager", dates: "Sept 2018 - Jan 2022", location: "Brooklyn, New York", href: "https://www.rtx.com/", start: "2018-09", end: "2022-01" },
  { company: "HUDSON ROUGE", name: "Hudson Rouge", tile: "/img/workhistory/hudson-rouge.png", logo: "/img/logos/hudson-rouge.png", role: "Design Director", dates: "Apr 2017 - Sept 2018", location: "NYC, New York", href: "https://www.hudsonrouge.com/", start: "2017-04", end: "2018-09" },
  { company: "CODE & THEORY", name: "Code & Theory", tile: "/img/workhistory/code-and-theory.png", logo: "/img/logos/code-and-theory.svg", role: "Senior Product Design", dates: "Feb 2013 - Mar 2017", location: "NYC, New York", href: "https://www.codeandtheory.com/", start: "2013-02", end: "2017-03" },
  { company: "TIP OR SKIP (START UP)", name: "Tip or Skip", tile: "/img/workhistory/tip-or-skip.svg", role: "Founding Designer", dates: "April 2012 - Feb 2013", location: "NYC, New York", start: "2012-04", end: "2013-02" },
  { company: "HANSON DIGITAL", name: "Hanson Digital", tile: "/img/workhistory/hanson.svg", role: "Product Designer", dates: "Aug 2010 - Apr 2012", location: "Maumee, Ohio", href: "https://hansoninc.com/work", start: "2010-08", end: "2012-04" },
];

export const contact = {
  email: "micahmicahdesign@gmail.com",
  linkedin: "https://www.linkedin.com/in/micahburger/",
};

// Illustration dropped with its footer link (Micah, 2026-11-07).
export const disciplines = [
  "Product Design",
  "Interaction Design",
  "Art Direction",
  "Creative Strategy",
];

/** Footer links. Shop is Corner Bodega's own site now, and Illustration
 *  was dropped (Micah, 2026-11-07). Everything but Home leaves for another
 *  site, so those open in a new tab, like the featured projects. */
export const footerLinks = [
  { label: "Home", href: "https://micahburger.com/" },
  { label: "Shop", href: "https://cornerbodega.pub/", external: true },
  { label: "Insta", href: "https://www.instagram.com/micahburger/", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/micahburger/", external: true },
];
