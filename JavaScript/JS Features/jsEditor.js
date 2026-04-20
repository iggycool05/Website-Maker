/**
 * jsEditor.js
 *
 * JS Editor ribbon: snippet-insertion buttons that append common JavaScript
 * templates to the user's script.js content and trigger a re-render.
 *
 * Also owns the ribbon toggle function (mirrors cssEditor.js / htmleditorToolbar.js).
 */

import { elements } from "../DOM/elements.js";
import { getRawJs, setRawJs } from "./jsStore.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { scheduleSnapshot } from "../Utils/undoRedo.js";
import { state } from "../State/editorState.js";

// Builder-injected classes that are not user-facing selectors
const _INTERNAL_CLASSES = new Set([
  "draggable-item", "selected-text",
  "resize-handle", "top-left", "top-right", "bottom-left", "bottom-right",
]);

// ── Snippet insertion ─────────────────────────────────────────────────────────

/**
 * Append a JS snippet to rawJs, keep the CodeMirror editor in sync,
 * re-render the preview, and schedule an undo snapshot.
 */
function appendSnippet(snippet) {
  const current   = getRawJs().trimEnd();
  const separator = current.length > 0 ? "\n\n" : "";
  const newJs     = current + separator + snippet;

  setRawJs(newJs);
  elements.jsInput.value = newJs;   // syncs to CodeMirror via the overridden setter

  renderPreview();
  scheduleSnapshot();
}

// ── Snippets ──────────────────────────────────────────────────────────────────

const SNIPPETS = {
  function:    `function myFunction() {\n  // code here\n}`,
  arrow:       `const myFunction = () => {\n  // code here\n};`,
  log:         `console.log("Hello, world!");`,
  timeout:     `setTimeout(() => {\n  // runs after 1 second\n}, 1000);`,
  interval:    `const timer = setInterval(() => {\n  // runs every second\n}, 1000);\n// clearInterval(timer); // call this to stop`,
  query:       `const element = document.querySelector("#my-element");`,
  domLoaded:   `document.addEventListener("DOMContentLoaded", () => {\n  // runs after the page loads\n});`,
  click:       `const btn = document.querySelector("#my-button");\nbtn?.addEventListener("click", (e) => {\n  // handle click\n});`,
  classToggle: `const el = document.querySelector("#my-element");\nel?.classList.toggle("my-class");`,
  fetch:       `fetch("https://api.example.com/data")\n  .then(r => r.json())\n  .then(data => {\n    console.log(data);\n  })\n  .catch(err => console.error("Fetch error:", err));`,
};

// ── Bind to selected element ──────────────────────────────────────────────────

function _selectorFor(el) {
  if (!el) return null;
  if (el.id) return `#${el.id}`;
  const cls = Array.from(el.classList).filter(c => !_INTERNAL_CLASSES.has(c));
  if (cls.length) return `.${cls[0]}`;
  return el.tagName.toLowerCase();
}

function bindClickToSelection() {
  const sel = _selectorFor(state.selectedTextElement);
  if (!sel) {
    alert("Select an element in the preview first, then click Bind Click.");
    return;
  }
  appendSnippet(
    `document.querySelector("${sel}")?.addEventListener("click", (e) => {\n  // handle click on ${sel}\n});`
  );
}

function bindInputToSelection() {
  const sel = _selectorFor(state.selectedTextElement);
  if (!sel) {
    alert("Select an element in the preview first, then click Bind Input.");
    return;
  }
  appendSnippet(
    `document.querySelector("${sel}")?.addEventListener("input", (e) => {\n  console.log("Value:", e.target.value);\n});`
  );
}

// ── Selector picker ───────────────────────────────────────────────────────────

function _parseSelectors() {
  const html = elements.htmlInput.value;
  const ids  = new Set();
  const cls  = new Set();

  // Extract id="..." attributes
  const idRe  = /\bid="([^"]+)"/gi;
  let m;
  while ((m = idRe.exec(html)) !== null) ids.add(m[1].trim());

  // Extract class="..." attributes — split on spaces to get individual classes
  const clsRe = /\bclass="([^"]+)"/gi;
  while ((m = clsRe.exec(html)) !== null) {
    m[1].split(/\s+/).forEach(c => {
      if (c && !_INTERNAL_CLASSES.has(c)) cls.add(c);
    });
  }

  return {
    ids:     [...ids].map(id => `#${id}`),
    classes: [...cls].map(c  => `.${c}`),
  };
}

