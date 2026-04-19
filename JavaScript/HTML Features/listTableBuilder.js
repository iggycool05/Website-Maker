import { elements } from "../DOM/elements.js";
import { addList, addTable } from "./htmleditorToolbar.js";

// ── List Builder ──────────────────────────────────────────────────────────────

export function openListBuilder() {
  // Reset form to defaults
  document.querySelector('[name="lbType"][value="ul"]').checked = true;
  elements.lbItemsInput.value = "Item 1\nItem 2\nItem 3";
  elements.lbClassInput.value = "";
  elements.listBuilderModal.classList.add("open");
  elements.lbItemsInput.focus();
}

// ── Table Builder ─────────────────────────────────────────────────────────────

export function openTableBuilder() {
  // Reset form to defaults
  elements.tbRowsInput.value = "3";
  elements.tbColsInput.value = "3";
  elements.tbHeaderCheck.checked = true;
  elements.tbClassInput.value = "";
  elements.tableBuilderModal.classList.add("open");
  elements.tbRowsInput.focus();
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initListTableBuilder() {
  // List: open via ribbon button
  elements.addListBtn.addEventListener("click", openListBuilder);

  // List: Cancel
  elements.listBuilderCancel.addEventListener("click", () => {
    elements.listBuilderModal.classList.remove("open");
  });

  // List: Confirm — build and insert
  elements.listBuilderConfirm.addEventListener("click", () => {
    const type = document.querySelector('[name="lbType"]:checked')?.value ?? "ul";
    const raw = elements.lbItemsInput.value;
    const items = raw.split("\n").map(s => s.trim()).filter(s => s.length > 0);
    if (items.length === 0) {
      elements.lbItemsInput.focus();
      return;
    }
    const className = elements.lbClassInput.value.trim();
    elements.listBuilderModal.classList.remove("open");
    addList(type, items, className);
  });

  // Table: open via ribbon button
  elements.addTableBtn.addEventListener("click", openTableBuilder);

  // Table: Cancel
  elements.tableBuilderCancel.addEventListener("click", () => {
    elements.tableBuilderModal.classList.remove("open");
  });

  // Table: Confirm — build and insert
  elements.tableBuilderConfirm.addEventListener("click", () => {
    const rows = Math.max(1, parseInt(elements.tbRowsInput.value, 10) || 3);
    const cols = Math.max(1, parseInt(elements.tbColsInput.value, 10) || 3);
    const hasHeader = elements.tbHeaderCheck.checked;
    const className = elements.tbClassInput.value.trim();
    elements.tableBuilderModal.classList.remove("open");
    addTable(rows, cols, hasHeader, className);
  });

  // Close modals on overlay click
  elements.listBuilderModal.addEventListener("click", (e) => {
    if (e.target === elements.listBuilderModal) {
      elements.listBuilderModal.classList.remove("open");
    }
  });
  elements.tableBuilderModal.addEventListener("click", (e) => {
    if (e.target === elements.tableBuilderModal) {
      elements.tableBuilderModal.classList.remove("open");
    }
  });
}
