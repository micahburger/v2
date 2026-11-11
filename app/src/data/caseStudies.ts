// Case studies, each one a list of blocks rendered top to bottom by
// components/CaseStudy.tsx. Opendoor is the first and the template: its
// blocks were chosen to cover everything the live Semplice case studies do
// (intro with a hero image, section headings, an image beside notes, a wide
// figure, a before/after, a slideshow, learnings, outcome stats, a video),
// so the next case study should be new data, not new components.
//
// The URL is /project/<slug>, the live site's own, so links to
// micahburger.com/project/opendoor keep working once v2 replaces it.
//
// Copy is the live page's wording (micahburger.com/project/opendoor,
// 2026-11-08), except the em dashes, which are now commas, and a missing
// full stop or two.
//
// Opendoor images (public/img/opendoor), from ~/Desktop/ds-assets, the
// files the live page was built from:
//   hero.jpg               header6.jpg
//   original-design.png    original2.png
//   journey-map.jpg        map4.png
//   prelim-offer-v1.jpg    eero3.jpg   (EERO, the design before)
//   prelim-offer-v2.jpg    novo5.jpg   (Novo, the redesign)
//   compare-options.png    compare3.png
//   forms.jpg              forms.jpg
//   next-steps.jpg         nextsteps.jpg
//   offer-breakdown.png    offerbreakdown.png
//   novo-1..6.jpg          designsystem_novo3, designsystem_novo2, dark,
//                          colors2, colors4, cards (the live slideshow order)
//   final-offer.mp4        final offer video.mp4   (not on the page for
//   final-offer-poster.jpg a frame of it            now; see the end of
//                                                   opendoor's blocks)
// JPEGs re-saved at quality 82, at most 2000px on the long side; the PNGs
// are cut out on transparency and are copied as they are.
//
// Lincoln and Infinity (2026-11-11) follow the same recipe; their sources
// are listed above each study. Only five of their files were in
// ~/Desktop/ds-assets, so the rest are the originals from the live site's
// wp-content/uploads (Micah's go-ahead). Their PNGs were opaque, full-frame
// exports on #161616, not cut-outs, so they're JPEGs here too.

export type Img = {
  src: string;
  alt: string;
  /** Intrinsic size, so the box is reserved before the image loads and the
   *  page doesn't jump as it scrolls into lazy images. */
  width: number;
  height: number;
  /** "framed" (the default): a screen exported on its own dark ground, set
   *  in a rounded box like the homepage's media. "cutout": a transparent
   *  PNG (a phone), set straight on the page with no box. */
  look?: "framed" | "cutout";
  /** For an animated GIF: a still of its first frame, shown instead under
   *  prefers-reduced-motion. A GIF can't be paused from CSS, so the only
   *  way to stop it is to not show it. */
  still?: string;
};

/** A short titled paragraph: a pain point, a feature, a learning. */
export type Note = { title: string; body: string };

