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
//   final-offer.mp4        final offer video.mp4
//   final-offer-poster.jpg a frame of it (Quick Look)
// JPEGs re-saved at quality 82, at most 2000px on the long side; the PNGs
// are cut out on transparency and are copied as they are.

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
  /** The same screen before and after, wiped between with a handle. */
  | { kind: "compare"; before: Img; after: Img; beforeLabel: string; afterLabel: string; body?: string }
  /** A grab-and-swipe set of images with a note under it. */
  | { kind: "slideshow"; label: string; images: Img[]; note?: Note }
  /** Notes in columns, the note's body set large (learnings). */
  | { kind: "takeaways"; notes: Note[] }
  /** Outcome statements, large, with *starred* phrases set in the accent. */
  | { kind: "outcomes"; items: { label: string; text: string }[] }
  | { kind: "video"; src: string; poster: string; width: number; height: number; label: string };

export type CaseStudy = {
  slug: string;
  /** Short name, for the document title and links. */
  name: string;
  title: string;
  /** Which colour-shift stage each block starts (block index -> stage),
   *  so a case study darkens through its sections the way the homepage
   *  does. Blocks before the first entry are stage 0. */
  stages: Record<number, number>;
  blocks: Block[];
};

const od = (file: string) => `/img/opendoor/${file}`;

