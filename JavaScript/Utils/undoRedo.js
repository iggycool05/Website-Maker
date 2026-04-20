/**
 * undoRedo.js
 *
 * Linear undo/redo history of { html, css, js } snapshots.
 *
 * Usage:
 *   scheduleSnapshot() — debounced push; call from input event handlers
 *   undo()             — Ctrl+Z
 *   redo()             — Ctrl+Y / Ctrl+Shift+Z
 *   initUndoRedo()     — seed initial snapshot at bootstrap
 *   resetHistory()     — wipe history and reseed (used by "New Project")
 */

import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "../CSS Features/cssStore.js";
import { getRawJs, setRawJs } from "../JS Features/jsStore.js";
import { getCurrentFile } from "../HTML Features/fileExplorer.js";
import { renderPreview } from "../Preview/renderPreview.js";

const MAX_HISTORY = 100;
const DEBOUNCE_MS = 600;

let history       = [];
let historyIndex  = -1;
let debounceTimer = null;
let isRestoring   = false;
let onHistoryChange = null;

export function setHistoryChangeCallback(fn) { onHistoryChange = fn; }

function notifyChange() {
  if (onHistoryChange) onHistoryChange(historyIndex > 0, historyIndex < history.length - 1);
}

// ── Snapshot helpers ──────────────────────────────────────────────────────────

function takeSnapshot() {
  return {
    html: elements.htmlInput.value,
    css:  getRawCss(),
    js:   getRawJs(),
  };
}

function applySnapshot(snap) {
  isRestoring = true;

  elements.htmlInput.value = snap.html;
  setRawCss(snap.css);
  setRawJs(snap.js);

  // Keep whichever textarea is currently visible in sync
  const file = getCurrentFile();
  if (file === "css") elements.cssInput.value = snap.css;
  if (file === "js")  elements.jsInput.value  = snap.js;

  renderPreview();
  isRestoring = false;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Schedule a debounced snapshot push.
 * Call this from every input handler that modifies html/css/js content.
 */
export function scheduleSnapshot() {
  if (isRestoring) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    if (isRestoring) return;
    _push(takeSnapshot());
  }, DEBOUNCE_MS);
}

export function undo() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
    _push(takeSnapshot());
  }
  if (historyIndex <= 0) return;
  historyIndex--;
  applySnapshot(history[historyIndex]);
  notifyChange();
}

export function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  applySnapshot(history[historyIndex]);
  notifyChange();
}

/** Seed the initial history entry — call once at bootstrap, after first render. */
export function initUndoRedo() {
  history      = [takeSnapshot()];
  historyIndex = 0;
  notifyChange();
}

/** Wipe history and reseed with the current (empty) state. Used by New Project. */
export function resetHistory() {
  clearTimeout(debounceTimer);
  debounceTimer = null;
  history       = [takeSnapshot()];
  historyIndex  = 0;
  notifyChange();
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _push(snap) {
  history = history.slice(0, historyIndex + 1);
  history.push(snap);
  if (history.length > MAX_HISTORY) {
    history.shift();
  } else {
    historyIndex++;
  }
  notifyChange();
}
