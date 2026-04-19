/**
 * domInspector.js
 *
 * VS Code-style DOM tree panel on the right side of the preview.
 * - Toggle via the "Inspector" tab button.
 * - Clicking a tree node selects the corresponding element in the iframe.
 * - Selection made elsewhere (click in iframe, drag, etc.) is reflected
 *   back into the tree via the onSelectionChange callback array.
 * - Right-clicking a tree node shows a context menu with
 *   "Go to line in Source Code" which jumps to that element's opening tag
 *   in the HTML CodeMirror editor.
 */

import { state, onSelectionChange } from "../State/editorState.js";
import { elements } from "../DOM/elements.js";
import {
  clearSelectedTextHighlight,
  updateFontSizeDisplay,
  updateFontFamilyDisplay,
} from "./textSelection.js";
import { showEditor, goToLineInHtml } from "./codeEditor.js";
import { showSourceView } from "./sourceEditor.js";
import { switchToFile } from "./fileExplorer.js";

// Builder-injected classes that are implementation details, not user classes
const INTERNAL_CLASSES = new Set([
  "draggable-item", "selected-text",
  "resize-handle", "top-left", "top-right", "bottom-left", "bottom-right",
]);

let isOpen = false;
// Maps live iframe elements → their inspector row <div> so we can
// highlight the active row without traversing the whole tree again.
const elementToRow = new WeakMap();

// ── Context menu (right-click on inspector node) ──────────────────────────────

let _ctxMenu    = null;  // the #inspCtxMenu element
let _ctxTarget  = null;  // the iframe element the menu was opened for

function _buildCtxMenu() {
  const menu = document.createElement("div");
  menu.id = "inspCtxMenu";

  const goItem = document.createElement("div");
  goItem.className = "insp-ctx-item";
  goItem.innerHTML = `<span class="insp-ctx-icon">&#9654;</span> Go to line in Source Code`;
  goItem.addEventListener("click", _goToSource);
  menu.appendChild(goItem);

  const sepEl = document.createElement("div");
  sepEl.className = "insp-ctx-sep";
  menu.appendChild(sepEl);

  const selectItem = document.createElement("div");
  selectItem.className = "insp-ctx-item";
  selectItem.innerHTML = `<span class="insp-ctx-icon">&#10022;</span> Select element`;
  selectItem.addEventListener("click", () => {
    if (_ctxTarget) selectFromInspector(_ctxTarget);
    _closeCtxMenu();
  });
  menu.appendChild(selectItem);

  document.body.appendChild(menu);
  return menu;
}

function _openCtxMenu(x, y, iframeEl) {
  if (!_ctxMenu) _ctxMenu = _buildCtxMenu();
  _ctxTarget = iframeEl;

  // Position the menu, keeping it inside the viewport
  const menuW = 210;
  const menuH = 80;
  const left  = Math.min(x, window.innerWidth  - menuW - 6);
  const top   = Math.min(y, window.innerHeight - menuH - 6);

  _ctxMenu.style.left = `${left}px`;
  _ctxMenu.style.top  = `${top}px`;
  _ctxMenu.classList.add("open");
}

function _closeCtxMenu() {
  _ctxMenu?.classList.remove("open");
  _ctxTarget = null;
}

// ── "Go to Source" logic ──────────────────────────────────────────────────────

/**
 * Find the 1-based line number in the raw HTML textarea where the
 * opening tag of `el` most likely appears.
 *
 * Strategy (in priority order):
 *   1. If the element has an id → search for id="<id>"
 *   2. If it has user-facing classes → search for the first one
 *   3. Fall back to the raw tag name
 */
function _findElementLine(el) {
  const html = elements.htmlInput.value;
  if (!html) return 1;

  const tag        = el.tagName.toLowerCase();
  const id         = el.id;
  const userClasses = Array.from(el.classList).filter(c => !INTERNAL_CLASSES.has(c));

  let searchStr;
  if (id) {
    searchStr = `id="${id}"`;
  } else if (userClasses.length > 0) {
    // Look for the opening tag containing the first user class
    searchStr = `<${tag}`;
    // Narrow by including the class if possible
    const classMatch = html.indexOf(`class="${userClasses[0]}`);
    const classMatch2 = html.indexOf(`class="${el.className.trim()}`);
    if (classMatch2 !== -1) {
      const before = html.substring(0, classMatch2);
      return before.split("\n").length;
    }
    if (classMatch !== -1) {
      const before = html.substring(0, classMatch);
      return before.split("\n").length;
    }
  } else {
    searchStr = `<${tag}`;
  }

  const idx = html.indexOf(searchStr);
  if (idx === -1) return 1;
  return html.substring(0, idx).split("\n").length;
}

