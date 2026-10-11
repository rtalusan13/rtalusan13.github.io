// =========================================================
// CAROUSEL COMPONENT  (pairs with css/carousel.css)
//
// A page only needs this markup. Everything else (track,
// caption, arrows, timer bar) is built by this script.
//
//   <div class="fp-root" data-carousel data-variant="single" data-autoplay="5000" aria-label="Photos">
//     <template>
//       <img src="image_carousel/photo.jpg" data-title="Caption under the photo" alt="What the photo shows">
//       <img src="image_carousel/other.jpg" data-title="Another caption"         alt="...">
//     </template>
//   </div>
//
// One <img> per slide, shown in the order written.
//   src         the photo file
//   data-title  caption shown under the photo (optional)
//   alt         description for screen readers (defaults to the title)
//
// Options on the carousel itself:
//   data-variant   "single" = one photo at a time
//                  "focus"  = (default) neighbours peek in, blurred
//   data-autoplay  ms per slide, shown as a filling bar. "0" = off. Default 5000.
// =========================================================
(function () {
  const BLUR = 7;                                    // px of blur one photo away (focus variant)
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const ICON_PREV = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.6"/></svg>';
  const ICON_NEXT = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.6"/></svg>';

  const wrap = (i, n) => ((i % n) + n) % n;
  const pad2 = n => (n < 10 ? "0" + n : String(n));

  // How out of focus a photo is, from its distance to the centre in photo widths.
  function focusOf(d) {
    const a = Math.min(Math.abs(d), 1);
    return {
      scale: 1 - 0.14 * a,
      blur: Math.min(Math.abs(d), 2) * BLUR,
      opacity: 1 - 0.5 * a,
      saturate: 1 - 0.45 * a,
    };
  }

  // Read the slides written inside <template>. Images there are inert, so
  // nothing downloads until this script decides to load it.
  function readSlides(root) {
    const tpl = root.querySelector(":scope > template");
    if (!tpl) return [];
    return [...tpl.content.querySelectorAll("img")]
      .map(img => {
        const title = (img.dataset.title || "").trim();
        const alt = img.getAttribute("alt");
        return { src: img.getAttribute("src"), title, alt: alt === null ? title : alt };
      })
      .filter(s => s.src);
  }

  function init(root) {
    const slides = readSlides(root);
    const n = slides.length;
    if (!n) return;

    const variant = root.dataset.variant === "single" ? "single" : "focus";
    const duration = root.dataset.autoplay === undefined ? 5000 : Number(root.dataset.autoplay) || 0;
    root.dataset.variant = variant;
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    if (!root.hasAttribute("aria-label")) root.setAttribute("aria-label", "Photos");
    root.tabIndex = 0;
    root.classList.toggle("fp-one", n < 2);

    root.insertAdjacentHTML("beforeend",
      '<div class="fp-track"></div>' +
      '<div class="fp-meta">' +
        '<p class="fp-cap" aria-hidden="true"></p>' +
        '<p class="fp-count" aria-hidden="true"></p>' +
        '<div class="fp-nav">' +
          '<button type="button" class="fp-btn" data-dir="-1" aria-label="Previous photo">' + ICON_PREV + '</button>' +
          '<button type="button" class="fp-btn" data-dir="1" aria-label="Next photo">' + ICON_NEXT + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="fp-bar" aria-hidden="true"><i></i></div>' +
      '<p class="fp-sr" aria-live="polite"></p>');

    const track = root.querySelector(".fp-track");
    const cap = root.querySelector(".fp-cap");
    const count = root.querySelector(".fp-count");
    const fill = root.querySelector(".fp-bar > i");
    const live = root.querySelector(".fp-sr");

    const cards = slides.map((s, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "fp-card";
      card.tabIndex = -1;
      card.setAttribute("aria-label", "Show photo " + (i + 1) + (s.title ? ": " + s.title : ""));
      const img = document.createElement("img");
      img.alt = s.alt;
      img.draggable = false;
      img.decoding = "async";
      img.dataset.src = s.src;
      card.append(img);
      track.append(card);
      return card;
    });

    /* ---------- State ---------- */
    let active = -1;
    let progress = 0;              // 0..1 of the timer bar
    let advancing = false;         // autoplay scroll in flight: hold the bar full
    let lastTouch = -Infinity;     // last user interaction, for screen reader announcements
    let nearViewport = false, onScreen = false;
    let hovering = false, pressing = false, dragging = false;

    const autoplayOn = () => duration > 0 && n > 1 && !reduceMotion.matches;
    const keyboardFocused = () => root.matches(":focus-visible") || !!root.querySelector(":focus-visible");
    const paused = () => !onScreen || document.hidden || hovering || pressing || dragging || keyboardFocused();

    function setBar(p) { fill.style.transform = "scaleX(" + p.toFixed(4) + ")"; }

    // Load only the photos around the current one, once the carousel is close to view.
    function loadAround(i) {
      if (!nearViewport) return;
      [i - 1, i, i + 1, i + 2].forEach(k => {
        const img = cards[wrap(k, n)].firstChild;
        if (!img.getAttribute("src")) img.src = img.dataset.src;
      });
    }

    function setActive(i) {
      if (i === active) return;
      active = i;
      progress = 0;
      advancing = false;
      cards.forEach((c, k) => c.toggleAttribute("aria-current", k === i));
      const span = document.createElement("span");   // re-inserting replays the slide-up
      span.textContent = slides[i].title;
      cap.replaceChildren(span);
      count.innerHTML = "<b>" + pad2(i + 1) + "</b> / " + pad2(n);
      if (performance.now() - lastTouch < 1500) {    // announce only changes the user made
        live.textContent = "Photo " + (i + 1) + " of " + n + (slides[i].title ? ": " + slides[i].title : "");
      }
      setBar(autoplayOn() ? 0 : (i + 1) / n);        // no autoplay: bar shows position instead
      loadAround(i);
    }

    // Every scroll frame: find the centred photo; in "focus", rack the blur.
    function paint() {
      const mid = track.scrollLeft + track.clientWidth / 2;
      const w = cards[0].offsetWidth || 1;
      let nearest = 0, best = Infinity;
      cards.forEach((c, i) => {
        const centre = c.offsetLeft + c.offsetWidth / 2;
        if (variant === "focus") {
          const f = focusOf(reduceMotion.matches ? 0 : (centre - mid) / w);
          c.style.transform = "scale(" + f.scale.toFixed(4) + ")";
          c.style.filter = f.blur > 0.05
            ? "blur(" + f.blur.toFixed(2) + "px) saturate(" + f.saturate.toFixed(3) + ")"
            : "none";
          c.style.opacity = f.opacity.toFixed(3);
        }
        const dist = Math.abs(centre - mid);
        if (dist < best) { best = dist; nearest = i; }
      });
      setActive(nearest);
    }
    let raf = 0;
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };
    track.addEventListener("scroll", schedule, { passive: true });
    new ResizeObserver(schedule).observe(track);

    function scrollToIndex(i) {
      const card = cards[i];
      track.scrollTo({
        left: card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    }
    function userGo(i) {                             // any manual move restarts the timer
      lastTouch = performance.now();
      progress = 0;
      advancing = false;
      scrollToIndex(wrap(i, n));
    }

    /* ---------- Timer: fill the bar, then advance ---------- */
    let timerRaf = 0, lastFrame = 0, advanceStart = 0;
    function tick(now) {
      timerRaf = 0;
      if (!autoplayOn() || !onScreen) return;        // stops; restarts when visible again
      const dt = Math.min(now - lastFrame, 100);     // ignore long gaps (background tab)
      lastFrame = now;
      if (advancing && now - advanceStart > 1500) {  // scroll got interrupted: start over
        advancing = false;
        progress = 0;
      }
      if (!paused() && !advancing) {
        progress += dt / duration;
        if (progress >= 1) {
          progress = 1;
          advancing = true;                          // cleared when the next photo is centred
          advanceStart = now;
          scrollToIndex(wrap(active + 1, n));
        }
      }
      setBar(advancing ? 1 : progress);
      timerRaf = requestAnimationFrame(tick);
    }
    function startTimer() {
      if (timerRaf || !autoplayOn()) return;
      lastFrame = performance.now();
      timerRaf = requestAnimationFrame(tick);
    }
    reduceMotion.addEventListener("change", () => {
      startTimer();
      setBar(autoplayOn() ? progress : (active + 1) / n);
    });

    /* ---------- Input ---------- */
    root.querySelectorAll(".fp-btn").forEach(b =>
      b.addEventListener("click", () => userGo(active + Number(b.dataset.dir))));
    root.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") userGo(active + 1);
      else if (e.key === "ArrowLeft") userGo(active - 1);
      else return;
      e.preventDefault();
    });

    // Hover pauses for mouse only (on phones a tap "hovers" and never un-hovers).
    root.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hovering = true; });
    root.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hovering = false; });
    root.addEventListener("pointerdown", () => { pressing = true; lastTouch = performance.now(); });
    addEventListener("pointerup", () => (pressing = false));
    addEventListener("pointercancel", () => (pressing = false));
    track.addEventListener("wheel", () => { lastTouch = performance.now(); progress = 0; }, { passive: true });

    // Mouse drag (touch and trackpads already scroll natively).
    let drag = null, justDragged = false;
    track.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    });
    track.addEventListener("pointermove", e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        dragging = true;
        track.dataset.drag = "1";
        track.setPointerCapture(e.pointerId);
      }
      if (drag.moved) track.scrollLeft = drag.left - dx;
    });
    const endDrag = () => {
      const d = drag;
      drag = null;
      if (d && d.moved) {
        justDragged = true;
        setTimeout(() => (justDragged = false), 0);
        dragging = false;
        track.dataset.drag = "0";
        userGo(active);                              // snap to the nearest photo
      }
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    cards.forEach((c, i) => c.addEventListener("click", e => {
      if (justDragged) return e.preventDefault();
      if (i !== active) userGo(i);
    }));

    /* ---------- Visibility ---------- */
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { nearViewport = true; loadAround(Math.max(active, 0)); }
    }, { rootMargin: "600px 0px" }).observe(root);
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) startTimer();
    }).observe(root);

    paint();
  }

  document.querySelectorAll("[data-carousel]").forEach(init);
})();
