// =========================================================
// LIGHTBOX: tap a photo to see it almost full screen  (pairs with css/lightbox.css)
//
// The page behind blurs; swipe (or use the arrows / arrow keys) to move through
// the other photos in the same group; the X, Escape, or a tap outside the photo
// closes it.
//
// Used by:
//   - carousels (js/carousel.js): tapping the photo that's showing opens it
//   - single project images (js/projects.js)
// Anything else can use it too:
//   window.Lightbox.open([{ src, alt, title }, ...], startIndex, onClose)
//   window.Lightbox.attach(element, items)   makes an element open it on tap/Enter
// The home page headshot deliberately doesn't use it.
// =========================================================
(function () {
  const ICON = {
    close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const pad2 = n => (n < 10 ? "0" + n : String(n));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  let box = null, track = null, count = null, cap = null, prevBtn = null, nextBtn = null;
  let items = [], index = 0, onClose = null, opener = null, raf = 0;

  function build() {
    box = document.createElement("div");
    box.className = "lb";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.hidden = true;
    box.innerHTML =
      '<div class="lb-track"></div>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Close photo">' + ICON.close + "</button>" +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">' + ICON.prev + "</button>" +
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo">' + ICON.next + "</button>" +
      '<div class="lb-meta"><p class="lb-cap"></p><p class="lb-count" aria-live="polite"></p></div>';
    document.body.append(box);
    track = box.querySelector(".lb-track");
    count = box.querySelector(".lb-count");
    cap = box.querySelector(".lb-cap");
    prevBtn = box.querySelector(".lb-prev");
    nextBtn = box.querySelector(".lb-next");

    box.querySelector(".lb-close").addEventListener("click", close);
    prevBtn.addEventListener("click", () => go(index - 1));
    nextBtn.addEventListener("click", () => go(index + 1));
    // A tap on the dark area (not the photo, not a button) closes.
    track.addEventListener("click", e => { if (!e.target.closest("img")) close(); });
    track.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const i = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
        if (i !== index && i >= 0 && i < items.length) setIndex(i);
      });
    }, { passive: true });
    box.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      else if (e.key === "Tab") {                  // keep focus inside the viewer
        const f = [...box.querySelectorAll("button")].filter(b => !b.hidden && b.offsetParent);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function load(i) {
    const img = track.children[i] && track.children[i].querySelector("img");
    if (img && !img.getAttribute("src")) img.src = img.dataset.src;
  }

  function setIndex(i) {
    index = i;
    count.innerHTML = "<b>" + pad2(i + 1) + "</b> / " + pad2(items.length);
    cap.textContent = items[i].title || "";
    [i - 1, i, i + 1].forEach(load);
  }

  function go(i) {
    if (items.length < 2) return;
    i = (i + items.length) % items.length;
    setIndex(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  function open(list, start, closeCallback) {
    if (!list || !list.length) return;
    if (!box) build();
    items = list;
    onClose = closeCallback || null;
    opener = document.activeElement;
    track.innerHTML = items.map(() => '<figure class="lb-slide"><img alt="" decoding="async"></figure>').join("");
    [...track.children].forEach((slide, k) => {
      const img = slide.querySelector("img");
      img.dataset.src = items[k].src;
      img.alt = items[k].alt || items[k].title || "";
      img.draggable = false;
    });
    box.classList.toggle("lb-one", items.length < 2);
    box.hidden = false;
    document.documentElement.classList.add("lb-open");
    const i = Math.max(0, Math.min(items.length - 1, start || 0));
    setIndex(i);
    track.scrollLeft = i * track.clientWidth;
    requestAnimationFrame(() => box.classList.add("show"));
    box.querySelector(".lb-close").focus();
  }

  function close() {
    if (!box || box.hidden) return;
    box.classList.remove("show");
    document.documentElement.classList.remove("lb-open");
    const done = () => { box.hidden = true; track.innerHTML = ""; };
    if (reduceMotion.matches) done(); else setTimeout(done, 200);
    if (onClose) onClose(index);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  // Make any element open the viewer when tapped (or Enter/Space when focused).
  function attach(el, list) {
    el.classList.add("lb-zoomable");
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "View " + (list[0].alt || "photo") + " full screen");
    el.addEventListener("click", () => open(list, 0));
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(list, 0); }
    });
  }

  addEventListener("resize", () => {          // keep the current photo centred after a resize/rotation
    if (box && !box.hidden) track.scrollLeft = index * track.clientWidth;
  });

  document.documentElement.classList.add("has-lightbox");   // lets carousels show a zoom cursor
  window.Lightbox = { open, close, attach };
})();