export function toggleSelectorPicker(anchorEl) {
  const dropdown = document.getElementById("selectorPickerDropdown");
  if (!dropdown) return;

  // Close if already open
  if (dropdown.classList.contains("open")) {
    dropdown.classList.remove("open");
    return;
  }

  const { ids, classes } = _parseSelectors();
  const items = [];

  if (ids.length > 0) {
    items.push(`<div class="sp-section-label">IDs</div>`);
    ids.forEach(sel => {
      items.push(`<div class="sp-item" data-sel="${sel}">${sel}</div>`);
    });
  }
  if (classes.length > 0) {
    items.push(`<div class="sp-section-label">Classes</div>`);
    classes.forEach(sel => {
      items.push(`<div class="sp-item" data-sel="${sel}">${sel}</div>`);
    });
  }
  if (items.length === 0) {
    items.push(`<div class="sp-empty">No IDs or classes found in the HTML.</div>`);
  }

  dropdown.innerHTML = items.join("");

  dropdown.querySelectorAll(".sp-item").forEach(item => {
    item.addEventListener("click", () => {
      appendSnippet(`const el = document.querySelector("${item.dataset.sel}");`);
      dropdown.classList.remove("open");
    });
  });

  // Position below the anchor button
  const rect = anchorEl.getBoundingClientRect();
  dropdown.style.top  = `${rect.bottom + 4}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.classList.add("open");
}

// Close picker on outside click
document.addEventListener("click", e => {
  const dropdown = document.getElementById("selectorPickerDropdown");
  if (!dropdown) return;
  const btn = document.getElementById("jsPickSelectorBtn");
  if (!dropdown.contains(e.target) && e.target !== btn) {
    dropdown.classList.remove("open");
  }
});

// ── Ribbon toggle ─────────────────────────────────────────────────────────────

export function toggleJsEditorRibbon() {
  if (!elements.htmlEditorRibbon.classList.contains("hidden")) {
    elements.htmlEditorRibbon.classList.add("hidden");
    elements.htmlEditorTabBtn.classList.remove("active");
  }
  if (!elements.cssEditorRibbon.classList.contains("hidden")) {
    elements.cssEditorRibbon.classList.add("hidden");
    elements.cssEditorTabBtn.classList.remove("active");
  }
  elements.jsEditorRibbon.classList.toggle("hidden");
  elements.jsEditorTabBtn.classList.toggle("active");
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initJsEditor() {
  // ── Snippets group ──
  elements.jsInsertFunctionBtn .addEventListener("click", () => appendSnippet(SNIPPETS.function));
  elements.jsInsertArrowBtn    .addEventListener("click", () => appendSnippet(SNIPPETS.arrow));
  elements.jsInsertLogBtn      .addEventListener("click", () => appendSnippet(SNIPPETS.log));
  elements.jsInsertTimeoutBtn  ?.addEventListener("click", () => appendSnippet(SNIPPETS.timeout));
  elements.jsInsertIntervalBtn ?.addEventListener("click", () => appendSnippet(SNIPPETS.interval));

  // ── DOM group ──
  elements.jsInsertQueryBtn    .addEventListener("click", () => appendSnippet(SNIPPETS.query));
  elements.jsInsertEventBtn    .addEventListener("click", () => appendSnippet(SNIPPETS.domLoaded));
  elements.jsInsertClickBtn    ?.addEventListener("click", () => appendSnippet(SNIPPETS.click));
  elements.jsInsertClassToggle ?.addEventListener("click", () => appendSnippet(SNIPPETS.classToggle));
  elements.jsInsertFetchBtn    ?.addEventListener("click", () => appendSnippet(SNIPPETS.fetch));

  // ── Bind group ──
  elements.jsBindClickBtn  ?.addEventListener("click", bindClickToSelection);
  elements.jsBindInputBtn  ?.addEventListener("click", bindInputToSelection);

  // ── Selector picker ──
  document.getElementById("jsPickSelectorBtn")?.addEventListener("click", function () {
    toggleSelectorPicker(this);
  });
}
