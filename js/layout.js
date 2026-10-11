// =========================================================
// SHARED LAYOUT: the nav bar and footer for every page.
//
// Pages load this file in <head> (not deferred), then write
//   <site-header></site-header>   where the nav bar goes
//   <site-footer></site-footer>   where the footer goes
// and this script fills them in while the page loads, so
// there's no flicker.
//
// Pages inside a subfolder (e.g. tools/) add root="../":
//   <site-header root="../"></site-header>
//
// EDIT HERE:
//   NAV_LINKS  pages in the nav bar (order = left to right)
//   CTA        the black button on the right
//   SOCIAL     links in the footer
// =========================================================
(function () {
  const NAME = "Raphael Talusan";

  const NAV_LINKS = [
    { label: "Home",     href: "index.html" },
    { label: "Resume",   href: "resume.html" },
    { label: "Projects", href: "projects.html" },
    { label: "Journal",  href: "journal.html" },
  ];

  const CTA = { label: "Contact Me", href: "contact.html" };

  const SOCIAL = [
    { label: "GitHub",   href: "https://github.com/rtalusan13" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/YOUR-PROFILE" },
  ];

  /* ---------- Nothing below needs editing for routine changes ---------- */

  const isExternal = href => /^(https?:|mailto:)/.test(href);
  const url = (root, href) => (isExternal(href) ? href : root + href);
  const links = root => NAV_LINKS.map(l => '<li><a href="' + url(root, l.href) + '">' + l.label + "</a></li>").join("");

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

  function header(root) {
    return (
      '<header class="nav-wrap">' +
        '<div class="nav-bar">' +
          '<a href="' + root + 'index.html" class="logo" aria-label="Home">' + LOGO + "</a>" +
          '<nav aria-label="Main"><ul class="nav-links">' + links(root) + "</ul></nav>" +
          '<div class="cta-desktop"><a href="' + url(root, CTA.href) + '" class="btn">' + CTA.label + "</a></div>" +
          '<button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">' + ICON_MENU + "</button>" +
        "</div>" +
        '<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">' +
          '<button class="close-btn" type="button" aria-label="Close menu">' + ICON_CLOSE + "</button>" +
          '<nav aria-label="Mobile"><ul class="mobile-links">' + links(root) + "</ul></nav>" +
          '<div class="mobile-cta"><a href="' + url(root, CTA.href) + '" class="btn">' + CTA.label + "</a></div>" +
        "</div>" +
      "</header>"
    );
  }

  function footer() {
    return (
      '<footer class="site-footer">' +
        "<span>&copy; " + new Date().getFullYear() + " " + NAME + "</span>" +
        "<ul>" + SOCIAL.map(s => '<li><a href="' + s.href + '">' + s.label + "</a></li>").join("") + "</ul>" +
      "</footer>"
    );
  }

  customElements.define("site-header", class extends HTMLElement {
    connectedCallback() { if (!this.firstChild) this.innerHTML = header(this.getAttribute("root") || ""); }
  });
  customElements.define("site-footer", class extends HTMLElement {
    connectedCallback() { if (!this.firstChild) this.innerHTML = footer(); }
  });

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
