import { elements } from "../DOM/elements.js";
import { renderPreview } from "../Preview/renderPreview.js";

export function addParagraph() {
  const newParagraph = `
<p class="draggable-item" contenteditable="true" style="position: absolute; left: 100px; top: 100px;">
  New paragraph
</p>`;

  elements.htmlInput.value = elements.htmlInput.value.trim() + "\n\n" + newParagraph;
  renderPreview();
}