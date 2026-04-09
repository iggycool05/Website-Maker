// shortcut for getting elements
const $ = (id) => document.getElementById(id);

// all DOM elements
const elements = {
  // htmlInput - the textarea where the user inputs their HTML code
  htmlInput: $("htmlInput"),
  // renderHTMLBtn - the button that the user clicks to render their HTML code in the preview iframe
  renderHTMLBtn: $("renderHTMLBtn"),
  // previewFrame - the iframe element where the user's HTML code is rendered for preview
  previewFrame: $("previewFrame"),
  // decreaseFontBtn - the button that decreases the font size of the selected text in the iframe
  decreaseFontBtn: $("decreaseFontBtn"),
  // increaseFontBtn - the button that increases the font size of the selected text in the iframe
  increaseFontBtn: $("increaseFontBtn"),
  // fontSizeNumber - the element that displays the current font size of the selected text in the iframe
  fontSizeNumber: $("fontSizeNumber"),
  // addParagraphBtn - the button that adds a new paragraph element to the HTML code in the textarea and updates the preview iframe
  addParagraphBtn: $("addParagraphBtn")
};

// Variables to hold references to the iframe's document and window
let iframeDoc = null;
// Variables for tracking selected text element, dragging, and resizing
let iframeWindow = null;
// selectedTextElement - the currently selected text element in the iframe
let selectedTextElement = null;
// dragItem - the element currently being dragged.
let dragItem = null;
// resizeItem - the element currently being resized
let resizeItem = null;
// resizeHandle - the specific handle being used for resizing
let resizeHandle = null;

// Variables to track dragging offsets and resizing start positions
// dragOffsetX - the horizontal offset between the mouse position and the left of the dragged element
let dragOffsetX = 0;
// dragOffsetY - the vertical offset between the mouse position and the top of the dragged element
let dragOffsetY = 0;

// Variables to track the initial state when resizing starts
// startX - the initial X coordinate of the mouse when resizing starts
let startX = 0;
// startY - the initial Y coordinate of the mouse when resizing starts
let startY = 0;
// startWidth - the initial width of the element being resized
let startWidth = 0;
// startHeight - the initial height of the element being resized
let startHeight = 0;
// startLeft - the initial left position of the element being resized
let startLeft = 0;
// startTop - the initial top position of the element being resized
let startTop = 0;

