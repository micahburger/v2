# micahburger.com v2

A rebuild of Micah Lindenberger's homepage (micahburger.com, currently on
Semplice/WordPress), meant to become the hub that links to every case study
and prototype: Corner Bodega, the rental application case study, Lattice,
the 2026 mini portfolio, plus the older case studies still on the live site.

Live at **https://v2.micahburger.com** (Hostinger, set up 2026-11-06).
Repo: github.com/micahburger/v2. hPanel's Git deploy pulls `main` into
`public_html` on every push.

Vite + React 18 + TypeScript, same setup as `../2026folio-site`.

## Deploy — same as the folio

Hostinger auto-deploys `main`, serving the repo root. Root `index.html` and
`assets/` are committed build output; source is in `app/`.

```sh
./deploy.sh   # builds app/ and copies app/dist/. to the repo root
```

Never commit an `app/` change without the rebuilt root output. Pushing
`main` is what deploys.

## Running it

```sh
npm --prefix app install
npm --prefix app run dev     # localhost:4178 (4176 is the folio)
npm --prefix app run build   # tsc -b && vite build, the only gate
```

## Where it stands

The page is a faithful rebuild of the live Semplice homepage (measured off
micahburger.com at 1279px: 12-col grid, 30px gutters, Poppins in #443736 on
#F5F1EB, teal #5A98B1 links), in the live order: hero, Select Clients, Work
History, Featured Projects, contact, footer. There is no header bar and no
hero image: the page opens on the statement, set large, with "Micah
Lindenberger" above it as an eyebrow (the page's h1, in Satoshi).

Image sources are listed at the top of `app/src/data/site.ts`. Most came
from `~/Desktop/ds-assets`; Lattice's from `../prtfolio images`.

## The lab

The "Lab" pill (bottom-left; bottom-right on phones) switches takes. The
choice lives only in the query string, e.g. `/?quilt=flap&history=timeline`;
a plain link gets the defaults.

| Section | Takes (default first) | File |
|---|---|---|
| Colour | clay, paper, graphite, forest | palette blocks at the top of `global.css` |
| Shift | dusk, off, saturate, drift | "section shift" in `global.css`, `useSectionStage` in `App.tsx` |
| Clients | marquee, quilt | `components/ClientQuilt.tsx` |
| History | resume, timeline, logo | `components/WorkHistory.tsx` |

Settled and out of the lab: the footer is the **sign-off** (three quiet
columns, then "Ciao." set enormous); Classic, Index and Card were cut on
2026-11-07, as were the Fill and Focus history takes. The client quilt's
build-in is the **wave**; the quilt is back in the lab against **Marquee**
(2026-11-07), every logo in one full-bleed row drifting right to left on a
loop (5s per tile, paused under the pointer and off screen, still under
reduced motion). The quilt image doesn't centre its logos vertically (top
row ~62%, middle 50%, bottom 40%), so the marquee shifts each slice by
`ROW_SHIFT` to keep the belt level.
Tiles are either a slice of `logoquilt2024.png` (the live site's single
image, cut with background-position) or their own logo file in the same
box, flattened to one colour by `--logo-filter`. `clients` in
`data/site.ts` sets the order (four to a row, last row centred). RentSpree
and Carrier were added as files; `carrier.svg` is a one-colour rebuild of
the Commons logo with the script cut out of the oval by a mask.

Shift: the page is split into stages by `data-stage` (0 intro + clients,
1 work history, 2 featured, 3 contact + footer). A scroll listener writes
the stage to `<html data-stage>`; CSS derives `--page` from the palette's
`--paper` with relative OKLCH colour, a small fixed step per stage.
Drift turns the hue at constant lightness; Dusk darkens, enriches and
turns toward red-violet (a sunset that stays in one lighting mode).

**The rule (Micah, 2026-11-07): a shift never changes the lighting mode.**
Light palettes stay light enough for dark text, dark ones dark enough for
light text, from top to bottom. Enforced by `--l-min` / `--l-max`, an
OKLCH lightness window per palette that every shift is clamped into
(light: 0.80 to 1, dark: 0.14 to 0.42). A bolder try that swept light to
dark per section (Sunset / Dawn / Canopy) broke this and was removed.

The contact sentence's links use `--link-strong` (further from the page
than `--link`), a faint resting underline, and a 2px underline that draws
in on hover.