function _goToSource() {
  _closeCtxMenu();
  if (!_ctxTarget) return;

  const lineNum = _findElementLine(_ctxTarget);

  // Switch to Source Code view, HTML file
  showSourceView();
  switchToFile("html");
  showEditor("html");

  // Give the editor a tick to become visible, then jump
  setTimeout(() => goToLineInHtml(lineNum), 60);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function toggleInspector() {
  isOpen = !isOpen;
  elements.inspectorPanel.classList.toggle("open", isOpen);
  elements.inspectorToggleBtn.classList.toggle("active", isOpen);
  if (isOpen) refreshInspector();
}

export function refreshInspector() {
  if (!isOpen) return;
  elements.inspectorTree.innerHTML = "";

  if (!state.iframeDoc?.body) {
    elements.inspectorTree.innerHTML =
      '<div class="insp-empty">No preview loaded.</div>';
    return;
  }

  const topChildren = Array.from(state.iframeDoc.body.children).filter(
    c => c.id !== "_snap-guides" && !c.classList.contains("resize-handle")
  );

  if (!topChildren.length) {
    elements.inspectorTree.innerHTML =
      '<div class="insp-empty">No elements in preview.</div>';
    return;
  }

  buildTree(state.iframeDoc.body, elements.inspectorTree, 0);
  highlightActiveRow();
}

// ── Tree building ─────────────────────────────────────────────────────────────

function buildTree(parentNode, container, depth) {
  for (const child of parentNode.children) {
    if (child.id === "_snap-guides") continue;
    if (child.classList.contains("resize-handle")) continue;

    const row = document.createElement("div");
    row.className = "insp-node";
    row.style.paddingLeft = `${8 + depth * 14}px`;
    elementToRow.set(child, row);

    // Children to recurse into (filtered for internal nodes)
    const displayChildren = Array.from(child.children).filter(
      c => c.id !== "_snap-guides" && !c.classList.contains("resize-handle")
    );

    // Collapse/expand arrow
    const arrow = document.createElement("span");
    arrow.className = "insp-arrow";
    arrow.textContent = "▾";
    if (!displayChildren.length) arrow.style.visibility = "hidden";
    row.appendChild(arrow);

    // Tag name
    const tag = document.createElement("span");
    tag.className = "insp-tag";
    tag.textContent = child.tagName.toLowerCase();
    row.appendChild(tag);

    // #id and user-facing .class names
    const metaParts = [];
    if (child.id) metaParts.push(`#${child.id}`);
    Array.from(child.classList)
      .filter(c => !INTERNAL_CLASSES.has(c))
      .forEach(c => metaParts.push(`.${c}`));

    if (metaParts.length) {
      const meta = document.createElement("span");
      meta.className = "insp-meta";
      meta.textContent = " " + metaParts.join("");
      row.appendChild(meta);
    }

    // Short text preview (direct text nodes only, first 24 chars)
    const directText = Array.from(child.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 24);

    if (directText) {
      const preview = document.createElement("span");
      preview.className = "insp-preview";
      preview.textContent = ` "${directText}"`;
      row.appendChild(preview);
    }

    // Left-click → select element
    row.addEventListener("click", e => {
      e.stopPropagation();
      selectFromInspector(child);
    });

    // Right-click → context menu with "Go to Source"
    row.addEventListener("contextmenu", e => {
      e.preventDefault();
      e.stopPropagation();
      _closeCtxMenu();
      _openCtxMenu(e.clientX, e.clientY, child);
    });

    container.appendChild(row);

    // Recursively render children in a collapsible sub-container
    if (displayChildren.length) {
      const childContainer = document.createElement("div");
      childContainer.className = "insp-children";
      buildTree(child, childContainer, depth + 1);
      container.appendChild(childContainer);

      let collapsed = false;
      arrow.style.cursor = "pointer";
      arrow.addEventListener("click", e => {
        e.stopPropagation();
        collapsed = !collapsed;
        arrow.textContent = collapsed ? "▸" : "▾";
        childContainer.style.display = collapsed ? "none" : "";
      });
    }
  }
}

// ── Selection sync ────────────────────────────────────────────────────────────

function selectFromInspector(el) {
  clearSelectedTextHighlight();
  el.classList.add("selected-text");
  state.selectedTextElement = el;
  updateFontSizeDisplay();
  updateFontFamilyDisplay();
  onSelectionChange.forEach(fn => fn());
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  highlightActiveRow();
}

function highlightActiveRow() {
  if (!isOpen) return;
  // Remove previous active highlight
  elements.inspectorTree
    .querySelectorAll(".insp-node.active")
    .forEach(n => n.classList.remove("active"));
  if (!state.selectedTextElement) return;
  const row = elementToRow.get(state.selectedTextElement);
  if (row) {
    row.classList.add("active");
    row.scrollIntoView({ block: "nearest" });
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initDomInspector() {
  elements.inspectorToggleBtn.addEventListener("click", toggleInspector);
  elements.inspectorCloseBtn.addEventListener("click", () => {
    if (isOpen) toggleInspector();
  });

  // Keep tree highlight in sync whenever the selection changes from outside
  onSelectionChange.push(highlightActiveRow);

  // Close the context menu on any outside click
  document.addEventListener("click", e => {
    if (_ctxMenu?.classList.contains("open") && !_ctxMenu.contains(e.target)) {
      _closeCtxMenu();
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") _closeCtxMenu();
  });
}
