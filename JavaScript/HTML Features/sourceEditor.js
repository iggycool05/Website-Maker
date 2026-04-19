/**
 * sourceEditor.js
 *
 * Owns two responsibilities:
 *   1. View switching  – toggles between the live-preview panel and the
 *      source-code editor panel when the user clicks tabs.
 *   2. Real-time sync  – debounced `input` listeners on all three textareas
 *      (HTML, CSS, JS) re-render the hidden iframe so it stays up to date.
 *      Renders are skipped when none of the files have changed since the
 *      last render.
 */

import { renderPreview } from "../Preview/renderPreview.js";
import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "../CSS Features/cssStore.js";
import { getRawJs, setRawJs } from "../JS Features/jsStore.js";
import { scheduleSnapshot } from "../Utils/undoRedo.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;

// ── State ─────────────────────────────────────────────────────────────────────

let debounceTimer    = null;
let lastRenderedHtml = "";
let lastRenderedCss  = "";
let lastRenderedJs   = "";

// ── Internal render helpers ───────────────────────────────────────────────────

function renderIfChanged() {
  const html = elements.htmlInput.value;
  const css  = getRawCss();
  const js   = getRawJs();
  if (html === lastRenderedHtml && css === lastRenderedCss && js === lastRenderedJs) return;
  lastRenderedHtml = html;
  lastRenderedCss  = css;
  lastRenderedJs   = js;
  renderPreview();
}

function scheduleRender() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(renderIfChanged, DEBOUNCE_MS);
}

function handleCssInput() {
  setRawCss(elements.cssInput.value);
  scheduleRender();
  scheduleSnapshot();
}

function handleJsInput() {
  setRawJs(elements.jsInput.value);
  scheduleRender();
  scheduleSnapshot();
}

// ── View switching ────────────────────────────────────────────────────────────

export function showSourceView() {
  elements.codePanel.classList.add("active");
  elements.previewPanel.classList.add("hidden");
  elements.sourceCodeTabBtn.classList.add("active");
  // Focus whichever editor is currently visible
  if (!elements.cssInput.classList.contains("hidden")) {
    elements.cssInput.focus();
  } else if (!elements.jsInput.classList.contains("hidden")) {
    elements.jsInput.focus();
  } else {
    elements.htmlInput.focus();
  }
}

export function showPreviewView(force = false) {
  clearTimeout(debounceTimer);
  elements.codePanel.classList.remove("active");
  elements.previewPanel.classList.remove("hidden");
  elements.sourceCodeTabBtn.classList.remove("active");
  if (force) {
    lastRenderedHtml = "";
    lastRenderedCss  = "";
    lastRenderedJs   = "";
  }
  renderIfChanged();
}

export function isSourceViewActive() {
  return elements.codePanel.classList.contains("active");
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initSourceEditor() {
  lastRenderedHtml = elements.htmlInput.value;
  lastRenderedCss  = getRawCss();
  lastRenderedJs   = getRawJs();

  elements.htmlInput.addEventListener("input", () => {
    scheduleRender();
    scheduleSnapshot();
  });
  elements.cssInput.addEventListener("input", handleCssInput);
  elements.jsInput.addEventListener("input",  handleJsInput);
}
