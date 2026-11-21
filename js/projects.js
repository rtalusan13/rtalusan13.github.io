// =========================================================
// PROJECTS: builds project cards and the Projects page from
// content/projects.md (format notes at the top of that file).
//
//   <div class="project-grid" data-projects="featured"></div>   home page cards
//   <div data-projects="all"></div>                             full Projects page
//
// Needs js/content.js first; the Projects page also needs
// js/vendor/marked.umd.js for the write-ups.
// =========================================================
(function () {
  const C = window.Content;
  const roots = document.querySelectorAll("[data-projects]");
  if (!roots.length || !C) return;

  const SRC = "content/projects.md";
  const KEYS = ["id", "kicker", "date", "status", "image", "alt", "summary", "tags", "links", "featured"];
  const PAGE = "projects.html";

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function toProject(entry, used) {
    const d = entry.details;
    let id = C.slug(d.id || entry.title);
    while (used.has(id)) id += "-2";
    used.add(id);
    const links = [];
    (d.links || "").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => { links.push({ label, href }); return ""; });
    return {
      id,
      title: entry.title,
      kicker: d.kicker || "",
      date: d.date || "",
      status: d.status || "",
      image: d.image || "",
      alt: d.alt != null ? d.alt : entry.title,
      summary: d.summary || "",
      tags: (d.tags || "").split(",").map(t => t.trim()).filter(Boolean),
      links,
      featured: C.yes(d.featured),
      body: entry.body,
    };
  }

  function metaRow(p, withDate) {
    const row = el("div", "project-meta");
    if (p.kicker) row.append(el("span", "project-kicker", p.kicker));
    if (withDate && p.date) row.append(el("span", "project-date", p.date));
    if (p.status) row.append(el("span", "status-badge", p.status));
    return row.childNodes.length ? row : null;
  }

  function tagList(tags) {
    if (!tags.length) return null;
    const ul = el("ul", "tags");
    tags.forEach(t => ul.append(el("li", "", t)));
    return ul;
  }

  // Image that quietly disappears if its file is missing (the card stays tidy).
  function picture(p, wrapperClass, onMissing) {
    if (!p.image) return null;
    const box = el("div", wrapperClass);
    const img = el("img");
    img.src = p.image;
    img.alt = p.alt;
    img.width = 1200;
    img.height = 750;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => { box.remove(); if (onMissing) onMissing(); }, { once: true });
    box.append(img);
    return box;
  }

  /* ---------- Home page: cards ---------- */
  function renderCards(root, projects) {
    const limit = Number(root.dataset.limit) || 3;
    const list = projects.filter(p => p.featured).slice(0, limit);
    if (!list.length) { C.problem(root, "No featured projects yet."); return; }
    list.forEach((p, i) => {
      const card = el("article", "project-card" + (i === 0 ? " featured" : ""));
      const media = picture(p, "project-media", () => card.classList.add("no-media"));
      if (media) card.append(media); else card.classList.add("no-media");
      const body = el("div", "project-body");
      const meta = metaRow(p, false);
      if (meta) body.append(meta);
      const h3 = el("h3");
      const a = el("a", "", p.title);
      a.href = PAGE + "#" + p.id;
      h3.append(a);
      body.append(h3);
      if (p.summary) body.append(el("p", "", p.summary));
      const tags = tagList(p.tags);
      if (tags) body.append(tags);
      card.append(body);
      root.append(card);
    });
  }

  /* ---------- Projects page: every project in full ---------- */
  function renderAll(root, projects) {
    if (!projects.length) { C.problem(root, "No projects yet."); return; }

    if (projects.length > 1) {                        // quick links to each project
      const jump = el("nav", "pj-jump");
      jump.setAttribute("aria-label", "Projects on this page");
      projects.forEach(p => {
        const a = el("a", "", p.title.split(":")[0]);
        a.href = "#" + p.id;
        jump.append(a);
      });
      root.append(jump);
    }

    projects.forEach(p => {
      const art = el("article", "pj");
      art.id = p.id;
      const top = el("div", "pj-top");
      const media = picture(p, "pj-media", () => top.classList.add("no-media"));
      if (media) top.append(media); else top.classList.add("no-media");

      const info = el("div", "pj-info");
      const meta = metaRow(p, true);
      if (meta) info.append(meta);
      info.append(el("h2", "pj-title", p.title));
      if (p.summary) info.append(el("p", "pj-summary", p.summary));
      const tags = tagList(p.tags);
      if (tags) info.append(tags);
      if (p.links.length) {
        const row = el("div", "pj-links");
        p.links.forEach(l => {
          const a = el("a", "btn btn-outline", l.label);
          a.href = l.href;
          if (/^https?:/i.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; }
          row.append(a);
        });
        info.append(row);
      }
      top.append(info);
      art.append(top);

      if (p.body) {
        const prose = el("div", "prose pj-body");
        prose.innerHTML = C.markdown(p.body);
        C.externalLinksInNewTab(prose);
        art.append(prose);
      }
      root.append(art);
    });

    // The address may point at a project (projects.html#aurora-os); it didn't
    // exist when the page first loaded, so scroll to it now.
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
      target.classList.add("is-target");
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
  }

  roots.forEach(r => r.setAttribute("aria-busy", "true"));
  C.load(SRC)
    .then(text => {
      const used = new Set();
      const projects = C.parse(text, KEYS).sections.flatMap(s => s.entries).map(e => toProject(e, used));
      roots.forEach(root => {
        if (root.dataset.projects === "all") renderAll(root, projects); else renderCards(root, projects);
        root.removeAttribute("aria-busy");
        if (window.Site && window.Site.watchReveal) root.querySelectorAll(".reveal").forEach(window.Site.watchReveal);
      });
    })
    .catch(err => {
      console.warn("Projects:", err.message);
      roots.forEach(root => {
        root.removeAttribute("aria-busy");
        C.problem(root, "The projects couldn't be loaded. Try refreshing the page.");
      });
    });
})();
