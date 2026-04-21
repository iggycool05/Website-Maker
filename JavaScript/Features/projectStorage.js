/**
 * projectStorage.js
 *
 * Two save/load modes:
 *   1. Folder mode  — uses the File System Access API (Chrome/Edge).
 *      "Open Folder" picks a directory; Save writes index.html / styles.css /
 *      script.js back into it.  The folder name appears in the file explorer.
 *   2. Browser mode — falls back to localStorage (always available).
 *      "Save Project" / "Load Project" use a single STORAGE_KEY slot.
 *
 * Auto-save debounce runs after every content change and calls saveProject(),
 * which routes to whichever mode is currently active.
 */

import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "../CSS Features/cssStore.js";
import { getRawJs, setRawJs } from "../JS Features/jsStore.js";
import { serializeJsFiles, loadJsFiles, clearJsFiles } from "../JS Features/jsFileStore.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { resetHistory } from "../Utils/undoRedo.js";
import { setProjectName, switchToFile, renderPageList, renderJsFileList } from "../HTML Features/fileExplorer.js";
import { showPreviewView } from "../HTML Features/sourceEditor.js";
import { serializePages, loadPages, clearPages } from "./pageStore.js";

const STORAGE_KEY  = "openbuilder_project";
const AUTOSAVE_MS  = 2000;

let _dirHandle     = null;   // FileSystemDirectoryHandle | null
let _autosaveTimer = null;

// ── File System Access helpers ────────────────────────────────────────────────

const hasFSA = "showDirectoryPicker" in window;

async function _readFile(dirHandle, filename) {
  try {
    const fh   = await dirHandle.getFileHandle(filename);
    const file = await fh.getFile();
    return await file.text();
  } catch {
    return "";
  }
}

async function _writeFile(dirHandle, filename, content) {
  const fh       = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fh.createWritable();
  await writable.write(content);
  await writable.close();
}

// ── Folder mode ───────────────────────────────────────────────────────────────

/** Open a local folder and load index.html / styles.css / script.js from it. */
export async function openFolder() {
  if (!hasFSA) {
    alert("Your browser does not support the File System Access API.\nPlease use Chrome or Edge.");
    return false;
  }

  let dirHandle;
  try {
    dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  } catch (e) {
    if (e.name !== "AbortError") console.error("[projectStorage] openFolder:", e);
    return false;
  }

  const css = await _readFile(dirHandle, "styles.css");

  // Load all pages from pages.json manifest (if it exists), else just index.html
  let pagesData = {};
  try {
    const manifest = JSON.parse(await _readFile(dirHandle, "pages.json"));
    if (Array.isArray(manifest)) {
      for (const name of manifest) {
        pagesData[name] = await _readFile(dirHandle, name);
      }
    }
  } catch {
    pagesData["index.html"] = await _readFile(dirHandle, "index.html");
  }
  if (!pagesData["index.html"]) {
    pagesData["index.html"] = await _readFile(dirHandle, "index.html");
  }

  // Load JS files from js_files.json manifest (if it exists), else just script.js
  let jsFilesData = {};
  try {
    const jsManifest = JSON.parse(await _readFile(dirHandle, "js_files.json"));
    if (Array.isArray(jsManifest)) {
      for (const name of jsManifest) {
        jsFilesData[name] = await _readFile(dirHandle, name);
      }
    }
  } catch {
    jsFilesData["script.js"] = await _readFile(dirHandle, "script.js");
  }
  if (!jsFilesData["script.js"]) {
    jsFilesData["script.js"] = await _readFile(dirHandle, "script.js");
  }

  loadPages(pagesData);
  loadJsFiles(jsFilesData);
  const activeJs = jsFilesData["script.js"] ?? "";
  elements.cssInput.value = css;
  elements.jsInput.value  = activeJs;
  setRawCss(css);
  setRawJs(activeJs);

  _dirHandle = dirHandle;
  setProjectName(dirHandle.name);
  renderPageList();
  renderJsFileList();

  renderPreview();
  resetHistory();
  return true;
}

