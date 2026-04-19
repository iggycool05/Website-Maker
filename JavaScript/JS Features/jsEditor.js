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

// ── Snippet insertion ─────────────────────────────────────────────────────────

/**
 * Append a JS snippet to rawJs, keep the textarea in sync if visible,
 * re-render the preview, and schedule an undo snapshot.
 */
function appendSnippet(snippet) {
  const current   = getRawJs().trimEnd();
  const separator = current.length > 0 ? "\n\n" : "";
  const newJs     = current + separator + snippet;

  setRawJs(newJs);

  // Keep the JS textarea in sync if it is currently visible
  if (!elements.jsInput.classList.contains("hidden")) {
    elements.jsInput.value = newJs;
  }

  renderPreview();
  scheduleSnapshot();
}

// ── Ribbon toggle ─────────────────────────────────────────────────────────────

/**
 * Show/hide the JS editor ribbon.
 * Closes the HTML and CSS ribbons first so only one ribbon is open at a time.
 */
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
  elements.jsInsertFunctionBtn.addEventListener("click", () => {
    appendSnippet(
      `function myFunction() {\n  // code here\n}`
    );
  });

  elements.jsInsertArrowBtn.addEventListener("click", () => {
    appendSnippet(
      `const myFunction = () => {\n  // code here\n};`
    );
  });

  elements.jsInsertLogBtn.addEventListener("click", () => {
    appendSnippet(`console.log("Hello, world!");`);
  });

  elements.jsInsertQueryBtn.addEventListener("click", () => {
    appendSnippet(`const element = document.querySelector("#my-element");`);
  });

  elements.jsInsertEventBtn.addEventListener("click", () => {
    appendSnippet(
      `document.addEventListener("DOMContentLoaded", () => {\n  // runs after the page loads\n});`
    );
  });
}
