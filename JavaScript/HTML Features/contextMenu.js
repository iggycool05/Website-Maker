/**
 * contextMenu.js
 * – Right-click context menu on iframe elements
 * – Set ID modal
 * – Add Comment modal
 * – ID Picker: searchable, vertical dropdown inside the HTML Editor ribbon
 */

import { state, onSelectionChange } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";
import { elements } from "../DOM/elements.js";
import { getAllClasses } from "../CSS Features/cssStore.js";
import { copySelected, pasteElement, duplicateSelected, deleteSelected } from "./copyPaste.js";

// ── Shared state ──────────────────────────────────────────────────────────────

let contextTarget  = null;  // element that was right-clicked in the iframe
let isPickerOpen   = false;
let pickerFocusIdx = -1;

// ── Validation ────────────────────────────────────────────────────────────────

function isValidHtmlId(id) {
  return /^[a-zA-Z_][a-zA-Z0-9_\-]*$/.test(id);
}

// ── Context Menu ──────────────────────────────────────────────────────────────

export function hideContextMenu() {
  elements.elementContextMenu.classList.remove("open");
  elements.ctxClassPanel.classList.remove("open");
  elements.ctxClassSearch.value = "";
}

function showContextMenu(x, y) {
  elements.ctxTagLabel.textContent = contextTarget
    ? `<${contextTarget.tagName.toLowerCase()}>`
    : "";
  elements.ctxIdBadge.textContent = contextTarget && contextTarget.id
    ? `#${contextTarget.id}`
    : "";

  // Always start with class panel collapsed
  elements.ctxClassPanel.classList.remove("open");
  elements.ctxClassSearch.value = "";

  const menu = elements.elementContextMenu;
  menu.style.left = Math.min(x, window.innerWidth  - 220) + "px";
  menu.style.top  = Math.min(y, window.innerHeight - 120) + "px";
  menu.classList.add("open");
}

export function handleIframeContextMenu(e) {
  e.preventDefault();

  let target = e.target;
  if (!target || target === state.iframeDoc.body) return;

  // Walk up to the nearest draggable-item
  let el = target;
  while (el && el !== state.iframeDoc.body) {
    if (el.classList && el.classList.contains("draggable-item")) {
      target = el;
      break;
    }
    el = el.parentElement;
  }

  contextTarget = target;
  const iframeRect = elements.previewFrame.getBoundingClientRect();
  showContextMenu(iframeRect.left + e.clientX, iframeRect.top + e.clientY);
}

// ── Set ID modal ──────────────────────────────────────────────────────────────

function openSetIdModal() {
  hideContextMenu();
  if (!contextTarget) return;

  elements.setIdElementTag.textContent = `<${contextTarget.tagName.toLowerCase()}>`;
  elements.setIdInput.value = contextTarget.id || "";
  elements.setIdError.textContent = "";
  elements.setIdModal.classList.add("open");
  elements.setIdInput.focus();
  elements.setIdInput.select();
}

function closeSetIdModal() {
  elements.setIdModal.classList.remove("open");
}

function confirmSetId() {
  if (!contextTarget) return;
  const val = elements.setIdInput.value.trim();

  if (!val) {
    contextTarget.removeAttribute("id");
    saveIframeToTextarea();
    refreshIdPanel();
    updateIdPanelDisplay();
    closeSetIdModal();
    return;
  }

  if (!isValidHtmlId(val)) {
    elements.setIdError.textContent =
      "Invalid ID — must start with a letter or underscore, and contain only letters, numbers, hyphens, or underscores. No spaces.";
    return;
  }

  const existing = state.iframeDoc && state.iframeDoc.getElementById(val);
  if (existing && existing !== contextTarget) {
    elements.setIdError.textContent = `The ID "#${val}" is already used by another element.`;
    return;
  }

  contextTarget.id = val;
  saveIframeToTextarea();
  refreshIdPanel();
  updateIdPanelDisplay();
  closeSetIdModal();
}

// ── Add Comment modal ─────────────────────────────────────────────────────────

function getCommentBefore(el) {
  let prev = el.previousSibling;
  while (prev) {
    if (prev.nodeType === Node.COMMENT_NODE) return prev;
    if (prev.nodeType === Node.TEXT_NODE && !prev.nodeValue.trim()) {
      prev = prev.previousSibling;
      continue;
    }
    break;
  }
  return null;
}

function openAddCommentModal() {
  hideContextMenu();
  if (!contextTarget) return;

  elements.addCommentElementTag.textContent =
    `<${contextTarget.tagName.toLowerCase()}>`;

  const existing = getCommentBefore(contextTarget);
  elements.addCommentInput.value = existing ? existing.nodeValue.trim() : "";

  elements.addCommentModal.classList.add("open");
  elements.addCommentInput.focus();
}