/** Write current content back to the open folder. */
export async function saveToFolder() {
  if (!_dirHandle) return false;
  try {
    const serialized = serializePages();

    // Write every page as its own file
    for (const [name, html] of Object.entries(serialized)) {
      await _writeFile(_dirHandle, name, html);
    }

    // Write a pages.json manifest when there is more than one page
    const pageNames = Object.keys(serialized);
    if (pageNames.length > 1) {
      await _writeFile(_dirHandle, "pages.json", JSON.stringify(pageNames, null, 2));
    }

    await _writeFile(_dirHandle, "styles.css", getRawCss());

    // Write each JS file; write a js_files.json manifest when there is more than one
    const jsSnapshot = serializeJsFiles(getRawJs());
    for (const [name, content] of Object.entries(jsSnapshot)) {
      await _writeFile(_dirHandle, name, content);
    }
    const jsFileNames = Object.keys(jsSnapshot);
    if (jsFileNames.length > 1) {
      await _writeFile(_dirHandle, "js_files.json", JSON.stringify(jsFileNames, null, 2));
    }
    return true;
  } catch (e) {
    console.error("[projectStorage] saveToFolder:", e);
    return false;
  }
}

/** Release the open folder reference (called by New Project). */
export function clearFolderHandle() {
  _dirHandle = null;
  setProjectName("Project");
}

/** True when a folder is currently open. */
export function hasFolderOpen() {
  return _dirHandle !== null;
}

// ── Browser (localStorage) mode ───────────────────────────────────────────────

export function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      pages:   serializePages(),
      css:     getRawCss(),
      jsFiles: serializeJsFiles(getRawJs()),
      savedAt: new Date().toISOString(),
    }));
    return true;
  } catch (e) {
    console.error("[projectStorage] saveToLocalStorage:", e);
    return false;
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);

    // Support both the new multi-page format and the old single-html format
    const pagesData = saved.pages
      ?? { "index.html": saved.html ?? "" };

    const savedJsFiles = saved.jsFiles ?? { "script.js": saved.js ?? "" };
    loadPages(pagesData);
    loadJsFiles(savedJsFiles);
    const activeJs = savedJsFiles["script.js"] ?? saved.js ?? "";
    elements.cssInput.value = saved.css ?? "";
    elements.jsInput.value  = activeJs;
    setRawCss(saved.css ?? "");
    setRawJs(activeJs);

    renderPreview();
    resetHistory();
    renderPageList();
    renderJsFileList();
    return true;
  } catch (e) {
    console.error("[projectStorage] loadFromLocalStorage:", e);
    return false;
  }
}

export function hasSavedProject() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// ── Unified save (routes to active mode) ─────────────────────────────────────

/** Save to folder if one is open, otherwise save to localStorage. */
export async function saveProject() {
  if (_dirHandle) return saveToFolder();
  return saveToLocalStorage();
}

// ── Auto-save (debounced) ─────────────────────────────────────────────────────

export function scheduleAutosave() {
  clearTimeout(_autosaveTimer);
  _autosaveTimer = setTimeout(() => saveProject(), AUTOSAVE_MS);
}

// ── Create new project in OpenBuilder/<name>/ folder ─────────────────────────

/**
 * Shows a name-input modal, opens a directory picker, then creates:
 *   <chosen-location>/OpenBuilder/<projectName>/index.html
 *                                               /styles.css
 *                                               /script.js
 * Falls back to a simple clear if the File System Access API is unavailable.
 */
export async function createNewProject() {
  if (!hasFSA) {
    if (!confirm("File System Access is not supported in this browser.\nStart a new empty project? All unsaved work will be lost.")) return false;
    _clearEditor();
    return true;
  }

  const name = await _promptProjectName();
  if (!name) return false;

  let parentHandle;
  try {
    parentHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  } catch (e) {
    if (e.name !== "AbortError") console.error("[projectStorage] createNewProject:", e);
    return false;
  }

  // Create OpenBuilder/ then the project subfolder
  const openBuilderDir = await parentHandle.getDirectoryHandle("OpenBuilder", { create: true });
  const projectDir     = await openBuilderDir.getDirectoryHandle(name, { create: true });

  // Write blank files
  await _writeFile(projectDir, "index.html", "");
  await _writeFile(projectDir, "styles.css",  "");
  await _writeFile(projectDir, "script.js",   "");

  _dirHandle = projectDir;
  setProjectName(name);

  _clearEditor();
  return true;
}

