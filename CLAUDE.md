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
opens `/project/rentspree` here), Rental application, Lattice, Opendoor,
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
edges.

The first round of featured carousels (Wash, Strips, Stack) was too much
and is parked in `app/_archive/`, outside the build.

## Case studies

`/project/<slug>` renders a case study instead of the homepage (`main.tsx`
reads the path once; moving between pages is a plain page load, and
`.htaccess` already sends every unknown path to `index.html`). The path is
the live site's own, so old `micahburger.com/project/…` links keep working
once v2 replaces it.

- Content: `app/src/data/caseStudies.ts`, one `CaseStudy` per project, made
  of typed blocks (intro, heading, split, figure, compare, slideshow,
  takeaways, outcomes, video). A new case study is new data, not new
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
  were exported on) with the shift off, whatever the homepage's lab says:
  set before first paint in `app/index.html`, then in `main.tsx`. Framed
  images then have no visible edge.
- The case study lab shows only its own rows (`CASE_LAB` in `lab.ts`):
  Outcomes, three takes on the closing numbers and learnings (Stats,
  Ledger, Statement). The homepage shows `HOME_LAB`.
- Opendoor (2026-11-08) is the first and the template: a first pass at the
  live page's structure and copy on v2's grid, type and palettes, to be
  shifted toward the v2 look next. Lincoln, Infinity and the archive
  projects still link to the live site.
- RentSpree (`/project/rentspree`, 2026-11-10): the 2026 folio's four
  RentSpree chapters (no Menu, no overview, no resume) as `chapter`
  blocks, each a rounded panel in the project's colour on the Night page.
  Panels rather than full-bleed grounds because stacked down one page the
  folio's light and dark chapters would break the lighting-mode rule.
  Screens copied from the folio into `public/img/rentspree`. The
  applicant chapter's CTA leads to applicants.micahburger.com, which stays
  its own static site (`../applicants-site`). The Outcomes lab pill only
  shows on studies with a results block.
- Back to home is **locked on scroll** on every case study (Micah,
  2026-11-10): `.cs-bar` is a sticky bar outside the header (sticky only
  holds inside its parent), resting 180px down and holding 24px from the
  top (112 / 16 on phones). applicants.micahburger.com mirrors it, and its
  title, number for number in `css/styles.css` (`.cs-bar`, `.cs-hero`);
  change one, change both. Its pill links to https://v2.micahburger.com/,
  to repoint when v2 becomes micahburger.com.

## Placeholders still in

- Rental application, 2026 folio and Corner Bodega media are screenshots
  of those live sites; swap for real exports. `bodega-3` and `folio-4`
  caught a mouse pointer.
- Infinity has only two 16:9 stills in ds-assets.
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
