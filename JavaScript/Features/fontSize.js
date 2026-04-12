import { state } from "../State/editorState.js";
import { elements } from "../DOM/elements.js";
import {
  clearSelectedTextHighlight,
  updateFontSizeDisplay
} from "./textSelection.js";

export function saveIframeToTextarea() {
  if (!state.iframeDoc) return;

  const bodyClone = state.iframeDoc.body.cloneNode(true);

  const selectedElements = bodyClone.querySelectorAll(".selected-text");
  selectedElements.forEach(function (element) {
    element.classList.remove("selected-text");
  });

  elements.htmlInput.value = bodyClone.innerHTML.trim();
}

export function getSelectedTextRangeInIframe() {
  if (!state.iframeWindow) return null;

  const selection = state.iframeWindow.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return null;

  return range;
}

export function getClosestFontSizeSpanFromRange(range) {
  if (!range) return null;

  let node = range.commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node !== state.iframeDoc.body) {
    if (node.tagName === "SPAN" && node.style.fontSize) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

export function changeHighlightedTextFontSize(amount) {
  if (!state.iframeDoc || !state.iframeWindow) return false;

  const range = getSelectedTextRangeInIframe();
  if (!range) return false;

  const selectedText = range.toString();
  if (!selectedText || !selectedText.trim()) return false;

  const existingSpan = getClosestFontSizeSpanFromRange(range);

  if (existingSpan) {
    let currentSize = parseInt(existingSpan.style.fontSize, 10);
    if (isNaN(currentSize)) currentSize = 16;

    const newSize = Math.max(8, currentSize + amount);
    existingSpan.style.fontSize = newSize + "px";

    clearSelectedTextHighlight();
    existingSpan.classList.add("selected-text");
    state.selectedTextElement = existingSpan;

    elements.fontSizeNumber.textContent = String(newSize);
    saveIframeToTextarea();
    return true;
  }

  let baseSize = 16;

  let parentElement =
    range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : range.startContainer;

  if (parentElement) {
    const computedStyle = state.iframeWindow.getComputedStyle(parentElement);
    const currentSize = parseInt(computedStyle.fontSize, 10);

    if (!isNaN(currentSize)) {
      baseSize = currentSize;
    }
  }

  const newSize = Math.max(8, baseSize + amount);

  const span = state.iframeDoc.createElement("span");
  span.style.fontSize = newSize + "px";

  try {
    const extractedContents = range.extractContents();
    span.appendChild(extractedContents);
    range.insertNode(span);
  } catch (error) {
    return false;
  }

  const selection = state.iframeWindow.getSelection();
  selection.removeAllRanges();

  const newRange = state.iframeDoc.createRange();
  newRange.selectNodeContents(span);
  selection.addRange(newRange);

  clearSelectedTextHighlight();
  span.classList.add("selected-text");
  state.selectedTextElement = span;

  elements.fontSizeNumber.textContent = String(newSize);
  saveIframeToTextarea();
  return true;
}

export function changeSelectedFontSize(amount) {
  const changedHighlightedText = changeHighlightedTextFontSize(amount);

  if (changedHighlightedText) return;

  if (!state.selectedTextElement || !state.iframeWindow) return;

  const computedStyle = state.iframeWindow.getComputedStyle(state.selectedTextElement);
  let currentSize = parseInt(computedStyle.fontSize, 10);

  if (isNaN(currentSize)) currentSize = 16;

  const newSize = Math.max(8, currentSize + amount);
  state.selectedTextElement.style.fontSize = newSize + "px";

  updateFontSizeDisplay();
  saveIframeToTextarea();
}