function _clearEditor() {
  clearPages();
  clearJsFiles();
  elements.cssInput.value = "";
  elements.jsInput.value  = "";
  setRawCss("");
  setRawJs("");
  renderPageList();
  renderJsFileList();
  switchToFile("html");
  showPreviewView(true);
  resetHistory();
}

/** Promise-based modal that asks for a project name. Resolves null on cancel. */
function _promptProjectName() {
  return new Promise(resolve => {
    const modal      = document.getElementById("newProjectModal");
    const input      = document.getElementById("newProjectNameInput");
    const errorEl    = document.getElementById("newProjectError");
    const confirmBtn = document.getElementById("newProjectConfirm");
    const cancelBtn  = document.getElementById("newProjectCancel");

    if (!modal) { resolve(null); return; }

    input.value         = "";
    errorEl.textContent = "";
    modal.classList.add("open");
    setTimeout(() => input.focus(), 50);

    function done(name) {
      modal.classList.remove("open");
      confirmBtn.removeEventListener("click",  onConfirm);
      cancelBtn.removeEventListener("click",   onCancel);
      input.removeEventListener("keydown",     onKey);
      resolve(name);
    }

    function validate() {
      const v = input.value.trim();
      if (!v) { errorEl.textContent = "Project name is required."; return null; }
      if (!/^[a-zA-Z0-9_\-. ]+$/.test(v)) {
        errorEl.textContent = "Use only letters, numbers, spaces, hyphens, underscores, or dots.";
        return null;
      }
      return v;
    }

    function onConfirm() { const n = validate(); if (n) done(n); }
    function onCancel()  { done(null); }
    function onKey(e) {
      if (e.key === "Enter")  { e.preventDefault(); onConfirm(); }
      if (e.key === "Escape") { e.preventDefault(); onCancel(); }
    }

    confirmBtn.addEventListener("click",  onConfirm);
    cancelBtn.addEventListener("click",   onCancel);
    input.addEventListener("keydown",     onKey);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initProjectStorage() {
  const fileDropdown  = document.getElementById("fileTabDropdown");
  const openFolderBtn = document.getElementById("openFolderBtn");
  const saveBtn       = document.getElementById("saveProjectBtn");
  const loadBtn       = document.getElementById("loadProjectBtn");

  // Open Folder
  openFolderBtn?.addEventListener("click", async () => {
    fileDropdown?.classList.remove("open");
    const ok = await openFolder();
    if (ok && openFolderBtn) {
      const orig = openFolderBtn.innerHTML;
      openFolderBtn.innerHTML = '<span class="td-ico">&#10003;</span> Folder Opened';
      setTimeout(() => { openFolderBtn.innerHTML = orig; }, 1400);
    }
  });

  // Save — routes to folder or localStorage
  saveBtn?.addEventListener("click", async () => {
    fileDropdown?.classList.remove("open");
    const ok = await saveProject();
    if (ok && saveBtn) {
      const orig = saveBtn.innerHTML;
      saveBtn.innerHTML = '<span class="td-ico">&#10003;</span> Saved!';
      setTimeout(() => { saveBtn.innerHTML = orig; }, 1400);
    }
  });

  // Load from localStorage
  loadBtn?.addEventListener("click", () => {
    fileDropdown?.classList.remove("open");
    if (!hasSavedProject()) { alert("No saved project found."); return; }
    if (confirm("Load saved project? Current unsaved work will be replaced.")) {
      loadFromLocalStorage();
    }
  });

  // Restore last localStorage session on startup (only when no folder is open)
  if (hasSavedProject()) {
    loadFromLocalStorage();
  }
}