export type Block =
  /** The opening: paragraphs and labelled facts on the left, an image right. */
  | { kind: "intro"; paragraphs: string[]; facts: { label: string; text: string }[]; image: Img }
  /** A section title, with an optional line under it; `ruled` draws the
   *  homepage's hairline above it. */
  | { kind: "heading"; title: string; lede?: string; ruled?: boolean }
  /** An image beside a column of notes. `size` is how much of the grid the
   *  image takes: "phone" a narrow column, "half" about half. */
  | { kind: "split"; image: Img; caption?: string; notes: Note[]; imageSide: "left" | "right"; size: "phone" | "half" }
  /** One image across the content width. */
  | { kind: "figure"; image: Img; caption?: string }
  /** Two images side by side, the way the live Semplice pages paired two
   *  half-width exports or two phone recordings. "phone": two narrow
   *  screens, three columns each, centred, with a phone's corners (they
   *  stay side by side on a phone, where two at half width still read).
   *  "half": two wide images, six columns each, stacked on a phone.
   *  Added 2026-11-11 for Lincoln and Infinity. */
  | { kind: "pair"; images: [Img, Img]; caption?: string; size: "phone" | "half" }
  /** The same screen before and after, wiped between with a handle. */
  | { kind: "compare"; before: Img; after: Img; beforeLabel: string; afterLabel: string; body?: string }
  /** A grab-and-swipe set of images with a note under it. */
  | { kind: "slideshow"; label: string; images: Img[]; note?: Note }
  /** The close: the numbers and what was learned. Laid out three ways in
   *  the lab (CaseStudy.tsx, "Outcomes"); each take uses the parts it
   *  needs. `summary` is the numbers as one sentence, *starred* phrases set
   *  in the accent; `stats` are the same numbers split out. */
  | {
      kind: "results";
      title: string;
      stats: { value: string; label: string }[];
      summary: string;
      learningsTitle: string;
      /** What the project taught, as one short paragraph. (Was three
       *  titled maxims until 2026-11-10.) */
      reflection: string;
    }
  | { kind: "video"; src: string; poster: string; width: number; height: number; label: string }
  /** One project from a body of work, as the 2026 folio sets it: a title
   *  and a few paragraphs beside a grab-and-swipe set of screens, all on a
   *  rounded panel in the project's own colour (`color`, text in `ink`).
   *  The screens are exported with their framing and ground composed in,
   *  so they sit straight on the panel, scaled to fit, never cropped.
   *  `cta` links on to a longer write-up of the same project. */
  | {
      kind: "chapter";
      title: string;
      body: string[];
      color: string;
      ink: string;
      images: Img[];
      cta?: { label: string; href: string };
    };

export type CaseStudy = {
  slug: string;
  /** Short name, for the document title and links. */
  name: string;
  title: string;
  blocks: Block[];
};

const od = (file: string) => `/img/opendoor/${file}`;

