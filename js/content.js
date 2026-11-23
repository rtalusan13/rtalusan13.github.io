// =========================================================
// CONTENT HELPERS: shared by every page that is built from a
// Markdown file (resume, projects, journal). Load it (defer)
// before those pages' own scripts.
//
//   Content.load(url)            -> text of a file (clear error if missing)
//   Content.frontMatter(text)    -> { meta, body } from a leading --- block
//   Content.parse(text, keys)    -> { meta, sections: [{ label, short, intro, entries }] }
//   Content.markdown(text)       -> HTML (via js/vendor/marked.umd.js)
//   Content.date("2026-01-04")   -> Date, or null;  Content.formatDate(date) -> "Jan 4, 2026"
//   Content.slug("Two words")    -> "two-words"
//   Content.problem(el, message) -> shows a message (explains file:// previews)
// =========================================================
(function () {
  const yes = v => /^(y|yes|true|1)$/i.test(String(v == null ? "" : v).trim());

  function slug(s) {
    return String(s).toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
  }

  async function load(url) {
    let res;
    try {
      res = await fetch(url, { cache: "no-cache" });
    } catch (err) {
      throw new Error("Couldn't reach " + url + " (" + err.message + ")");
    }
    if (!res.ok) throw new Error(url + ": HTTP " + res.status);
    return res.text();
  }

  function pairs(block) {
    const out = {};
    block.split("\n").forEach(line => {
      const m = line.match(/^\s*([A-Za-z][\w-]*)\s*:\s*(.*?)\s*$/);
      if (m) out[m[1].toLowerCase()] = m[2].replace(/^(["'])(.*)\1$/, "$2");
    });
    return out;
  }

  function normalize(text) {
    return String(text).replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  }

  // "---\nkey: value\n---\nbody"  ->  { meta: {key: "value"}, body }
  function frontMatter(text) {
    text = normalize(text);
    const m = text.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
    return m ? { meta: pairs(m[1]), body: text.slice(m[0].length) } : { meta: {}, body: text };
  }

  // Reads the shared format used by content/*.md:
  //   # Section | Short name          (optional; sections become tabs, etc.)
  //   ## Entry title
  //   key: value                       (only keys listed in `keys`, right under ##;
  //                                     a key may repeat: entry.all[key] keeps every value)
  //   (blank line, then the entry's Markdown)
  // Entries written before any # heading go into one unnamed section.
  // HTML comments are ignored.
  function parse(text, keys) {
    const { meta, body } = frontMatter(text);
    const lines = body.replace(/<!--[\s\S]*?-->/g, "").split("\n");
    const allowed = new Set(keys.map(k => k.toLowerCase()));
    const sections = [];
    let section = null, entry = null, inDetails = false, inCode = false;
    const newSection = (label, short) => {
      section = { label, short: short || label, intro: [], entries: [] };
      sections.push(section);
      entry = null;
    };
    for (const line of lines) {
      if (/^\s*```/.test(line)) inCode = !inCode;
      let m;
      if (!inCode && (m = line.match(/^#\s+(.+?)\s*#*\s*$/))) {
        const [full, short] = m[1].split("|").map(s => s.trim());
        newSection(full, short);
        continue;
      }
      if (!inCode && (m = line.match(/^##\s+(.+?)\s*#*\s*$/))) {
        if (!section) newSection("", "");
        entry = { title: m[1], details: {}, all: {}, body: [] };
        section.entries.push(entry);
        inDetails = true;
        continue;
      }
      if (!section) continue;
      if (!entry) { section.intro.push(line); continue; }
      if (inDetails) {
        const kv = line.match(/^\s*([A-Za-z]+)\s*:\s*(.*?)\s*$/);
        if (kv && allowed.has(kv[1].toLowerCase())) {
          const key = kv[1].toLowerCase();
          entry.details[key] = entry.details[key] == null ? kv[2] : entry.details[key];   // first one wins
          (entry.all[key] = entry.all[key] || []).push(kv[2]);
          continue;
        }
        inDetails = false;                              // first other line ends the details
        if (!line.trim()) continue;
      }
      entry.body.push(line);
    }
    sections.forEach(s => {
      s.intro = s.intro.join("\n").trim();
      s.entries.forEach(e => { e.body = e.body.join("\n").trim(); });
    });
    return { meta, sections };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function markdown(text) {
    if (window.marked && typeof window.marked.parse === "function") return window.marked.parse(text);
    return "<pre>" + escapeHtml(text) + "</pre>";      // converter missing: plain text
  }

  // "2026-10-19" -> Date pinned to UTC so no time zone can shift the day
  function date(s) {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || "").trim());
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  }
  const pretty = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const formatDate = d => pretty.format(d);
  const isoDate = d => d.toISOString().slice(0, 10);

  // External links in rendered Markdown open in a new tab.
  function externalLinksInNewTab(container) {
    container.querySelectorAll("a[href]").forEach(a => {
      try {
        const u = new URL(a.getAttribute("href"), location.href);
        if (/^https?:$/.test(u.protocol) && u.origin !== location.origin) { a.target = "_blank"; a.rel = "noopener"; }
      } catch (_) { /* not a URL */ }
    });
  }

  function problem(container, message, className) {
    const p = document.createElement("p");
    p.className = className || "content-status";
    p.textContent = location.protocol === "file:"
      ? "This part of the page can't load from a file opened directly. Preview the site " +
        "through a local server instead: double-click dev/preview (see README.md)."
      : message;
    container.append(p);
    return p;
  }

  window.Content = { load, frontMatter, parse, markdown, date, formatDate, isoDate, slug, yes, problem, escapeHtml, externalLinksInNewTab };
})();