function closeAddCommentModal() {
  elements.addCommentModal.classList.remove("open");
}

function confirmAddComment() {
  if (!contextTarget) return;
  const text = elements.addCommentInput.value;

  if (!text.trim()) {
    const existing = getCommentBefore(contextTarget);
    if (existing) {
      // Also remove the whitespace text node that sits between comment and element
      let node = existing.nextSibling;
      while (node && node !== contextTarget) {
        const next = node.nextSibling;
        if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) node.remove();
        node = next;
      }
      existing.remove();
    }
    saveIframeToTextarea();
    closeAddCommentModal();
    return;
  }

  // Remove old comment + its trailing whitespace
  const existing = getCommentBefore(contextTarget);
  if (existing) {
    let node = existing.nextSibling;
    while (node && node !== contextTarget) {
      const next = node.nextSibling;
      if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) node.remove();
      node = next;
    }
    existing.remove();
  }

  // `-->` inside the text would end the comment early — replace with `-- >`
  const safeText = text.replace(/-->/g, "-- >");
  const comment = state.iframeDoc.createComment(` ${safeText} `);
  contextTarget.parentNode.insertBefore(comment, contextTarget);
  // Newline so `-->` doesn't share a line with the opening tag
  contextTarget.parentNode.insertBefore(
    state.iframeDoc.createTextNode("\n"),
    contextTarget
  );

  saveIframeToTextarea();
  closeAddCommentModal();
}

// ── ID Picker ─────────────────────────────────────────────────────────────────