// Function to render the user's HTML code in the preview iframe
function renderPreview() {
  // Get the user's HTML code from the textarea
  const userCode = htmlInput.value;
// Create a full HTML document by embedding the user's code within a basic structure
  const fullHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Preview</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          min-height: 100vh;
          position: relative;
          margin: 0;
        }

        .draggable-item {
          position: absolute;
        }

        .draggable-item:hover {
          outline: 2px dashed #007BFF;
        }

        .selected-text {
          outline: 2px solid red;
        }

        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border: 1px solid #007BFF;
          border-radius: 50%;
          z-index: 10;
        }

        .top-right {
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        }

        .top-left {
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        }

        .bottom-right {
          bottom: -5px;
          right: -5px;
          cursor: nwse-resize;
        }

        .bottom-left {
          bottom: -5px;
          left: -5px;
          cursor: nesw-resize;
        }

        [contenteditable="true"] {
          user-select: text;
          -webkit-user-select: text;
          cursor: text;
        }
      </style>
    </head>
    <body>
      ${userCode}
    </body>
    </html>
  `;
// Set the iframe's srcdoc to the full HTML document, which will render the user's code in the preview iframe
  previewFrame.srcdoc = fullHTML;
}

// Function to check if a given element is a text-type element that can be selected for font size changes
function isTextTypeElement(element) {
  // Check if the element exists and has a tagName property
  if (!element || !element.tagName) return false;
  // Get the tag name of the element and check if it is one of the allowed text-type elements
  const tag = element.tagName;
  return (
    tag === "P" ||
    tag === "H1" ||
    tag === "H2" ||
    tag === "H3" ||
    tag === "H4" ||
    tag === "H5" ||
    tag === "H6" ||
    tag === "SPAN" ||
    tag === "BUTTON"
  );
}

// Function to clear the highlight from the currently selected text element in the iframe
function clearSelectedTextHighlight() {
  // Check if the iframe document is available before trying to access it
  if (!iframeDoc) return;
  // Find the currently selected text element in the iframe and remove the "selected-text" class to clear the highlight
  const oldSelected = iframeDoc.querySelector(".selected-text");
  if (oldSelected) {
    oldSelected.classList.remove("selected-text");
  }
}

// Function to select a text element in the iframe and highlight it, as well as update the font size display
function selectTextElement(element) {
  // Check if the iframe document is available before trying to access it
  if (!iframeDoc) return;
// Clear the highlight from the previously selected text element, if any
  clearSelectedTextHighlight();
  selectedTextElement = element;
  selectedTextElement.classList.add("selected-text");
  updateFontSizeDisplay();
}

// Function to update the font size display based on the currently selected text element in the iframe
function updateFontSizeDisplay() {
  if (!selectedTextElement || !iframeWindow) {
    fontSizeNumber.textContent = "0";
    return;
  }

  const computedStyle = iframeWindow.getComputedStyle(selectedTextElement);
  const currentSize = parseInt(computedStyle.fontSize, 10);

  fontSizeNumber.textContent = isNaN(currentSize) ? "16" : String(currentSize);
}

// Function to save the current state of the iframe's body content back to the textarea, while removing any temporary selection highlights
function saveIframeToTextarea() {
  if (!iframeDoc) return;

  const bodyClone = iframeDoc.body.cloneNode(true);

  const selectedElements = bodyClone.querySelectorAll(".selected-text");
  selectedElements.forEach(function (element) {
    element.classList.remove("selected-text");
  });

  htmlInput.value = bodyClone.innerHTML.trim();
}
// Function to get the currently selected text range within the iframe, if any
function getSelectedTextRangeInIframe() {
  if (!iframeWindow) return null;

  const selection = iframeWindow.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return null;

  return range;
}
// Function to find the closest parent span element with a font size style from a given text range in the iframe
function getClosestFontSizeSpanFromRange(range) {
  if (!range) return null;

  let node = range.commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node !== iframeDoc.body) {
    if (node.tagName === "SPAN" && node.style.fontSize) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}
// Function to update the font size display based on the current text selection in the iframe, if any
function updateFontSizeFromSelection() {
  if (!iframeWindow) return;

  const selection = iframeWindow.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const anchorNode = selection.anchorNode;
  if (!anchorNode) return;

  let element =
    anchorNode.nodeType === Node.TEXT_NODE
      ? anchorNode.parentElement
      : anchorNode;

  if (!element) return;

  const computedStyle = iframeWindow.getComputedStyle(element);
  const currentSize = parseInt(computedStyle.fontSize, 10);

  if (!isNaN(currentSize)) {
    fontSizeNumber.textContent = String(currentSize);
  }
}
// Function to change the font size of the currently highlighted text in the iframe by a given amount (positive or negative)
function changeHighlightedTextFontSize(amount) {
  if (!iframeDoc || !iframeWindow) return false;

  const range = getSelectedTextRangeInIframe();
  if (!range) return false;

  const selectedText = range.toString();
  if (!selectedText || !selectedText.trim()) return false;

  const existingSpan = getClosestFontSizeSpanFromRange(range);

  if (existingSpan) {
    let currentSize = parseInt(existingSpan.style.fontSize, 10);
    if (isNaN(currentSize)) {
      currentSize = 16;
    }

    const newSize = Math.max(8, currentSize + amount);
    existingSpan.style.fontSize = newSize + "px";

    clearSelectedTextHighlight();
    existingSpan.classList.add("selected-text");
    selectedTextElement = existingSpan;

    fontSizeNumber.textContent = String(newSize);
    saveIframeToTextarea();
    return true;
  }

  let baseSize = 16;

  let parentElement =
    range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : range.startContainer;

  if (parentElement) {
    const computedStyle = iframeWindow.getComputedStyle(parentElement);
    const currentSize = parseInt(computedStyle.fontSize, 10);

    if (!isNaN(currentSize)) {
      baseSize = currentSize;
    }
  }

  const newSize = Math.max(8, baseSize + amount);

  const span = iframeDoc.createElement("span");
  span.style.fontSize = newSize + "px";

  try {
    const extractedContents = range.extractContents();
    span.appendChild(extractedContents);
    range.insertNode(span);
  } catch (error) {
    return false;
  }

  const selection = iframeWindow.getSelection();
  selection.removeAllRanges();

  const newRange = iframeDoc.createRange();
  newRange.selectNodeContents(span);
  selection.addRange(newRange);

  clearSelectedTextHighlight();
  span.classList.add("selected-text");
  selectedTextElement = span;

  fontSizeNumber.textContent = String(newSize);
  saveIframeToTextarea();
  return true;
}
// Function to change the font size of the currently selected text element in the iframe by a given amount (positive or negative), or if there is a text selection, change the font size of the highlighted text instead
function changeSelectedFontSize(amount) {
  const changedHighlightedText = changeHighlightedTextFontSize(amount);

  if (changedHighlightedText) {
    return;
  }

  if (!selectedTextElement || !iframeWindow) return;

  const computedStyle = iframeWindow.getComputedStyle(selectedTextElement);
  let currentSize = parseInt(computedStyle.fontSize, 10);

  if (isNaN(currentSize)) {
    currentSize = 16;
  }

  const newSize = Math.max(8, currentSize + amount);
  selectedTextElement.style.fontSize = newSize + "px";

  updateFontSizeDisplay();
  saveIframeToTextarea();
}
// Function to attach click event listeners to text-type elements in the iframe, allowing them to be selected and highlighted when clicked
function attachTextSelectionListeners() {
  const textElements = iframeDoc.querySelectorAll(
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
// Function to start dragging a draggable item in the iframe, calculating the initial offset between the mouse position and the element's position
function startDragging(item, e) {
  const rect = item.getBoundingClientRect();

  dragItem = item;
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
}
// Function to start resizing a draggable item in the iframe, calculating the initial mouse position and element dimensions for resizing
function startResizing(item, handle, e) {
  const rect = item.getBoundingClientRect();
  const bodyRect = iframeDoc.body.getBoundingClientRect();

  resizeItem = item;
  resizeHandle = handle;

  startX = e.clientX;
  startY = e.clientY;
  startWidth = rect.width;
  startHeight = rect.height;
  startLeft = rect.left - bodyRect.left;
  startTop = rect.top - bodyRect.top;
}
// Function to handle mousedown events in the iframe, determining whether to start dragging or resizing based on the target element and its proximity to edges
function handleMouseDown(e) {
  const handle = e.target.closest(".resize-handle");
  if (handle) {
    const item = handle.closest(".draggable-item");
    if (!item) return;

    e.preventDefault();
    e.stopPropagation();
    startResizing(item, handle, e);
    return;
  }

  const item = e.target.closest(".draggable-item");
  if (!item) return;

  const rect = item.getBoundingClientRect();
  const edgeSize = 10;

  const isNearLeft = e.clientX - rect.left < edgeSize;
  const isNearRight = rect.right - e.clientX < edgeSize;
  const isNearTop = e.clientY - rect.top < edgeSize;
  const isNearBottom = rect.bottom - e.clientY < edgeSize;

  const isOnEdge = isNearLeft || isNearRight || isNearTop || isNearBottom;

  if (!isOnEdge) {
    return;
  }

  e.preventDefault();
  startDragging(item, e);
}
// Function to handle mousemove events in the iframe, updating the position of a dragged item or the dimensions of a resized item based on the current mouse position
function handleMouseMove(e) {
  const bodyRect = iframeDoc.body.getBoundingClientRect();

  if (dragItem) {
    const newLeft = e.clientX - bodyRect.left - dragOffsetX;
    const newTop = e.clientY - bodyRect.top - dragOffsetY;

    dragItem.style.left = newLeft + "px";
    dragItem.style.top = newTop + "px";
  }

  if (resizeItem && resizeHandle) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    if (resizeHandle.classList.contains("bottom-right")) {
      newWidth = startWidth + dx;
      newHeight = startHeight + dy;
    }

    if (resizeHandle.classList.contains("bottom-left")) {
      newWidth = startWidth - dx;
      newHeight = startHeight + dy;
      newLeft = startLeft + dx;
    }

    if (resizeHandle.classList.contains("top-right")) {
      newWidth = startWidth + dx;
      newHeight = startHeight - dy;
      newTop = startTop + dy;
    }

    if (resizeHandle.classList.contains("top-left")) {
      newWidth = startWidth - dx;
      newHeight = startHeight - dy;
      newLeft = startLeft + dx;
      newTop = startTop + dy;
    }

    if (newWidth > 50) {
      resizeItem.style.width = newWidth + "px";
      resizeItem.style.left = newLeft + "px";
    }

    if (newHeight > 40) {
      resizeItem.style.height = newHeight + "px";
      resizeItem.style.top = newTop + "px";
    }
  }
}
// Function to handle mouseup events in the iframe, ending any dragging or resizing actions and saving the current state back to the textarea
function handleMouseUp() {
  if (dragItem || resizeItem) {
    dragItem = null;
    resizeItem = null;
    resizeHandle = null;
    saveIframeToTextarea();
  }

  updateFontSizeFromSelection();
}
// Function to handle click events in the iframe, clearing any text selection if the user clicks on the body of the iframe
function handleIframeClick(e) {
  if (e.target === iframeDoc.body) {
    clearSelectedTextHighlight();
    selectedTextElement = null;
    updateFontSizeDisplay();
  }
}
// Function to handle input events in the iframe, saving the current state back to the textarea and updating the font size display if a text element is selected
function handleIframeInput() {
  saveIframeToTextarea();

  if (selectedTextElement) {
    updateFontSizeDisplay();
  }
}
// Function to set up the iframe after it has loaded, initializing variables, attaching event listeners, and preparing for user interactions
function setupIframe() {
  iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  iframeWindow = previewFrame.contentWindow;

  if (!iframeDoc || !iframeWindow) return;

  selectedTextElement = null;
  updateFontSizeDisplay();

  attachTextSelectionListeners();

  iframeDoc.addEventListener("mousedown", handleMouseDown);
  iframeDoc.addEventListener("mousemove", handleMouseMove);
  iframeDoc.addEventListener("mouseup", handleMouseUp);
  iframeDoc.addEventListener("click", handleIframeClick);
  iframeDoc.addEventListener("input", handleIframeInput);
  iframeDoc.addEventListener("keyup", updateFontSizeFromSelection);
}
// Attach event listeners to the buttons for changing font size and rendering the preview, as well as adding a new paragraph
decreaseFontBtn.addEventListener("click", function () {
  changeSelectedFontSize(-1);
});
// Attach event listener to the increase font size button, which calls the changeSelectedFontSize function with a positive value to increase the font size of the selected text in the iframe
increaseFontBtn.addEventListener("click", function () {
  changeSelectedFontSize(1);
});
// Attach event listener to the render HTML button, which calls the renderPreview function to update the preview iframe with the current HTML code from the textarea
renderHTMLBtn.addEventListener("click", function () {
  renderPreview();
});
// Attach event listener to the add paragraph button, which appends a new paragraph element to the HTML code in the textarea and updates the preview iframe
addParagraphBtn.addEventListener("click", function () {
  const newParagraph = `
<p class="draggable-item" contenteditable="true" style="position: absolute; left: 100px; top: 100px;">
  New paragraph
</p>`;

  htmlInput.value = htmlInput.value.trim() + "\n\n" + newParagraph;
  renderPreview();
});
// Attach event listener to the iframe's load event, which calls the setupIframe function to initialize the iframe's document and event listeners once the content has loaded
previewFrame.addEventListener("load", function () {
  setupIframe();
});

renderPreview();