export const opendoor: CaseStudy = {
  slug: "opendoor",
  name: "Opendoor",
  title: "Redesign of Opendoor’s seller experience",
  // Copy revised 2026-11-10 (Micah's editorial brief, for Staff Product
  // Designer reviewers): one story from the business change to the seller
  // needs, the design decisions and testing, the result and the outcomes.
  // Only claims Micah supplied or the screens themselves show. The
  // preliminary versus final offer distinction is the prelim screen's own
  // copy ("based on what we know about your house today", "a precise cash
  // offer after your assessment"); its progress list gives the step order.
  blocks: [
    {
      kind: "intro",
      paragraphs: [
        "Opendoor was adding ‘List with Opendoor’ alongside its cash offer. Sellers needed a clear way to compare the two options, understand their offer, and know what would happen next.",
        "I led the redesign of the seller experience with Product, Design, and Engineering, simplifying key pages and forms while updating the visual and interaction patterns used across the journey.",
      ],
      facts: [
        {
          label: "Objective",
          text: "Help sellers compare their options, understand pricing, and move forward with a clear next step.",
        },
        {
          label: "Role",
          text: "Led the experience redesign in partnership with Product, Design, and Engineering.",
        },
        {
          // The headline result, surfaced in the opening (brief, item 6);
          // the full set is in the outcomes at the end.
          label: "Outcome",
          text: "A 22% rise in sellers scheduling the first video call.",
        },
      ],
      image: { src: od("hero.jpg"), alt: "The redesigned final offer on a phone, held in a hand", width: 1330, height: 1600 },
    },
    { kind: "heading", title: "What sellers needed to understand", ruled: true },
    {
      kind: "split",
      image: { src: od("original-design.png"), alt: "The original preliminary offer screen on mobile", width: 796, height: 1760, look: "cutout" },
      // No caption: "Original design" is already set in the image, under the phone.
      imageSide: "left",
      size: "phone",
      notes: [
        {
          title: "Compare the selling options",
          body: "Selling directly to Opendoor and listing on the market trade speed against price in different ways. Sellers needed an easy way to weigh the two side by side.",
        },
        {
          title: "Understand the offer",
          body: "Sellers needed to see the offer, the range around it, and the factors that shaped it, including fees and condition adjustments.",
        },
        {
          title: "Know what happens next",
          body: "Selling takes several steps. Forms and navigation varied from page to page, especially on mobile, which made it hard to tell where you were and what to do next.",
        },
      ],
    },
    {
      kind: "figure",
      image: { src: od("journey-map.jpg"), alt: "Seller experience map: from listing or selling to Opendoor, through offers, video call and walkthrough, to closing", width: 2200, height: 1238 },
      caption: "The seller journey for both paths, from the first offer through the video call and walkthrough to closing.",
    },
    {
      kind: "heading",
      title: "Making the offer and next steps clearer",
      lede: "After onboarding, sellers arrive at the preliminary offer page. That offer is based on what Opendoor knows about the home so far; a precise cash offer follows the home assessment. The page has to explain the number and lead to the next step: scheduling a video call.",
    },
    {
      kind: "compare",
      before: { src: od("prelim-offer-v1.jpg"), alt: "The preliminary offer before, on mobile and desktop", width: 2000, height: 1125 },
      after: { src: od("prelim-offer-v2.jpg"), alt: "The preliminary offer redesigned in Novo, on mobile and desktop", width: 2000, height: 1125 },
      beforeLabel: "Before",
      afterLabel: "After",
      body: "We tested how to present the offer range and explored card layouts that made pricing recognizable as Opendoor. We simplified the page and its content, explained what happens next, and paired a prominent blue CTA with a progress indicator so sellers could understand where they were in the process and what to expect.",
    },
    {
      kind: "split",
      image: { src: od("compare-options.png"), alt: "Comparing selling options: Sell to Opendoor against List with Opendoor, side by side", width: 640, height: 1992, look: "cutout" },
      imageSide: "right",
      size: "phone",
      notes: [
        {
          title: "Comparing the two ways to sell",
          body: "Sell to Opendoor and List with Opendoor sit side by side, each with a one-line description, a ballpark price range, a timeline, and the number of showings. Sellers can weigh speed against price on one screen, with a full comparison chart a tap away and one button to schedule the video call.",
        },
      ],
    },
    {
      kind: "split",
      image: { src: od("forms.jpg"), alt: "A form step: “Which best applies to you?” with four options and a Next button", width: 789, height: 1774 },
      imageSide: "left",
      size: "phone",
      notes: [
        {
          title: "One form pattern",
          body: "Every form step shares one layout: a plain question, a line of context, large answer options, and a persistent ‘Next’ button in the same place on every step. Sellers learn the pattern once, on mobile and desktop.",
        },
      ],
    },
    {
      kind: "split",
      image: { src: od("next-steps.jpg"), alt: "Home details form, next step buttons and the progress list", width: 2000, height: 1477 },
      imageSide: "right",
      size: "half",
      notes: [
        {
          title: "One next step at a time",
          body: "Earlier flows branched in several directions. Now each stage ends in a single ‘Next step’ bar with one blue button, such as Schedule video call or Sign and close. A progress list runs from Request offer to Sign & Close and marks what’s up next, and forms show a progress bar above the back and Next buttons.",
        },
      ],
    },
    {
      kind: "split",
      image: { src: od("offer-breakdown.png"), alt: "Final offer breakdown: charges, adjustments, proceeds and costs outside of Opendoor", width: 640, height: 1362, look: "cutout" },
      imageSide: "left",
      size: "phone",
      notes: [
        {
          title: "Final offer breakdown",
          body: "The final offer lists each charge and adjustment with a plain explanation: the Simple Sale charge and condition adjustments, then the proceeds from Opendoor. Costs outside of Opendoor, such as title and escrow, are shown separately as fees paid to third parties.",
        },
      ],
    },
    {
      kind: "slideshow",
      label: "Novo design system",
      images: [
        { src: od("novo-1.jpg"), alt: "Novo design system, 1 of 6", width: 2000, height: 1125 },
        { src: od("novo-2.jpg"), alt: "Novo design system, 2 of 6", width: 2000, height: 1125 },
        { src: od("novo-3.jpg"), alt: "Novo in dark mode", width: 2000, height: 1125 },
        { src: od("novo-4.jpg"), alt: "Novo colour palette", width: 2000, height: 1125 },
        { src: od("novo-5.jpg"), alt: "Novo screen colour palette", width: 2000, height: 1125 },
        { src: od("novo-6.jpg"), alt: "Novo cards", width: 2000, height: 1125 },
      ],
      note: {
        title: "Extending the redesign across the design system",
        body: "The new visual style, Novo, was built on design tokens, so shared styles such as colour, type, and cards could be maintained and updated across the design system rather than screen by screen.",
      },
    },
    {
      // The three figures are the live page's: a 22% rise in sellers
      // scheduling the first video call, a 12% lift in final offers
      // received, closings 3 days faster on average. Keep their wording;
      // no measurement context is documented in this repo, so none is
      // given (questions for Micah are in the 2026-11-10 handoff).
      kind: "results",
      title: "Outcomes",
      stats: [
        { value: "22%", label: "rise in sellers scheduling the first video call" },
        { value: "12%", label: "lift in final offers received" },
        { value: "3 days", label: "faster to close, on average" },
      ],
      summary:
        "Video call scheduling rose *22%*, final offers received rose *12%*, and sellers closed *3 days sooner* on average.",
      learningsTitle: "What I learned",
      reflection:
        "The page needed to do two jobs: make the offer recognizable as Opendoor and make the process easy to understand. Layout, content, and navigation had to work together, with enough information to explain the offer without overwhelming the next step.",
    },
    // The final-offer video closed the live page; off for now (Micah,
    // 2026-11-08). To bring it back:
    // { kind: "video", src: od("final-offer.mp4"), poster: od("final-offer-poster.jpg"),
    //   width: 1280, height: 924, label: "The final offer, from the email to the offer page" },
  ],
};