/** Collect all elements with IDs from the iframe, sorted alphabetically. */
function getIframeIds() {
  if (!state.iframeDoc) return [];
  return Array.from(state.iframeDoc.querySelectorAll("[id]"))
    .map(el => ({ id: el.id, tag: el.tagName.toLowerCase() }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function openIdPicker() {
  isPickerOpen = true;
  renderIdDropdown(elements.idPickerInput.value.trim());
  positionIdDropdown();
  elements.idPickerDropdown.classList.add("open");
  pickerFocusIdx = -1;
  elements.idPickerInput.select();
}

function closeIdPicker() {
  isPickerOpen = false;
  elements.idPickerDropdown.classList.remove("open");
  pickerFocusIdx = -1;
}

function positionIdDropdown() {
  const rect = elements.idPickerInput.closest(".ip-input-wrap").getBoundingClientRect();
  elements.idPickerDropdown.style.top  = rect.bottom + "px";
  elements.idPickerDropdown.style.left = rect.left   + "px";
  elements.idPickerDropdown.style.width = "210px";
}

function renderIdDropdown(query) {
  const q = query.toLowerCase();
  const all = getIframeIds();
  const filtered = q ? all.filter(e => e.id.toLowerCase().includes(q)) : all;
  const currentId = state.selectedTextElement ? (state.selectedTextElement.id || "") : "";

  elements.idPickerDropdown.innerHTML = "";

  if (all.length === 0) {
    const msg = document.createElement("div");
    msg.className = "ip-empty";
    msg.textContent = "No IDs in document yet";
    elements.idPickerDropdown.appendChild(msg);
    return;
  }

  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.className = "ip-no-results";
    msg.textContent = `No IDs match "${query}"`;
    elements.idPickerDropdown.appendChild(msg);
    return;
  }

  if (!q) {
    elements.idPickerDropdown.appendChild(makePickerHeader("All IDs"));
  }

  filtered.forEach(entry => {
    const item = document.createElement("div");
    item.className = "ip-item";
    if (entry.id === currentId) item.classList.add("active");
    item.dataset.id  = entry.id;
    item.dataset.tag = entry.tag;

    const hash = document.createElement("span");
    hash.className = "ip-item-hash";
    hash.textContent = "#";

    const name = document.createTextNode(entry.id);

    const tag = document.createElement("span");
    tag.className = "ip-item-tag";
    tag.textContent = `<${entry.tag}>`;

    item.append(hash, name, tag);

    // mousedown fires before blur so the picker stays open long enough
    item.addEventListener("mousedown", e => {
      e.preventDefault();
      elements.idPickerInput.value = entry.id;
      highlightById(entry.id);
      closeIdPicker();
    });

    item.addEventListener("mousemove", () => {
      clearPickerFocus();
      item.classList.add("focused");
      pickerFocusIdx = getPickerItems().indexOf(item);
    });

    elements.idPickerDropdown.appendChild(item);
  });
}

function makePickerHeader(text) {
  const el = document.createElement("div");
  el.className = "ip-section-header";
  el.textContent = text;
  return el;
}

function highlightById(id) {
  if (!state.iframeDoc) return;
  const el = state.iframeDoc.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const prev = el.style.outline;
  el.style.outline = "2px solid #0078d4";
  setTimeout(() => { el.style.outline = prev; }, 1500);
}

// ── Picker input events ───────────────────────────────────────────────────────

function onPickerFocus() { openIdPicker(); }

function onPickerInput() {
  if (!isPickerOpen) openIdPicker();
  renderIdDropdown(elements.idPickerInput.value.trim());
  positionIdDropdown();
  pickerFocusIdx = -1;
}

function onPickerBlur() {
  setTimeout(() => {
    if (!isPickerOpen) return;
    closeIdPicker();
  }, 150);
}

function onPickerKeydown(e) {
  if (!isPickerOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
    openIdPicker();
    return;
  }

  const items = getPickerItems();

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      pickerFocusIdx = Math.min(pickerFocusIdx + 1, items.length - 1);
      applyPickerFocus(items);
      scrollPickerItem(items[pickerFocusIdx]);
      break;

    case "ArrowUp":
      e.preventDefault();
      pickerFocusIdx = Math.max(pickerFocusIdx - 1, 0);
      applyPickerFocus(items);
      scrollPickerItem(items[pickerFocusIdx]);
      break;

    case "Enter":
      e.preventDefault();
      if (pickerFocusIdx >= 0 && items[pickerFocusIdx]) {
        elements.idPickerInput.value = items[pickerFocusIdx].dataset.id;
        highlightById(items[pickerFocusIdx].dataset.id);
      } else {
        pickerSetId();
      }
      closeIdPicker();
      break;

    case "Escape":
    case "Tab":
      closeIdPicker();
      break;
  }
}

// ── Keyboard focus helpers ────────────────────────────────────────────────────

function getPickerItems() {
  return Array.from(elements.idPickerDropdown.querySelectorAll(".ip-item"));
}

function clearPickerFocus() {
  getPickerItems().forEach(el => el.classList.remove("focused"));
}

function applyPickerFocus(items) {
  clearPickerFocus();
  if (items[pickerFocusIdx]) {
    items[pickerFocusIdx].classList.add("focused");
    elements.idPickerInput.value = items[pickerFocusIdx].dataset.id;
  }
}

function scrollPickerItem(el) {
  if (!el) return;
  const ct = elements.idPickerDropdown.scrollTop;
  const cb = ct + elements.idPickerDropdown.clientHeight;
  const et = el.offsetTop;
  const eb = et + el.offsetHeight;
  if (et < ct) elements.idPickerDropdown.scrollTop = et - 4;
  else if (eb > cb) elements.idPickerDropdown.scrollTop = eb - elements.idPickerDropdown.clientHeight + 4;
}

// ── Set / Remove from picker ribbon buttons ───────────────────────────────────

function pickerSetId() {
  const target = state.selectedTextElement || contextTarget;
  if (!target) return;

  const val = elements.idPickerInput.value.trim();

  if (!val) {
    target.removeAttribute("id");
    saveIframeToTextarea();
    refreshIdPanel();
    return;
  }

  if (!isValidHtmlId(val)) {
    alert(
      "Invalid ID — must start with a letter or underscore and contain only letters, numbers, hyphens, or underscores."
    );
    return;
  }

  const existing = state.iframeDoc && state.iframeDoc.getElementById(val);
  if (existing && existing !== target) {
    alert(`The ID "#${val}" is already used by another element.`);
    return;
  }

  target.id = val;
  saveIframeToTextarea();
  refreshIdPanel();
}

function pickerRemoveId() {
  const target = state.selectedTextElement || contextTarget;
  if (!target) return;
  target.removeAttribute("id");
  elements.idPickerInput.value = "";
  saveIframeToTextarea();
  refreshIdPanel();
}

// ── Public helpers ────────────────────────────────────────────────────────────

/** Re-render the dropdown if it's currently open (called after DOM changes). */
export function refreshIdPanel() {
  if (isPickerOpen) {
    renderIdDropdown(elements.idPickerInput.value.trim());
  }
}

/** Sync the picker input to the currently selected element's ID. */
export function updateIdPanelDisplay() {
  if (!elements.idPickerInput) return;
  elements.idPickerInput.value =
    state.selectedTextElement ? (state.selectedTextElement.id || "") : "";
}

// ── Add CSS Class panel ───────────────────────────────────────────────────────

function toggleClassPanel() {
  const isOpen = elements.ctxClassPanel.classList.toggle("open");
  if (isOpen) {
    renderClassList(elements.ctxClassSearch.value);
    elements.ctxClassSearch.focus();
    // Reposition menu if it would go off-screen after expanding
    const menu = elements.elementContextMenu;
    const rect = menu.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 10) {
      menu.style.top = Math.max(4, window.innerHeight - rect.height - 10) + "px";
    }
  }
}

