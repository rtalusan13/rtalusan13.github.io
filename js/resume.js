// =========================================================
// RESUME PAGE  (pairs with css/resume.css)
// Everything shown comes from content/resume.md; the notes at the
// top of that file explain the format. Nothing here needs editing
// for routine changes.
//
// Needs js/content.js and js/vendor/marked.umd.js loaded first.
// =========================================================
(function () {
  const root = document.querySelector("[data-resume]");
  const C = window.Content;
  if (!root || !C) return;

  const SRC = root.dataset.src || "content/resume.md";
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  const DETAIL_KEYS = ["role", "dates", "location", "logo", "current", "open", "tags"];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const yes = C.yes;
  const slug = C.slug;

  const ICON_DOWN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2.5v9m0 0L4 7.5m4 4 4-4M3 14h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_PREV = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_NEXT = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_CHEV = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- Title: words rise in one by one ---------- */
  document.querySelectorAll("[data-pull-up]").forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", words.join(" "));
    h.textContent = "";
    words.forEach((w, i) => {
      const s = el("span", "w", w);
      s.style.setProperty("--i", i);
      s.setAttribute("aria-hidden", "true");
      h.append(s, i < words.length - 1 ? " " : "");
    });
    h.classList.add("split");
  });

  /* ---------- Reading content/resume.md (format rules: js/content.js) ---------- */
  const parse = text => C.parse(text, DETAIL_KEYS);
  const markdown = text => C.markdown(text);

  /* ---------- Courses: colored bubbles with a hover card ----------
     In a row's text, list lines shaped like this become course bubbles:

       ### Relevant coursework
       - ECE 385 | Digital Systems Laboratory | completed | SystemVerilog, FPGA design
       - ECE 391 | Computer Systems Engineering | in progress (Fall 2026) | C, Assembly
       - ECE 411 | Computer Organization and Design | planned | SystemVerilog

     code | full title | status | key skills (comma separated, optional)
     status: completed (green), in progress (yellow), or planned (gray, shown
     as "Planned/Future Coursework"; future, planning and registered also work).
     A term in parentheses after it is shown on the card. The ### line right above
     becomes the group's label ("Coursework" if there isn't one).

     Plain list lines (no | status) under a ### heading that mentions courses
     become simple chips instead: no colors, no status key, no hover card.

       ### Relevant coursework
       - Linear Algebra
       - Differential Equations */
  const STATUSES = [
    { key: "done", label: "Completed",   match: /^(completed?|done|taken|finished|passed)$/ },
    { key: "now",  label: "In progress", match: /^(in[ -]?progress|current|currently taking|taking|ongoing|now)$/ },
    { key: "next", label: "Planned/Future Coursework",
      match: /^(planned|planning|future|registered|upcoming|next|planned ?\/ ?future( coursework)?|(planned|future) coursework)$/ },
  ];
  const COURSE_LINE = /^\s*[-*+]\s+([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*(?:\|\s*(.*?))?\s*$/;

  function parseCourse(line) {
    const m = COURSE_LINE.exec(line);
    if (!m) return null;
    const s = /^([a-z][a-z /-]*?)\s*(?:[(,]\s*([^)]*?)\s*\)?)?$/i.exec(m[3]);
    const status = s && STATUSES.find(st => st.match.test(s[1].toLowerCase().replace(/\s+/g, " ")));
    if (!status) return null;                        // not a course line: stays ordinary Markdown
    return {
      code: m[1],
      title: m[2],
      status,
      term: (s[2] || "").trim(),
      skills: (m[4] || "").split(",").map(t => t.trim()).filter(Boolean),
    };
  }

  const COURSE_HEADING = /^#{3,6}\s+(.*cours.*?)\s*#*\s*$/i;   // "### Relevant coursework", "### Courses"
  const LIST_ITEM = /^\s*[-*+]\s+(.+?)\s*$/;
  const plainText = t => t.replace(/\*\*|__|[*_`]/g, "").trim();

  // Splits a row's text into Markdown parts and course groups, in order.
  function splitCourses(text) {
    const lines = text.split("\n");
    const parts = [];
    let md = [];
    const flush = () => { if (md.join("").trim()) parts.push({ md: md.join("\n") }); md = []; };
    const nextFilled = k => { while (k < lines.length && !lines[k].trim()) k++; return k; };
    for (let i = 0; i < lines.length; i++) {
      // A course heading over plain list lines: simple chips.
      const ch = COURSE_HEADING.exec(lines[i]);
      if (ch) {
        let k = nextFilled(i + 1);
        if (k < lines.length && LIST_ITEM.test(lines[k]) && !parseCourse(lines[k])) {
          const names = [];
          while (k < lines.length && LIST_ITEM.test(lines[k]) && !parseCourse(lines[k])) {
            names.push(plainText(LIST_ITEM.exec(lines[k])[1]));
            i = k;
            k = nextFilled(k + 1);
          }
          flush();
          parts.push({ label: ch[1], names });
          continue;
        }
      }
      const first = parseCourse(lines[i]);
      if (!first) { md.push(lines[i]); continue; }
      let j = md.length - 1;                         // a ### heading just above names the group
      while (j >= 0 && !md[j].trim()) j--;
      const h = j >= 0 && /^#{3,6}\s+(.+?)\s*#*\s*$/.exec(md[j]);
      if (h) md.length = j;
      flush();
      const items = [first];
      for (;;) {                                     // more course lines (blank lines between are fine)
        let k = i + 1;
        while (k < lines.length && !lines[k].trim()) k++;
        const next = k < lines.length && parseCourse(lines[k]);
        if (!next) break;
        items.push(next);
        i = k;
      }
      parts.push({ label: h ? h[1] : "Coursework", items });
    }
    flush();
    return parts;
  }

  // Course names as plain chips (no status), e.g. high school coursework.
  function plainCourseGroup({ label, names }) {
    const box = el("div", "rz-courses");
    const head = el("div", "rz-courses-head");
    head.append(el("h4", "rz-courses-title", label));
    const list = el("ul", "tags rz-course-tags");
    list.setAttribute("aria-label", label);
    names.forEach(n => list.append(el("li", "", n)));
    box.append(head, list);
    return box;
  }

  function courseGroup({ label, items }) {
    const box = el("div", "rz-courses");
    const head = el("div", "rz-courses-head");
    head.append(el("h4", "rz-courses-title", label));
    const key = el("ul", "rz-key");                  // color key: only the statuses used here
    key.setAttribute("aria-hidden", "true");
    STATUSES.filter(st => items.some(c => c.status === st)).forEach(st => {
      const li = el("li", "", st.label);
      li.dataset.status = st.key;
      key.append(li);
    });
    head.append(key);

    const list = el("ul", "rz-course-list");
    list.setAttribute("aria-label", label);
    items.forEach(c => {
      const li = el("li");
      const b = el("button", "rz-course");
      b.type = "button";
      b.dataset.status = c.status.key;
      b.append(el("span", "rz-course-code", c.code));
      // screen readers get the card's content right away
      b.append(el("span", "sr-only", ": " + c.title + ". " + c.status.label + (c.term ? ", " + c.term : "") +
        "." + (c.skills.length ? " Skills: " + c.skills.join(", ") + "." : "")));
      b._course = c;
      li.append(b);
      list.append(li);
    });
    box.append(head, list);
    return box;
  }

  // One shared card, placed over the page (so no scrolling box can cut it off).
  const tip = { el: null, for: null, hideTimer: 0 };
  function tipEl() {
    if (tip.el) return tip.el;
    tip.el = el("div", "rz-tip");
    tip.el.setAttribute("aria-hidden", "true");      // the bubble already carries this text
    document.body.append(tip.el);
    return tip.el;
  }
  function placeTip() {
    const btn = tip.for;
    if (!btn) return;
    const r = btn.parentElement.getBoundingClientRect();   // the <li>: not moved by the pop-out
    if (!btn.isConnected || !r.width || btn.closest("[hidden], .rz-entry:not(.open)")) { hideTip(true); return; }
    const t = tip.el;
    const w = t.offsetWidth, h = t.offsetHeight, gap = 12;
    const bar = document.querySelector(".rz-bar-wrap");
    const minTop = Math.max(8, bar ? bar.getBoundingClientRect().bottom + 6 : 8);
    let top = r.top - gap - h, side = "above";
    if (top < minTop) { top = r.bottom + gap; side = "below"; }
    const cx = r.left + r.width / 2;
    const left = Math.max(8, Math.min(innerWidth - 8 - w, cx - w / 2));
    t.dataset.side = side;
    t.style.left = Math.round(left) + "px";
    t.style.top = Math.round(top) + "px";
    t.style.setProperty("--ax", Math.round(cx - left) + "px");
  }
  function showTip(btn) {
    clearTimeout(tip.hideTimer);
    const c = btn._course;
    const t = tipEl();
    if (tip.for && tip.for !== btn) tip.for.classList.remove("is-tipped");
    if (tip.for !== btn) {
      t.replaceChildren();
      const top = el("div", "rz-tip-top");
      top.append(el("span", "rz-tip-code", c.code));
      const st = el("span", "rz-tip-status", c.status.label + (c.term ? " · " + c.term : ""));
      st.dataset.status = c.status.key;
      top.append(st);
      t.append(top, el("p", "rz-tip-title", c.title));
      if (c.skills.length) {
        const ul = el("ul", "rz-tip-skills");
        c.skills.forEach(s => ul.append(el("li", "", s)));
        t.append(ul);
      }
      t.append(el("i", "rz-tip-arrow"));
    }
    tip.for = btn;
    btn.classList.add("is-tipped");
    placeTip();
    t.classList.add("show");
  }
  function hideTip(now) {
    clearTimeout(tip.hideTimer);
    const go = () => {
      if (tip.for) tip.for.classList.remove("is-tipped");
      tip.for = null;
      if (tip.el) tip.el.classList.remove("show");
    };
    if (now === true) go(); else tip.hideTimer = setTimeout(go, 90);  // moving to a neighbor doesn't flicker
  }

  // Mouse: hover. Keyboard: focus. Touch: tap to open, tap elsewhere to close.
  let lastPointer = "mouse";
  document.addEventListener("pointerdown", e => {
    lastPointer = e.pointerType || "mouse";
    if (tip.for && !e.target.closest(".rz-course")) hideTip(true);
  }, true);
  document.addEventListener("pointerover", e => {
    const b = e.target.closest && e.target.closest(".rz-course");
    if (b && e.pointerType === "mouse") showTip(b);
  });
  document.addEventListener("pointerout", e => {
    const b = e.target.closest && e.target.closest(".rz-course");
    if (b && e.pointerType === "mouse" && !b.contains(e.relatedTarget) && !b.matches(":focus-visible")) hideTip();
  });
  document.addEventListener("click", e => {
    const b = e.target.closest(".rz-course");
    if (!b) return;
    if (lastPointer !== "mouse" && tip.for === b) hideTip(true); else showTip(b);
  });
  document.addEventListener("focusin", e => { if (e.target.matches(".rz-course:focus-visible")) showTip(e.target); });
  document.addEventListener("focusout", e => { if (e.target === tip.for) hideTip(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && tip.for) hideTip(true); });
  let tipQueued = false;
  const queueTip = () => {
    if (!tip.for || tipQueued) return;
    tipQueued = true;
    requestAnimationFrame(() => { tipQueued = false; placeTip(); });
  };
  addEventListener("scroll", queueTip, { passive: true });
  addEventListener("resize", queueTip);

  /* ---------- Building one row ---------- */
  function initials(name) {
    const skip = /^(of|the|and|at|for|in|&)$/i;
    const words = name.replace(/[\[\]()]/g, "").split(/[\s-]+/).filter(w => w && !skip.test(w));
    return (words.slice(0, 2).map(w => w[0]).join("") || "?").toUpperCase();
  }

  function logoBox(entry) {
    const src = (entry.details.logo || "").trim();
    const box = el("span", "rz-logo");
    box.setAttribute("aria-hidden", "true");
    const useInitials = () => { box.className = "rz-logo mono"; box.textContent = initials(entry.title); };
    if (!src) { useInitials(); return box; }
    const img = el("img");
    img.alt = "";
    img.decoding = "async";
    img.addEventListener("error", useInitials, { once: true });
    img.src = src;
    box.append(img);
    return box;
  }

  function nowBadge() {
    const b = el("span", "rz-now");
    b.append(el("i"), document.createTextNode("Current"));
    return b;
  }

  let uid = 0;
  function buildEntry(entry, index) {
    const d = entry.details;
    const li = el("li", "rz-entry");
    li.style.setProperty("--i", index);
    const hasLogo = (d.logo || "").trim().toLowerCase() !== "none";
    if (!hasLogo) li.classList.add("no-logo");

    const bodyText = entry.body;
    const tags = (d.tags || "").split(",").map(t => t.trim()).filter(Boolean);
    const hasDropdown = !!(bodyText || tags.length);
    const current = yes(d.current);

    const h3 = el("h3");
    const row = el(hasDropdown ? "button" : "div", "rz-row");
    if (hasLogo) row.append(logoBox(entry));

    const main = el("span", "rz-main");
    main.append(el("span", "rz-name", entry.title));
    const sub = [d.role, d.location].filter(Boolean).join(" · ");
    if (sub) main.append(el("span", "rz-sub", sub));
    if (d.dates || current) {                         // phone layout shows these under the title
      const m = el("span", "rz-meta-m");
      if (d.dates) m.append(el("span", "rz-dates", d.dates));
      if (current) m.append(nowBadge());
      main.append(m);
    }
    row.append(main);

    const side = el("span", "rz-side");
    if (d.dates) side.append(el("span", "rz-dates", d.dates));
    if (current) side.append(nowBadge());
    if (hasDropdown) {
      const chev = el("span", "rz-chev");
      chev.innerHTML = ICON_CHEV;
      side.append(chev);
    }
    row.append(side);
    h3.append(row);
    li.append(h3);

    if (hasDropdown) {
      const id = "rz-entry-" + (++uid);
      const collapse = el("div", "rz-collapse");
      collapse.id = id;
      const inner = el("div");
      const content = el("div", "rz-content");
      if (bodyText) {
        splitCourses(bodyText).forEach(part => {
          if (part.names) { content.append(plainCourseGroup(part)); return; }
          if (!part.md) { content.append(courseGroup(part)); return; }
          const tmp = el("div");
          tmp.innerHTML = markdown(part.md);
          content.append(...tmp.childNodes);
        });
      }
      if (tags.length) {
        const ul = el("ul", "tags");
        tags.forEach(t => ul.append(el("li", "", t)));
        content.append(ul);
      }
      C.externalLinksInNewTab(content);
      inner.append(content);
      collapse.append(inner);
      li.append(collapse);

      row.type = "button";
      row.setAttribute("aria-controls", id);
      const setOpen = open => {
        if (!open && tip.for && li.contains(tip.for)) hideTip(true);
        li.classList.toggle("open", open);
        row.setAttribute("aria-expanded", String(open));
        collapse.inert = !open;                       // closed content can't be tabbed into
      };
      setOpen(yes(d.open));
      row.addEventListener("click", () => setOpen(!li.classList.contains("open")));
    }
    return li;
  }

  /* ---------- Building the page ---------- */
  const showProblem = message => C.problem(root, message, "rz-status");

  async function addPdfButton(meta) {
    const row = root.querySelector(".rz-pdf-row");
    if (!row || !meta.pdf) return;
    try {
      const res = await fetch(meta.pdf, { method: "HEAD", cache: "no-cache" });
      if (!res.ok) throw new Error(meta.pdf + " not found (HTTP " + res.status + ")");
    } catch (err) {
      console.warn("Resume PDF button hidden:", err.message);
      return;
    }
    const a = el("a", "rz-pdf");
    a.href = meta.pdf;
    a.target = "_blank";
    a.rel = "noopener";
    a.append(document.createTextNode("Download PDF"));
    const icon = el("span", "rz-pdf-icon");
    icon.innerHTML = ICON_DOWN;
    a.append(icon);
    row.append(a);
    const date = C.date(meta.updated);
    if (date) {
      const t = el("time", "", C.formatDate(date));
      t.dateTime = C.isoDate(date);
      const p = el("span", "rz-updated", "Updated ");
      p.append(t);
      row.append(p);
    }
  }

  function build({ meta, sections }) {
    addPdfButton(meta);
    if (!sections.length) { showProblem("No resume sections found in " + SRC + "."); return; }

    const ids = [];
    sections.forEach(s => { let id = slug(s.short); while (ids.includes(id)) id += "-2"; ids.push(id); });

    /* Section bar */
    const wrap = el("div", "rz-bar-wrap");
    const bar = el("div", "rz-bar");
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", "Resume sections");
    // Two layers: the outer one slides from tab to tab; the inner "blob" leans,
    // stretches and squishes around its own center, so it can bend either way.
    const bubble = el("span", "rz-bubble");
    bubble.setAttribute("aria-hidden", "true");
    const blob = el("span", "rz-blob");
    bubble.append(blob);
    bar.append(bubble);

    const tabs = sections.map((s, i) => {
      const t = el("button", "rz-tab");
      t.type = "button";
      t.id = "tab-" + ids[i];
      t.setAttribute("role", "tab");
      t.setAttribute("aria-controls", "panel-" + ids[i]);
      t.append(el("span", "t-full", s.label), el("span", "t-short", s.short));
      bar.append(t);
      return t;
    });
    // Small round buttons either side of the bar: previous / next, wrapping around.
    const arrowButton = (step, label, icon) => {
      const b = el("button", "rz-arrow");
      b.type = "button";
      b.setAttribute("aria-label", label);
      b.innerHTML = icon;
      b.addEventListener("click", () => select((active + step + sections.length) % sections.length));
      return b;
    };
    wrap.append(arrowButton(-1, "Previous section", ICON_PREV), bar, arrowButton(1, "Next section", ICON_NEXT));

    /* Panels */
    const stage = el("div", "rz-stage");
    const panels = sections.map((s, i) => {
      const p = el("div", "rz-panel");
      p.id = "panel-" + ids[i];
      p.setAttribute("role", "tabpanel");
      p.setAttribute("aria-labelledby", tabs[i].id);
      p.tabIndex = 0;
      p.hidden = true;
      const intro = s.intro;
      if (intro) {
        const div = el("div", "rz-intro");
        div.innerHTML = markdown(intro);
        p.append(div);
      }
      const list = el("ul", "rz-list");
      s.entries.forEach((e, k) => list.append(buildEntry(e, k)));
      p.append(list);
      stage.append(p);
      return p;
    });

    root.append(wrap, stage);

    /* Bubble position; short names when the full ones don't fit */
    let active = -1;
    function placeBubble(animate) {
      const t = tabs[active];
      if (!t) return;
      if (!animate) bubble.style.transition = "none";
      bubble.style.setProperty("--x", t.offsetLeft + "px");
      bubble.style.setProperty("--w", t.offsetWidth + "px");
      if (!animate) { void bubble.offsetWidth; bubble.style.transition = ""; }
    }
    function fit() {
      bar.classList.remove("compact");
      if (bar.scrollWidth > bar.clientWidth + 1) bar.classList.add("compact");
      placeBubble(false);
    }
    new ResizeObserver(fit).observe(wrap);

    /* Switching sections, with a sideways slide */
    let running = [];
    function stopRunning() {
      running.forEach(r => { r.anims.forEach(a => a.cancel()); r.done(); });
      running = [];
    }

    function centerTab(instant) {                    // keep the chosen tab in view if the bar scrolls
      const t = tabs[active];
      bar.scrollTo({ left: t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior: instant ? "auto" : "smooth" });
    }

    function select(i, { instant = false, focus = false, fromDrag = false } = {}) {
      i = Math.max(0, Math.min(sections.length - 1, i));
      if (i === active) return;
      const prev = active;
      active = i;
      hideTip(true);

      tabs.forEach((t, k) => {
        t.setAttribute("aria-selected", String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      if (focus) tabs[i].focus();
      placeBubble(!instant);
      if (!instant && !fromDrag && !reduceMotion.matches) {   // little squish as it lands
        blob.animate([{ scale: "1 1" }, { scale: "1.08 0.84" }, { scale: "1 1" }], { duration: 480, easing: "ease-out" });
      }
      if (!fromDrag) centerTab(instant);
      if (!instant) history.replaceState(null, "", "#" + ids[i]);  // address remembers the section

      stopRunning();
      const from = panels[prev], to = panels[i];
      if (!from || instant || reduceMotion.matches) {
        panels.forEach((p, k) => (p.hidden = k !== i));
        return;
      }

      // If the reader scrolled down, bring the top of the new section into view.
      const stageTop = stage.getBoundingClientRect().top;
      if (stageTop < wrap.offsetHeight + 20) {
        scrollTo({ top: scrollY + stageTop - wrap.offsetHeight - 30, behavior: "smooth" });
      }

      const dir = i > prev ? 1 : -1;
      const h0 = stage.offsetHeight;
      to.hidden = false;
      Object.assign(from.style, { position: "absolute", top: "0", left: "0", right: "0" });
      const h1 = stage.offsetHeight;

      const anims = [
        stage.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 480, easing: EASE }),
        from.animate([{ transform: "translateX(0)", opacity: 1 }, { transform: `translateX(${-dir * 12}%)`, opacity: 0 }],
          { duration: 220, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" }),
        to.animate([{ transform: `translateX(${dir * 12}%)`, opacity: 0 }, { transform: "translateX(0)", opacity: 1 }],
          { duration: 480, delay: 70, easing: EASE, fill: "backwards" }),
      ];
      const job = { anims, done: () => { from.hidden = true; from.removeAttribute("style"); } };
      running.push(job);
      Promise.all(anims.map(a => a.finished)).then(() => {
        if (running.includes(job)) { job.anims[1].cancel(); job.done(); running = running.filter(r => r !== job); }
      }, () => {});
    }

    tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));

    // Press and drag along the bar (mouse or finger). The selection follows the
    // pointer, but only jumps to a section once the pointer is past the halfway
    // point between two sections, so the bubble never sits between two.
    const nearestTab = x => {
      let best = 0, bestDist = Infinity;
      tabs.forEach((t, k) => {
        const r = t.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - x);
        if (dist < bestDist) { bestDist = dist; best = k; }
      });
      return best;
    };
    // The bubble reaches toward the pointer, left or right: the edge nearest the
    // pointer travels `reach` px at most, the far edge follows a little (FOLLOW),
    // and the bubble flattens slightly as it stretches. A little while the mouse
    // is over the bar, a lot while dragging. Measured from the chosen tab (not
    // the bubble) so the stretch doesn't feed back into its own position.
    //   near edge moves e, far edge moves e*FOLLOW
    //   => shift the center by e*(1+FOLLOW)/2 and widen by |e|*(1-FOLLOW)
    const FOLLOW = 0.2;
    function lean(clientX, strength) {
      if (reduceMotion.matches || !tabs[active]) return;
      const t = tabs[active].getBoundingClientRect();
      const b = bar.getBoundingClientRect();
      const reach = strength > 0.2 ? 44 : 10;
      let e = (clientX - (t.left + t.width / 2)) * strength;
      e = Math.max(-reach, Math.min(reach, e));
      const room = e < 0 ? t.left - b.left - 3 : b.right - t.right - 3;   // stay inside the bar
      e = Math.sign(e) * Math.min(Math.abs(e), Math.max(0, room));
      const stretch = Math.min(0.45, (Math.abs(e) * (1 - FOLLOW)) / Math.max(t.width, 1));
      bar.classList.add("tracking");
      blob.style.setProperty("--lean", (e * (1 + FOLLOW) / 2).toFixed(1) + "px");
      blob.style.setProperty("--stretch", stretch.toFixed(3));
    }
    function relax() {                                 // spring back to round
      bar.classList.remove("tracking");
      blob.style.setProperty("--lean", "0px");
      blob.style.setProperty("--stretch", "0");
    }
    bar.addEventListener("pointermove", e => { if (!drag && e.pointerType === "mouse") lean(e.clientX, 0.07); });
    bar.addEventListener("pointerleave", () => { if (!drag) relax(); });

    let drag = null;
    bar.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, moved: false };
      bar.classList.add("held");                      // the bubble swells while held
    });
    bar.addEventListener("pointermove", e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.abs(e.clientX - drag.x) < 6) return; // small wobble is still a tap
        drag.moved = true;
        bar.classList.add("dragging");
        try { bar.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone */ }
      }
      select(nearestTab(e.clientX), { fromDrag: true });
      lean(e.clientX, 0.4);
    });
    const endDrag = e => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const moved = drag.moved;
      drag = null;
      bar.classList.remove("held", "dragging");
      relax();
      if (moved) centerTab();
    };
    bar.addEventListener("pointerup", endDrag);
    bar.addEventListener("pointercancel", endDrag);
    bar.addEventListener("lostpointercapture", endDrag);
    bar.addEventListener("keydown", e => {
      const keys = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(keys[e.key], { focus: true });
    });

    // Swipe left/right on phones and tablets to change section.
    let start = null;
    stage.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") start = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener("pointercancel", () => (start = null));
    stage.addEventListener("pointerup", e => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 1.6 * Math.abs(dy)) select(active + (dx < 0 ? 1 : -1));
    });

    // Open on the section named in the address (resume.html#work), else the first.
    const fromHash = () => Math.max(0, ids.indexOf(decodeURIComponent(location.hash.slice(1))));
    select(fromHash(), { instant: true });
    addEventListener("hashchange", () => select(fromHash()));
    fit();

    // First load only: rows rise in one after another.
    if (!reduceMotion.matches) {
      stage.classList.add("rz-enter");
      setTimeout(() => stage.classList.remove("rz-enter"), 2000);
    }

    // Once per visit, the bubble gives a small elastic tug to the right, so it
    // reads as something you can pull (phones have no hover to show this).
    let nudged = false;
    try { nudged = sessionStorage.getItem("rz-nudged") === "1"; sessionStorage.setItem("rz-nudged", "1"); } catch (_) { /* storage off */ }
    if (!nudged && !reduceMotion.matches) {
      setTimeout(() => {
        if (drag || bar.matches(":hover")) return;
        const r = tabs[active].getBoundingClientRect();
        lean(r.right + 120, 0.4);
        bar.classList.remove("tracking");               // use the slow, springy return
        setTimeout(() => { if (!drag) relax(); }, 280);
      }, 1500);
    }
  }

  C.load(SRC)
    .then(text => build(parse(text)))
    .catch(err => { console.warn("Resume:", err.message); showProblem("The resume couldn't be loaded."); });
})();
