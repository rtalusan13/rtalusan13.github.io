// =========================================================
// SHARED BEHAVIOUR for every page (loaded with defer, after
// js/layout.js has drawn the nav bar):
//   - phone menu: open/close, Escape, focus kept inside while open
//   - underline the current page in the nav
//   - fade sections in as they scroll into view (add class="reveal")
//   - progressive blur at the top/bottom edges of the screen
// =========================================================
(function () {
  // Older Safari (before 14) only has addListener on media queries.
  const onMediaChange = (mq, fn) => (mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn));

  // "Skip to content" needs a target even if a page forgot id="main".
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main";

  /* ---------- Mobile menu ---------- */
  const menu = document.getElementById("mobile-menu");
  const openBtn = document.querySelector(".menu-btn");
  if (menu && openBtn) {
    const closeBtn = menu.querySelector(".close-btn");
    const isOpen = () => menu.classList.contains("open");

    function setOpen(open) {
      menu.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
      openBtn.setAttribute("aria-expanded", String(open));
      (open ? closeBtn : openBtn).focus();
    }

    openBtn.addEventListener("click", () => setOpen(true));
    closeBtn.addEventListener("click", () => setOpen(false));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", e => {
      if (!isOpen()) return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab") return;
      // Keep Tab inside the open menu (it covers the whole screen).
      const items = [...menu.querySelectorAll("a, button")];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    onMediaChange(matchMedia("(min-width: 768px)"), e => {
      if (e.matches && isOpen()) setOpen(false);
    });
  }

  /* ---------- Current page ----------
     Compares full paths, and treats /resume, /resume.html, / and /index.html
     consistently (GitHub Pages serves pages both with and without .html).
     A page that isn't in the nav can say which link to underline:
       <body data-nav="journal.html">   (used by journal-entry.html) */
  const clean = path => path.replace(/\.html$/, "").replace(/\/index$/, "/");
  const navFor = document.body.dataset.nav;
  const here = clean(navFor ? new URL(navFor, location.href).pathname : location.pathname);
  document.querySelectorAll(".nav-links a, .mobile-links a, .cta-desktop a, .mobile-cta a").forEach(a => {
    if (clean(new URL(a.href).pathname) === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- Scroll reveal ---------- */
  document.documentElement.classList.add("reveal-ready");   // turns off the CSS failsafe
  const reveal = el => el.classList.add("is-visible");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = !reduce && "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 })
    : null;
  const watch = el => (io ? io.observe(el) : reveal(el));
  document.querySelectorAll(".reveal").forEach(watch);

  /* ---------- Progressive blur at the screen edges ----------
     Top strip: only once you've scrolled (keeps the nav and page title crisp).
     Bottom strip: hidden at the end of the page (keeps the footer crisp).
     Off for a page with <body data-blur="off">. Styles: css/style.css, section 14. */
  if (main && document.body.dataset.blur !== "off") {
    const strip = side => {
      const el = document.createElement("div");
      el.className = "pblur pblur-" + side;
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = "<i></i>".repeat(4);     // 3 blur layers + 1 fade
      main.append(el);
      return el;
    };
    const top = strip("top"), bottom = strip("bottom");
    let queued = false;
    const update = () => {
      queued = false;
      const y = window.scrollY;
      const end = document.documentElement.scrollHeight - innerHeight;
      top.classList.toggle("on", y > 40);
      bottom.classList.toggle("on", end - y > 24);
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    if ("ResizeObserver" in window) new ResizeObserver(queue).observe(document.body);  // content loaded later changes page height
    update();
  }

  // Content added later (e.g. project cards built from Markdown) can opt in:
  //   window.Site.watchReveal(element)
  window.Site = Object.assign(window.Site || {}, { watchReveal: watch });
})();
