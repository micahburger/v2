import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CaseStudyPage from "./components/CaseStudy";
import ArchivePage from "./components/archive/ArchivePage";
import { caseStudyFor } from "./data/caseStudies";
import { readLab } from "./lab";
import "./styles/global.css";

// Set before the first render, so a link with ?palette=… paints in that
// palette from the start instead of fading over from the default cream
// (body transitions its colours; App keeps this in sync after that).

// Routing is just the path, read once: /project/<slug> is a case study,
// anything else the homepage. Moving between them is an ordinary page load
// (plain links), so the browser handles back, forward and scroll position
// itself. Unknown paths reach index.html through Vite's SPA fallback in dev
// and .htaccess in production.
const study = caseStudyFor(window.location.pathname);
// The Archive (2026-11-11) is a case study page too, but its own component:
// five projects as previews rather than one study's blocks.
const isArchive = /^\/project\/archive\/?$/.test(window.location.pathname);

// The homepage follows the lab. A case study is always Night with the shift
// off (see index.html, which sets that before the first paint): its screens
// were exported on that black, and a shift would pull the page off it. The
// lab query still rides along on its links, so going home restores the
// visitor's palette.
if (study) {
  document.documentElement.dataset.palette = "night";
  document.documentElement.dataset.shift = "off";
} else if (isArchive) {
  // The Archive follows the lab's colour (the homepage's, carried in on
  // the query) with no shift; ArchivePage keeps it in sync after this.
  document.documentElement.dataset.palette = readLab().palette;
  document.documentElement.dataset.shift = "off";
} else {
  const initial = readLab();
  document.documentElement.dataset.palette = initial.palette;
  document.documentElement.dataset.shift = initial.shift;
}

const page = isArchive ? <ArchivePage /> : study ? <CaseStudyPage study={study} /> : <App />;

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode>{page}</React.StrictMode>);
