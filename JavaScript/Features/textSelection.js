import { state } from "../State/editorState.js";
import { elements } from "../DOM/elements.js";
import { isTextTypeElement } from "../Utils/helpers.js";

export function clearSelectedTextHighlight() {
  if (!state.iframeDoc) return;

  const oldSelected = state.iframeDoc.querySelector(".selected-text");
  if (oldSelected) {
    oldSelected.classList.remove("selected-text");
  }
}

export function updateFontSizeDisplay() {
  if (!state.selectedTextElement || !state.iframeWindow) {
    elements.fontSizeNumber.textContent = "0";
    return;
  }

  const computedStyle = state.iframeWindow.getComputedStyle(state.selectedTextElement);
  const currentSize = parseInt(computedStyle.fontSize, 10);

  elements.fontSizeNumber.textContent = isNaN(currentSize) ? "16" : String(currentSize);
}

export function selectTextElement(element) {
  if (!state.iframeDoc) return;

  clearSelectedTextHighlight();
  state.selectedTextElement = element;
  state.selectedTextElement.classList.add("selected-text");
  updateFontSizeDisplay();
}

export function attachTextSelectionListeners() {
  const textElements = state.iframeDoc.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, button"
  );

  textElements.forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.stopPropagation();

      if (isTextTypeElement(element)) {
        selectTextElement(element);
      }
    });
  });
}

export function updateFontSizeFromSelection() {
  if (!state.iframeWindow) return;

  const selection = state.iframeWindow.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const anchorNode = selection.anchorNode;
  if (!anchorNode) return;

  let element =
    anchorNode.nodeType === Node.TEXT_NODE
      ? anchorNode.parentElement
      : anchorNode;

  if (!element) return;

  const computedStyle = state.iframeWindow.getComputedStyle(element);
  const currentSize = parseInt(computedStyle.fontSize, 10);

  if (!isNaN(currentSize)) {
    elements.fontSizeNumber.textContent = String(currentSize);
  }
}