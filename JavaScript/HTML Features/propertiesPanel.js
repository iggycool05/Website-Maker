import { elements } from "../DOM/elements.js";
import { state, onSelectionChange } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";
import { getAllClasses } from "../CSS Features/cssStore.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function rgbToHex(rgb) {
  if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return "#000000";
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#000000";
  return "#" + [match[1], match[2], match[3]].map(n => parseInt(n).toString(16).padStart(2, "0")).join("");
}

function extractUnit(val) {
  if (!val || val === "auto" || val === "none") return "px";
  const m = String(val).match(/(px|%|em|rem|vw|vh|fr|ch|pt|cm|mm)$/);
  return m ? m[1] : "px";
}

function extractNum(val) {
  if (!val || val === "auto" || val === "none") return "";
  const n = parseFloat(val);
  return isNaN(n) ? "" : n;
}

function parseShadows(str) {
  if (!str || str === "none") return [];
  const parts = [];
  let depth = 0, current = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) { parts.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function getFilter(filterStr, name) {
  const m = filterStr.match(new RegExp(`${name}\\(([^)]+)\\)`));
  return m ? m[1] : "";
}

function getTransformVal(transformStr, name) {
  const m = transformStr.match(new RegExp(`${name}\\(([^)]+)\\)`));
  return m ? m[1] : "";
}

// ── Section collapse state ────────────────────────────────────────────────────

const _collapsed = {};

function _section(id, title, body) {
  const isCollapsed = _collapsed[id] ?? false;
  return `
    <div class="pp-section${isCollapsed ? " pp-collapsed" : ""}" data-sid="${id}">
      <div class="pp-section-title pp-toggleable">
        <span class="pp-chevron">${isCollapsed ? "▶" : "▼"}</span>${title}
      </div>
      <div class="pp-section-body">${body}</div>
    </div>`;
}

// ── Unit field ────────────────────────────────────────────────────────────────

function _unitField(prop, val, units = ["px", "%", "em", "rem", "vw", "vh"]) {
  const isAuto = !val || val === "auto";
  const num    = isAuto ? "" : extractNum(val);
  const unit   = isAuto ? "auto" : extractUnit(val);
  const allUnits = ["auto", ...units];
  const opts = allUnits.map(u => `<option value="${u}"${u === unit ? " selected" : ""}>${u || "—"}</option>`).join("");
  return `<div class="pp-unit-field" data-prop="${prop}">
    <input class="pp-unit-num" type="number" value="${num}" placeholder="—"${isAuto ? " disabled" : ""}>
    <select class="pp-unit-sel">${opts}</select>
  </div>`;
}

// ── Icon button group ─────────────────────────────────────────────────────────

function _icons(prop, options, current) {
  const btns = options.map(([val, icon, tip]) =>
    `<button class="pp-icon-btn${current === val ? " pp-active" : ""}" data-prop="${prop}" data-value="${val}" title="${tip}">${icon}</button>`
  ).join("");
  return `<div class="pp-icon-group">${btns}</div>`;
}

// ── Section builders ──────────────────────────────────────────────────────────

function _buildElement(el) {
  const tag = el.tagName.toLowerCase();
  const id  = el.getAttribute("id") || "";
  return _section("element", "Element", `
    <div class="pp-element-row">
      <span class="pp-tag-badge">&lt;${tag}&gt;</span>
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">ID</label>
      <input class="pp-input" id="ppIdInput" type="text" value="${id}" placeholder="element-id">
    </div>`);
}

function _buildLayout(el, cs) {
  const s        = el.style;
  const display  = cs.display  || "block";
  const position = s.position  || cs.position || "static";
  const zIndex   = s.zIndex    || "";
  const overflow = s.overflow  || "";

  const displayOpts  = ["block","inline","inline-block","flex","inline-flex","grid","inline-grid","none"];
  const positionOpts = ["static","relative","absolute","fixed","sticky"];
  const overflowOpts = ["visible","hidden","scroll","auto","clip"];

  const sel = (prop, opts, cur) => `<select class="pp-input" data-prop="${prop}">${
    opts.map(v => `<option value="${v}"${cur === v ? " selected" : ""}>${v}</option>`).join("")
  }</select>`;

  const notStatic = ["relative","absolute","fixed","sticky"].includes(position);
  const offsets = notStatic ? `
    <div class="pp-subheader">Offsets</div>
    <div class="pp-4grid">
      <div class="pp-4cell"><label class="pp-label2">T</label>${_unitField("top",    s.top)}</div>
      <div class="pp-4cell"><label class="pp-label2">R</label>${_unitField("right",  s.right)}</div>
      <div class="pp-4cell"><label class="pp-label2">B</label>${_unitField("bottom", s.bottom)}</div>
      <div class="pp-4cell"><label class="pp-label2">L</label>${_unitField("left",   s.left)}</div>
    </div>` : "";

  return _section("layout", "Layout", `
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Display</label>
      ${sel("display", displayOpts, display)}
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label pp-label-lg">Position</label>
        ${sel("position", positionOpts, position)}
      </div>
      <div class="pp-field">
        <label class="pp-label">Z</label>
        <input class="pp-input" data-prop="zIndex" type="number" value="${zIndex}" placeholder="auto">
      </div>
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Overflow</label>
      ${sel("overflow", overflowOpts, overflow)}
    </div>
    ${offsets}`);
}

function _buildFlex(el, cs) {
  const display = cs.display;
  if (display !== "flex" && display !== "inline-flex") return "";

  const s = el.style;
  const dir   = s.flexDirection  || cs.flexDirection  || "row";
  const wrap  = s.flexWrap       || cs.flexWrap       || "nowrap";
  const just  = s.justifyContent || cs.justifyContent || "flex-start";
  const align = s.alignItems     || cs.alignItems     || "stretch";
  const gap   = s.gap || s.columnGap || "";

  return _section("flex", "Flex", `
    <div class="pp-field-row">
      <label class="pp-label pp-label-lg">Direction</label>
      ${_icons("flexDirection", [
        ["row",            "→", "Row"],
        ["row-reverse",    "←", "Row Reverse"],
        ["column",         "↓", "Column"],
        ["column-reverse", "↑", "Column Reverse"],
      ], dir)}
    </div>
    <div class="pp-field-row">
      <label class="pp-label pp-label-lg">Wrap</label>
      ${_icons("flexWrap", [
        ["nowrap",       "—",  "No Wrap"],
        ["wrap",         "↵",  "Wrap"],
        ["wrap-reverse", "↵↑", "Wrap Reverse"],
      ], wrap)}
    </div>
    <div class="pp-field-row">
      <label class="pp-label pp-label-lg">Justify</label>
      ${_icons("justifyContent", [
        ["flex-start",    "⇤",  "Start"],
        ["center",        "⇔",  "Center"],
        ["flex-end",      "⇥",  "End"],
        ["space-between", "↔",  "Space Between"],
        ["space-around",  "↔",  "Space Around"],
        ["space-evenly",  "↔",  "Space Evenly"],
      ], just)}
    </div>
    <div class="pp-field-row">
      <label class="pp-label pp-label-lg">Align</label>
      ${_icons("alignItems", [
        ["flex-start", "⊤", "Start"],
        ["center",     "·", "Center"],
        ["flex-end",   "⊥", "End"],
        ["stretch",    "⬍", "Stretch"],
        ["baseline",   "B", "Baseline"],
      ], align)}
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Gap</label>
      <input class="pp-input" data-prop="gap" type="text" value="${gap}" placeholder="0px">
    </div>`);
}

function _buildGrid(el, cs) {
  const display = cs.display;
  if (display !== "grid" && display !== "inline-grid") return "";

  const s = el.style;
  return _section("grid", "Grid", `
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Columns</label>
      <input class="pp-input" data-prop="gridTemplateColumns" type="text" value="${s.gridTemplateColumns || ""}" placeholder="repeat(3, 1fr)">
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Rows</label>
      <input class="pp-input" data-prop="gridTemplateRows" type="text" value="${s.gridTemplateRows || ""}" placeholder="auto">
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Gap</label>
      <input class="pp-input" data-prop="gap" type="text" value="${s.gap || ""}" placeholder="0px">
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label pp-label-lg">Col Gap</label>
        <input class="pp-input" data-prop="columnGap" type="text" value="${s.columnGap || ""}" placeholder="0px">
      </div>
      <div class="pp-field">
        <label class="pp-label pp-label-lg">Row Gap</label>
        <input class="pp-input" data-prop="rowGap" type="text" value="${s.rowGap || ""}" placeholder="0px">
      </div>
    </div>`);
}

function _buildSize(el) {
  const s = el.style;
  return _section("size", "Size", `
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label">W</label>
        ${_unitField("width", s.width || "auto")}
      </div>
      <div class="pp-field">
        <label class="pp-label">H</label>
        ${_unitField("height", s.height || "auto")}
      </div>
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label">Min W</label>
        ${_unitField("minWidth", s.minWidth || "auto")}
      </div>
      <div class="pp-field">
        <label class="pp-label">Min H</label>
        ${_unitField("minHeight", s.minHeight || "auto")}
      </div>
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label">Max W</label>
        ${_unitField("maxWidth", s.maxWidth || "auto")}
      </div>
      <div class="pp-field">
        <label class="pp-label">Max H</label>
        ${_unitField("maxHeight", s.maxHeight || "auto")}
      </div>
    </div>`);
}

function _buildSpacing(el, cs) {
  const s = el.style;
  // individual sides (inline first, then computed as placeholder)
  const sp = (prop, computed) => {
    const inline = parseFloat(s[prop]);
    const val    = isNaN(inline) ? "" : inline;
    const ph     = Math.round(parseFloat(computed)) || 0;
    return `<input class="pp-sp-input" data-prop="${prop}" type="number" value="${val}" placeholder="${ph}">`;
  };

  return _section("spacing", "Spacing", `
    <div class="pp-sbox">
      <div class="pp-sbox-top">${sp("marginTop",    cs.marginTop)}</div>
      <div class="pp-sbox-left">${sp("marginLeft",   cs.marginLeft)}</div>
      <div class="pp-sbox-inner">
        <div class="pp-sbox-top">${sp("paddingTop",    cs.paddingTop)}</div>
        <div class="pp-sbox-left">${sp("paddingLeft",   cs.paddingLeft)}</div>
        <div class="pp-sbox-content">content</div>
        <div class="pp-sbox-right">${sp("paddingRight",  cs.paddingRight)}</div>
        <div class="pp-sbox-bottom">${sp("paddingBottom", cs.paddingBottom)}</div>
      </div>
      <div class="pp-sbox-right">${sp("marginRight",  cs.marginRight)}</div>
      <div class="pp-sbox-bottom">${sp("marginBottom", cs.marginBottom)}</div>
    </div>`);
}

function _buildTypography(el, cs) {
  const s = el.style;

  const fontFamily    = s.fontFamily    || "";
  const fontSize      = s.fontSize      || "";
  const fontWeight    = s.fontWeight    || cs.fontWeight || "";
  const lineHeight    = s.lineHeight    || "";
  const letterSpacing = s.letterSpacing || "";
  const textAlign     = s.textAlign     || cs.textAlign  || "";
  const fontStyle     = s.fontStyle     || cs.fontStyle  || "";
  const textDec       = s.textDecoration || "";
  const textTransform = s.textTransform || "";
  const colorHex      = rgbToHex(cs.color);
  const textShadow    = s.textShadow   || "";

  const FONTS = [
    "", "Arial", "Helvetica", "Times New Roman", "Georgia", "Courier New",
    "Verdana", "Trebuchet MS", "Impact", "Tahoma", "Palatino",
    "system-ui", "sans-serif", "serif", "monospace",
  ];

  const fontOpts = FONTS.map(f =>
    `<option value="${f}"${fontFamily === f ? " selected" : ""}>${f || "— Font Family —"}</option>`
  ).join("");

  const weightOpts = ["", "100","200","300","400","500","600","700","800","900","bold","normal"].map(w =>
    `<option value="${w}"${fontWeight === w ? " selected" : ""}>${w || "—"}</option>`
  ).join("");

  const transformOpts = [
    ["",            "Aa", "None"],
    ["uppercase",   "AA", "Uppercase"],
    ["lowercase",   "aa", "Lowercase"],
    ["capitalize",  "Aa", "Capitalize"],
  ];

  const hasUnder  = textDec.includes("underline");
  const hasStrike = textDec.includes("line-through");

  return _section("typography", "Typography", `
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Font</label>
      <select class="pp-input" id="ppFontFamilySelect" data-prop="fontFamily">${fontOpts}</select>
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Custom</label>
      <input class="pp-input" id="ppFontFamilyInput" type="text" value="${fontFamily}" placeholder="e.g. Roboto, sans-serif">
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label">Size</label>
        ${_unitField("fontSize", fontSize || "16px", ["px", "em", "rem", "%", "vw"])}
      </div>
      <div class="pp-field">
        <label class="pp-label">Weight</label>
        <select class="pp-input" data-prop="fontWeight">${weightOpts}</select>
      </div>
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label">LH</label>
        <input class="pp-input" data-prop="lineHeight" type="text" value="${lineHeight}" placeholder="1.5">
      </div>
      <div class="pp-field">
        <label class="pp-label">LS</label>
        <input class="pp-input" data-prop="letterSpacing" type="text" value="${letterSpacing}" placeholder="0px">
      </div>
    </div>
    <div class="pp-field-row">
      <label class="pp-label pp-label-lg">Align</label>
      ${_icons("textAlign", [
        ["left",    "≡", "Left"],
        ["center",  "≡", "Center"],
        ["right",   "≡", "Right"],
        ["justify", "≡", "Justify"],
      ], textAlign)}
    </div>
    <div class="pp-field-row">
      <label class="pp-label pp-label-lg">Style</label>
      <div class="pp-icon-group">
        <button class="pp-icon-btn${fontStyle === "italic" ? " pp-active" : ""}"
          data-fontstyle title="Italic"><i>I</i></button>
        <button class="pp-icon-btn${hasUnder  ? " pp-active" : ""}" data-textdec="underline"    title="Underline"><u>U</u></button>
        <button class="pp-icon-btn${hasStrike ? " pp-active" : ""}" data-textdec="line-through"  title="Strikethrough"><s>S</s></button>
      </div>
    </div>
    <div class="pp-field-row">
      <label class="pp-label pp-label-lg">Transform</label>
      ${_icons("textTransform", transformOpts, textTransform || "")}
    </div>
    <div class="pp-color-row">
      <label class="pp-label pp-label-lg">Color</label>
      <input class="pp-color" data-prop="color" type="color" value="${colorHex}">
      <input class="pp-input pp-color-text" data-prop="color" type="text" value="${s.color || ""}">
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Shadow</label>
      <input class="pp-input" data-prop="textShadow" type="text" value="${textShadow}" placeholder="2px 2px 4px #000">
    </div>`);
}

function _buildBackground(el, cs) {
  const s = el.style;
  const bgHex     = rgbToHex(cs.backgroundColor);
  const bgImage   = s.backgroundImage    || "";
  const bgSize    = s.backgroundSize     || "";
  const bgPos     = s.backgroundPosition || "";
  const bgRepeat  = s.backgroundRepeat   || "";
  const opacity   = s.opacity !== "" && s.opacity !== undefined ? s.opacity : "1";
  const visibility = s.visibility || cs.visibility || "visible";
  const cursor    = s.cursor || "";

  const bgSizeOpts  = ["", "cover", "contain", "auto", "100% 100%"];
  const bgRepOpts   = ["", "no-repeat", "repeat", "repeat-x", "repeat-y"];
  const cursorOpts  = [
    "", "default", "pointer", "text", "move", "grab", "grabbing",
    "crosshair", "wait", "not-allowed", "zoom-in", "zoom-out",
    "ew-resize", "ns-resize", "help",
  ];

  const sel = (prop, opts, cur, ph) => `<select class="pp-input" data-prop="${prop}">
    ${opts.map(v => `<option value="${v}"${cur === v ? " selected" : ""}>${v || ph}</option>`).join("")}
  </select>`;

  return _section("background", "Background & Effects", `
    <div class="pp-color-row">
      <label class="pp-label pp-label-lg">BG Color</label>
      <input class="pp-color" data-prop="backgroundColor" type="color" value="${bgHex}">
      <input class="pp-input pp-color-text" data-prop="backgroundColor" type="text" value="${s.backgroundColor || ""}">
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">BG Image</label>
      <input class="pp-input" data-prop="backgroundImage" type="text" value="${bgImage}" placeholder="url(...)">
    </div>
    <div class="pp-row">
      <div class="pp-field">
        ${sel("backgroundSize", bgSizeOpts, bgSize, "— BG Size —")}
      </div>
      <div class="pp-field">
        ${sel("backgroundRepeat", bgRepOpts, bgRepeat, "— Repeat —")}
      </div>
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">BG Pos</label>
      <input class="pp-input" data-prop="backgroundPosition" type="text" value="${bgPos}" placeholder="center center">
    </div>
    <div class="pp-opacity-row">
      <label class="pp-label pp-label-lg">Opacity</label>
      <input class="pp-range" data-prop="opacity" type="range" min="0" max="1" step="0.01" value="${opacity}">
      <span class="pp-range-val">${parseFloat(opacity).toFixed(2)}</span>
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <select class="pp-input" data-prop="visibility">
          <option value="visible"${visibility === "visible" ? " selected" : ""}>visible</option>
          <option value="hidden"${visibility  === "hidden"  ? " selected" : ""}>hidden</option>
        </select>
      </div>
      <div class="pp-field">
        ${sel("cursor", cursorOpts, cursor, "— cursor —")}
      </div>
    </div>`);
}

function _buildBorder(el, cs) {
  const s = el.style;

  const bStyle = s.borderStyle || "";
  const bWidth = s.borderWidth || "";
  const bColor = rgbToHex(s.borderColor || cs.borderTopColor || "#000000");

  const bTopW  = s.borderTopWidth    || "";
  const bRightW = s.borderRightWidth  || "";
  const bBotW  = s.borderBottomWidth  || "";
  const bLeftW = s.borderLeftWidth    || "";

  const rTL = s.borderTopLeftRadius     || "";
  const rTR = s.borderTopRightRadius    || "";
  const rBR = s.borderBottomRightRadius || "";
  const rBL = s.borderBottomLeftRadius  || "";
  const rAll = s.borderRadius           || "";

  const styleOpts = ["none","solid","dashed","dotted","double","groove","ridge","inset","outset"];
  const styleSelect = `<select class="pp-input" data-prop="borderStyle">
    ${styleOpts.map(v => `<option value="${v}"${bStyle === v ? " selected" : ""}>${v}</option>`).join("")}
  </select>`;

  return _section("border", "Border", `
    <div class="pp-subheader">All Sides</div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Style</label>
      ${styleSelect}
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label">Width</label>
        ${_unitField("borderWidth", bWidth || "1px")}
      </div>
      <div class="pp-field pp-field-color">
        <label class="pp-label">Color</label>
        <input class="pp-color" data-prop="borderColor" type="color" value="${bColor}">
        <input class="pp-input pp-color-text" data-prop="borderColor" type="text" value="${s.borderColor || ""}">
      </div>
    </div>
    <div class="pp-subheader">Individual Widths</div>
    <div class="pp-4grid">
      <div class="pp-4cell"><label class="pp-label2">T</label>${_unitField("borderTopWidth",    bTopW  || "1px")}</div>
      <div class="pp-4cell"><label class="pp-label2">R</label>${_unitField("borderRightWidth",  bRightW|| "1px")}</div>
      <div class="pp-4cell"><label class="pp-label2">B</label>${_unitField("borderBottomWidth", bBotW  || "1px")}</div>
      <div class="pp-4cell"><label class="pp-label2">L</label>${_unitField("borderLeftWidth",   bLeftW || "1px")}</div>
    </div>
    <div class="pp-subheader">Radius</div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">All</label>
      <input class="pp-input" data-prop="borderRadius" type="text" value="${rAll}" placeholder="0px">
    </div>
    <div class="pp-radius-corners">
      <div class="pp-radius-row">
        <div class="pp-radius-cell">
          <span class="pp-radius-lbl">TL</span>
          <input class="pp-input pp-radius-input" data-prop="borderTopLeftRadius"     type="text" value="${rTL}" placeholder="0">
        </div>
        <div class="pp-radius-cell">
          <span class="pp-radius-lbl">TR</span>
          <input class="pp-input pp-radius-input" data-prop="borderTopRightRadius"    type="text" value="${rTR}" placeholder="0">
        </div>
      </div>
      <div class="pp-radius-row">
        <div class="pp-radius-cell">
          <span class="pp-radius-lbl">BL</span>
          <input class="pp-input pp-radius-input" data-prop="borderBottomLeftRadius"  type="text" value="${rBL}" placeholder="0">
        </div>
        <div class="pp-radius-cell">
          <span class="pp-radius-lbl">BR</span>
          <input class="pp-input pp-radius-input" data-prop="borderBottomRightRadius" type="text" value="${rBR}" placeholder="0">
        </div>
      </div>
    </div>`);
}

function _buildShadow(el) {
  const s = el.style;
  const shadows = parseShadows(s.boxShadow || "");

  const items = shadows.map((sh, i) => `
    <div class="pp-shadow-item">
      <input class="pp-input pp-shadow-val" type="text" value="${sh}" placeholder="2px 4px 8px rgba(0,0,0,0.3)">
      <button class="pp-shadow-rm" title="Remove">✕</button>
    </div>`).join("");

  return _section("shadow", "Box Shadow", `
    <div class="pp-shadow-list" id="ppShadowList">${items}</div>
    <button class="pp-btn" id="ppAddShadowBtn">+ Add Shadow</button>`);
}

function _buildFilters(el) {
  const s = el.style;
  const filter = s.filter || "";

  const row = (name, ph) => `
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">${name.charAt(0).toUpperCase() + name.slice(1)}</label>
      <input class="pp-input" data-filter="${name}" type="text" value="${getFilter(filter, name)}" placeholder="${ph}">
    </div>`;

  return _section("filter", "Filters", `
    ${row("blur",       "0px")}
    ${row("brightness", "1")}
    ${row("contrast",   "1")}
    ${row("saturate",   "1")}
    ${row("grayscale",  "0")}
    ${row("hue-rotate", "0deg")}
    ${row("invert",     "0")}`);
}

function _buildTransform(el) {
  const s = el.style;
  const tr = s.transform || "";

  const row = (name, ph) => `
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">${name}</label>
      <input class="pp-input" data-transform="${name}" type="text" value="${getTransformVal(tr, name)}" placeholder="${ph}">
    </div>`;

  return _section("transform", "Transform", `
    ${row("rotate",     "45deg")}
    ${row("scaleX",     "1")}
    ${row("scaleY",     "1")}
    ${row("translateX", "0px")}
    ${row("translateY", "0px")}
    ${row("skewX",      "0deg")}
    ${row("skewY",      "0deg")}
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Origin</label>
      <input class="pp-input" data-prop="transformOrigin" type="text" value="${s.transformOrigin || ""}" placeholder="center center">
    </div>`);
}

function _buildTransition(el) {
  const s = el.style;
  const transition = s.transition || "";

  return _section("transition", "Transition", `
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Property</label>
      <input class="pp-input" data-prop="transitionProperty" type="text" value="${s.transitionProperty || ""}" placeholder="all">
    </div>
    <div class="pp-row">
      <div class="pp-field">
        <label class="pp-label">Duration</label>
        <input class="pp-input" data-prop="transitionDuration" type="text" value="${s.transitionDuration || ""}" placeholder="0.3s">
      </div>
      <div class="pp-field">
        <label class="pp-label">Delay</label>
        <input class="pp-input" data-prop="transitionDelay" type="text" value="${s.transitionDelay || ""}" placeholder="0s">
      </div>
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Easing</label>
      <select class="pp-input" data-prop="transitionTimingFunction">
        ${["","ease","ease-in","ease-out","ease-in-out","linear","step-start","step-end"].map(v =>
          `<option value="${v}"${s.transitionTimingFunction === v ? " selected" : ""}>${v || "— easing —"}</option>`
        ).join("")}
      </select>
    </div>`);
}

// ── Link section (preserved) ──────────────────────────────────────────────────

function _getLinkEl(el) {
  if (!el) return null;
  if (el.tagName === "A") return el;
  if (el.parentElement && el.parentElement.tagName === "A") return el.parentElement;
  return null;
}

function _buildLink(el) {
  const linkEl = _getLinkEl(el);
  const href   = linkEl ? (linkEl.getAttribute("href")   || "") : "";
  const target = linkEl ? (linkEl.getAttribute("target") || "") : "";
  const has    = linkEl !== null;

  const body = `
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">href</label>
      <input class="pp-input" id="ppHrefInput" type="text" value="${href}" placeholder="https://..." ${!has ? "disabled" : ""}>
    </div>
    <div class="pp-field-full">
      <label class="pp-label pp-label-lg">Target</label>
      <select class="pp-input" id="ppTargetSelect" ${!has ? "disabled" : ""}>
        <option value=""      ${target === ""       ? "selected" : ""}>Same tab</option>
        <option value="_blank"${target === "_blank" ? "selected" : ""}>New tab</option>
        <option value="_self" ${target === "_self"  ? "selected" : ""}>Self</option>
      </select>
    </div>
    ${has
      ? `<button class="pp-btn pp-btn-danger" id="ppRemoveLinkBtn">Remove Link</button>`
      : `<button class="pp-btn" id="ppWrapLinkBtn">Wrap in Link</button>`}`;

  return _section("link", "Link", body);
}

// ── CSS class section (preserved) ────────────────────────────────────────────

const INTERNAL_CLASSES = new Set([
  "draggable-item", "selected-text",
  "resize-handle", "top-left", "top-right", "bottom-left", "bottom-right",
]);

function _buildClasses(el) {
  const current = Array.from(el.classList).filter(c => !INTERNAL_CLASSES.has(c));
  const built   = getAllClasses();
  const addable = built.filter(c => !current.includes(c));

  const chips = current.map(c => `
    <span class="pp-class-chip">
      <span class="pp-class-dot"></span>${c}
      <button class="pp-class-remove" data-class="${c}">&#x2715;</button>
    </span>`).join("");

  const opts = addable.map(c => `<option value="${c}">${c}</option>`).join("");

  const body = `
    <div class="pp-class-list">${chips || '<span class="pp-class-empty">No classes applied</span>'}</div>
    ${built.length > 0 ? `
    <div class="pp-class-add-row">
      <select class="pp-input" id="ppClassSelect">
        <option value="">＋ add class…</option>${opts}
      </select>
    </div>` : ""}`;

  return _section("classes", "CSS Classes", body);
}

// ── Main refresh ──────────────────────────────────────────────────────────────

function refresh() {
  const el      = state.selectedTextElement;
  const content = elements.propertiesContent;

  if (!el || !state.iframeWindow) {
    content.innerHTML = `<div class="pp-empty">Click an element in the preview to edit its properties.</div>`;
    return;
  }

  const cs = state.iframeWindow.getComputedStyle(el);

  content.innerHTML = [
    _buildElement(el),
    _buildLayout(el, cs),
    _buildFlex(el, cs),
    _buildGrid(el, cs),
    _buildSize(el),
    _buildSpacing(el, cs),
    _buildTypography(el, cs),
    _buildBackground(el, cs),
    _buildBorder(el, cs),
    _buildShadow(el),
    _buildFilters(el),
    _buildTransform(el),
    _buildTransition(el),
    _buildLink(el),
    _buildClasses(el),
  ].join("");

  _wireAll(content, el, cs);
}

// ── Wiring ────────────────────────────────────────────────────────────────────

function _wireAll(content, el, cs) {
  // Collapsible sections
  content.querySelectorAll(".pp-toggleable").forEach(title => {
    title.addEventListener("click", () => {
      const section = title.parentElement;
      const id = section.dataset.sid;
      _collapsed[id] = !(_collapsed[id] ?? false);
      section.classList.toggle("pp-collapsed", _collapsed[id]);
      title.querySelector(".pp-chevron").textContent = _collapsed[id] ? "▶" : "▼";
    });
  });

  // ID input
  const idInput = content.querySelector("#ppIdInput");
  if (idInput) {
    idInput.addEventListener("change", () => {
      const val = idInput.value.trim();
      if (val) el.setAttribute("id", val); else el.removeAttribute("id");
      saveIframeToTextarea();
    });
    idInput.addEventListener("keydown", e => { if (e.key === "Enter") idInput.blur(); });
  }

  // Standard data-prop inputs/selects
  content.querySelectorAll("[data-prop]").forEach(input => {
    if (input.classList.contains("pp-color")) return;
    if (input.classList.contains("pp-color-text")) return;
    if (input.classList.contains("pp-range")) return;

    const apply = () => {
      const prop = input.dataset.prop;
      el.style[prop] = input.value.trim();
      saveIframeToTextarea();
      if (prop === "display" || prop === "position") refresh();
    };
    input.addEventListener("change", apply);
    if (input.tagName !== "SELECT") {
      input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
    }
  });

  // Color swatches
  content.querySelectorAll(".pp-color[data-prop]").forEach(swatch => {
    swatch.addEventListener("input", () => {
      el.style[swatch.dataset.prop] = swatch.value;
      const txt = swatch.nextElementSibling;
      if (txt && txt.classList.contains("pp-color-text")) txt.value = swatch.value;
      saveIframeToTextarea();
    });
  });

  // Color text inputs
  content.querySelectorAll(".pp-color-text[data-prop]").forEach(input => {
    input.addEventListener("change", () => {
      el.style[input.dataset.prop] = input.value.trim();
      const swatch = input.previousElementSibling;
      if (swatch && swatch.type === "color") {
        try { swatch.value = rgbToHex(input.value); } catch (_) {}
      }
      saveIframeToTextarea();
    });
    input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
  });

  // Opacity range
  const rangeInput = content.querySelector(".pp-range[data-prop]");
  if (rangeInput) {
    rangeInput.addEventListener("input", () => {
      el.style[rangeInput.dataset.prop] = rangeInput.value;
      const label = rangeInput.nextElementSibling;
      if (label) label.textContent = parseFloat(rangeInput.value).toFixed(2);
      saveIframeToTextarea();
    });
  }

  // Unit fields
  content.querySelectorAll(".pp-unit-field").forEach(field => {
    const prop    = field.dataset.prop;
    const numIn   = field.querySelector(".pp-unit-num");
    const unitSel = field.querySelector(".pp-unit-sel");

    const apply = () => {
      const unit = unitSel.value;
      if (unit === "auto") {
        el.style[prop] = "auto";
        numIn.disabled = true;
      } else {
        numIn.disabled = false;
        const n = numIn.value;
        el.style[prop] = n !== "" ? n + unit : "";
      }
      saveIframeToTextarea();
    };

    numIn.addEventListener("change", apply);
    numIn.addEventListener("keydown", e => { if (e.key === "Enter") numIn.blur(); });
    unitSel.addEventListener("change", () => {
      numIn.disabled = unitSel.value === "auto";
      apply();
    });
  });

  // Icon button groups (data-prop)
  content.querySelectorAll(".pp-icon-btn[data-prop]").forEach(btn => {
    btn.addEventListener("click", () => {
      el.style[btn.dataset.prop] = btn.dataset.value;
      btn.closest(".pp-icon-group").querySelectorAll(".pp-icon-btn[data-prop]").forEach(b => {
        if (b.dataset.prop === btn.dataset.prop) b.classList.toggle("pp-active", b === btn);
      });
      saveIframeToTextarea();
      if (btn.dataset.prop === "display") refresh();
    });
  });

  // Font style toggle (italic)
  content.querySelectorAll(".pp-icon-btn[data-fontstyle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const next = el.style.fontStyle === "italic" ? "normal" : "italic";
      el.style.fontStyle = next;
      btn.classList.toggle("pp-active", next === "italic");
      saveIframeToTextarea();
    });
  });

  // Text decoration toggles
  content.querySelectorAll(".pp-icon-btn[data-textdec]").forEach(btn => {
    btn.addEventListener("click", () => {
      const dec   = btn.dataset.textdec;
      const parts = (el.style.textDecoration || "").split(/\s+/).filter(p => p && p !== "none");
      const idx   = parts.indexOf(dec);
      if (idx >= 0) parts.splice(idx, 1); else parts.push(dec);
      const newVal = parts.join(" ");
      el.style.textDecoration = newVal;
      btn.classList.toggle("pp-active", newVal.includes(dec));
      saveIframeToTextarea();
    });
  });

  // Spacing box
  content.querySelectorAll(".pp-sp-input").forEach(input => {
    const apply = () => {
      const val = input.value;
      el.style[input.dataset.prop] = val !== "" ? val + "px" : "";
      saveIframeToTextarea();
    };
    input.addEventListener("change", apply);
    input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
  });

  // Font family — sync select ↔ text input
  const fontSel = content.querySelector("#ppFontFamilySelect");
  const fontIn  = content.querySelector("#ppFontFamilyInput");
  if (fontSel && fontIn) {
    fontSel.addEventListener("change", () => {
      fontIn.value = fontSel.value;
      el.style.fontFamily = fontSel.value;
      saveIframeToTextarea();
    });
    fontIn.addEventListener("change", () => {
      el.style.fontFamily = fontIn.value.trim();
      saveIframeToTextarea();
    });
    fontIn.addEventListener("keydown", e => { if (e.key === "Enter") fontIn.blur(); });
  }

  // Box shadow
  const shadowList   = content.querySelector("#ppShadowList");
  const addShadowBtn = content.querySelector("#ppAddShadowBtn");

  function _flushShadow() {
    const vals = Array.from(shadowList.querySelectorAll(".pp-shadow-val"))
      .map(i => i.value.trim()).filter(Boolean);
    el.style.boxShadow = vals.join(", ") || "";
    saveIframeToTextarea();
  }

  if (shadowList) {
    shadowList.querySelectorAll(".pp-shadow-val").forEach(inp => {
      inp.addEventListener("change", _flushShadow);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
    });
    shadowList.querySelectorAll(".pp-shadow-rm").forEach(btn => {
      btn.addEventListener("click", () => { btn.parentElement.remove(); _flushShadow(); });
    });
  }

  if (addShadowBtn) {
    addShadowBtn.addEventListener("click", () => {
      const item = document.createElement("div");
      item.className = "pp-shadow-item";
      item.innerHTML = `
        <input class="pp-input pp-shadow-val" type="text" value="2px 4px 8px rgba(0,0,0,0.3)" placeholder="2px 4px 8px rgba(0,0,0,0.3)">
        <button class="pp-shadow-rm" title="Remove">✕</button>`;
      shadowList.appendChild(item);
      const inp = item.querySelector(".pp-shadow-val");
      inp.addEventListener("change", _flushShadow);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); });
      item.querySelector(".pp-shadow-rm").addEventListener("click", () => { item.remove(); _flushShadow(); });
      _flushShadow();
    });
  }

  // Filter inputs
  content.querySelectorAll("[data-filter]").forEach(input => {
    const apply = () => {
      const parts = [];
      content.querySelectorAll("[data-filter]").forEach(i => {
        const v = i.value.trim();
        if (v) parts.push(`${i.dataset.filter}(${v})`);
      });
      el.style.filter = parts.join(" ") || "";
      saveIframeToTextarea();
    };
    input.addEventListener("change", apply);
    input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
  });

  // Transform inputs
  content.querySelectorAll("[data-transform]").forEach(input => {
    const apply = () => {
      const parts = [];
      content.querySelectorAll("[data-transform]").forEach(i => {
        const v = i.value.trim();
        if (v) parts.push(`${i.dataset.transform}(${v})`);
      });
      el.style.transform = parts.join(" ") || "";
      saveIframeToTextarea();
    };
    input.addEventListener("change", apply);
    input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
  });

  // Link section
  const hrefInput    = content.querySelector("#ppHrefInput");
  const targetSelect = content.querySelector("#ppTargetSelect");
  const wrapBtn      = content.querySelector("#ppWrapLinkBtn");
  const removeBtn    = content.querySelector("#ppRemoveLinkBtn");

  if (hrefInput) {
    hrefInput.addEventListener("change", () => {
      const linkEl = _getLinkEl(el);
      if (linkEl) { linkEl.setAttribute("href", hrefInput.value.trim()); saveIframeToTextarea(); }
    });
    hrefInput.addEventListener("keydown", e => { if (e.key === "Enter") hrefInput.blur(); });
  }
  if (targetSelect) {
    targetSelect.addEventListener("change", () => {
      const linkEl = _getLinkEl(el);
      if (!linkEl) return;
      if (targetSelect.value) linkEl.setAttribute("target", targetSelect.value);
      else linkEl.removeAttribute("target");
      saveIframeToTextarea();
    });
  }
  if (wrapBtn) {
    wrapBtn.addEventListener("click", () => {
      const a = el.ownerDocument.createElement("a");
      a.setAttribute("href", "#");
      el.parentNode.insertBefore(a, el);
      a.appendChild(el);
      saveIframeToTextarea();
      refresh();
    });
  }
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      const linkEl = _getLinkEl(el);
      if (!linkEl) return;
      const parent = linkEl.parentNode;
      while (linkEl.firstChild) parent.insertBefore(linkEl.firstChild, linkEl);
      linkEl.remove();
      saveIframeToTextarea();
      refresh();
    });
  }

  // CSS class section
  content.querySelectorAll(".pp-class-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      el.classList.remove(btn.dataset.class);
      saveIframeToTextarea();
      refresh();
    });
  });
  const classSel = content.querySelector("#ppClassSelect");
  if (classSel) {
    classSel.addEventListener("change", () => {
      if (!classSel.value) return;
      el.classList.add(classSel.value);
      saveIframeToTextarea();
      refresh();
    });
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initPropertiesPanel() {
  onSelectionChange.push(refresh);

  elements.propertiesToggleBtn.addEventListener("click", () => {
    elements.propertiesPanel.classList.toggle("open");
    elements.propertiesToggleBtn.classList.toggle("active");
  });

  elements.propertiesCloseBtn.addEventListener("click", () => {
    elements.propertiesPanel.classList.remove("open");
    elements.propertiesToggleBtn.classList.remove("active");
  });
}
