import { elements } from "./DOM/elements.js";
import { renderPreview } from "./Preview/renderPreview.js";
import { setupIframe } from "./Preview/setupIframe.js";
import { changeSelectedFontSize } from "./HTML Features/fontSize.js";
import { changeSelectedFontFamily } from "./HTML Features/fontFamily.js";
import * as htmlToolbar from "./HTML Features/htmleditorToolbar.js";
import { addUploadedImage } from "./Utils/imageStore.js";
import { initTooltips } from "./HTML Features/toolTip.js";
import { initFontPicker } from "./HTML Features/fontPicker.js";
import { initContextMenu, refreshIdPanel } from "./HTML Features/contextMenu.js";
import {
  initSourceEditor,
  showSourceView,
  showPreviewView,
  isSourceViewActive
} from "./HTML Features/sourceEditor.js";
import { initCssEditor, toggleCssEditorRibbon } from "./CSS Features/cssEditor.js";
import { initClassBuilder } from "./CSS Features/classBuilder.js";
import { initFileExplorer } from "./HTML Features/fileExplorer.js";
import { initExport } from "./Features/export.js";
import { initUndoRedo, undo, redo, setHistoryChangeCallback } from "./Utils/undoRedo.js";
import { initDomInspector, refreshInspector } from "./HTML Features/domInspector.js";
import { initListTableBuilder } from "./HTML Features/listTableBuilder.js";
import { initJsEditor, toggleJsEditorRibbon } from "./JS Features/jsEditor.js";
import { initJsConsole, markRenderDivider } from "./JS Features/jsConsole.js";
import { initPropertiesPanel } from "./HTML Features/propertiesPanel.js";
import { initFormatToolbar } from "./HTML Features/formatToolbar.js";
import { initAlignTools } from "./HTML Features/alignTools.js";
import { initLayerControl } from "./HTML Features/layerControl.js";
import { copySelected, pasteElement, duplicateSelected, hasCopy, deleteSelected } from "./HTML Features/copyPaste.js";
import { toggleGrid } from "./HTML Features/snapGuides.js";
import { initResponsivePreview } from "./HTML Features/responsivePreview.js";
import { initProjectStorage, scheduleAutosave } from "./Features/projectStorage.js";
import { initCodeEditors } from "./HTML Features/codeEditor.js";
import { initComponentLibrary } from "./HTML Features/componentLibrary.js";
import { initAnimationBuilder } from "./CSS Features/animationBuilder.js";
import { initJsLibrary } from "./JS Features/jsLibrary.js";
import { initTemplateGallery } from "./HTML Features/templateGallery.js";
import { initWidgetLibrary, toggleWidgetRibbon, hideWidgetRibbon } from "./HTML Features/widgetLibrary.js";

// ── Re-init the iframe each time it reloads ───────────────────────────────────
elements.previewFrame.addEventListener("load", function () {
  setupIframe();
  refreshIdPanel();
  refreshInspector();
  markRenderDivider();
});

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
// Capture phase: intercepts Ctrl+Z/Y before textarea native undo/redo fires
document.addEventListener("keydown", e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
    e.preventDefault();
    redo();
  }
}, true);

// Bubble phase: copy / paste / duplicate shortcuts
// Guard: skip when focus is inside a main-doc input/textarea/contenteditable
//        or inside an iframe contenteditable (state.iframeDoc?.activeElement)
document.addEventListener("keydown", e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const active = document.activeElement;
  if (active) {
    const tag = active.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || active.contentEditable === "true") return;
  }
  // Also skip when a contenteditable inside the iframe is focused
  if (elements.previewFrame.contentDocument?.activeElement?.contentEditable === "true") return;

  if (e.key === "c" && !e.shiftKey && !e.altKey) {
    if (elements.previewFrame.contentDocument?.querySelector(".selected-text")) {
      e.preventDefault();
      copySelected();
    }
  } else if (e.key === "v") {
    if (hasCopy()) { e.preventDefault(); pasteElement(); }
  } else if (e.key === "d") {
    if (elements.previewFrame.contentDocument?.querySelector(".selected-text")) {
      e.preventDefault();
      duplicateSelected();
    }
  } else if (e.key === "Delete" || e.key === "Backspace") {
    if (elements.previewFrame.contentDocument?.querySelector(".selected-text")) {
      e.preventDefault();
      deleteSelected();
    }
  }
});

