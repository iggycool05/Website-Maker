/**
 * layerControl.js
 *
 * Bring Forward / Send Back / Bring to Front / Send to Back
 * z-index controls for the currently selected iframe element.
 */

import { elements } from "../DOM/elements.js";
import { state } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getZ(el) {
  return parseInt(el.style.zIndex, 10) || 0;
}

function getAllZ() {
  if (!state.iframeDoc) return [0];
  return Array.from(state.iframeDoc.querySelectorAll(".draggable-item")).map(getZ);
}

// ── Layer operations ──────────────────────────────────────────────────────────

export function bringForward() {
  const el = state.selectedTextElement;
  if (!el) return;
  el.style.zIndex = String(getZ(el) + 1);
  saveIframeToTextarea();
}

export function sendBack() {
  const el = state.selectedTextElement;
  if (!el) return;
  el.style.zIndex = String(getZ(el) - 1);
  saveIframeToTextarea();
}

export function bringToFront() {
  const el = state.selectedTextElement;
  if (!el) return;
  const maxZ = Math.max(...getAllZ());
  el.style.zIndex = String(maxZ + 1);
  saveIframeToTextarea();
}

export function sendToBack() {
  const el = state.selectedTextElement;
  if (!el) return;
  const minZ = Math.min(...getAllZ());
  el.style.zIndex = String(minZ - 1);
  saveIframeToTextarea();
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initLayerControl() {
  elements.layerForwardBtn.addEventListener("click", bringForward);
  elements.layerBackBtn.addEventListener("click",   sendBack);
  elements.layerFrontBtn.addEventListener("click",  bringToFront);
  elements.layerBottomBtn.addEventListener("click", sendToBack);
}
