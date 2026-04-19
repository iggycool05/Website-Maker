import { elements } from "../DOM/elements.js";
import { setClass, getClass, hasClass, setClassState, getClassState, deleteClassState } from "./cssStore.js";

// All CSS properties the builder supports, mapped to their input element IDs
const CSS_PROPS = [
  // Text
  { prop: "color",             id: "cbColor" },
  { prop: "font-family",       id: "cbFontFamily" },
  { prop: "font-size",         id: "cbFontSize" },
  { prop: "font-weight",       id: "cbFontWeight" },
  { prop: "text-align",        id: "cbTextAlign" },
  { prop: "text-decoration",   id: "cbTextDecoration" },
  { prop: "line-height",       id: "cbLineHeight" },
  { prop: "letter-spacing",    id: "cbLetterSpacing" },
  // Spacing
  { prop: "margin",            id: "cbMargin" },
  { prop: "padding",           id: "cbPadding" },
  // Box
  { prop: "width",             id: "cbWidth" },
  { prop: "height",            id: "cbHeight" },
  { prop: "border",            id: "cbBorder" },
  { prop: "border-radius",     id: "cbBorderRadius" },
  { prop: "overflow",          id: "cbOverflow" },
  { prop: "display",           id: "cbDisplay" },
  { prop: "float",             id: "cbFloat" },
  // Background
  { prop: "background-color",  id: "cbBgColor" },
  { prop: "background-image",  id: "cbBgImage" },
  // Effects
  { prop: "opacity",           id: "cbOpacity" },
  { prop: "box-shadow",        id: "cbBoxShadow" },
  { prop: "transform",         id: "cbTransform" },
  { prop: "transition",        id: "cbTransition" },
  { prop: "cursor",            id: "cbCursor" },
  // Position
  { prop: "position",          id: "cbPosition" },
  { prop: "z-index",           id: "cbZIndex" },
  { prop: "top",               id: "cbTop" },
  { prop: "left",              id: "cbLeft" },
  // Flexbox
  { prop: "flex-direction",    id: "cbFlexDirection" },
  { prop: "justify-content",   id: "cbJustifyContent" },
  { prop: "align-items",       id: "cbAlignItems" },
  { prop: "flex-wrap",         id: "cbFlexWrap" },
  { prop: "gap",               id: "cbGap" },
];

const PSEUDO_STATES = ["", ":hover", ":focus", ":active"];

let editingName    = null;
let onSaveCallback = null;
let activeState    = "";
// Per-state property values while the modal is open
let stateValues    = {};

// ── Public API ────────────────────────────────────────────────────────────────

export function openClassBuilder(name = null, callback = null) {
  editingName    = name;
  onSaveCallback = callback;
  activeState    = "";

  const isEdit = name !== null;

  // Load all states from the CSS store
  stateValues = {};
  PSEUDO_STATES.forEach(state => {
    if (state === "") {
      stateValues[state] = isEdit ? (getClass(name) ?? {}) : {};
    } else {
      stateValues[state] = isEdit ? (getClassState(name, state) ?? {}) : {};
    }
  });

  elements.cbClassNameInput.value      = isEdit ? name : "";
  elements.cbClassNameInput.disabled   = isEdit;
  elements.classBuilderConfirm.textContent = isEdit ? "Save Changes" : "Create";
  elements.classBuilderError.textContent   = "";

  _activateStateTab("");
  _populateInputs("");

  elements.classBuilderModal.classList.add("open");
  if (!isEdit) elements.cbClassNameInput.focus();
  else         document.getElementById(CSS_PROPS[0].id)?.focus();
}

export function closeClassBuilder() {
  elements.classBuilderModal.classList.remove("open");
  editingName    = null;
  onSaveCallback = null;
  stateValues    = {};
  activeState    = "";
}

export function initClassBuilder() {
  elements.classBuilderConfirm.addEventListener("click", handleSave);
  elements.classBuilderCancel.addEventListener("click",  closeClassBuilder);

  // State tab switching
  document.querySelectorAll(".cb-state-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const newState = btn.dataset.state;
      if (newState === activeState) return;
      _saveCurrentInputsToState(activeState);
      _activateStateTab(newState);
      _populateInputs(newState);
      activeState = newState;
    });
  });

  // Click outside to close
  elements.classBuilderModal.addEventListener("click", e => {
    if (e.target === elements.classBuilderModal) closeClassBuilder();
  });
  elements.classBuilderModal.addEventListener("keydown", e => {
    if (e.key === "Escape") closeClassBuilder();
  });
  elements.cbClassNameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleSave();
  });
}

// ── Internal ──────────────────────────────────────────────────────────────────

function handleSave() {
  const name = editingName ?? elements.cbClassNameInput.value.trim();

  if (!name) {
    elements.classBuilderError.textContent = "Class name is required.";
    return;
  }
  if (!/^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(name)) {
    elements.classBuilderError.textContent =
      "Invalid name. Use letters, numbers, hyphens, or underscores.";
    return;
  }
  if (!editingName && hasClass(name)) {
    elements.classBuilderError.textContent = `"${name}" already exists. Edit it from the ribbon.`;
    return;
  }

  // Flush current tab's inputs before writing
  _saveCurrentInputsToState(activeState);

  // Write the default block
  setClass(name, _filterEmpty(stateValues[""]));

  // Write or delete each pseudo-class block
  [":hover", ":focus", ":active"].forEach(state => {
    const props = _filterEmpty(stateValues[state]);
    if (Object.keys(props).length > 0) {
      setClassState(name, state, props);
    } else {
      deleteClassState(name, state);
    }
  });

  closeClassBuilder();
  if (onSaveCallback) onSaveCallback(name);
}

function _saveCurrentInputsToState(state) {
  const vals = {};
  CSS_PROPS.forEach(({ prop, id }) => {
    const val = document.getElementById(id)?.value.trim() ?? "";
    if (val) vals[prop] = val;
  });
  stateValues[state] = vals;
}

function _populateInputs(state) {
  const vals = stateValues[state] ?? {};
  CSS_PROPS.forEach(({ prop, id }) => {
    const el = document.getElementById(id);
    if (el) el.value = vals[prop] ?? "";
  });
}

function _activateStateTab(state) {
  document.querySelectorAll(".cb-state-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.state === state);
  });
}

function _filterEmpty(vals) {
  const out = {};
  Object.entries(vals ?? {}).forEach(([p, v]) => {
    if (v && v.trim()) out[p] = v.trim();
  });
  return out;
}