// ── Font size ─────────────────────────────────────────────────────────────────
elements.decreaseFontBtn.addEventListener("click", () => changeSelectedFontSize(-1));
elements.increaseFontBtn.addEventListener("click", () => changeSelectedFontSize(1));

// ── Font family (hidden select fires change from fontPicker.js) ───────────────
elements.fontFamilySelect.addEventListener("change", function () {
  changeSelectedFontFamily(elements.fontFamilySelect.value);
});

// ── HTML ribbon scroll navigation (defined early; used by tab click handler) ─
const RIBBON_SCROLL_AMOUNT = 220;

function updateRibbonNavBtns() {
  const ribbon = elements.htmlEditorRibbon;
  if (ribbon.classList.contains("hidden")) {
    elements.htmlRibbonPrev.classList.add("hidden");
    elements.htmlRibbonNext.classList.add("hidden");
    return;
  }
  const atStart = ribbon.scrollLeft <= 0;
  const atEnd   = ribbon.scrollLeft >= ribbon.scrollWidth - ribbon.clientWidth - 1;
  elements.htmlRibbonPrev.classList.toggle("hidden", atStart);
  elements.htmlRibbonNext.classList.toggle("hidden", atEnd);
}

elements.htmlRibbonPrev.addEventListener("click", () => {
  elements.htmlEditorRibbon.scrollLeft -= RIBBON_SCROLL_AMOUNT;
  updateRibbonNavBtns();
});

elements.htmlRibbonNext.addEventListener("click", () => {
  elements.htmlEditorRibbon.scrollLeft += RIBBON_SCROLL_AMOUNT;
  updateRibbonNavBtns();
});

elements.htmlEditorRibbon.addEventListener("scroll", updateRibbonNavBtns);

// ── Tab bar ───────────────────────────────────────────────────────────────────

// Source Code → show the code editor
elements.sourceCodeTabBtn.addEventListener("click", showSourceView);

// HTML Editor → switch to preview (if needed) then toggle the ribbon
// Close CSS, JS, and Widgets ribbons if open
elements.htmlEditorTabBtn.addEventListener("click", function () {
  if (isSourceViewActive()) showPreviewView();
  if (!elements.cssEditorRibbon.classList.contains("hidden")) {
    elements.cssEditorRibbon.classList.add("hidden");
    elements.cssEditorTabBtn.classList.remove("active");
  }
  if (!elements.jsEditorRibbon.classList.contains("hidden")) {
    elements.jsEditorRibbon.classList.add("hidden");
    elements.jsEditorTabBtn.classList.remove("active");
  }
  hideWidgetRibbon();
  htmlToolbar.toggleHtmlEditorRibbon();
  updateRibbonNavBtns();
});

// CSS Editor → switch to preview (if needed) then toggle the ribbon
elements.cssEditorTabBtn.addEventListener("click", function () {
  if (isSourceViewActive()) showPreviewView();
  hideWidgetRibbon();
  toggleCssEditorRibbon();
});

// JS Editor → switch to preview (if needed) then toggle the JS ribbon
elements.jsEditorTabBtn.addEventListener("click", function () {
  if (isSourceViewActive()) showPreviewView();
  hideWidgetRibbon();
  toggleJsEditorRibbon();
});

// Widgets → show preview (if needed) then toggle the Widgets ribbon
elements.widgetsTabBtn.addEventListener("click", function () {
  if (isSourceViewActive()) showPreviewView();
  if (!elements.htmlEditorRibbon.classList.contains("hidden")) {
    elements.htmlEditorRibbon.classList.add("hidden");
    elements.htmlEditorTabBtn.classList.remove("active");
  }
  if (!elements.cssEditorRibbon.classList.contains("hidden")) {
    elements.cssEditorRibbon.classList.add("hidden");
    elements.cssEditorTabBtn.classList.remove("active");
  }
  if (!elements.jsEditorRibbon.classList.contains("hidden")) {
    elements.jsEditorRibbon.classList.add("hidden");
    elements.jsEditorTabBtn.classList.remove("active");
  }
  toggleWidgetRibbon();
});

