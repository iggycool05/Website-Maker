import { elements } from "../DOM/elements.js";
import { state } from "../State/editorState.js";
import {
  attachTextSelectionListeners,
  clearSelectedTextHighlight,
  updateFontSizeDisplay,
  updateFontSizeFromSelection
} from "../Features/textSelection.js";
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
} from "../Features/dragResize.js";
import { saveIframeToTextarea } from "../Features/fontSize.js";

export function handleIframeClick(e) {
  if (e.target === state.iframeDoc.body) {
    clearSelectedTextHighlight();
    state.selectedTextElement = null;
    updateFontSizeDisplay();
  }
}

export function handleIframeInput() {
  saveIframeToTextarea();

  if (state.selectedTextElement) {
    updateFontSizeDisplay();
  }
}

export function setupIframe() {
  state.iframeDoc =
    elements.previewFrame.contentDocument || elements.previewFrame.contentWindow.document;
  state.iframeWindow = elements.previewFrame.contentWindow;

  if (!state.iframeDoc || !state.iframeWindow) return;

  state.selectedTextElement = null;
  updateFontSizeDisplay();

  attachTextSelectionListeners();

  state.iframeDoc.addEventListener("mousedown", handleMouseDown);
  state.iframeDoc.addEventListener("mousemove", handleMouseMove);
  state.iframeDoc.addEventListener("mouseup", handleMouseUp);
  state.iframeDoc.addEventListener("click", handleIframeClick);
  state.iframeDoc.addEventListener("input", handleIframeInput);
  state.iframeDoc.addEventListener("keyup", updateFontSizeFromSelection);
}