Timeline is one colour: faint bars, and the hovered job's bar in the text
colour (no per-company brand colours). Hovering a row lightens it to 50%;
nothing else dims. The ruler runs from the first job's start to this month, so the
first bar lines up with the section title and the last with the content
edge. Section titles are 22px (the live site's are 18px).

Featured rows settled on **Corner** (2026-11-07): only the project's name
is a link in the paragraph, underlined with `.u-line` (the contact
sentence's faint 1px line, 2px drawing in on hover; the Archive's inline
links use it too), and a round arrow sits on the media's bottom-right
corner. It beat the whole paragraph as a link with an arrow under it
(three clickable things per row) and an underline-only version.

Defaults (2026-11-07): Clay, Dusk, Marquee, Resume. Each lab list leads
with its default (`readLab` takes the first), and `app/index.html` puts
`data-palette="clay" data-shift="dusk"` on `<html>` so the first paint is
already Clay. The
name is set apart by weight, not link colour. A fixed back-to-top button
(`BackToTop.tsx`) sits bottom-right and grows on hover; footers keep
`--clear-to-top` of space under their last line so it never covers text.

Small round buttons have **no outlines or strokes** (Micah): just a
`--chip` fill, white on light palettes and a lighter tint of `--page` on
dark ones.

Featured order: RentSpree (was the 2026 folio row; since 2026-11-10 it
opens `/project/rentspree` here), Applicant experience (was "Rental
application"; renamed 2026-11-10 to match its page), Lattice, Opendoor,
Lincoln, Infinity, then an Archive row grouping WWE, BBC, ABA and Rockwell
(a placeholder until they get a proper home). Featured links to other
sites open in a new tab, so the homepage stays open as the hub; case
studies built here open in place. Corner Bodega is parked in
`parked` in `data/site.ts`.

"Resume" is the 2026 folio's resume rows (`ResumeLayout.tsx` there),
brought over on 2026-11-07 as a first step toward the two sites feeling
like one family: the folio's rounded logo tiles (copied into
`public/img/workhistory`), set in Poppins rather than the folio's Proxima
Nova. Each row is tile | role over "company · city" | dates on the right
edge; the first try stacked four lines in the folio's order and Micah
found it cluttered. The list starts at column 6, sharing the featured
media's edge. Hanson's tile is its "h." mark from hansoninc.com and Tip
or Skip's (a split coin) was made up; both are white on black SVGs to
match Hudson Rouge and Code & Theory. With Resume picked, Featured opens
with the same hairline as Work History (`:has()` on the section).

"Logo" (Micah's ask): hovering a job floats that company's logo, flattened
to black by CSS, on a white card beside the pointer. Every row links to the
company's site in a new tab.

Palettes are sets of CSS custom properties under `:root[data-palette=…]`;
`main.tsx` sets the attribute before first render so a palette link doesn't
fade in from cream. Paper is the live site; the others exist because light
screens (Corner Bodega, the folio) disappear into the cream page. Client
logos follow the palette through `--logo-filter` (black, or white on dark
palettes). Quilt slices come from `logoquilt2024-alpha.png`, the live
image with its cream ground made transparent by
`app/scripts/quilt-alpha.mjs` (`node app/scripts/quilt-alpha.mjs in.png
out.png`). Don't go back to hiding the cream with mix-blend-mode: a blend
stops at its stacking context, so inside the masked, animated marquee the
logos showed cream boxes on every coloured palette.

Featured media is the folio's grab-and-swipe carousel (`carousel.ts`, a
port of 2026folio's `useMediaGallery`): autoplay every 4.2s while the row
is on screen, slow 700ms drift, quick 400ms settle after a throw. A press
that turns into a drag swallows the click, so the media can still link to
the project. A two-image set is doubled so the loop has a slide past both
edges. There is no pause on hover; autoplay stops only in hand, off
screen (under half visible) or with reduced motion.

Dots are one component for every carousel (`CarouselDots.tsx`). The
active dot is a 24px pill that fills left to right over the 4.2s dwell
(Micah, 2026-11-11), so a big still slide reads as "this moves, and soon";
he'd taken the case study slideshows for paused under his pointer. Picked
over peeking the next slide and a quicker first advance. The fill's
duration comes from `CAROUSEL_AUTOPLAY_MS` (no CSS mirror); it restarts
on the same changes that re-arm the timer, via `playing` from
`useCarousel`. A hidden Browser pane renders no frames, so nothing there
counts as on screen and no carousel autoplays: test with the pane showing.

The first round of featured carousels (Wash, Strips, Stack) was too much
and is parked in `app/_archive/`, outside the build.

## Case studies

`/project/<slug>` renders a case study instead of the homepage (`main.tsx`
reads the path once; moving between pages is a plain page load, and
`.htaccess` already sends every unknown path to `index.html`). The path is
the live site's own, so old `micahburger.com/project/…` links keep working
once v2 replaces it.

- Content: `app/src/data/caseStudies.ts`, one `CaseStudy` per project, made
  of typed blocks (intro, heading, split, figure, pair, compare, slideshow,
  results, video, chapter). A new case study is new data, not new
  components. `stages` marks which blocks start each scroll-shift stage.
- Rendering: `components/CaseStudy.tsx`, with `BeforeAfter.tsx` (the wipe)
  and `Slideshow.tsx` (the homepage carousel without the link). Styles are
  the `case study` block in `global.css`.
- Images: `app/public/img/<slug>/`, sources listed at the top of
  `caseStudies.ts` (Opendoor's came from `~/Desktop/ds-assets`). Screens on a
  dark ground get the rounded frame; transparent phone PNGs are `look:
  "cutout"`.
- A featured row whose `href` starts with `/` opens in the same tab and
  carries the lab query string along (`linkTo` in FeaturedProjects.tsx);
  every other project link still opens a new tab.
- Always on the Night palette (#161417, the ground the Opendoor screens
  were exported on) with the shift off, whatever the homepage's lab says
  (the Archive is the exception: it follows the palette):
  set before first paint in `app/index.html`, then in `main.tsx`. Framed
  images then have no visible edge.
- The case study lab shows only its own rows (`CASE_LAB` in `lab.ts`):
  Outcomes, three takes on the closing numbers and learnings (Stats,
  Ledger, Statement). The homepage shows `HOME_LAB`.
- Opendoor (2026-11-08) is the first and the template: a first pass at the
  live page's structure and copy on v2's grid, type and palettes, to be
  shifted toward the v2 look next. The archive projects (WWE, BBC, ABA,
  Rockwell) still link to the live site.
- Lincoln and Infinity (`/project/lincoln`, `/project/infinity`,
  2026-11-11): the live pages on the Opendoor template, copy tightened,
  homepage rows opening them in place. They added one block, `pair` (two
  images side by side: phones at three columns each, or two wide halves),
  and `Img.still`, a first-frame JPEG that replaces an animated GIF under
  reduced motion (Infinity's four screen recordings). Only five of their
  images were in ds-assets; the rest were downloaded from the live site's
  wp-content/uploads. Neither has a results block, on purpose (Lincoln
  states its A/B lift in words).
- **High level, no numbers needed** (Micah, 2026-11-11): the portfolio
  gives the shape of each project; dates, metrics and results are for the
  interview. Don't ask for outcome figures or add results blocks to fill a
  gap. Release timing is a year at most: RentSpree's 3.0 "launches in
  2027" (it's a full rollout, not an A/B test), here and on the applicant
  experience page.
- RentSpree (`/project/rentspree`, 2026-11-10): the 2026 folio's four
  RentSpree chapters (no Menu, no overview, no resume) as `chapter`
  blocks, each a rounded panel in the project's colour on the Night page.
  Panels rather than full-bleed grounds because stacked down one page the
  folio's light and dark chapters would break the lighting-mode rule.
  Screens copied from the folio into `public/img/rentspree`. The
  applicant chapter's CTA leads to the applicant experience page. The
  Outcomes lab pill only shows on studies with a results block.
- **Applicant experience** (`/project/applicant-experience/`, moved in
  2026-11-11): the long RentSpree case study, which was its own static site
  at applicants.micahburger.com (`../applicants-site`, repo
  micahburger/Applicants). It came over **as files, not as React**: the
  site's HTML, CSS, JS and images, byte for byte, in
  `app/public/project/applicant-experience/`, served as they are. Its links
  are all relative, so the trailing slash matters (Apache and the dev
  plugin in `vite.config.ts` both redirect to it). The only edit was Back
  to home: `/` plus an inline script that leaves homeScroll's return note.
  Its subpages `screens/` and `styleguide/` came too. The old subdomain
  301s here (applicants-site's .htaccess); that repo is retired, so make
  changes here. It has its own CSS and doesn't share global.css.
- **One case study system** (Micah, 2026-11-10): type, spacing and corners
  are `--cs-*` / `--radius-media|card|phone` tokens in `:root` (phone values
  in the 900px block), used by every case study rule and the homepage media.
  The applicant experience page's own `css/styles.css` declares the same
  names and values and maps Night's colours into its `--page-*` tokens;
  it's Poppins 400/500 throughout (its RentSpree `.product` screens keep
  Newsreader and Manrope). Change a value in one, change it in the other.
- The Back pill (it read "Back to home" until 2026-11-11) is **locked on scroll** on every case study (Micah,
  2026-11-10): `.cs-bar` is a sticky bar outside the header (sticky only
  holds inside its parent), resting 180px down and holding 24px from the
  top (112 / 16 on phones). The applicant experience page mirrors it, and
  its title, number for number in its `css/styles.css` (`.cs-bar`,
  `.cs-hero`); change one, change both.
- Back to home **returns you to your place** on the homepage (Micah,
  2026-11-10), via `homeScroll.ts`: the homepage saves its scroll to
  sessionStorage as it's left, the pill (plain click only) leaves a
  one-time note, and the homepage restores before first paint, retrying
  after fonts and load until the visitor moves. Reloads and fresh visits
  still open at the top. The applicant experience page does it too, by
  hand (an inline script with the same sessionStorage key), now that it's
  on the same origin; it couldn't while it was its own subdomain.
- **Archive** (`/project/archive`, 2026-11-11): WWE, BBC, Rockwell, ABA and
  FPO (Collins Aerospace), retired as standalone pages, kept as previews.
  Carrier/Infinity and Lincoln stay full case studies and aren't in it.
  - Content lives in `data/archive-data.json` alone (typed by
    `data/archive.ts`, which also lists image sources and picks). Summarize,
    don't retell; anything the source doesn't say is `[TBD]`, shown as is.
    Years are Micah's (none of the old pages gave one); projects run newest
    first. Only FPO shows an Outcome (WWE's and ABA's were cut); no team
    credits anywhere on the site (cut 2026-11-11).
  - **One layout: the long read** (`ArchiveScroll.tsx`). Index, Titles and
    Panels were tried as `?layout=` lab options the same day and removed
    when Micah chose Scroll; an old `?layout=` link still opens the page
    (the lab drops the param). A chapter per project: a ruled meta row
    (client, project, year, role) and "What I designed" columns from Code
    and Theory's TIME/Thomson Reuters pages, a contents list on NZero's
    ruled lines, and negeurra.com's caption sticking beside stacked
    screens. Native scrolling, no smoothing library. No chapter numbers
    shown; the bottom-centre `ChapterSkipper.tsx` (after the ds section
    pill) counts and jumps. A screen opens `Lightbox.tsx`, which is just
    the screen and closes with one click anywhere.
  - `holdAnchor.ts` re-lands a #slug after fonts and load (text re-wraps
    above it) until the visitor moves.
  - **Colour:** the Archive's lab row is Colour only; it follows the
    homepage's palette (carried in on `?palette=`, Clay when absent), set
    before first paint in `app/index.html` and synced in `ArchivePage`.
    The case studies stay on Night. Archive styles use palette tokens only.
  - Type is set once as `--ax-*` tokens on `.ax` (body 14, small 13,
    labels 12, statements 18), Micah's "too large" note.
  - The frame is `CaseShell.tsx`, shared with every case study: bar, title,
    footer. Its pill reads **"Back"** (aria-label "Back to home"), here and
    on the applicant experience page.
  - Images: `public/img/archive/<slug>/<name>.webp` (1600px), from the old
    site's uploads (not hotlinked).
  - The old `/project/{wwe,bbc,rockwell,aba,fpo}` paths 301 to
    `/project/archive#<slug>` (.htaccess), for when this site becomes
    micahburger.com.
  - Testing note: a hidden Browser pane renders no frames, so smooth
    scroll, the reveal and anything waiting on requestAnimationFrame stall
    there. Show the pane, or force frames with screenshots.

## Placeholders still in

- Rental application, 2026 folio and Corner Bodega media are screenshots
  of those live sites; swap for real exports. `bodega-3` and `folio-4`
  caught a mouse pointer.
- No logo exists for Tip or Skip or Hanson Digital; the card sets the name.
- The live page's `Section-divider2.jpg` (above the contact block) isn't in
  ds-assets, so it's left out.

## Things that will bite you

- `motion.ts` is the timing source of truth, but CSS can't import it; some
  values are mirrored in `global.css` with a comment saying which.
- Weights: only Poppins 400/500, Satoshi 700 (the name eyebrow, from Fontshare)
  and Plex Mono 400 (lab panel) are loaded. Another weight gets synthesised.
- Logos in the hover card must have transparent backgrounds: the black is
  `filter: brightness(0)`, which would turn an opaque box solid black.

## House style

Same as the folio: comments explain *why*, at length; commit subjects are
plain-English imperatives ("Flood the next project's colour in from the
click"), no `fix:`/`feat:` prefixes. Copy: no em dashes.