export const opendoor: CaseStudy = {
  slug: "opendoor",
  name: "Opendoor",
  title: "Redesign of Opendoor’s seller experience",
  // The three section headings: pain points, enhancements, learnings.
  stages: { 1: 1, 4: 2, 11: 3 },
  blocks: [
    {
      kind: "intro",
      paragraphs: [
        "Opendoor aimed to simplify home selling, but the addition of ‘List with Opendoor’ created a new challenge: how to seamlessly integrate these distinct pathways.",
        "I led the redesign of the seller experience, working across teams to unify the flow from offer to closing while also refreshing Opendoor’s visual and interaction design standards. This project set the foundation for a more cohesive design that would scale with the platform’s evolving needs.",
      ],
      facts: [
        {
          label: "Objective",
          text: "To create a cohesive, flexible experience for home sellers, integrating the option to list on the market with Opendoor’s cash offer.",
        },
        {
          label: "Role",
          text: "Led the redesign and managed cross-functional collaboration across Product, Design, and Engineering.",
        },
      ],
      image: { src: od("hero.jpg"), alt: "The redesigned final offer on a phone, held in a hand", width: 1330, height: 1600 },
    },
    { kind: "heading", title: "Key pain points & customer insights", ruled: true },
    {
      kind: "split",
      image: { src: od("original-design.png"), alt: "The original preliminary offer screen on mobile", width: 796, height: 1760, look: "cutout" },
      // No caption: "Original design" is already set in the image, under the phone.
      imageSide: "left",
      size: "phone",
      notes: [
        {
          title: "Limited price transparency",
          body: "Sellers often lacked a clear understanding of their home’s value and how Opendoor’s offer compared to other market options. Without easy-to-access price comparisons, users felt uncertain about the fairness and value of the offer.",
        },
        {
          title: "Rigid experience for diverse seller needs",
          body: "Sellers have different motivations, such as needing to sell quickly or waiting for a favorable market, but the experience did not accommodate these varying preferences. Without flexibility, the platform felt one-size-fits-all and missed an opportunity to personalize the journey.",
        },
        {
          title: "Unclear differentiation of Opendoor’s benefits",
          body: "Users struggled to see how Opendoor’s unique advantages, such as a faster, simpler selling process, set it apart from traditional real estate options. This lack of clarity made it difficult for sellers to fully appreciate the value Opendoor could provide.",
        },
        {
          title: "Inconsistent and disjointed navigation",
          body: "Prior form designs and navigation lacked standardization, leading to a fragmented experience that could increase user frustration and abandonment rates. This issue was particularly problematic on mobile, where ease of use is critical.",
        },
      ],
    },
    {
      kind: "figure",
      image: { src: od("journey-map.jpg"), alt: "Seller experience map: from listing or selling to Opendoor, through offers, video call and walkthrough, to closing", width: 2200, height: 1238 },
    },
    {
      kind: "heading",
      title: "Enhancements to the user journey",
      lede: "To address these issues, we focused on enhancing clarity, personalization, and consistency.",
    },
    {
      kind: "compare",
      before: { src: od("prelim-offer-v1.jpg"), alt: "The preliminary offer before, on mobile and desktop", width: 2000, height: 1125 },
      after: { src: od("prelim-offer-v2.jpg"), alt: "The preliminary offer redesigned in Novo, on mobile and desktop", width: 2000, height: 1125 },
      beforeLabel: "Before",
      afterLabel: "After",
      body: "After onboarding, customers arrive at the preliminary offer page, designed to guide them toward the next step: scheduling a video call. Through iterative user testing, this page evolved into a clear and engaging experience, communicating three critical points: the preliminary offer price, the key factors influencing the offer, and the next steps in the process. This redesign ensures customers feel informed, confident, and empowered to proceed toward closing on their home.",
    },
    {
      kind: "split",
      image: { src: od("compare-options.png"), alt: "Comparing selling options: Sell to Opendoor against List with Opendoor, side by side", width: 640, height: 1992, look: "cutout" },
      imageSide: "right",
      size: "phone",
      notes: [
        {
          title: "Price Comparison Tool",
          body: "We introduced a side-by-side price comparison feature, allowing sellers to easily understand how Opendoor’s offer compares to other options, building transparency and trust.",
        },
        {
          title: "Enhanced Messaging",
          body: "Clear, targeted messaging highlighted Opendoor’s unique value proposition as a streamlined alternative to traditional real estate.",
        },
      ],
    },
    {
      kind: "split",
      image: { src: od("forms.jpg"), alt: "A form step: “Which best applies to you?” with four options and a Next button", width: 789, height: 1774 },
      imageSide: "left",
      size: "phone",
      notes: [
        { title: "Personalized Selling Options", body: "Added options for flexible closing and move dates." },
        {
          title: "Standardized Forms & Navigation",
          body: "Redesigned forms with consistent layouts and locked “Next” CTAs simplified the user flow, reducing friction and abandonment.",
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
          title: "Understanding customer journeys",
          body: "Enhanced backend integration with frontend forms provided greater insight into where customers were in their journey, helping us anticipate and meet their needs.",
        },
        {
          title: "Clear path to completion",
          body: "Previously, multi-path flows created confusion. The new flow prioritized a prominent, locked “Next Step” CTA, making it clear what users needed to do to progress.",
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
          title: "Transparent offer breakdown",
          body: "We added a detailed “What Went Into Your Offer” section, providing users transparency into our pricing and fee structure to increase confidence in the Opendoor offer.",
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
        title: "Tokenized art direction",
        body: "The new visual style (named Novo) was tokenized, allowing for easy updates across the design system, making it efficient for teams to maintain consistency in future iterations.",
      },
    },
    { kind: "heading", title: "Learnings and outcomes", ruled: true },
    {
      kind: "takeaways",
      notes: [
        {
          title: "Confidence Through Clarity",
          body: "Consistent forms, intuitive design, and user-tested content created a seamless flow, empowering sellers to progress confidently with clear and actionable next steps.",
        },
        {
          title: "Empathy for User Needs",
          body: "Building flexibility into the platform allowed users to have options to sell their home, leading to reduced frustration and a sense of support throughout the home-selling journey.",
        },
        {
          title: "The Power of Transparency",
          body: "Providing clear, upfront details about pricing and comparisons fostered trust, empowering users to feel confident in their choices and reinforcing Opendoor’s value.",
        },
      ],
    },
    {
      kind: "outcomes",
      items: [
        {
          label: "Business impact",
          text: "Increased customer engagement, with a *22% rise in initial video call scheduling* and a *12% lift in final offers received*.",
        },
        {
          label: "Customer impact",
          text: "Faster closings, with the average process *shortened by 3 days*, reducing stress and improving the overall customer experience.",
        },
      ],
    },
    {
      kind: "video",
      src: od("final-offer.mp4"),
      poster: od("final-offer-poster.jpg"),
      width: 1280,
      height: 924,
      label: "The final offer, from the email to the offer page",
    },
  ],
};

export const caseStudies: CaseStudy[] = [opendoor];

/** The case study a path like /project/opendoor (or /project/opendoor/)
 *  asks for, or undefined for any other path. */
export function caseStudyFor(pathname: string): CaseStudy | undefined {
  const match = pathname.match(/^\/project\/([^/]+)\/?$/);
  return match ? caseStudies.find((study) => study.slug === match[1]) : undefined;
}
