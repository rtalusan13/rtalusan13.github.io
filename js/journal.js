// =========================================================
// JOURNAL  (pairs with css/journal.css)
//
// Each entry is a Markdown file in journals/ that starts with:
//
//   ---
//   title: Hello world
//   caption: One sentence shown under the title on the journal page.
//   published: 2026-10-19
//   updated: 2026-10-21          <- optional; add it when you edit the entry
//   ---
//
//   The entry itself, in Markdown...
//
// journal.html            lists which files to show (newest first on the page)
// journal-entry.html?p=X  shows journals/X.md as a readable page
//
// Needs js/content.js first, and js/vendor/marked.umd.js on the entry page.
// =========================================================
(function () {
  const FOLDER = "journals/";
  const READER = "journal-entry.html";
  const NAME_OK = /^[a-z0-9][a-z0-9_-]*$/i;           // allowed file names (no paths)

  const C = window.Content;
  if (!C) return;

  async function loadEntry(name) {
    const { meta, body } = C.frontMatter(await C.load(FOLDER + name + ".md"));
    return {
      name,
      body,
      title: meta.title || name.replace(/[-_]+/g, " "),
      caption: meta.caption || "",
      published: C.date(meta.published),
      updated: C.date(meta.updated),
    };
  }

  /* ---------- Small DOM helpers ---------- */

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  // <dl> with "Published" and (if later) "Updated", each a <time>.
  function dateList(className, published, updated) {
    const dl = el("dl", className);
    const add = (label, d) => {
      const row = el("div");
      const t = el("time", "", C.formatDate(d));
      t.dateTime = C.isoDate(d);
      const dd = el("dd");
      dd.append(t);
      row.append(el("dt", "", label), dd);
      dl.append(row);
    };
    if (published) add("Published", published);
    if (updated && (!published || updated > published)) add("Updated", updated);
    return dl;
  }

  const showProblem = (container, message) => C.problem(container, message, "journal-status");

  /* ---------- journal.html: the list ---------- */

  async function renderIndex(root) {
    const tpl = root.querySelector(":scope > template");
    const names = (tpl ? tpl.content.textContent : "")
      .split(/\s+/)
      .map(s => s.split("/").pop().replace(/\.md$/i, ""))
      .filter(s => NAME_OK.test(s));

    const loading = el("p", "journal-status", "Loading…");
    root.append(loading);

    const results = await Promise.allSettled(names.map(loadEntry));
    loading.remove();
    results.forEach(r => { if (r.status === "rejected") console.warn("Journal:", r.reason.message); });
    const entries = results.filter(r => r.status === "fulfilled").map(r => r.value)
      .sort((a, b) => (b.published || 0) - (a.published || 0));

    if (!entries.length) {
      showProblem(root, names.length ? "Couldn't load the journal entries." : "No entries yet.");
      return;
    }

    const list = el("ol", "journal-list");
    entries.forEach(e => {
      const item = el("li", "journal-item");
      const body = el("div", "journal-body");
      const h2 = el("h2", "journal-title");
      const a = el("a", "", e.title);
      a.href = READER + "?p=" + encodeURIComponent(e.name);
      h2.append(a);
      body.append(h2);
      if (e.caption) body.append(el("p", "journal-caption", e.caption));
      const read = el("span", "journal-read", "Read ");
      read.setAttribute("aria-hidden", "true");
      read.append(el("span", "", "→"));
      body.append(read);
      item.append(dateList("journal-dates", e.published, e.updated), body);
      list.append(item);
    });
    root.append(list);
  }

  /* ---------- journal-entry.html: one entry ---------- */

  // Markdown paths are written relative to the .md file (e.g. images/x.jpg),
  // but the page lives one folder up. Point them at the right place, and turn
  // links to other entries (other.md) into reader links.
  function fixLinks(article) {
    const base = new URL(FOLDER, location.href);
    const isRelative = v => v && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(v);
    article.querySelectorAll("img[src], source[src], video[src]").forEach(n => {
      const v = n.getAttribute("src");
      if (isRelative(v)) n.setAttribute("src", new URL(v, base).href);
    });
    article.querySelectorAll("a[href]").forEach(a => {
      const v = a.getAttribute("href");
      if (isRelative(v)) {
        const url = new URL(v, base);
        const m = url.pathname.match(/\/journals\/([^/]+)\.md$/i);
        a.setAttribute("href", m ? READER + "?p=" + m[1] + url.hash : url.href);
      } else if (/^https?:/i.test(v) && new URL(v).origin !== location.origin) {
        a.target = "_blank";
        a.rel = "noopener";
      }
    });
  }

  // An image alone in its paragraph with a "title" becomes a figure with a caption:
  //   ![alt text](images/photo.jpg "Caption shown under the image")
  function makeFigures(article) {
    article.querySelectorAll("p > img").forEach(img => {
      const p = img.parentElement;
      if (p.textContent.trim() || p.querySelectorAll("img").length !== 1) return;
      const fig = el("figure");
      const caption = img.getAttribute("title");
      img.removeAttribute("title");
      fig.append(img);
      if (caption) fig.append(el("figcaption", "", caption));
      p.replaceWith(fig);
    });
    article.querySelectorAll("img").forEach(img => { img.loading = "lazy"; img.decoding = "async"; });
  }

  // Give headings ids so sections can be linked: journal-entry.html?p=x#some-heading
  function addHeadingIds(article) {
    const used = new Set();
    article.querySelectorAll("h2, h3").forEach(h => {
      let id = h.textContent.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      while (used.has(id)) id += "-";
      used.add(id);
      h.id = id;
    });
  }

  async function renderEntry(root) {
    const name = new URLSearchParams(location.search).get("p") || "";
    if (!NAME_OK.test(name)) {
      showProblem(root, "That journal entry doesn't exist.");
      return;
    }
    let e;
    try {
      e = await loadEntry(name);
    } catch (err) {
      console.warn("Journal:", err.message);
      showProblem(root, "That journal entry doesn't exist.");
      return;
    }

    const site = document.title.split("|").pop().trim();
    document.title = e.title + " | " + site;

    const head = el("header", "entry-head");
    head.append(el("h1", "page-title", e.title));
    if (e.caption) head.append(el("p", "lede", e.caption));
    head.append(dateList("entry-meta", e.published, e.updated));

    const article = el("div", "prose");
    article.innerHTML = C.markdown(e.body);
    fixLinks(article);
    makeFigures(article);
    addHeadingIds(article);

    root.append(head, article);
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }

  /* ---------- Start ---------- */
  document.querySelectorAll("[data-journal-index]").forEach(renderIndex);
  document.querySelectorAll("[data-journal-entry]").forEach(renderEntry);
})();