function renderClassList(filter) {
  const q = filter.toLowerCase();
  const all = getAllClasses();
  const matches = all.filter(n => n.toLowerCase().includes(q));

  elements.ctxClassList.innerHTML = "";

  if (all.length === 0) {
    const msg = document.createElement("div");
    msg.className = "ctx-no-classes";
    msg.textContent = "No CSS classes yet. Build one first.";
    elements.ctxClassList.appendChild(msg);
    return;
  }

  if (matches.length === 0) {
    const msg = document.createElement("div");
    msg.className = "ctx-no-classes";
    msg.textContent = "No matches.";
    elements.ctxClassList.appendChild(msg);
    return;
  }

  matches.forEach(name => {
    const item = document.createElement("div");
    item.className = "ctx-class-entry";

    const dot = document.createElement("span");
    dot.className = "ctx-class-entry-dot";
    item.appendChild(dot);
    item.appendChild(document.createTextNode(name));

    item.addEventListener("mousedown", e => {
      e.preventDefault(); // keep menu open until we're done
      if (!contextTarget) return;
      contextTarget.classList.add(name);
      saveIframeToTextarea();
      hideContextMenu();
    });

    elements.ctxClassList.appendChild(item);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initContextMenu() {
  // Context menu buttons
  elements.ctxSetId.addEventListener("click", openSetIdModal);
  elements.ctxAddComment.addEventListener("click", openAddCommentModal);
  elements.ctxAddCssClass.addEventListener("click", toggleClassPanel);
  elements.ctxCopyBtn.addEventListener("click", () => {
    copySelected(contextTarget);
    hideContextMenu();
  });
  elements.ctxDuplicateBtn.addEventListener("click", () => {
    duplicateSelected(contextTarget);
    hideContextMenu();
  });
  elements.ctxPasteBtn.addEventListener("click", () => {
    pasteElement();
    hideContextMenu();
  });
  elements.ctxDeleteBtn.addEventListener("click", () => {
    deleteSelected(contextTarget);
    hideContextMenu();
  });
  elements.ctxClassSearch.addEventListener("input", () => renderClassList(elements.ctxClassSearch.value));

  // Close context menu when clicking in the parent window outside it
  document.addEventListener("mousedown", e => {
    if (!elements.elementContextMenu.contains(e.target)) hideContextMenu();
  });

  // ── Set ID modal ──
  elements.setIdConfirm.addEventListener("click", confirmSetId);
  elements.setIdCancel.addEventListener("click", closeSetIdModal);
  elements.setIdModal.addEventListener("click", e => {
    if (e.target === elements.setIdModal) closeSetIdModal();
  });
  elements.setIdInput.addEventListener("keydown", e => {
    if (e.key === "Enter")  confirmSetId();
    if (e.key === "Escape") closeSetIdModal();
  });
  elements.setIdInput.addEventListener("input", () => {
    elements.setIdError.textContent = "";
  });

  // ── Add Comment modal ──
  elements.addCommentConfirm.addEventListener("click", confirmAddComment);
  elements.addCommentCancel.addEventListener("click", closeAddCommentModal);
  elements.addCommentModal.addEventListener("click", e => {
    if (e.target === elements.addCommentModal) closeAddCommentModal();
  });
  elements.addCommentInput.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAddCommentModal();
  });

  // ── ID Picker ──
  elements.idPickerInput.addEventListener("focus",   onPickerFocus);
  elements.idPickerInput.addEventListener("input",   onPickerInput);
  elements.idPickerInput.addEventListener("keydown", onPickerKeydown);
  elements.idPickerInput.addEventListener("blur",    onPickerBlur);

  elements.idPickerArrow.addEventListener("mousedown", e => {
    e.preventDefault();
    isPickerOpen ? closeIdPicker() : openIdPicker();
  });

  // Close picker when clicking outside
  document.addEventListener("mousedown", e => {
    if (!elements.idPicker.contains(e.target)) closeIdPicker();
  });

  elements.idPickerSetBtn.addEventListener("click", pickerSetId);
  elements.idPickerRemoveBtn.addEventListener("click", pickerRemoveId);
  elements.idPickerInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !isPickerOpen) pickerSetId();
  });

  // Keep picker input in sync whenever selection changes
  onSelectionChange.push(updateIdPanelDisplay);
}