// RentSpree (2026-11-10): the 2026 folio's four RentSpree chapters on one
// page, without the folio's Menu and overview and without its resume. The
// folio's deck sets each chapter on its own full screen in its own colour;
// stacked down one scrolling page those grounds would swing from light to
// dark and back, which breaks the one-lighting-mode rule. So each chapter
// is a rounded panel on the Night page instead, like the folio overview's
// cards opened up: the page stays dark, each project keeps its colour.
//
// Copy and screens are the folio's (2026folio-site/app/src/data/projects.ts
// and its assets/, copied to public/img/rentspree). Every screen is exported
// onto the same 786px canvas at 2x with its ground composed in; the
// Assistant's two taller ones are scaled to fit, not cropped.
//
// The applicant chapter links on to the long case study, a static page in
// public/project/applicant-experience (its own site at
// applicants.micahburger.com until 2026-11-11; that address redirects).
const rs = (file: string) => `/img/rentspree/${file}`;
const screen = (file: string, alt: string, height = 1450): Img => ({ src: rs(file), alt, width: 1572, height });

export const rentspree: CaseStudy = {
  slug: "rentspree",
  name: "RentSpree",
  title: "Recent product work at RentSpree",
  blocks: [
    {
      kind: "chapter",
      title: "Applicant experience",
      // Rewritten 2026-11-10 to set up the long read (its CTA below), which
      // shares this title: the same three problems, then the three changes,
      // in the order the long case study tells them.
      body: [
        "Applications carry most of RentSpree’s transactions and revenue, and most are filled out on a phone over several sittings. Applicants lost their place, found typos only after their credit and background reports came back, and couldn’t tell when the application had actually been sent.",
        "I restructured it into four predictable steps with an overview to return to, added a full review before anything goes to the credit bureau, and moved payment after that review, so paying no longer reads as finishing.",
        // Not an A/B test: the whole of 3.0 ships at once. Just the year
        // (Micah, 2026-11-11): the portfolio gives the high level, and
        // timing and results are for the conversation.
        "Version 3.0 launches in 2027.",
      ],
      color: "#FAF7F3",
      ink: "#141414",
      images: [
        screen("applicant-list.png", "Applications list on mobile"),
        screen("applicant-checklist.png", "Application checklist"),
        screen("applicant-pets.png", "Household details, pets"),
      ],
      cta: { label: "Read the full case study", href: "/project/applicant-experience/" },
    },
    {
      kind: "chapter",
      title: "Requesting an application",
      body: [
        "Agents often send the same screening package again and again, but the old flow made them repeat the same multi-step setup every time.",
        "I collapsed the common path to a few taps: choose the property, invite renters, done. The package stays preselected across properties, while deeper controls sit one tap behind “What’s included” for agents who need to customize or stage reports over time.",
        "Once requests are out, the applications view makes progress easy to scan, with clear states for each applicant and grouped households for co-applicants and guarantors.",
      ],
      color: "#F2E6FB",
      ink: "#141414",
      images: [
        screen("request-invite.png", "Invite your first applicant"),
        screen("request-included.png", "What’s included in the application package"),
        screen("request-applications.png", "Applications in progress"),
      ],
    },
    {
      kind: "chapter",
      title: "Messaging",
      body: [
        "RentSpree connects agents, landlords, and applicants, but the conversation lived in personal texts and email, disconnected from the property and application.",
        "I designed the messaging platform around that missing context: a responsive three-column hub where every conversation is tied to a property, its participants, and application activity. The foundation was built to support future milestones, templates, notifications, and automated workflows without redesigning the core experience.",
      ],
      color: "#222222",
      ink: "#F5F4F1",
      images: [
        screen("messaging-list.png", "Messages list"),
        screen("messaging-conversation.png", "Conversation hub on desktop"),
        screen("messaging-detail.png", "Messages on mobile"),
      ],
    },
    {
      kind: "chapter",
      title: "Rental Assistant",
      body: [
        "Screening an applicant or listing a property meant learning RentSpree’s navigation before getting anything done. I designed a conversational layer that lets agents start those jobs directly.",
        "The workflows themselves worked: 79% of people who started creating an ApplyLink finished one, while 514 reviewed conversations produced zero compliance failures. But adoption exposed a more interesting problem. After reviewing all 1,083 sessions, I found that more than half of users disappeared when we asked for a property address.",
        "The next iteration is in the works.",
      ],
      color: "#FFFFFF",
      ink: "#141414",
      images: [
        screen("assistant-welcome.png", "Assistant welcome", 1516),
        screen("assistant-conversation.png", "Assistant conversation", 1524),
        screen("assistant-address.png", "Assistant address search"),
      ],
    },
  ],
};

