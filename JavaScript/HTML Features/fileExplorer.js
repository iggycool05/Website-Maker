/**
 * fileExplorer.js
 *
 * Manages the VS Code-style file sidebar inside the Source Code tab.
 *
 * Pages section: lists all HTML pages.
 * Files section: CSS file.
 * Scripts section: one or more JS files (managed by jsFileStore).
 */

import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "../CSS Features/cssStore.js";
import { getRawJs, setRawJs }   from "../JS Features/jsStore.js";
import {
  getCurrentJsFile, getAllJsFiles, getJsFileContent, setJsFileContent,
  switchJsFile, addJsFile, removeJsFile, onJsFileChange,
} from "../JS Features/jsFileStore.js";
import { showEditor }           from "./codeEditor.js";
import {
  getCurrentPage, getAllPages,
  addPage, removePage, switchPage, onPageChange, setPageHtml,
} from "../Features/pageStore.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { scheduleAutosave } from "../Features/projectStorage.js";

let currentFile = "html"; // "html" | "css" | "js"

// ── Public API ────────────────────────────────────────────────────────────────

export function setProjectName(name) {
  const label = document.querySelector(".fe-pages-name");
  if (label) label.textContent = `\u25B6 ${name}`;
}

export function initFileExplorer() {
  // CSS file click
  elements.feCssFile.addEventListener("click", e => {
    if (e.target.classList.contains("fe-load-btn")) return;
    switchToFile("css");
  });

  // Load-from-disk button for CSS
  document.getElementById("feLoadCssBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    _pickAndLoad("css");
  });

  // Add-page button
  document.getElementById("feAddPageBtn")?.addEventListener("click", _handleAddPage);

  // Import HTML page from file
  document.getElementById("feImportPageBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    _pickAndLoad("html");
  });

  // Add new JS file
  document.getElementById("feAddJsFileBtn")?.addEventListener("click", _handleAddJsFile);

  // Load JS file from disk (adds as new file)
  document.getElementById("feLoadJsBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    _pickAndLoad("js");
  });

  // Re-render lists on store changes
  onPageChange(() => renderPageList());
  onJsFileChange(() => renderJsFileList());

  renderPageList();
  renderJsFileList();
}

export function switchToFile(name) {
  if (name === currentFile) return;

  // Flush the outgoing editor back to its store
  if (currentFile === "css") setRawCss(elements.cssInput.value);
  if (currentFile === "js")  _flushCurrentJsFile();

  currentFile = name;
  _activateFile(name);
}

export function getCurrentFile() { return currentFile; }

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

  list.querySelectorAll(".fe-page-entry").forEach(el => {
    el.addEventListener("click", e => {
      if (e.target.classList.contains("fe-rm-page")) return;
      const pageName = el.dataset.page;

      if (currentFile !== "html") {
        if (currentFile === "css") setRawCss(elements.cssInput.value);
        if (currentFile === "js")  _flushCurrentJsFile();
        currentFile = "html";
        showEditor("html");
      }

      if (switchPage(pageName)) {
        renderPageList();
        renderPreview();
      }
    });
  });

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

export function renderJsFileList() {
  const list = document.getElementById("feJsFileList");
  if (!list) return;

  const files   = getAllJsFiles();
  const current = getCurrentJsFile();

  list.innerHTML = files.map(name => `
    <div class="fe-file fe-js-entry${name === current ? " active" : ""}" data-jsfile="${name}">
      <span class="fe-icon fe-js">J</span>
      <span class="fe-file-name">${name}</span>
      ${name !== "script.js"
        ? `<button class="fe-rm-js" data-jsfile="${name}" title="Remove file">&#215;</button>`
        : ""}
    </div>
  `).join("");

  list.querySelectorAll(".fe-js-entry").forEach(el => {
    el.addEventListener("click", e => {
      if (e.target.classList.contains("fe-rm-js")) return;
      _switchToJsFile(el.dataset.jsfile);
    });
  });

  list.querySelectorAll(".fe-rm-js").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const fname = btn.dataset.jsfile;
      if (confirm(`Remove "${fname}"? This cannot be undone.`)) {
        if (removeJsFile(fname)) renderJsFileList();
      }
    });
  });

  // Keep CSS file active indicator in sync
  elements.feCssFile.classList.toggle("active", currentFile === "css");
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _activateFile(name) {
  elements.feCssFile.classList.toggle("active", name === "css");

  showEditor(name);

  if (name === "css") elements.cssInput.value = getRawCss();
  if (name === "js")  elements.jsInput.value  = getJsFileContent(getCurrentJsFile());

  renderJsFileList();
}

function _flushCurrentJsFile() {
  const content = elements.jsInput.value;
  setRawJs(content);
  setJsFileContent(getCurrentJsFile(), content);
}

function _switchToJsFile(name) {
  // If we're not in JS mode yet, switch to it first
  if (currentFile !== "js") {
    if (currentFile === "css") setRawCss(elements.cssInput.value);
    currentFile = "js";
    showEditor("js");
  }

  // switchJsFile flushes the current textarea content into the outgoing file
  const switched = switchJsFile(name, elements.jsInput.value);
  if (!switched && name !== getCurrentJsFile()) return;

  const content = getJsFileContent(name);
  setRawJs(content);
  elements.jsInput.value = content;
  renderJsFileList();
}

function _handleAddPage() {
  const raw = prompt("New page filename (e.g. about.html):");
  if (!raw) return;

  let filename = raw.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  if (!filename.endsWith(".html")) filename += ".html";

  if (!addPage(filename)) {
    alert(`Page "${filename}" already exists.`);
    return;
  }
  renderPageList();
}

function _handleAddJsFile() {
  const raw = prompt("New JS file name (e.g. utils.js):");
  if (!raw) return;

  let filename = raw.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  if (!filename.endsWith(".js")) filename += ".js";

  if (!addJsFile(filename)) {
    alert(`File "${filename}" already exists.`);
    return;
  }
  _switchToJsFile(filename);
}

// ── Load a file from disk ─────────────────────────────────────────────────────

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
        // Load as a new JS file named after the source file
        let filename = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
        if (!filename.endsWith(".js")) filename += ".js";
        addJsFile(filename);
        setJsFileContent(filename, text);
        _switchToJsFile(filename);

      } else {
        // Import as a new HTML page named after the file
        let filename = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
        if (!filename.endsWith(".html")) filename += ".html";
        addPage(filename);
        setPageHtml(filename, text);
        if (currentFile !== "html") {
          if (currentFile === "css") setRawCss(elements.cssInput.value);
          if (currentFile === "js")  _flushCurrentJsFile();
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
