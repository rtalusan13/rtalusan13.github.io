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
resume.html, projects.html, journal.html, contact.html
_template.html          starting point for a new page (not published)

css/style.css           site-wide styles; table of contents at the top
css/carousel.css        carousel component styles
js/layout.js            nav bar + footer for every page (edit links here)
js/main.js              phone menu, current-page underline, fade-ins
js/carousel.js          carousel component

assets/images/          page images (portrait, project thumbnails)
assets/logos/           small logos used inside text
image_carousel/         photos for the About carousel
```

## Recipes

**Add a carousel photo.** Export it about 1600 px wide as JPG (under ~500 KB) into
`image_carousel/`. In `index.html`, find the carousel's `<template>` and add a line:
`<img src="image_carousel/file.jpg" data-title="Caption" alt="What the photo shows">`.
Order on the page = order of the lines.

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
