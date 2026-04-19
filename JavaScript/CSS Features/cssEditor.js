import { elements } from "../DOM/elements.js";
import { state } from "../State/editorState.js";
import { getAllClasses, deleteClass, getClass } from "./cssStore.js";
import { openClassBuilder } from "./classBuilder.js";
import { saveIframeToTextarea } from "../HTML Features/fontSize.js";
import { renderPreview } from "../Preview/renderPreview.js";

let isPickerOpen = false;
let pickerFocusIdx = -1;

export function initCssEditor() {
  // "Build CSS Class" button → open modal in create mode
  elements.buildCssClassBtn.addEventListener("click", () => {
    openClassBuilder(null, (name) => {
      renderPreview();
      refreshClassPicker();
      elements.cssClassInput.value = name;
    });
  });

  // Class picker input
  elements.cssClassInput.addEventListener("input", () => {
    if (!isPickerOpen) openPickerDropdown();
    else renderDropdownItems(elements.cssClassInput.value);
  });
  elements.cssClassInput.addEventListener("focus", openPickerDropdown);
  elements.cssClassInput.addEventListener("blur", () => {
    setTimeout(closePickerDropdown, 150);
  });
  elements.cssClassInput.addEventListener("keydown", handlePickerKeydown);

  // Arrow toggles dropdown
  elements.cssClassArrow.addEventListener("click", () => {
    isPickerOpen ? closePickerDropdown() : openPickerDropdown();
  });

  // Action buttons
  elements.cssClassApplyBtn.addEventListener("click", applyClassToElement);
  elements.cssClassEditBtn.addEventListener("click", editSelectedClass);
  elements.cssClassDeleteBtn.addEventListener("click", deleteSelectedClass);
}

// Show/hide the CSS editor ribbon, closing any other open ribbon first.
export function toggleCssEditorRibbon() {
  if (!elements.htmlEditorRibbon.classList.contains("hidden")) {
    elements.htmlEditorRibbon.classList.add("hidden");
    elements.htmlEditorTabBtn.classList.remove("active");
  }
  if (!elements.jsEditorRibbon.classList.contains("hidden")) {
    elements.jsEditorRibbon.classList.add("hidden");
    elements.jsEditorTabBtn.classList.remove("active");
  }
  elements.cssEditorRibbon.classList.toggle("hidden");
  elements.cssEditorTabBtn.classList.toggle("active");
}

// Called after a class is created, edited, or deleted to keep the list fresh.
export function refreshClassPicker() {
  renderDropdownItems(elements.cssClassInput.value);
}

// ── Dropdown helpers ──────────────────────────────────────────────────────────

function openPickerDropdown() {
  isPickerOpen = true;
  pickerFocusIdx = -1;
  renderDropdownItems(elements.cssClassInput.value);

  const rect = elements.cssClassInput.parentElement.getBoundingClientRect();
  const dropdown = elements.cssClassDropdown;
  dropdown.style.top = `${rect.bottom}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.minWidth = `${rect.width}px`;
  dropdown.classList.add("open");
}

function closePickerDropdown() {
  isPickerOpen = false;
  elements.cssClassDropdown.classList.remove("open");
}

function renderDropdownItems(filter = "") {
  const dropdown = elements.cssClassDropdown;
  const query = filter.toLowerCase();
  const classes = getAllClasses().filter(n => n.toLowerCase().includes(query));

  dropdown.innerHTML = "";

  if (classes.length === 0) {
    const msg = document.createElement("div");
    msg.className = "cp-no-results";
    msg.textContent = !filter
      ? "No classes yet. Use Build Class."
      : "No matching classes.";
    dropdown.appendChild(msg);
    return;
  }

  classes.forEach((name, i) => {
    const item = document.createElement("div");
    item.className = "cp-item" + (i === pickerFocusIdx ? " focused" : "");
    item.dataset.name = name;

    const dot = document.createElement("span");
    dot.className = "cp-item-dot";
    item.appendChild(dot);
    item.appendChild(document.createTextNode(name));

    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      elements.cssClassInput.value = name;
      closePickerDropdown();
    });

    dropdown.appendChild(item);
  });
}

function handlePickerKeydown(e) {
  if (!isPickerOpen) {
    if (e.key === "ArrowDown" || e.key === "Enter") openPickerDropdown();
    return;
  }

  const items = elements.cssClassDropdown.querySelectorAll(".cp-item");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    pickerFocusIdx = Math.min(pickerFocusIdx + 1, items.length - 1);
    renderDropdownItems(elements.cssClassInput.value);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    pickerFocusIdx = Math.max(pickerFocusIdx - 1, -1);
    renderDropdownItems(elements.cssClassInput.value);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (pickerFocusIdx >= 0 && items[pickerFocusIdx]) {
      elements.cssClassInput.value = items[pickerFocusIdx].dataset.name;
    }
    closePickerDropdown();
  } else if (e.key === "Escape") {
    closePickerDropdown();
  }
}

// ── Class actions ─────────────────────────────────────────────────────────────

function applyClassToElement() {
  const name = elements.cssClassInput.value.trim();
  if (!name) return;

  const el = state.selectedTextElement;
  if (!el) {
    alert("No element selected. Click an element in the preview first.");
    return;
  }

  el.classList.add(name);
  saveIframeToTextarea();
}

function editSelectedClass() {
  const name = elements.cssClassInput.value.trim();
  if (!name || !getClass(name)) return;

  openClassBuilder(name, () => {
    renderPreview();
    refreshClassPicker();
  });
}

function deleteSelectedClass() {
  const name = elements.cssClassInput.value.trim();
  if (!name) return;
  if (!confirm(`Delete class "${name}"?`)) return;

  deleteClass(name);
  elements.cssClassInput.value = "";
  renderPreview();
  refreshClassPicker();
}
