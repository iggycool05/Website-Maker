/**
 * copyPaste.js
 *
 * Copy, paste, and duplicate selected .draggable-item elements
 * inside the preview iframe without triggering a full re-render.
 */

import { state, onSelectionChange } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";
import { selectTextElement, clearSelectedTextHighlight } from "./textSelection.js";

let _clipboard = null;

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Copy an element's outer HTML into the in-memory clipboard.
 * Defaults to state.selectedTextElement if no element is provided.
 */
export function copySelected(el = null) {
  const target = el || state.selectedTextElement;
  if (!target) return;
  _clipboard = target.outerHTML;
}

/** True when the clipboard holds something pasteable. */
export function hasCopy() {
  return _clipboard !== null;
}

/**
 * Paste the clipboard element into the iframe body, offset 20 px
 * from the original so it isn't hidden behind it.
 */
export function pasteElement() {
  if (!_clipboard || !state.iframeDoc) return;

  const wrapper = state.iframeDoc.createElement("div");
  wrapper.innerHTML = _clipboard;
  const newEl = wrapper.firstElementChild;
  if (!newEl) return;

  // Shift position to avoid exact overlap
  const rawLeft = parseInt(newEl.style.left, 10);
  const rawTop  = parseInt(newEl.style.top,  10);
  newEl.style.left = ((isNaN(rawLeft) ? 0 : rawLeft) + 20) + "px";
  newEl.style.top  = ((isNaN(rawTop)  ? 0 : rawTop)  + 20) + "px";

  // Drop the id to prevent duplicate IDs in the document
  newEl.removeAttribute("id");

  state.iframeDoc.body.appendChild(newEl);

  // Re-attach click-to-select listener for the new element
  newEl.addEventListener("click", function (e) {
    e.stopPropagation();
    selectTextElement(newEl);
  });

  selectTextElement(newEl);
  saveIframeToTextarea();
}

/** Shorthand: copy the element then immediately paste (with position offset). */
export function duplicateSelected(el = null) {
  copySelected(el);
  pasteElement();
}

/**
 * Remove an element from the iframe entirely.
 * Defaults to state.selectedTextElement if no element is provided.
 */
export function deleteSelected(el = null) {
  const target = el || state.selectedTextElement;
  if (!target) return;
  clearSelectedTextHighlight();
  target.remove();
  state.selectedTextElement = null;
  onSelectionChange.forEach(fn => fn());
  saveIframeToTextarea();
}