// Lincoln (2026-11-11): micahburger.com/project/lincoln on the Opendoor
// template. The live page's copy, tightened into Micah's voice: its
// duplicated desktop and mobile paragraphs are one now, and two things are
// gone, a pasted citation ("micahburger.com+1arcd.ku.edu+1") and a closing
// line about industry research that wasn't about this project. The A/B
// test's lift is stated in words, in the facts and the notes, with no
// results block: the portfolio stays high level and the numbers are for
// the interview (Micah, 2026-11-11).
//
// Images (public/img/lincoln), live page order:
//   hero.jpg            HalfTn-1.png           (live site)
//   devices.jpg         Lincoln13-CaseStudy    (ds-assets)
//   mobile-steps.jpg    Lincoln5-CaseStudy     (live site)
//   build-summary.jpg   Lincoln7-CaseStudy     (live site)
//   hover-guide.jpg     Lincoln9-CaseStudy     (live site)
//   pricing.jpg         Linc-right             (ds-assets)
//   models.jpg          Linc-left              (ds-assets)
//   nautilus.jpg        Lincoln14-CaseStudy    (ds-assets)
//   detail-page.jpg     Lincoln6-CaseStudy     (live site)
//   components.jpg      Lincoln3-CaseStudy     (live site)
//   style-guide.jpg     Lincoln1-CaseStudy     (live site)
// Lincoln10-12 and Lincoln-Gallery in ds-assets aren't on the live page.
const ln = (file: string) => `/img/lincoln/${file}`;
const wide = (src: string, alt: string): Img => ({ src, alt, width: 1920, height: 1080 });