// Render button → force re-render and switch to preview
elements.renderPreviewBtn.addEventListener("click", () => showPreviewView(true));

// ── HTML editor ribbon buttons ────────────────────────────────────────────────

elements.addParagraphBtn.addEventListener("click", () => htmlToolbar.addParagraph());
elements.addHeadingBtn.addEventListener("click",   () => htmlToolbar.addHeading());
elements.addDivBtn.addEventListener("click",       () => htmlToolbar.addDiv());
elements.addSpanBtn.addEventListener("click",      () => htmlToolbar.addSpan());
elements.addImageBtn.addEventListener("click", () => elements.addImageInput.click());
elements.addLinkBtn.addEventListener("click",    () => htmlToolbar.addLink());
elements.addButtonBtn.addEventListener("click",  () => htmlToolbar.addButton());
elements.addInputBtn.addEventListener("click",   () => htmlToolbar.addInput());
elements.addVideoBtn.addEventListener("click",   () => htmlToolbar.addVideo());
elements.addSectionBtn.addEventListener("click", () => htmlToolbar.addSection());
elements.addNavBtn.addEventListener("click",     () => htmlToolbar.addNav());
elements.addFooterBtn.addEventListener("click",  () => htmlToolbar.addFooter());
elements.addFormBtn.addEventListener("click",    () => htmlToolbar.addForm());

elements.headingDropdownBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  const menu = elements.headingDropdownMenu;
  const isOpen = menu.classList.toggle("open");
  if (isOpen) {
    const rect = elements.headingDropdownBtn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top  = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.right = "auto";
  } else {
    menu.style.position = menu.style.top = menu.style.left = "";
  }
});

elements.headingDropdownMenu.addEventListener("click", function (event) {
  const level = event.target.dataset.headingLevel;
  if (level) {
    htmlToolbar.addHeading(level);
    elements.headingDropdownMenu.classList.remove("open");
    elements.headingDropdownMenu.style.position =
      elements.headingDropdownMenu.style.top =
      elements.headingDropdownMenu.style.left = "";
  }
});

document.addEventListener("click", function (event) {
  const menu = elements.headingDropdownMenu;
  if (
    menu.classList.contains("open") &&
    !menu.contains(event.target) &&
    event.target !== elements.headingDropdownBtn
  ) {
    menu.classList.remove("open");
    menu.style.position = menu.style.top = menu.style.left = "";
  }
});

elements.addImageInput.addEventListener("change", function (event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    if (typeof reader.result === "string") {
      const uploadId = `uploaded-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      addUploadedImage(uploadId, reader.result);
      htmlToolbar.addImage(uploadId);
    }
  };
  reader.readAsDataURL(file);
  elements.addImageInput.value = "";
});

// ── Grid toggle button ────────────────────────────────────────────────────────
elements.gridToggleBtn.addEventListener("click", function () {
  const on = toggleGrid();
  elements.gridToggleBtn.classList.toggle("active", on);
});

// ── Undo / Redo buttons ───────────────────────────────────────────────────────
elements.undoBtn.addEventListener("click", undo);
elements.redoBtn.addEventListener("click", redo);

setHistoryChangeCallback((canUndo, canRedo) => {
  elements.undoBtn.classList.toggle("disabled", !canUndo);
  elements.redoBtn.classList.toggle("disabled", !canRedo);
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────

renderPreview();          // initial render
initSourceEditor();       // set up real-time sync + snapshot baseline
initCodeEditors();        // replace textareas with CodeMirror editors
initTooltips();
initFontPicker();
initContextMenu();
initClassBuilder();
initCssEditor();
initFileExplorer();
initListTableBuilder();
initExport();
initJsEditor();
initJsConsole();
initDomInspector();
initPropertiesPanel();
initFormatToolbar();
initAlignTools();
initLayerControl();
initResponsivePreview();
initUndoRedo();           // last: seeds initial undo snapshot after everything is set up
initProjectStorage();     // restore last session + wire Save/Load buttons
initComponentLibrary();
initAnimationBuilder();
initJsLibrary();
initTemplateGallery();
initWidgetLibrary();

// Autosave when CSS or JS content changes in the editor
elements.cssInput.addEventListener("input", scheduleAutosave);
elements.jsInput.addEventListener("input", scheduleAutosave);
