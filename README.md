- need to complete home page layout
- redo favicon with transparent background
- change color scheme
- create all different pages

- https://rtalusan13.github.io/index.html

- https://21st.dev

---

# How this site is organized

```
index.html              home page (sections marked with ===== banners)
resume.html, projects.html, contact.html
journal.html            journal list (which entries to show)
journal-entry.html      shows one entry: journal-entry.html?p=hello-world
_template.html          starting point for a new page (hidden from search)
.nojekyll               tells GitHub Pages to serve files as-is (no Jekyll)

css/style.css           site-wide styles; table of contents at the top
css/carousel.css        carousel component styles
css/journal.css         journal list + entry page styles
js/layout.js            nav bar + footer for every page (edit links here)
js/main.js              phone menu, current-page underline, fade-ins
js/carousel.js          carousel component
js/journal.js           reads journals/*.md and builds the journal pages
js/vendor/              third-party code (marked: Markdown -> HTML), don't edit

assets/images/          page images (portrait, project thumbnails)
assets/logos/           small logos used inside text
image_carousel/         photos for the About carousel
journals/               journal entries (.md) and their images (journals/images/)
```

## Previewing on your computer

Double-clicking an .html file works for most pages, but the journal can't read
.md files that way (browsers block it). Serve the folder instead:

```
cd ~/website
python3 -m http.server 8000
```

then open http://localhost:8000. Stop it with Ctrl+C. (On Windows use `python`
instead of `python3`, or VS Code's "Live Server" extension.)

## Recipes

**Add a carousel photo.** Export it about 1600 px wide as JPG (under ~500 KB) into
`image_carousel/`. In `index.html`, find the carousel's `<template>` and add a line:
`<img src="image_carousel/file.jpg" data-title="Caption" alt="What the photo shows">`.
Order on the page = order of the lines.

**Write a journal entry.** Create `journals/my-entry.md` (lowercase, dashes, no spaces)
starting with:

```
---
title: My entry
caption: One sentence shown on the journal page.
published: 2026-10-19
---
```

then write the entry in Markdown below it. Add `my-entry.md` as a new line in the
`<template>` in `journal.html`. When you edit the entry later, add an `updated:` date.
Images go in `journals/images/` and are written `![description](images/file.jpg "optional caption")`.

**Add a featured project.** In `index.html` section 2, copy a whole
`<article class="project-card"> ... </article>` block and edit it. Only the first card
has `featured`.

**Put a logo in place of a word.** Save the logo in `assets/logos/`, then write
`<img class="inline-logo" src="assets/logos/file.svg" alt="Word it replaces">` in the
text. It sizes itself to the surrounding text. If the file is missing, the alt text shows.

**Add a page.** Copy `_template.html`, rename it, edit the title and text. To show it in
the nav bar, add one line to `NAV_LINKS` in `js/layout.js`.

**Change colors or widths.** `css/style.css`, section 1 (Design tokens).

**Never commit camera originals.** GitHub rejects files over 100 MB. Make a web copy:
`sips -Z 1600 -s format jpeg -s formatOptions 82 IMG.HEIC --out image_carousel/name.jpg`
