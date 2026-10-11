// Focus-pull photo carousel.
// Builds itself from every image in the image_carousel/ folder. The file name
// sets the order and the caption:
//   3_Soldering_the_FPGA_board.jpg  ->  3rd slide, "Soldering the FPGA board"
(function () {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;
  const BLUR = 7;                                   // px of blur one photo away from centre
  const AUTOPLAY = Number(root.dataset.autoplay) || 0;
  const folder = root.dataset.folder;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const track = root.querySelector(".fp-track");
  const cap = root.querySelector(".fp-cap");
  const count = root.querySelector(".fp-count");
  const bar = root.querySelector(".fp-bar");
  const live = root.querySelector(".fp-sr");

  /* ---------- 1. Which images exist? ----------
     A static site can't list a folder, so:
     - Live site: GitHub Pages fills in js/carousel-images.json on every push.
     - Local preview: that file is unprocessed, so ask the GitHub API instead
       (it only knows about images you have already pushed). */
  async function listFiles() {
    try {
      const res = await fetch(root.dataset.manifest, { cache: "no-cache" });
      if (res.ok) return JSON.parse(await res.text());   // throws on unprocessed template
    } catch (e) { /* fall through to the API */ }
    const res = await fetch("https://api.github.com/repos/" + root.dataset.repo + "/contents/" + folder);
    if (!res.ok) throw new Error("GitHub API " + res.status);
    return (await res.json()).filter(f => f.type === "file").map(f => f.path);
  }

  /* ---------- 2. File name -> order + caption ---------- */
  function toSlide(path) {
    const clean = String(path).replace(/^\/+/, "");
    const file = clean.split("/").pop();
    const m = file.match(/^(\d+)_(.+)\.[^.]+$/);
    const words = m ? m[2] : file.replace(/\.[^.]+$/, "");
    return {
      file,
      order: m ? Number(m[1]) : Infinity,           // unnumbered files go last
      caption: words.replace(/_+/g, " ").trim(),
      src: clean.split("/").map(encodeURIComponent).join("/"),
    };
  }
  const byOrder = (a, b) =>
    (a.order - b.order) || a.file.localeCompare(b.file, undefined, { numeric: true });

  /* ---------- 3. Focus maths (same curve as the original component) ---------- */
  function focusOf(d, blur) {
    const a = Math.min(Math.abs(d), 1);
    return {
      scale: 1 - 0.14 * a,
      blur: Math.min(Math.abs(d), 2) * blur,
      opacity: 1 - 0.5 * a,
      saturate: 1 - 0.45 * a,
    };
  }
  const wrap = (i, n) => ((i % n) + n) % n;
  const pad2 = n => (n < 10 ? "0" + n : String(n));

  /* ---------- 4. Build ---------- */
  function build(slides) {
    const n = slides.length;
    let active = -1;
    let lastTouch = -Infinity;                       // last user interaction (ms)
    let nearViewport = false;
    let onScreen = false;
    let hovering = false;

    const cards = slides.map((s, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "fp-card";
      card.tabIndex = -1;
      card.setAttribute("aria-label", "Show photo " + (i + 1) + ": " + s.caption);
      const img = document.createElement("img");
      img.alt = s.caption;
      img.draggable = false;
      img.decoding = "async";
      img.dataset.src = s.src;
      card.append(img);
      track.append(card);
      return card;
    });

    root.classList.toggle("fp-single", n < 2);
    root.hidden = false;

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
      cards.forEach((c, k) => c.toggleAttribute("aria-current", k === i));
      const span = document.createElement("span");    // re-inserting replays the slide-up
      span.textContent = slides[i].caption;
      cap.replaceChildren(span);
      count.innerHTML = "<b>" + pad2(i + 1) + "</b> / " + pad2(n);
      if (performance.now() - lastTouch < 1500) {     // announce only user-driven changes
        live.textContent = "Photo " + (i + 1) + " of " + n + ": " + slides[i].caption;
      }
      loadAround(i);
    }

    // Rack focus on every scroll frame.
    function paint() {
      const mid = track.scrollLeft + track.clientWidth / 2;
      const w = cards[0].offsetWidth || 1;
      const blur = reduceMotion.matches ? 0 : BLUR;
      let nearest = 0, best = Infinity;
      cards.forEach((c, i) => {
        const centre = c.offsetLeft + c.offsetWidth / 2;
        const f = focusOf((centre - mid) / w, blur);
        c.style.transform = "scale(" + f.scale.toFixed(4) + ")";
        c.style.filter = f.blur > 0.05
          ? "blur(" + f.blur.toFixed(2) + "px) saturate(" + f.saturate.toFixed(3) + ")"
          : "none";
        c.style.opacity = f.opacity.toFixed(3);
        const dist = Math.abs(centre - mid);
        if (dist < best) { best = dist; nearest = i; }
      });
      const max = track.scrollWidth - track.clientWidth;
      bar.style.setProperty("--fp-p", max > 0 ? (track.scrollLeft / max).toFixed(4) : "0");
      setActive(nearest);
    }

    let raf = 0;
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };
    track.addEventListener("scroll", schedule, { passive: true });
    new ResizeObserver(schedule).observe(track);

    function scrollToIndex(i, smooth = true) {
      const card = cards[i];
      track.scrollTo({
        left: card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2,
        behavior: smooth && !reduceMotion.matches ? "smooth" : "auto",
      });
    }
    function step(dir) {
      lastTouch = performance.now();
      scrollToIndex(wrap(active + dir, n));
    }

    // Arrows, keyboard, clicking a side photo
    root.querySelectorAll(".fp-btn").forEach(b =>
      b.addEventListener("click", () => step(Number(b.dataset.dir))));
    root.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else return;
      e.preventDefault();
    });

    // Mouse drag (touch and trackpads already scroll natively)
    let drag = null, justDragged = false;
    track.addEventListener("pointerdown", e => {
      lastTouch = performance.now();
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    });
    track.addEventListener("pointermove", e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        track.dataset.drag = "1";
        track.setPointerCapture(e.pointerId);
      }
      if (drag.moved) track.scrollLeft = drag.left - dx;
    });
    const endDrag = () => {
      const d = drag;
      drag = null;
      lastTouch = performance.now();
      if (d && d.moved) {
        justDragged = true;
        setTimeout(() => (justDragged = false), 0);
        track.dataset.drag = "0";
        scrollToIndex(active);
      }
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("wheel", () => (lastTouch = performance.now()), { passive: true });
    cards.forEach((c, i) => c.addEventListener("click", e => {
      if (justDragged) return e.preventDefault();
      lastTouch = performance.now();
      scrollToIndex(i);
    }));

    // Pause while hovered or focused (so people can actually read and look)
    root.addEventListener("pointerenter", () => (hovering = true));
    root.addEventListener("pointerleave", () => (hovering = false));

    // Lazy-load when close to view; autoplay only while visible
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { nearViewport = true; loadAround(Math.max(active, 0)); }
    }, { rootMargin: "600px 0px" }).observe(root);
    new IntersectionObserver(([e]) => (onScreen = e.isIntersecting)).observe(root);

    if (AUTOPLAY && n > 1) {
      setInterval(() => {
        if (reduceMotion.matches || !onScreen || document.hidden || hovering) return;
        if (root.contains(document.activeElement)) return;
        if (performance.now() - lastTouch < AUTOPLAY) return;
        scrollToIndex(wrap(active + 1, n));
      }, AUTOPLAY);
    }

    paint();
  }

  /* ---------- 5. Go ---------- */
  listFiles()
    .then(paths => {
      const slides = paths
        .filter(p => typeof p === "string" && IMAGE.test(p) && p.includes(folder + "/"))
        .map(toSlide)
        .sort(byOrder);
      if (slides.length) build(slides);              // no images: carousel stays hidden
    })
    .catch(err => console.warn("Photo carousel:", err.message));
})();
