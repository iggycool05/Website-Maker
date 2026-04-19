/**
 * pageStore.js
 *
 * Manages multiple HTML pages in the project.
 * The current page's HTML is always reflected in elements.htmlInput.
 *
 * Setting elements.htmlInput.value via the CodeMirror override updates the
 * editor without dispatching a synthetic input event, so callers should call
 * renderPreview() themselves after switching pages.
 */

import { elements } from "../DOM/elements.js";

let pages       = { "index.html": "" };
let currentPage = "index.html";

const _onChange = [];   // registered callbacks for page-change events

// ── Callbacks ─────────────────────────────────────────────────────────────────

/** Register a function to call whenever the active page changes. */
export function onPageChange(fn) {
  _onChange.push(fn);
}

// ── Read ──────────────────────────────────────────────────────────────────────

export function getCurrentPage() { return currentPage; }
export function getAllPages()    { return Object.keys(pages); }
export function getPageHtml(name) { return pages[name] ?? ""; }

// ── Write ─────────────────────────────────────────────────────────────────────

export function setPageHtml(name, html) { pages[name] = html; }

/**
 * Switch to a different page.
 * Saves the current textarea content, loads the new page into the editor.
 * Returns false if the page name is unknown.
 */
export function switchPage(name) {
  if (!Object.prototype.hasOwnProperty.call(pages, name)) return false;
  if (name === currentPage) return true;

  pages[currentPage] = elements.htmlInput.value;
  currentPage        = name;
  elements.htmlInput.value = pages[name];   // syncs CodeMirror (no input event fired)

  _onChange.forEach(fn => fn(name));
  return true;
}

/** Add a new blank page. Returns false if the name already exists. */
export function addPage(name) {
  if (Object.prototype.hasOwnProperty.call(pages, name)) return false;
  pages[name] = "";
  return true;
}

/**
 * Remove a page.
 * Cannot remove "index.html" or the currently visible page.
 */
export function removePage(name) {
  if (name === "index.html") return false;
  if (name === currentPage)  return false;
  if (!Object.prototype.hasOwnProperty.call(pages, name)) return false;
  delete pages[name];
  return true;
}

// ── Serialization ─────────────────────────────────────────────────────────────

/**
 * Return a snapshot of all pages for saving.
 * Always flushes the current textarea content first.
 */
export function serializePages() {
  pages[currentPage] = elements.htmlInput.value;
  return { ...pages };
}

/**
 * Load pages from a saved snapshot.
 * Resets to index.html as the active page.
 */
export function loadPages(data) {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    pages = {};
    for (const [name, html] of Object.entries(data)) {
      pages[name] = typeof html === "string" ? html : "";
    }
  }
  if (!Object.prototype.hasOwnProperty.call(pages, "index.html")) {
    pages["index.html"] = "";
  }

  currentPage = "index.html";
  elements.htmlInput.value = pages["index.html"];
  _onChange.forEach(fn => fn(currentPage));
}

/** Reset to a single empty index.html (used by New Project). */
export function clearPages() {
  pages       = { "index.html": "" };
  currentPage = "index.html";
  elements.htmlInput.value = "";
  _onChange.forEach(fn => fn(currentPage));
}
