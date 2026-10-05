// Shared site script: mobile menu, current-page highlight, scroll reveal, footer year.
(function () {
  /* ---------- Mobile menu ---------- */
  const menu = document.getElementById("mobile-menu");
  const openBtn = document.querySelector(".menu-btn");
  if (menu && openBtn) {
    const closeBtn = menu.querySelector(".close-btn");

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
      if (e.key === "Escape" && menu.classList.contains("open")) setOpen(false);
    });
    matchMedia("(min-width: 768px)").addEventListener("change", e => {
      if (e.matches && menu.classList.contains("open")) setOpen(false);
    });
  }

  /* ---------- Current page ----------
     Compares full paths, and treats /resume, /resume.html, / and /index.html
     consistently (GitHub Pages serves pages both with and without .html). */
  const clean = path => path.replace(/\.html$/, "").replace(/\/index$/, "/");
  const here = clean(location.pathname);
  document.querySelectorAll(".nav-links a, .mobile-links a").forEach(a => {
    if (clean(new URL(a.href).pathname) === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- Scroll reveal ---------- */
  const items = document.querySelectorAll(".reveal");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduce) {
    items.forEach(el => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    items.forEach(el => io.observe(el));
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
})();
