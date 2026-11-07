# micahburger.com v2

A rebuild of Micah Lindenberger's homepage (micahburger.com, currently on
Semplice/WordPress), meant to become the hub that links to every case study
and prototype: Corner Bodega, the rental application case study, Lattice,
the 2026 mini portfolio, plus the older case studies still on the live site.

Planned home while in progress: **v2.micahburger.com** (Hostinger subdomain,
not set up yet as of 2026-11-06).

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
History, Featured Projects, contact, footer. The header bar scrolls away
(it is fixed on the live site; Micah didn't want it locked). The four new
projects lead the featured list; the old case studies follow.

Image sources are listed at the top of `app/src/data/site.ts`. Most came
from `~/Desktop/ds-assets`; Lattice's from `../prtfolio images`.

## The lab

The "Lab" pill (bottom-left; bottom-right on phones) switches takes. The
choice lives only in the query string, e.g. `/?quilt=flap&history=timeline`;
a plain link gets the defaults.

| Section | Takes (default first) | File |
|---|---|---|
| Clients | static, wave, assemble, flap | `components/ClientQuilt.tsx` |
| History | logo, static, fill, focus, timeline | `components/WorkHistory.tsx` |

The quilt is one image (`logoquilt2024.png`) cut into twelve tiles with
background-position, so the build-ins move logos individually.

"Logo" (Micah's ask): hovering a job floats that company's logo, flattened
to black by CSS, on a white card beside the pointer. Every row links to the
company's site in a new tab.

The first round of featured carousels (Wash, Strips, Stack) was too much
and is parked in `app/_archive/`, outside the build.

## Placeholders still in

- Rental application, 2026 folio and Corner Bodega media are screenshots
  of those live sites; swap for real exports.
- Lincoln, Rockwell and WWE use their `-Gallery.jpg` stills; the live site
  has `-4up.gif` animations for them that aren't in ds-assets.
- No logo exists for Tip or Skip or Hanson Digital; the card sets the name.
- The live page's `Section-divider2.jpg` (above the contact block) isn't in
  ds-assets, so it's left out.
- The palm is a still (`photo.jpg`); the live hero is a video loop.

## Things that will bite you

- `motion.ts` is the timing source of truth, but CSS can't import it; some
  values are mirrored in `global.css` with a comment saying which.
- Weights: only Poppins 400/500, Satoshi 700 (header name, from Fontshare)
  and Plex Mono 400 (lab panel) are loaded. Another weight gets synthesised.
- Logos in the hover card must have transparent backgrounds: the black is
  `filter: brightness(0)`, which would turn an opaque box solid black.

## House style

Same as the folio: comments explain *why*, at length; commit subjects are
plain-English imperatives ("Flood the next project's colour in from the
click"), no `fix:`/`feat:` prefixes. Copy: no em dashes.
