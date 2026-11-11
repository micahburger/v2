import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Dev only: serve a folder in public/ that has its own index.html the way
 * Hostinger does, instead of answering with the React app.
 *
 * The applicant experience case study (public/project/applicant-experience,
 * moved in from its own site on 2026-11-11) is plain HTML, CSS and JS
 * served as is. In production Apache finds the real directory and serves
 * its index.html (the "-d" rule in .htaccess), redirecting to the trailing
 * slash first. Vite's dev server has no such rule: its SPA fallback sends
 * /project/applicant-experience/ to the app's own index.html, so the page
 * only showed at .../index.html. This does what Apache does: slash-less
 * folder paths redirect to the slash (the page's css/, js/ and img/ links
 * are relative and need it), and slashed ones get their index.html.
 */
function publicFolderIndex(): Plugin {
  return {
    name: "public-folder-index",
    configureServer(server) {
      const publicDir = server.config.publicDir;
      server.middlewares.use((req, res, next) => {
        const [path, query = ""] = (req.url ?? "").split("?");
        if (path === "/" || /\.[a-z0-9]+$/i.test(path)) return next();
        const folder = path.replace(/\/+$/, "");
        if (!existsSync(resolve(publicDir, `.${folder}/index.html`))) return next();
        if (!path.endsWith("/")) {
          res.statusCode = 301;
          res.setHeader("Location", `${folder}/${query ? `?${query}` : ""}`);
          return res.end();
        }
        req.url = `${folder}/index.html${query ? `?${query}` : ""}`;
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), publicFolderIndex()],
  server: {
    // 4176 is the folio, 5173 is taken by most other prototypes.
    port: 4178,
    strictPort: true,
  },
});
