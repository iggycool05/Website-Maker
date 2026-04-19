/**
 * export.js
 * File tab dropdown: Export as HTML, Export as ZIP, New Project.
 */

import { elements } from "../DOM/elements.js";
import { getRawCss } from "../CSS Features/cssStore.js";
import { getRawJs } from "../JS Features/jsStore.js";
import { getUploadedImage } from "../Utils/imageStore.js";
import { createNewProject } from "./projectStorage.js";

// ── Internal helpers ──────────────────────────────────────────────────────────

function resolveImages(html) {
  return html.replace(
    /<img\b([^>]*?)\sdata-upload-id="([^"]+)"([^>]*?)>/gi,
    (match, before, id, after) => {
      const src = getUploadedImage(id);
      return src ? `<img${before} src="${src}" data-upload-id="${id}"${after}>` : match;
    }
  );
}

function cleanHtml(html) {
  html = html.replace(/<div\s+class="resize-handle[^"]*"><\/div>\s*/gi, "");
  html = html.replace(/<div\s+id="_snap-guides"[^>]*>[\s\S]*?<\/div>\s*/gi, "");
  return html.trim();
}

function buildBaseCss(css) {
  return [
    "body { margin: 0; padding: 20px; font-family: Arial, sans-serif; position: relative; }",
    ".draggable-item { position: absolute; }",
    css || "",
  ].filter(Boolean).join("\n\n");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Export as single HTML file ────────────────────────────────────────────────

export function saveAsHtml() {
  const html    = cleanHtml(resolveImages(elements.htmlInput.value));
  const css     = getRawCss();
  const js      = getRawJs();
  const safeJs  = js ? js.replace(/<\/script/gi, "<\\/script") : "";
  const styleBlock = `  <style>\n${buildBaseCss(css)}\n  </style>`;

  const doc = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "  <title>My Website</title>",
    styleBlock,
    "</head>",
    "<body>",
    html,
    safeJs ? `<script>\n${safeJs}\n<\/script>` : "",
    "</body>",
    "</html>",
  ].filter(Boolean).join("\n");

  downloadBlob(new Blob([doc], { type: "text/html" }), "index.html");
}

// ── Export as ZIP (separate index.html / styles.css / script.js) ──────────────

export async function saveAsZip() {
  const { default: JSZip } = await import("https://esm.sh/jszip");

  const html    = cleanHtml(resolveImages(elements.htmlInput.value));
  const css     = getRawCss();
  const js      = getRawJs();
  const safeJs  = js ? js.replace(/<\/script/gi, "<\\/script") : "";

  const htmlDoc = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "  <title>My Website</title>",
    '  <link rel="stylesheet" href="styles.css">',
    "</head>",
    "<body>",
    html,
    safeJs ? `<script src="script.js"><\/script>` : "",
    "</body>",
    "</html>",
  ].filter(Boolean).join("\n");

  const zip = new JSZip();
  zip.file("index.html", htmlDoc);
  zip.file("styles.css",  buildBaseCss(css));
  if (js) zip.file("script.js", js);

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "website.zip");
}

// ── Dropdown wiring ───────────────────────────────────────────────────────────

export function initExport() {
  const fileTabBtn      = document.getElementById("fileTabBtn");
  const fileTabDropdown = document.getElementById("fileTabDropdown");
  const exportHtmlBtn   = document.getElementById("exportHtmlBtn");
  const exportZipBtn    = document.getElementById("exportZipBtn");
  const newProjectBtn   = document.getElementById("newProjectBtn");

  if (!fileTabBtn || !fileTabDropdown) return;

  fileTabBtn.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = fileTabDropdown.classList.toggle("open");
    if (isOpen) {
      const rect = fileTabBtn.getBoundingClientRect();
      fileTabDropdown.style.top  = `${rect.bottom}px`;
      fileTabDropdown.style.left = `${rect.left}px`;
    }
  });

  document.addEventListener("click", () => fileTabDropdown.classList.remove("open"));

  exportHtmlBtn?.addEventListener("click", () => {
    fileTabDropdown.classList.remove("open");
    saveAsHtml();
  });

  exportZipBtn?.addEventListener("click", () => {
    fileTabDropdown.classList.remove("open");
    saveAsZip();
  });

  newProjectBtn?.addEventListener("click", () => {
    fileTabDropdown.classList.remove("open");
    createNewProject();
  });
}
