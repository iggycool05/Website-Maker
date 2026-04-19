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

export function addLink() {
  appendHtmlSnippet(
    `<a class="draggable-item" href="#" style="position:absolute; left:100px; top:100px;">Link text</a>`
  );
}

export function addButton() {
  appendHtmlSnippet(
    `<button class="draggable-item" style="position:absolute; left:100px; top:100px; padding:8px 16px; cursor:pointer;">Click me</button>`
  );
}

export function addInput() {
  appendHtmlSnippet(
    `<input class="draggable-item" type="text" placeholder="Enter text..." style="position:absolute; left:100px; top:100px; padding:6px 10px;">`
  );
}

export function addVideo() {
  appendHtmlSnippet(
    `<video class="draggable-item" controls style="position:absolute; left:100px; top:100px; width:320px; height:180px;">\n  <source src="" type="video/mp4">\n  Your browser does not support the video tag.\n</video>`
  );
}

export function addSection() {
  appendHtmlSnippet(
    `<section class="draggable-item" style="position:absolute; left:100px; top:100px; width:360px; padding:20px;">\n  <h2>Section Title</h2>\n  <p>Section content goes here.</p>\n</section>`
  );
}

export function addNav() {
  appendHtmlSnippet(
    `<nav class="draggable-item" style="position:absolute; left:100px; top:100px; width:360px; padding:10px; display:flex; gap:16px;">\n  <a href="#">Home</a>\n  <a href="#">About</a>\n  <a href="#">Contact</a>\n</nav>`
  );
}

export function addFooter() {
  appendHtmlSnippet(
    `<footer class="draggable-item" style="position:absolute; left:0; bottom:0; width:100%; padding:20px; text-align:center;">\n  <p>&copy; 2024 My Website</p>\n</footer>`
  );
}

export function addForm() {
  appendHtmlSnippet(
    `<form class="draggable-item" style="position:absolute; left:100px; top:100px; padding:20px; display:flex; flex-direction:column; gap:10px;">\n  <label>Name<br><input type="text" name="name" placeholder="Your name"></label>\n  <label>Email<br><input type="email" name="email" placeholder="your@email.com"></label>\n  <button type="submit">Submit</button>\n</form>`
  );
}

export function addList(type, items, className) {
  const classAttr = className ? ` class="${className}"` : "";
  const liLines = items.map(item => `  <li>${item}</li>`).join("\n");
  appendHtmlSnippet(`<${type}${classAttr}>\n${liLines}\n</${type}>`);
}

export function addTable(rows, cols, hasHeader, className) {
  const classAttr = className ? ` class="${className}"` : "";
  let html = `<table${classAttr}>\n`;
  if (hasHeader) {
    html += "  <thead>\n    <tr>\n";
    for (let c = 0; c < cols; c++) {
      html += `      <th>Header ${c + 1}</th>\n`;
    }
    html += "    </tr>\n  </thead>\n";
  }
  html += "  <tbody>\n";
  for (let r = 0; r < rows; r++) {
    html += "    <tr>\n";
    for (let c = 0; c < cols; c++) {
      html += `      <td>Row ${r + 1}, Col ${c + 1}</td>\n`;
    }
    html += "    </tr>\n";
  }
  html += "  </tbody>\n</table>";
  appendHtmlSnippet(html);
}

