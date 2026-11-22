- need to complete home page layout
- redo favicon with transparent background
- change color scheme
- create all different pages
- need block i icon

- https://rtalusan13.github.io/index.html

- https://21st.dev

---

# How this site is organized

```
index.html, resume.html, projects.html, journal.html, contact.html
journal-entry.html      shows one journal entry: journal-entry.html?p=hello-world
404.html                shown for any address that doesn't exist
_template.html          starting point for a new page (not published)
.github/workflows/deploy.yml   publishes the site on every push to main (see Publishing)

content/projects.md     every project (home page cards + Projects page)
content/resume.md       everything on the resume page
journals/               journal entries (.md) and their images (journals/images/)

js/layout.js            SITE settings (name, email, links, nav) + nav bar and footer
js/main.js              phone menu, current-page underline, fade-ins
js/content.js           shared Markdown reader used by the three below
js/projects.js          builds project cards and the Projects page
js/resume.js            builds the resume page
js/journal.js           builds the journal pages
js/carousel.js          photo carousel
js/vendor/              third-party code (marked: Markdown -> HTML), don't edit

css/style.css           site-wide styles; table of contents and colors at the top
css/projects.css, css/resume.css, css/journal.css, css/carousel.css   one per feature

assets/images/          page images      assets/logos/   small logos for text
image_carousel/         About carousel photos

dev/preview.command     Mac: double-click to preview the site
dev/preview.bat         Windows: double-click to preview the site
dev/serve.py            the preview server they run (stops the browser keeping old files)
dev/check.py            finds broken links, oversized files, and leftover [placeholders]
```

## Working on the site

**Preview:** double-click `dev/preview.command` (Mac) or `dev/preview.bat` (Windows). It
opens http://localhost:8000; close the window to stop. It always serves your latest files, so a
normal reload shows every change (if a change ever seems missing, close any older preview
window and double-click it again). Pages built from Markdown (projects,
resume, journal) don't load if you double-click the .html files themselves.

**Check before pushing:** `python3 dev/check.py` (Windows: `python dev\check.py`). It lists
broken links, missing images, oversized files, images nothing uses, and `[placeholder]` text
that would still show on the live site.

**Publishing:** pushing to `main` runs `.github/workflows/deploy.yml`, which copies the site
files to GitHub Pages exactly as they are (no build step, no converting the .md files). The
Actions tab shows each run; a green check means it's live about a minute later. `dev/`, this
README, `_template.html` and hidden files aren't published.
One-time setup (already done if the Actions tab shows a successful "Deploy site" run):
GitHub > the repo > Settings > Pages > Build and deployment > Source: **GitHub Actions**.

**Browser support:** current versions and about three years back of Chrome, Edge, Safari
(including iPhone) and Firefox. Newer CSS features have fallbacks marked `fallback:` in the
stylesheets, so older browsers get a simpler page that still works.

## Recipes

**Change your name, email, LinkedIn/GitHub, or the nav.** `SITE` at the top of `js/layout.js`.
The nav bar, footer, home page links and Contact page all update from it.

**Add a project.** Add a `## Project title` block to `content/projects.md` (the notes at the top
show every option). `featured: yes` also puts it on the home page; the first featured project
gets the big card. Its section on the Projects page is `projects.html#` + its `id:`.

**Edit the resume.** Everything is in `content/resume.md`; the notes at the top show the format.
`# Section | Short name` makes a tab, `## Organization` makes a row, and the `role:`, `dates:`,
`logo:`, `current: yes` lines under it fill in the row. Put the PDF at `assets/resume.pdf` and the
Download button appears; change `updated:` when you do.

**Add a course bubble.** In `content/resume.md`, under `### Relevant coursework`, add a line
`- ECE 411 | Computer Organization and Design | in progress | SystemVerilog, Caches`
(code | full title | status | skills). Status: `completed` (green), `in progress` (yellow) or `planned` (gray, labeled
"Planned/Future Coursework"; `future`, `planning` and `registered` work too).
`planned (Spring 2027)` also shows the term on the hover card.
For a plain list with no status or colors (like high school classes), put ordinary list lines
under the heading instead: `- Linear Algebra`. They show as simple chips in that row's dropdown.

**Write a journal entry.** Create `journals/my-entry.md` (lowercase, dashes, no spaces) starting with:

```
---
title: My entry
caption: One sentence shown on the journal page.
published: 2026-10-19
---
```

then write the entry in Markdown. Add `my-entry.md` as a new line in the `<template>` in
`journal.html`. Add an `updated:` date when you edit it later. Images go in `journals/images/`.

**Your portrait.** Replace `assets/images/portrait.jpg` with your photo (keep the name; 800×1000
JPG, under ~200 KB). Until then it shows an RT monogram. Once it's your photo, uncomment the
`og:image` line in `index.html` so link previews show it too.

**Project images.** `assets/images/covers/` has an illustration for each project. To use a real
photo instead, save it in `assets/images/` (1200×750) and point that project's `image:` line at it.

**Add a carousel photo.** Export it about 1600 px wide as JPG (under ~500 KB) into
`image_carousel/`, then add a line to the carousel's `<template>` in `index.html`:
`<img src="image_carousel/file.jpg" data-title="Caption" alt="What the photo shows">`.

**Put a logo in place of a word.** Save it in `assets/logos/`, then write
`<img class="inline-logo" src="assets/logos/file.png" alt="Word it replaces">`. It sizes itself
to the text around it; if the file is missing, the alt text shows instead.

**Add a page.** Copy `_template.html`, rename it, edit the title and text. To show it in the
nav, add it to `SITE.nav` in `js/layout.js`.

**Change colors or widths.** `css/style.css`, section 1 (Design tokens). The glass look
(`--glass-*`) and the orange selection color (`--orange-soft`) live there too.

**Progressive blur** (content softening at the top and bottom of the screen) is on every page.
Turn it off for one page with `<body data-blur="off">`; size and strength: `css/style.css`, section 14.

**Images.** Never commit camera originals (GitHub rejects files over 100 MB). Make a web copy
about 1600 px wide. Mac: `sips -Z 1600 -s format jpeg -s formatOptions 82 IMG.HEIC --out file.jpg`.