export const lincoln: CaseStudy = {
  slug: "lincoln",
  name: "Lincoln",
  title: "Redesign of Lincoln’s Build and Price",
  blocks: [
    {
      kind: "intro",
      paragraphs: [
        "Lincoln.com needed a new way to introduce shoppers to Lincoln’s latest luxury lineup. At the center was Build and Price, one of the most visited parts of the site, where shoppers configure their own Lincoln and see what it costs.",
        "Working with a small digital team, I redesigned Build and Price as a responsive experience that made pricing and the essentials easy to follow, with customizing the car as the hero.",
      ],
      facts: [
        { label: "Objective", text: "Make building and pricing a Lincoln simple on any screen, and as considered as the brand." },
        { label: "Role", text: "Art direction and product design, shared with Natalie Cho." },
        {
          label: "Team",
          text: "Natalie Cho (art direction, product design), Paul Mathisen (product design), Hassan Karimi (user experience), Heather Tafel (project management).",
        },
        {
          // The live page's claim, without numbers; see the note above.
          label: "Outcome",
          text: "In A/B testing against the legacy experience, engagement and vehicle purchase rates rose.",
        },
      ],
      image: {
        src: ln("hero.jpg"),
        alt: "Build and Price on a phone, its step menu open, over a Lincoln on a mountain road",
        width: 854,
        height: 1080,
      },
    },
    {
      kind: "figure",
      image: wide(ln("devices.jpg"), "Build and Price on a laptop and a phone: choosing the exterior paint for a 2017 Lincoln MKZ"),
      caption: "Build and Price on desktop and mobile.",
    },
    {
      kind: "heading",
      title: "What buyers needed",
      lede: "We ran several rounds of user testing to understand what motivates a buyer. Three needs came up.",
      ruled: true,
    },
    {
      kind: "split",
      image: {
        src: ln("pricing.jpg"),
        alt: "Payment summary for a 2017 Lincoln MKZ Premiere: base MSRP, options, destination charges, incentives, net price and monthly payment",
        width: 854,
        height: 1080,
      },
      imageSide: "left",
      size: "phone",
      notes: [
        {
          title: "Clear pricing",
          body: "Buyers wanted a cost structure they could see through: what the car costs, what each option adds, and what that means each month.",
        },
        {
          title: "Features of their choosing",
          body: "Buyers valued being able to add the specific features they wanted to their car.",
        },
        {
          title: "Delivery to their door",
          body: "Once the car was built, buyers wanted the option to schedule delivery to their home.",
        },
      ],
    },
    {
      kind: "split",
      image: {
        src: ln("models.jpg"),
        alt: "Choosing a model on desktop: Premiere, Select, Reserve and Black Label, each with its price and fuel economy",
        width: 854,
        height: 926,
      },
      imageSide: "right",
      size: "phone",
      notes: [
        {
          title: "Designed around those three",
          body: "The redesign took on each point of friction: pricing laid out line by line, a clear choice at every step, and delivery at home as part of the journey. In A/B testing against the legacy experience, it raised engagement and vehicle purchase rates.",
        },
      ],
    },
    {
      kind: "heading",
      title: "Start on the web, finish on a phone",
      lede: "The new Build and Price worked across devices, so a shopper could start a build on the web and carry on with it on mobile.",
    },
    {
      kind: "figure",
      image: wide(ln("mobile-steps.jpg"), "Three mobile screens: the model, the step menu open, and the payment summary"),
      caption: "On mobile, a progressive dropdown moves between the steps, so shoppers can go back to add or edit a feature, or change the model, at any point.",
    },
    {
      kind: "figure",
      image: wide(ln("build-summary.jpg"), "Exterior accessories and the build summary on a laptop, with fuel type and model on a phone"),
      caption: "Accessories and the build summary on desktop, and the same build on a phone.",
    },
    {
      kind: "heading",
      title: "A style guide built for accessibility",
      lede: "A core part of the work was a comprehensive, accessibility-focused style guide, which we turned into a component library for the key screens and the detail pages.",
      ruled: true,
    },
    {
      kind: "slideshow",
      label: "Lincoln style guide and components",
      images: [
        wide(ln("style-guide.jpg"), "Style guide: type, icons, buttons and the colour palette"),
        wide(ln("components.jpg"), "Type sizes to the AA standard, and the component library"),
        wide(ln("hover-guide.jpg"), "Hover style guide for the model, trim and accessory selectors"),
        wide(ln("nautilus.jpg"), "Introducing the 2019 Lincoln Nautilus, a detail page built from the library"),
        wide(ln("detail-page.jpg"), "A detail page with a video header: Let Anticipation Give Way to Elation"),
      ],
      note: {
        title: "An interactive guide",
        body: "I led a junior designer in making the guide interactive, with its animations, hover states and transitions. We worked with marketing, art directors and copywriters to plan a cohesive launch.",
      },
    },
  ],
};

