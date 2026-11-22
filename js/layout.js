// =========================================================
// SITE SETTINGS + SHARED LAYOUT (loaded in <head> on every page, not deferred)
//
// Edit SITE below to change your name, email, links or nav once for the
// whole site. Pages then use these tags, which this file fills in:
//
//   <site-header></site-header>              nav bar (+ "skip to content" link)
//   <site-footer></site-footer>              footer
//   <site-links></site-links>                GitHub / LinkedIn / Email as a row of links
//   <site-links variant="list"></site-links>    the same as a stacked list with icons (Contact page)
//   <site-email></site-email>                your email as a clickable link
//
// Pages inside a subfolder add root="../" to <site-header>; the 404 page uses root="/".
// =========================================================
(function () {
  const SITE = {
    name: "Raphael Talusan",
    email: "rtalu@illinois.edu",

    // Order here = order everywhere (hero, footer, Contact page).
    // note = the short line under each one on the Contact page.
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/raphael-talusan", handle: "linkedin.com/in/raphael-talusan", note: "Experience, background, and messages" },
      { label: "GitHub",   href: "https://github.com/rtalusan13",               handle: "github.com/rtalusan13",           note: "Code for my projects" },
    ],
    emailNote: "The fastest way to reach me",

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
  const allLinks = () => SITE.links.concat(SITE.email ? [{ label: "Email", href: "mailto:" + SITE.email, handle: SITE.email, note: SITE.emailNote }] : []);
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
    '<stop stop-color="#FF9966"/><stop offset="1" stop-color="#FF5E62"/></linearGradient></defs>' +
    '<text x="16" y="20.5" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" ' +
    'font-size="12.5" font-weight="800" letter-spacing="-0.4" fill="#fff">RT</text></svg>';
  // Brand and UI icons from Bootstrap Icons v1.11.3 (MIT, js/vendor/bootstrap-icons.LICENSE.txt), 16x16 paths.
  const BI = {
    github: '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>',
    linkedin: '<path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>',
    email: '<path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>',
    link: '<path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>',
    arrow: '<path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>',
    arrowRight: '<path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>',
  };
  const bi = (name, size) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' + BI[name] + "</svg>";


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

  // Contact page: one row per way to reach you, stacked, each with its logo.
  function linkList() {
    const items = allLinks();
    items.sort((a, b) => (b.label === "Email") - (a.label === "Email"));   // email first
    const kind = s => (/^mailto:/i.test(s.href) ? "email" : /github\.com/i.test(s.href) ? "github" : /linkedin\.com/i.test(s.href) ? "linkedin" : "link");
    return '<ul class="contact-list">' + items.map(s => {
      const k = kind(s);
      const copy = k === "email"
        ? '<button class="contact-copy" type="button" data-copy="' + esc(s.handle) + '" aria-label="Copy email address">Copy</button>'
        : "";
      return '<li class="contact-item" data-kind="' + k + '">' +
        '<a class="contact-link" href="' + esc(s.href) + '"' + ext(s.href) + ">" +
          '<span class="contact-icon">' + bi(k, 24) + "</span>" +
          '<span class="contact-text">' +
            '<span class="contact-label">' + esc(s.label) + "</span>" +
            '<span class="contact-value">' + esc(s.handle || s.href) + "</span>" +
            (s.note ? '<span class="contact-note">' + esc(s.note) + "</span>" : "") +
          "</span>" +
          '<span class="contact-arrow">' + bi(k === "email" ? "arrowRight" : "arrow", 18) + "</span>" +
        "</a>" + copy + "</li>";
    }).join("") + "</ul>";
  }

  // "Copy" next to the email address.
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-copy]");
    if (!b) return;
    const text = b.getAttribute("data-copy");
    const done = ok => {
      b.textContent = ok ? "Copied" : "Press Ctrl+C";
      b.classList.toggle("copied", ok);
      clearTimeout(b._t);
      b._t = setTimeout(() => { b.textContent = "Copy"; b.classList.remove("copied"); }, 1800);
    };
    const fallback = () => {               // older browsers / non-secure pages
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.append(t); t.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) { /* not allowed */ }
      t.remove(); done(ok);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => done(true), fallback);
    else fallback();
  });

  const define = (name, render) => {
    if (customElements.get(name)) return;
    customElements.define(name, class extends HTMLElement {
      connectedCallback() { if (!this.dataset.ready) { this.dataset.ready = "1"; this.innerHTML = render(this); } }
    });
  };
  define("site-header", el => header(el.getAttribute("root") || ""));
  define("site-footer", () => footer());
  define("site-links", el => (/^(list|cards)$/.test(el.getAttribute("variant") || "") ? linkList() : linkRow()));
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
