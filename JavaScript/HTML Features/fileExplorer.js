/**
 * fileExplorer.js
 *
 * Manages the VS Code-style file sidebar inside the Source Code tab.
 *
 * Pages section: lists all HTML pages. Clicking a page loads it into the
 * HTML editor and re-renders the preview. Pages can be added (+) or removed
 * (× button on hover, except index.html).
 *
 * Files section: CSS and JS files (shared across all pages).
 *
 * Switching files saves the current editor content back to its store, then
 * loads the new file's content into the active CodeMirror editor.
 */

import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "../CSS Features/cssStore.js";
import { getRawJs, setRawJs }   from "../JS Features/jsStore.js";
import { showEditor }           from "./codeEditor.js";
import {
  getCurrentPage, getAllPages,
  addPage, removePage, switchPage, onPageChange, setPageHtml,
} from "../Features/pageStore.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { scheduleAutosave } from "../Features/projectStorage.js";

let currentFile = "html"; // "html" | "css" | "js"

// ── Public API ────────────────────────────────────────────────────────────────

/** Update the folder/project name shown in the Explorer sidebar. */
export function setProjectName(name) {
  const label = document.querySelector(".fe-pages-name");
  if (label) label.textContent = `\u25B6 ${name}`;
}

export function initFileExplorer() {
  elements.feCssFile.addEventListener("click", e => {
    if (e.target.classList.contains("fe-load-btn")) return;
    switchToFile("css");
  });
  elements.feJsFile.addEventListener("click", e => {
    if (e.target.classList.contains("fe-load-btn")) return;
    switchToFile("js");
  });

  // Load-from-disk buttons for CSS and JS
  document.getElementById("feLoadCssBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    _pickAndLoad("css");
  });
  document.getElementById("feLoadJsBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    _pickAndLoad("js");
  });

  // Add-page button
  document.getElementById("feAddPageBtn")?.addEventListener("click", _handleAddPage);

  // Import HTML page from file
  document.getElementById("feImportPageBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    _pickAndLoad("html");
  });

  // Re-render page list whenever the active page changes
  onPageChange(() => renderPageList());

  renderPageList();
}

/** Switch the code editor to a given file type. */
export function switchToFile(name) {
  if (name === currentFile) return;

  // Flush the outgoing editor back to its store
  if (currentFile === "css") setRawCss(elements.cssInput.value);
  if (currentFile === "js")  setRawJs(elements.jsInput.value);

  currentFile = name;
  _activateFile(name);
}

/** Returns which file type is currently open ("html" | "css" | "js"). */
export function getCurrentFile() { return currentFile; }

/** Rebuild the pages list in the sidebar (called on init and on page changes). */
export function renderPageList() {
  const list = document.getElementById("fePageList");
  if (!list) return;

  const pages   = getAllPages();
  const current = getCurrentPage();

  list.innerHTML = pages.map(name => `
    <div class="fe-file fe-page-entry${name === current ? " active" : ""}" data-page="${name}">
      <span class="fe-icon fe-html">H</span>
      <span class="fe-file-name">${name}</span>
      ${name !== "index.html"
        ? `<button class="fe-rm-page" data-page="${name}" title="Remove page">&#215;</button>`
        : ""}
    </div>
  `).join("");

  // Page click → switch page + re-render
  list.querySelectorAll(".fe-page-entry").forEach(el => {
    el.addEventListener("click", e => {
      if (e.target.classList.contains("fe-rm-page")) return;
      const pageName = el.dataset.page;

      // Make sure the HTML editor is visible
      if (currentFile !== "html") {
        if (currentFile === "css") setRawCss(elements.cssInput.value);
        if (currentFile === "js")  setRawJs(elements.jsInput.value);
        currentFile = "html";
        showEditor("html");
      }

      if (switchPage(pageName)) {
        renderPageList();
        renderPreview();
      }
    });
  });

  // Remove-page button
  list.querySelectorAll(".fe-rm-page").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const pageName = btn.dataset.page;
      if (confirm(`Remove page "${pageName}"? This cannot be undone.`)) {
        if (removePage(pageName)) renderPageList();
      }
    });
  });
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _activateFile(name) {
  elements.feCssFile.classList.toggle("active", name === "css");
  elements.feJsFile.classList.toggle("active",  name === "js");

  showEditor(name);

  if (name === "css") elements.cssInput.value = getRawCss();
  if (name === "js")  elements.jsInput.value  = getRawJs();
}

function _handleAddPage() {
  const raw = prompt("New page filename (e.g. about.html):");
  if (!raw) return;

  // Sanitize and ensure .html extension
  let filename = raw.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  if (!filename.endsWith(".html")) filename += ".html";

  if (!addPage(filename)) {
    alert(`Page "${filename}" already exists.`);
    return;
  }
  renderPageList();
}

// ── Load a file from disk into the editor ─────────────────────────────────────

function _pickAndLoad(type) {
  const accept = type === "html" ? ".html,.htm" : type === "css" ? ".css" : ".js";
  const input  = document.createElement("input");
  input.type   = "file";
  input.accept = accept;

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      if (type === "css") {
        setRawCss(text);
        elements.cssInput.value = text;
        switchToFile("css");
      } else if (type === "js") {
        setRawJs(text);
        elements.jsInput.value = text;
        switchToFile("js");
      } else {
        // Import as a new HTML page named after the file
        let filename = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
        if (!filename.endsWith(".html")) filename += ".html";
        // If the page name already exists, switch to it and overwrite
        addPage(filename);
        setPageHtml(filename, text);
        // Switch to it
        if (currentFile !== "html") {
          if (currentFile === "css") setRawCss(elements.cssInput.value);
          if (currentFile === "js")  setRawJs(elements.jsInput.value);
          currentFile = "html";
          showEditor("html");
        }
        switchPage(filename);
        renderPageList();
      }
      renderPreview();
      scheduleAutosave();
    };
    reader.readAsText(file);
  });

  input.click();
}