// Infinity (2026-11-11): micahburger.com/project/infinity on the Opendoor
// template, the live copy tightened the same way as Lincoln's. No results
// block, for the same reason as Lincoln's.
//
// Images (public/img/infinity), live page order:
//   hero.jpg            Infinity-skinny2       (live site)
//   schedule.jpg        Infinity-Therm-2       (live site)
//   controller.jpg      Infinity-Therm-3       (live site)
//   onboarding.jpg      Infinity-Therm-4       (live site)
//   auto-mode.gif       Infinity-Auto-Mode     (live site)
//   heat-mode.gif       Infinity-Heat          (live site)
//   in-home.jpg         Infinity-Therm-10      (live site)
//   mode-menu.jpg       Infinity-skinny1       (live site)
//   cooling-mode.gif    Infinity-Cooling-Mode  (live site)
//   modes.gif           Infinity-modes         (live site)
//   style-light.jpg     Infinity-Therm-8       (live site)
//   style-dark.jpg      Infinity-Therm-9       (ds-assets)
//   wall-light.jpg      Infinity-Therm-5       (live site)
//   wall-dark.jpg       Infinity-Therm-6       (live site)
// The GIFs are copied as they are (375x667, looping); each *-still.jpg is
// its first frame, for reduced motion.
const inf = (file: string) => `/img/infinity/${file}`;
const recording = (name: string, alt: string): Img => ({
  src: inf(`${name}.gif`),
  still: inf(`${name}-still.jpg`),
  alt,
  width: 375,
  height: 667,
});

