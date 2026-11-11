#!/bin/sh
# Builds the app/ source and copies the static output to the repo root,
# which is what Hostinger's Git auto-deploy actually serves. Run this
# before every push that changes app/.
set -e
cd "$(dirname "$0")"
npm --prefix app run build
rm -f index.html
# Everything app/public ships (img/, and project/ for the static applicant
# experience page since 2026-11-11) is cleared too, so a file deleted from
# the source doesn't linger in what Hostinger serves.
rm -rf assets img project
cp -r app/dist/. .
echo "Built and copied app/dist -> repo root. Review with 'git status' before committing."
