import { state, onSelectionChange } from "../State/editorState.js";
import { setFontPickerValue } from "./fontPicker.js";
import { elements } from "../DOM/elements.js";


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

export function updateFontFamilyDisplay() {
  if (!state.selectedTextElement || !state.iframeWindow) {
    setFontPickerValue("");
    return;
  }

  const computedStyle = state.iframeWindow.getComputedStyle(state.selectedTextElement);
  const currentFamily = computedStyle.fontFamily;

  // Try to match with picker options
  const options = Array.from(elements.fontFamilySelect.options);
  const matchingOption = options.find(option => {
    return currentFamily && option.value && currentFamily.includes(option.value.split(',')[0]);
  });

  setFontPickerValue(matchingOption ? matchingOption.value : "");
}

export function selectTextElement(element) {
  if (!state.iframeDoc) return;

  clearSelectedTextHighlight();
  state.selectedTextElement = element;
  state.selectedTextElement.classList.add("selected-text");
  updateFontSizeDisplay();
  updateFontFamilyDisplay();
  onSelectionChange.forEach(fn => fn());
}

export function attachTextSelectionListeners() {
  // Select all draggable items (p, h1-h6, span, button, div, img, etc.)
  const textElements = state.iframeDoc.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, button, div.draggable-item, img.draggable-item"
  );

  textElements.forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.stopPropagation();
      selectTextElement(element);
    });
  });

  // Listen for text selection changes
  state.iframeDoc.addEventListener("selectionchange", function() {
    updateFontSizeFromSelection();
    updateFontFamilyFromSelection();
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

export function updateFontFamilyFromSelection() {
  if (!state.iframeWindow) return;

  const selection = state.iframeWindow.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (!range.collapsed) {
    // If there's a selection, use the existing logic
    const anchorNode = selection.anchorNode;
    if (!anchorNode) return;

    let element =
      anchorNode.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : anchorNode;

    if (!element) return;

    const computedStyle = state.iframeWindow.getComputedStyle(element);
    const currentFamily = computedStyle.fontFamily;

    const options = Array.from(elements.fontFamilySelect.options);
    const matchingOption = options.find(option => {
      return currentFamily && option.value && currentFamily.includes(option.value.split(',')[0]);
    });

    setFontPickerValue(matchingOption ? matchingOption.value : "");
    return;
  }

  // If cursor is collapsed (just a cursor, no selection), get font family of character to the left
  const fontFamily = getFontFamilyAtCursor(range);
  const options = Array.from(elements.fontFamilySelect.options);
  const matchingOption = options.find(option => {
    return fontFamily && option.value && fontFamily.includes(option.value.split(',')[0]);
  });

  setFontPickerValue(matchingOption ? matchingOption.value : "");
}

function getFontFamilyAtCursor(range) {
  const startContainer = range.startContainer;
  const startOffset = range.startOffset;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    if (startOffset === 0) {
      // At the beginning of a text node, check previous sibling or parent
      return getFontFamilyBeforeTextNode(startContainer);
    } else {
      // In the middle of text, check the text node's parent style
      // But if the text node is inside a span, use the span's style
      let element = startContainer.parentElement;
      while (element && element !== state.iframeDoc.body) {
        if (element.tagName === 'SPAN' && element.style.fontFamily) {
          return element.style.fontFamily;
        }
        element = element.parentElement;
      }
      // If no span found, use the text node's parent computed style
      const parentElement = startContainer.parentElement;
      if (parentElement) {
        const computedStyle = state.iframeWindow.getComputedStyle(parentElement);
        return computedStyle.fontFamily;
      }
    }
  } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
    // Cursor is in an element node
    const computedStyle = state.iframeWindow.getComputedStyle(startContainer);
    return computedStyle.fontFamily;
  }

  return null;
}

function getFontFamilyBeforeTextNode(textNode) {
  // Check if there's a previous sibling
  let previousSibling = textNode.previousSibling;
  while (previousSibling) {
    if (previousSibling.nodeType === Node.TEXT_NODE && previousSibling.textContent.trim()) {
      // Found a previous text node with content - check if it's in a span
      let element = previousSibling.parentElement;
      while (element && element !== state.iframeDoc.body) {
        if (element.tagName === 'SPAN' && element.style.fontFamily) {
          return element.style.fontFamily;
        }
        element = element.parentElement;
      }
      // If no span found, use the text node's parent
      const parentElement = previousSibling.parentElement;
      if (parentElement) {
        const computedStyle = state.iframeWindow.getComputedStyle(parentElement);
        return computedStyle.fontFamily;
      }
    } else if (previousSibling.nodeType === Node.ELEMENT_NODE) {
      // Check if it's a span element
      if (previousSibling.tagName === 'SPAN' && previousSibling.style.fontFamily) {
        return previousSibling.style.fontFamily;
      }
      // Check if it has text content
      const computedStyle = state.iframeWindow.getComputedStyle(previousSibling);
      if (computedStyle.fontFamily) {
        return computedStyle.fontFamily;
      }
    }
    previousSibling = previousSibling.previousSibling;
  }

  // No previous sibling, check parent
  let element = textNode.parentElement;
  while (element && element !== state.iframeDoc.body) {
    if (element.tagName === 'SPAN' && element.style.fontFamily) {
      return element.style.fontFamily;
    }
    element = element.parentElement;
  }

  const parentElement = textNode.parentElement;
  if (parentElement) {
    const computedStyle = state.iframeWindow.getComputedStyle(parentElement);
    return computedStyle.fontFamily;
  }

  return null;
}