/**
 * alignTools.js
 *
 * Alignment buttons in the HTML Editor ribbon.
 * Operates on state.selectedTextElement (the currently selected element
 * in the iframe). All positions are relative to the iframe viewport.
 */

import { elements } from "../DOM/elements.js";
import { state } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEl() { return state.selectedTextElement; }

function getViewport() {
  const doc = state.iframeDoc;
  return {
    w: doc.documentElement.clientWidth  || doc.body.clientWidth,
    h: doc.documentElement.clientHeight || doc.body.clientHeight,
  };
}

function apply(styleProp, value) {
  const el = getEl();
  if (!el || !state.iframeDoc) return;
  el.style[styleProp] = value;
  saveIframeToTextarea();
}

// ── Horizontal ────────────────────────────────────────────────────────────────

function alignLeft()    { apply("left", "0px"); }

function alignCenterH() {
  const el = getEl(); if (!el || !state.iframeDoc) return;
  const { w } = getViewport();
  apply("left", Math.max(0, (w - el.offsetWidth) / 2) + "px");
}

function alignRight() {
  const el = getEl(); if (!el || !state.iframeDoc) return;
  const { w } = getViewport();
  apply("left", Math.max(0, w - el.offsetWidth) + "px");
}

// ── Vertical ──────────────────────────────────────────────────────────────────

function alignTop()     { apply("top", "0px"); }

function alignCenterV() {
  const el = getEl(); if (!el || !state.iframeDoc) return;
  const { h } = getViewport();
  apply("top", Math.max(0, (h - el.offsetHeight) / 2) + "px");
}

function alignBottom() {
  const el = getEl(); if (!el || !state.iframeDoc) return;
  const { h } = getViewport();
  apply("top", Math.max(0, h - el.offsetHeight) + "px");
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initAlignTools() {
  elements.alignLeftBtn.addEventListener("click",    alignLeft);
  elements.alignCenterHBtn.addEventListener("click", alignCenterH);
  elements.alignRightBtn.addEventListener("click",   alignRight);
  elements.alignTopBtn.addEventListener("click",     alignTop);
  elements.alignCenterVBtn.addEventListener("click", alignCenterV);
  elements.alignBottomBtn.addEventListener("click",  alignBottom);
}
