/**
 * formatToolbar.js
 *
 * Floating toolbar that appears above selected text in contenteditable
 * elements inside the preview iframe. Provides bold, italic, underline,
 * strikethrough, text-color, and clear-formatting actions.
 *
 * Uses mousedown + preventDefault on buttons so the iframe never loses
 * focus / selection when clicking toolbar buttons.
 */

import { elements } from "../DOM/elements.js";
import { state, onIframeLoad } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";

let currentColor = "#ff0000";
let _hideTimer = null;

// ── Positioning ───────────────────────────────────────────────────────────────

function show() {
  if (!state.iframeWindow) return;

  const sel = state.iframeWindow.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    hide();
    return;
  }

  // Only show for selections inside contenteditable elements
  const anchor = sel.anchorNode;
  const anchorEl = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor;
  if (!anchorEl?.closest("[contenteditable]")) {
    hide();
    return;
  }

  const range = sel.getRangeAt(0);
  const selRect = range.getBoundingClientRect();
  if (selRect.width === 0 && selRect.height === 0) { hide(); return; }

  const toolbar = elements.formatToolbar;
  toolbar.classList.add("visible");

  const iframeRect = elements.previewFrame.getBoundingClientRect();
  const tbRect = toolbar.getBoundingClientRect();

  const x = iframeRect.left + selRect.left + selRect.width  / 2 - tbRect.width  / 2;
  const y = iframeRect.top  + selRect.top  - tbRect.height - 10;

  toolbar.style.left = Math.max(4, x) + "px";
  toolbar.style.top  = Math.max(4, y) + "px";
}

function hide() {
  elements.formatToolbar.classList.remove("visible");
}

function scheduleHide() {
  clearTimeout(_hideTimer);
  _hideTimer = setTimeout(hide, 200);
}

function cancelHide() {
  clearTimeout(_hideTimer);
}

// ── execCommand wrapper ───────────────────────────────────────────────────────

function exec(command, value = null) {
  if (!state.iframeDoc) return;
  state.iframeWindow.focus();
  state.iframeDoc.execCommand(command, false, value);
  saveIframeToTextarea();
  // Re-show toolbar at new selection position
  requestAnimationFrame(show);
}

// ── Register selectionchange listener on each iframe load ─────────────────────

function attachSelectionChangeListener() {
  if (!state.iframeDoc) return;
  state.iframeDoc.addEventListener("selectionchange", () => {
    const sel = state.iframeWindow?.getSelection();
    if (sel && !sel.isCollapsed) {
      show();
    } else {
      scheduleHide();
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initFormatToolbar() {
  // Re-attach selectionchange on every iframe reload
  onIframeLoad.push(attachSelectionChangeListener);

  const toolbar = elements.formatToolbar;

  // Prevent toolbar clicks from blurring the iframe selection
  toolbar.addEventListener("mousedown", e => e.preventDefault());

  // Keep toolbar visible while mouse is over it
  toolbar.addEventListener("mouseenter", cancelHide);
  toolbar.addEventListener("mouseleave", scheduleHide);

  // Bold
  elements.fmtBoldBtn.addEventListener("click", () => exec("bold"));

  // Italic
  elements.fmtItalicBtn.addEventListener("click", () => exec("italic"));

  // Underline
  elements.fmtUnderlineBtn.addEventListener("click", () => exec("underline"));

  // Strikethrough
  elements.fmtStrikeBtn.addEventListener("click", () => exec("strikeThrough"));

  // Clear formatting
  elements.fmtClearBtn.addEventListener("click", () => exec("removeFormat"));

  // Text color — fires on color picker change
  elements.fmtColorInput.addEventListener("input", e => {
    currentColor = e.target.value;
    // Update the color bar underline
    const bar = elements.fmtColorBar;
    if (bar) bar.style.background = currentColor;
  });

  elements.fmtColorInput.addEventListener("change", e => {
    exec("foreColor", e.target.value);
  });
}