export const infinity: CaseStudy = {
  slug: "infinity",
  name: "Infinity",
  title: "Redesign of Carrier’s Infinity thermostat and app",
  blocks: [
    {
      kind: "intro",
      paragraphs: [
        "Carrier Residential needed a homeowner app and wall controller for Infinity, its premium smart home system. Both were dated, and Carrier wanted to compete in the smart home market.",
        "I led the creative team that redesigned the app and the wall controller together, so homeowners could easily install, monitor and manage their system and their energy use.",
      ],
      facts: [
        { label: "Objective", text: "Modernize the app and wall controller, and put Carrier in a competitive position in the smart home market." },
        { label: "Role", text: "Led the creative team: art direction, product design and research." },
        {
          label: "Team",
          text: "Jill Haefele (interaction design, strategy, research), Tae Yang (product design, prototyping), Ana Lopez (product design), with Lisa Mitchell, Madeline Winer, Mary Rockwell, Anya Palkowski and Dan Levine.",
        },
      ],
      image: {
        src: inf("hero.jpg"),
        alt: "The app’s main screen cooling to 75°, over a photo of a father lifting his child at home",
        width: 854,
        height: 1080,
      },
    },
    {
      kind: "slideshow",
      label: "Infinity app and wall controller",
      images: [
        wide(inf("schedule.jpg"), "Setting a weekly schedule and comfort profiles in the app"),
        wide(inf("controller.jpg"), "Three wall controller screens"),
        wide(inf("onboarding.jpg"), "The app’s welcome screen and comfort settings"),
      ],
    },
    {
      kind: "heading",
      title: "Learning what homeowners valued",
      lede: "In discovery I studied the interaction patterns thermostats already used, from dials to sliders, and we interviewed homeowners about the features they valued most in a digital climate control. We then walked people through key tasks in prototypes, refining the design over several rounds of testing.",
      ruled: true,
    },
    {
      kind: "pair",
      size: "phone",
      images: [
        recording("auto-mode", "Prototype of the main screen in auto mode"),
        recording("heat-mode", "Prototype of the main screen in heat mode"),
      ],
      caption: "Prototypes of the main screen, in auto and heat modes.",
    },
    {
      kind: "figure",
      image: wide(inf("in-home.jpg"), "The wall controller heating to 80° beside the app’s home screen, in a kitchen"),
      caption: "The wall controller and the app, designed as one.",
    },
    {
      kind: "heading",
      title: "One experience, on the wall and the phone",
    },
    {
      // The section's own paragraph is the first note rather than a lede
      // (Micah, 2026-11-11: the spacing looked off). With one short note
      // beside a phone, the notes column was a few lines floating in the
      // middle of an empty column; two notes fill it and sit level with the
      // picture, and the heading leads straight into them.
      kind: "split",
      image: {
        src: inf("mode-menu.jpg"),
        alt: "The mode menu sliding up over the main screen: cool, heat, auto, fan and off",
        width: 854,
        height: 1080,
      },
      imageSide: "left",
      size: "phone",
      notes: [
        {
          title: "One design language",
          body: "To simplify flows and onboarding, we brought the wall controller and the iOS app under one design language for interactions, visuals and navigation, across every journey.",
        },
        {
          title: "Menus as cards",
          body: "To keep homeowners on the main controller screen, menus are cards that slide in over it with a subtle micro-interaction.",
        },
      ],
    },
    {
      kind: "pair",
      size: "phone",
      images: [
        recording("cooling-mode", "The main screen in cooling mode"),
        recording("modes", "Switching modes from the main screen"),
      ],
      caption: "Cooling mode, and switching modes, on the main screen.",
    },
    {
      kind: "heading",
      title: "Documented for engineering",
      lede: "I made sure the team produced clear, concise documentation: a style guide, component and interaction libraries, prototypes and feature flows, to set engineering and QA up for success.",
      ruled: true,
    },
    {
      kind: "pair",
      size: "half",
      images: [
        wide(inf("style-light.jpg"), "Style guide in light mode: type, UI elements, icons and colours"),
        wide(inf("style-dark.jpg"), "Style guide in dark mode: type, UI elements, icons and colours"),
      ],
      caption: "The style guide, in light and dark.",
    },
    {
      kind: "heading",
      title: "Light and dark",
      lede: "We also designed light and dark modes, there for function, but also to give Infinity a premium feel and bring a little elegance into the home.",
    },
    {
      kind: "compare",
      before: wide(inf("wall-light.jpg"), "The wall controller and the app in light mode, in a living room"),
      after: wide(inf("wall-dark.jpg"), "The wall controller and the app in dark mode, in the same room"),
      beforeLabel: "Light",
      afterLabel: "Dark",
    },
  ],
};

export const caseStudies: CaseStudy[] = [opendoor, rentspree, lincoln, infinity];

/** The case study a path like /project/opendoor (or /project/opendoor/)
 *  asks for, or undefined for any other path. */
export function caseStudyFor(pathname: string): CaseStudy | undefined {
  const match = pathname.match(/^\/project\/([^/]+)\/?$/);
  return match ? caseStudies.find((study) => study.slug === match[1]) : undefined;
}
