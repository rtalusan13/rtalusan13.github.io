// =========================================================
// SITE SETTINGS + SHARED LAYOUT (loaded in <head> on every page, not deferred)
//
// Edit SITE below to change your name, email, links or nav once for the
// whole site. Pages then use these tags, which this file fills in:
//
//   <site-header></site-header>              nav bar (+ "skip to content" link)
//   <site-footer></site-footer>              footer
//   <site-links></site-links>                GitHub / LinkedIn / Email as a row of links
//   <site-links variant="cards"></site-links>   the same as large cards (Contact page)
//   <site-email></site-email>                your email as a clickable link
//
// Pages inside a subfolder add root="../" to <site-header>; the 404 page uses root="/".
// =========================================================
(function () {
  const SITE = {
    name: "Raphael Talusan",
    email: "rtalu@illinois.edu",

    // Order here = order everywhere (hero, footer, Contact page).
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/raphael-talusan", handle: "linkedin.com/in/raphael-talusan" },
      { label: "GitHub",   href: "https://github.com/rtalusan13",               handle: "github.com/rtalusan13" },
    ],

    // Pages in the nav bar, left to right.
    nav: [
      { label: "Home",     href: "index.html" },
      { label: "Resume",   href: "resume.html" },
      { label: "Projects", href: "projects.html" },
      { label: "Journal",  href: "journal.html" },
    ],

    // The button on the right of the nav bar.
    cta: { label: "Contact Me", href: "contact.html" },
  };

  /* ---------- Nothing below needs editing for routine changes ---------- */

  window.SITE = SITE;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isExternal = href => /^([a-z][a-z0-9+.-]*:|\/)/i.test(href);
  const url = (root, href) => (isExternal(href) ? href : root + href);
  const navItems = root => SITE.nav.map(l => '<li><a href="' + esc(url(root, l.href)) + '">' + esc(l.label) + "</a></li>").join("");
  const allLinks = () => SITE.links.concat(SITE.email ? [{ label: "Email", href: "mailto:" + SITE.email, handle: SITE.email }] : []);
  const ext = href => (/^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : "");

  const ICON_MENU =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';
  const ICON_CLOSE =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const LOGO =
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
    '<circle cx="16" cy="16" r="16" fill="url(#logo-grad)"/><defs>' +
    '<linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">' +
    '<stop stop-color="#FF9966"/><stop offset="1" stop-color="#FF5E62"/></linearGradient></defs></svg>';
  const ICON_ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function header(root) {
    const cta = '<a href="' + esc(url(root, SITE.cta.href)) + '" class="btn">' + esc(SITE.cta.label) + "</a>";
    return (
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="nav-wrap">' +
        '<div class="nav-bar">' +
          '<a href="' + esc(url(root, "index.html")) + '" class="logo" aria-label="Home">' + LOGO + "</a>" +
          '<nav aria-label="Main"><ul class="nav-links">' + navItems(root) + "</ul></nav>" +
          '<div class="cta-desktop">' + cta + "</div>" +
          '<button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">' + ICON_MENU + "</button>" +
        "</div>" +
        '<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">' +
          '<button class="close-btn" type="button" aria-label="Close menu">' + ICON_CLOSE + "</button>" +
          '<nav aria-label="Mobile"><ul class="mobile-links">' + navItems(root) + "</ul></nav>" +
          '<div class="mobile-cta">' + cta + "</div>" +
        "</div>" +
      "</header>"
    );
  }

  function footer() {
    return (
      '<footer class="site-footer">' +
        "<span>&copy; " + new Date().getFullYear() + " " + esc(SITE.name) + "</span>" +
        "<ul>" + allLinks().map(s => '<li><a href="' + esc(s.href) + '"' + ext(s.href) + ">" + esc(s.label) + "</a></li>").join("") + "</ul>" +
      "</footer>"
    );
  }

  function linkRow() {
    return '<ul class="social">' + allLinks().map(s => '<li><a href="' + esc(s.href) + '"' + ext(s.href) + ">" + esc(s.label) + "</a></li>").join("") + "</ul>";
  }

  function linkCards() {
    // Email first on the Contact page: it's the main way to reach you.
    const items = allLinks();
    items.sort((a, b) => (b.label === "Email") - (a.label === "Email"));
    return '<div class="contact-grid">' + items.map(s =>
      '<a class="contact-card" href="' + esc(s.href) + '"' + ext(s.href) + ">" +
        '<span class="contact-label">' + esc(s.label) + "</span>" +
        '<span class="contact-value">' + esc(s.handle || s.href) + "</span>" +
        '<span class="contact-arrow">' + ICON_ARROW + "</span>" +
      "</a>").join("") + "</div>";
  }

  const define = (name, render) => {
    if (customElements.get(name)) return;
    customElements.define(name, class extends HTMLElement {
      connectedCallback() { if (!this.dataset.ready) { this.dataset.ready = "1"; this.innerHTML = render(this); } }
    });
  };
  define("site-header", el => header(el.getAttribute("root") || ""));
  define("site-footer", () => footer());
  define("site-links", el => (el.getAttribute("variant") === "cards" ? linkCards() : linkRow()));
  define("site-email", () => '<a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>");

  // Inline logos (<img class="inline-logo">): if the image file is missing,
  // show its alt text instead of a broken-image icon. Runs this early so it
  // catches errors that happen before the rest of the page's scripts load.
  document.addEventListener("error", e => {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.classList.contains("inline-logo")) {
      img.replaceWith(document.createTextNode(img.alt));
    }
  }, true);
})();
