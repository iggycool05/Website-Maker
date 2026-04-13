import { elements } from "./DOM/elements.js";
import { renderPreview } from "./Preview/renderPreview.js";
import { setupIframe } from "./Preview/setupIframe.js";
import { changeSelectedFontSize } from "./Features/fontSize.js";
import * as htmlToolbar from "./Features/htmleditorToolbar.js";
import { addUploadedImage } from "./Utils/imageStore.js";
import { initTooltips } from "./Features/toolTip.js";

elements.decreaseFontBtn.addEventListener("click", function () {
  changeSelectedFontSize(-1);
});

elements.increaseFontBtn.addEventListener("click", function () {
  changeSelectedFontSize(1);
});

elements.previewFrame.addEventListener("load", function () {
  setupIframe();
});

// HTMLEditorButtons - Event listener for the HTML editor ribbon toggle button
elements.htmlEditorTabBtn.addEventListener("click", function () {
  htmlToolbar.toggleHtmlEditorRibbon();
});
// HTMLEditorButtons - Event listener for the "Add Paragraph" button in the HTML editor ribbon
elements.addParagraphBtn.addEventListener("click", function () {
  htmlToolbar.addParagraph();
});
// HTMLEditorButtons - Event listener for the "Add Heading" button in the HTML editor ribbon
elements.addHeadingBtn.addEventListener("click", function () {
  htmlToolbar.addHeading();
});
// HTMLEditorButtons - Event listener for the heading dropdown arrow
elements.headingDropdownBtn.addEventListener("click", function (event) {
  event.stopPropagation();

  const menu = elements.headingDropdownMenu;
  const isOpen = menu.classList.toggle("open");
  if (isOpen) {
    const rect = elements.headingDropdownBtn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.right = "auto";
  } else {
    menu.style.position = "";
    menu.style.top = "";
    menu.style.left = "";
  }
});
// HTMLEditorButtons - Event listener for heading level selection
elements.headingDropdownMenu.addEventListener("click", function (event) {
  const level = event.target.dataset.headingLevel;
  if (level) {
    htmlToolbar.addHeading(level);
    elements.headingDropdownMenu.classList.remove("open");
    elements.headingDropdownMenu.style.position = "";
    elements.headingDropdownMenu.style.top = "";
    elements.headingDropdownMenu.style.left = "";
  }
});
// Close the heading menu when clicking outside it
document.addEventListener("click", function (event) {
  const target = event.target;
  const menu = elements.headingDropdownMenu;
  if (
    menu.classList.contains("open") &&
    !menu.contains(target) &&
    target !== elements.headingDropdownBtn
  ) {
    menu.classList.remove("open");
    menu.style.position = "";
    menu.style.top = "";
    menu.style.left = "";
  }
});
// HTMLEditorButtons - Event listener for the "Add Div" button in the HTML editor ribbon
elements.addDivBtn.addEventListener("click", function () {
  htmlToolbar.addDiv();
});
// HTMLEditorButtons - Event listener for the "Add Span" button in the HTML editor ribbon
elements.addSpanBtn.addEventListener("click", function () {
  htmlToolbar.addSpan();
});
// HTMLEditorButtons - Event listener for the "Add Image" button in the HTML editor ribbon
elements.addImageBtn.addEventListener("click", function () {
  elements.addImageInput.click();
});

// HTMLEditorButtons - Event listener for image file selection
elements.addImageInput.addEventListener("change", function (event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    if (typeof reader.result === "string") {
      const uploadId = `uploaded-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      addUploadedImage(uploadId, reader.result);
      htmlToolbar.addImage(uploadId);
    }
  };
  reader.readAsDataURL(file);
  elements.addImageInput.value = "";
});

// Render - Event listener for the "Render" button to update the preview iframe with the current HTML code
elements.renderPreviewBtn.addEventListener("click", function () {
  renderPreview();
});

renderPreview();

// Initialize tooltips
initTooltips();