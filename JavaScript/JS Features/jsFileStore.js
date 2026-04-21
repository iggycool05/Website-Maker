/**
 * jsFileStore.js
 * Manages multiple JS files per project, mirroring the pageStore.js pattern.
 * "script.js" is always present and cannot be removed.
 */

let jsFiles       = { "script.js": "" };
let currentJsFile = "script.js";
const _onChange   = [];

// ── Public API ────────────────────────────────────────────────────────────────

export function getCurrentJsFile()           { return currentJsFile; }
export function getAllJsFiles()               { return Object.keys(jsFiles); }
export function getJsFileContent(name)       { return jsFiles[name] ?? ""; }
export function setJsFileContent(name, text) { jsFiles[name] = text; }

/**
 * Returns all JS file contents concatenated, substituting currentBuffer
 * for the active file so the caller can pass the live textarea value without
 * flushing to the store first.
 */
export function getAllJsContent(currentBuffer) {
  const snap = { ...jsFiles, [currentJsFile]: currentBuffer };
  return Object.values(snap).filter(Boolean).join("\n\n");
}

/** Flush currentBuffer → old file, switch to new file. Returns false if no-op. */
export function switchJsFile(name, currentBuffer) {
  if (name === currentJsFile || !(name in jsFiles)) return false;
  jsFiles[currentJsFile] = currentBuffer;
  currentJsFile = name;
  _notify();
  return true;
}

/** Add a new empty JS file. Returns false if name already exists. */
export function addJsFile(name) {
  if (name in jsFiles) return false;
  jsFiles[name] = "";
  _notify();
  return true;
}

/** Remove a JS file. Cannot remove "script.js" or the current file. */
export function removeJsFile(name) {
  if (name === "script.js" || name === currentJsFile || !(name in jsFiles)) return false;
  delete jsFiles[name];
  _notify();
  return true;
}

/** Snapshot all files, substituting currentBuffer for the active file. */
export function serializeJsFiles(currentBuffer) {
  return { ...jsFiles, [currentJsFile]: currentBuffer };
}

/** Load a saved files object; always ensures "script.js" exists. */
export function loadJsFiles(data) {
  jsFiles = (typeof data === "object" && data !== null) ? { ...data } : { "script.js": "" };
  if (!("script.js" in jsFiles)) jsFiles["script.js"] = "";
  currentJsFile = "script.js";
  _notify();
}

/** Reset to a single empty script.js. */
export function clearJsFiles() {
  jsFiles = { "script.js": "" };
  currentJsFile = "script.js";
  _notify();
}

export function onJsFileChange(fn) { _onChange.push(fn); }

function _notify() { _onChange.forEach(fn => fn()); }
