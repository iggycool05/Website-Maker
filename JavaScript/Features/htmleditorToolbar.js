import { elements } from "../DOM/elements.js";
import { renderPreview } from "../Preview/renderPreview.js";

// Helper function to append HTML snippets to the textarea and re-render the preview 
function appendHtmlSnippet(snippet) {
  elements.htmlInput.value = elements.htmlInput.value.trim() + "\n\n" + snippet;
  renderPreview();
}
// HTMLEditorButtons - Functions for handling HTML editor ribbon actions
export function toggleHtmlEditorRibbon() {
  elements.htmlEditorRibbon.classList.toggle("hidden");
  elements.htmlEditorTabBtn.classList.toggle("active");
}
// HTMLEditorButtons - Functions for adding different HTML elements to the textarea
export function addParagraph() {
  appendHtmlSnippet(
    `<p class="draggable-item" contenteditable="true" style="position:absolute; left:100px; top:100px;">New paragraph</p>`
  );
}
// HTMLEditorButtons - Functions for adding different HTML elements to the textarea
export function addHeading(level = 1) {
  appendHtmlSnippet(
    `<h${level} class="draggable-item" contenteditable="true" style="position:absolute; left:100px; top:100px;">New Heading</h${level}>`
  );
}
// HTMLEditorButtons - Functions for adding different HTML elements to the textarea
export function addDiv() {
  appendHtmlSnippet(
    `<div class="draggable-item" contenteditable="true" style="position:absolute; left:100px; top:100px;">New Div</div>`
  );
}
// HTMLEditorButtons - Functions for adding different HTML elements to the textarea
export function addSpan() {
  appendHtmlSnippet(
    `<span class="draggable-item" contenteditable="true" style="position:absolute; left:100px; top:100px;">New Span</span>`
  );
}
// HTMLEditorButtons - Functions for adding different HTML elements to the textarea
export function addImage(uploadId) {
  appendHtmlSnippet(
    `<img class="draggable-item" data-upload-id="${uploadId}" alt="Uploaded image" style="position:absolute; left:100px; top:100px; max-width:240px; max-height:180px;">`
  );
}

