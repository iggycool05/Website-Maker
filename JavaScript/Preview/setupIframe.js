import { elements } from "../DOM/elements.js";
import { state, onSelectionChange, onIframeLoad } from "../State/editorState.js";
import {
  attachTextSelectionListeners,
  clearSelectedTextHighlight,
  updateFontSizeDisplay,
  updateFontFamilyDisplay,
  updateFontSizeFromSelection,
  updateFontFamilyFromSelection
} from "../HTML Features/textSelection.js";
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
} from "../HTML Features/dragResize.js";
import { saveIframeToTextarea } from "../HTML Features/fontSize.js";
import {
  handleIframeContextMenu,
  hideContextMenu
} from "../HTML Features/contextMenu.js";
import { initSnapGuides } from "../HTML Features/snapGuides.js";

export function handleIframeClick(e) {
  if (e.target === state.iframeDoc.body) {
    clearSelectedTextHighlight();
    state.selectedTextElement = null;
    updateFontSizeDisplay();
    updateFontFamilyDisplay();
    onSelectionChange.forEach(fn => fn());
  }
}

export function handleIframeInput() {
  saveIframeToTextarea();

  if (state.selectedTextElement) {
    updateFontSizeDisplay();
    updateFontFamilyDisplay();
  }
}

export function setupIframe() {
  state.iframeDoc =
    elements.previewFrame.contentDocument || elements.previewFrame.contentWindow.document;
  state.iframeWindow = elements.previewFrame.contentWindow;

  if (!state.iframeDoc || !state.iframeWindow) return;

  state.selectedTextElement = null;
  updateFontSizeDisplay();
  updateFontFamilyDisplay();

  attachTextSelectionListeners();
  initSnapGuides();

  state.iframeDoc.addEventListener("mousedown", handleMouseDown);
  state.iframeDoc.addEventListener("mousemove", handleMouseMove);
  state.iframeDoc.addEventListener("mouseup", handleMouseUp);
  state.iframeDoc.addEventListener("click", handleIframeClick);
  state.iframeDoc.addEventListener("input", handleIframeInput);
  state.iframeDoc.addEventListener("keyup", updateFontSizeFromSelection);
  state.iframeDoc.addEventListener("keyup", updateFontFamilyFromSelection);
  state.iframeDoc.addEventListener("contextmenu", handleIframeContextMenu);
  // Close the context menu whenever the user clicks inside the iframe
  state.iframeDoc.addEventListener("mousedown", hideContextMenu);

  onIframeLoad.forEach(fn => fn());
}