import { elements } from "../DOM/elements.js";
import { state, onSelectionChange } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";
import { getAllClasses } from "../CSS Features/cssStore.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function rgbToHex(rgb) {
  if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return "#000000";
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#000000";
  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");
  return "#" + r + g + b;
}

function parsePx(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "" : String(Math.round(n));
}

// ── Render ────────────────────────────────────────────────────────────────────

function refresh() {
  const el = state.selectedTextElement;
  const content = elements.propertiesContent;

  if (!el || !state.iframeWindow) {
    content.innerHTML = `<div class="pp-empty">Click an element in the preview to edit its properties.</div>`;
    return;
  }

  const cs = state.iframeWindow.getComputedStyle(el);
  const s  = el.style;

  // Position (from inline style; parsed as numbers)
  const x = parsePx(s.left);
  const y = parsePx(s.top);

  // Size
  const w = s.width  || "";
  const h = s.height || "";

  // Typography
  const fontSize   = s.fontSize   || "";
  const fontWeight = s.fontWeight || "";
  const fontStyle  = s.fontStyle  || "";
  const textAlign  = s.textAlign  || "";

  // Appearance
  const bgHex      = rgbToHex(cs.backgroundColor);
  const colorHex   = rgbToHex(cs.color);
  const border     = s.border       || "";
  const radius     = s.borderRadius || "";
  const opacity    = s.opacity !== "" ? s.opacity : "1";

  // Spacing
  const padding = s.padding || "";
  const margin  = s.margin  || "";

  function weightOpt(v) {
    return `<option value="${v}" ${fontWeight === v ? "selected" : ""}>${v}</option>`;
  }

  content.innerHTML = `
    <div class="pp-section">
      <div class="pp-section-title">Position &amp; Size</div>
      <div class="pp-row">
        <div class="pp-field">
          <label class="pp-label">X</label>
          <input class="pp-input" data-prop="left" data-unit="px" type="number" value="${x}" placeholder="0">
        </div>
        <div class="pp-field">
          <label class="pp-label">Y</label>
          <input class="pp-input" data-prop="top" data-unit="px" type="number" value="${y}" placeholder="0">
        </div>
      </div>
      <div class="pp-row">
        <div class="pp-field">
          <label class="pp-label">W</label>
          <input class="pp-input" data-prop="width" type="text" value="${w}" placeholder="auto">
        </div>
        <div class="pp-field">
          <label class="pp-label">H</label>
          <input class="pp-input" data-prop="height" type="text" value="${h}" placeholder="auto">
        </div>
      </div>
    </div>

    <div class="pp-section">
      <div class="pp-section-title">Typography</div>
      <div class="pp-row">
        <div class="pp-field">
          <label class="pp-label">Size</label>
          <input class="pp-input" data-prop="fontSize" type="text" value="${fontSize}" placeholder="16px">
        </div>
        <div class="pp-field">
          <label class="pp-label">Weight</label>
          <select class="pp-input" data-prop="fontWeight">
            <option value="" ${!fontWeight ? "selected" : ""}>—</option>
            ${["normal","bold","100","200","300","400","500","600","700","800","900"].map(weightOpt).join("")}
          </select>
        </div>
      </div>
      <div class="pp-row">
        <div class="pp-field">
          <label class="pp-label">Align</label>
          <select class="pp-input" data-prop="textAlign">
            <option value="" ${!textAlign ? "selected" : ""}>—</option>
            <option value="left"    ${textAlign === "left"    ? "selected" : ""}>Left</option>
            <option value="center"  ${textAlign === "center"  ? "selected" : ""}>Center</option>
            <option value="right"   ${textAlign === "right"   ? "selected" : ""}>Right</option>
            <option value="justify" ${textAlign === "justify" ? "selected" : ""}>Justify</option>
          </select>
        </div>
        <div class="pp-field">
          <label class="pp-label">Style</label>
          <select class="pp-input" data-prop="fontStyle">
            <option value=""       ${!fontStyle              ? "selected" : ""}>—</option>
            <option value="normal" ${fontStyle === "normal"  ? "selected" : ""}>Normal</option>
            <option value="italic" ${fontStyle === "italic"  ? "selected" : ""}>Italic</option>
          </select>
        </div>
      </div>
    </div>

    <div class="pp-section">
      <div class="pp-section-title">Appearance</div>
      <div class="pp-color-row">
        <label class="pp-label">BG</label>
        <input class="pp-color" data-prop="backgroundColor" type="color" value="${bgHex}">
        <input class="pp-input pp-color-text" data-prop="backgroundColor" data-mode="color-text" type="text" value="${s.backgroundColor || ""}">
      </div>
      <div class="pp-color-row">
        <label class="pp-label">Color</label>
        <input class="pp-color" data-prop="color" type="color" value="${colorHex}">
        <input class="pp-input pp-color-text" data-prop="color" data-mode="color-text" type="text" value="${s.color || ""}">
      </div>
      <div class="pp-field-full">
        <label class="pp-label">Border</label>
        <input class="pp-input" data-prop="border" type="text" value="${border}" placeholder="1px solid #000">
      </div>
      <div class="pp-field-full">
        <label class="pp-label">Radius</label>
        <input class="pp-input" data-prop="borderRadius" type="text" value="${radius}" placeholder="4px">
      </div>
      <div class="pp-opacity-row">
        <label class="pp-label">Opacity</label>
        <input class="pp-range" data-prop="opacity" type="range" min="0" max="1" step="0.01" value="${opacity}">
        <span class="pp-range-val">${parseFloat(opacity).toFixed(2)}</span>
      </div>
    </div>

    <div class="pp-section">
      <div class="pp-section-title">Spacing</div>
      <div class="pp-field-full">
        <label class="pp-label">Padding</label>
        <input class="pp-input" data-prop="padding" type="text" value="${padding}" placeholder="10px">
      </div>
      <div class="pp-field-full">
        <label class="pp-label">Margin</label>
        <input class="pp-input" data-prop="margin" type="text" value="${margin}" placeholder="0 auto">
      </div>
    </div>

    ${buildLinkSection(el)}
    ${buildClassSection(el)}
  `;

  wireInputs(content, el);
  wireLinkSection(content, el);
  wireClassSection(content, el);
}

// ── Link section ──────────────────────────────────────────────────────────────

function getLinkEl(el) {
  if (!el) return null;
  if (el.tagName === "A") return el;
  if (el.parentElement && el.parentElement.tagName === "A") return el.parentElement;
  return null;
}

function buildLinkSection(el) {
  const linkEl  = getLinkEl(el);
  const href    = linkEl ? (linkEl.getAttribute("href")   || "") : "";
  const target  = linkEl ? (linkEl.getAttribute("target") || "") : "";
  const hasLink = linkEl !== null;

  return `
    <div class="pp-section">
      <div class="pp-section-title">Link</div>
      <div class="pp-field-full">
        <label class="pp-label">href</label>
        <input class="pp-input" id="ppHrefInput" type="text" value="${href}" placeholder="https://example.com" ${!hasLink ? "disabled" : ""}>
      </div>
      <div class="pp-field-full">
        <label class="pp-label">Target</label>
        <select class="pp-input" id="ppTargetSelect" ${!hasLink ? "disabled" : ""}>
          <option value=""      ${target === ""       ? "selected" : ""}>Same tab</option>
          <option value="_blank" ${target === "_blank" ? "selected" : ""}>New tab</option>
          <option value="_self"  ${target === "_self"  ? "selected" : ""}>Self</option>
        </select>
      </div>
      ${hasLink
        ? `<button class="pp-btn pp-btn-danger" id="ppRemoveLinkBtn">Remove Link</button>`
        : `<button class="pp-btn" id="ppWrapLinkBtn">Wrap in Link</button>`
      }
    </div>
  `;
}

function wireLinkSection(content, el) {
  const hrefInput    = content.querySelector("#ppHrefInput");
  const targetSelect = content.querySelector("#ppTargetSelect");
  const wrapBtn      = content.querySelector("#ppWrapLinkBtn");
  const removeBtn    = content.querySelector("#ppRemoveLinkBtn");

  if (hrefInput) {
    hrefInput.addEventListener("change", () => {
      const linkEl = getLinkEl(el);
      if (linkEl) {
        linkEl.setAttribute("href", hrefInput.value.trim());
        saveIframeToTextarea();
      }
    });
    hrefInput.addEventListener("keydown", e => { if (e.key === "Enter") hrefInput.blur(); });
  }

  if (targetSelect) {
    targetSelect.addEventListener("change", () => {
      const linkEl = getLinkEl(el);
      if (!linkEl) return;
      if (targetSelect.value) {
        linkEl.setAttribute("target", targetSelect.value);
      } else {
        linkEl.removeAttribute("target");
      }
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
      refresh(); // re-render the panel to show link fields
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      const linkEl = getLinkEl(el);
      if (!linkEl) return;
      // Replace <a> with its children
      const parent = linkEl.parentNode;
      while (linkEl.firstChild) parent.insertBefore(linkEl.firstChild, linkEl);
      linkEl.remove();
      saveIframeToTextarea();
      refresh();
    });
  }
}

// ── CSS class section ─────────────────────────────────────────────────────────

const INTERNAL_CLASSES = new Set([
  "draggable-item", "selected-text",
  "resize-handle", "top-left", "top-right", "bottom-left", "bottom-right"
]);

function buildClassSection(el) {
  const current  = Array.from(el.classList).filter(c => !INTERNAL_CLASSES.has(c));
  const built    = getAllClasses();
  const addable  = built.filter(c => !current.includes(c));

  const chips = current.map(c => `
    <span class="pp-class-chip">
      <span class="pp-class-dot"></span>${c}<button class="pp-class-remove" data-class="${c}">&#x2715;</button>
    </span>`).join("");

  const options = addable.map(c => `<option value="${c}">${c}</option>`).join("");

  return `
    <div class="pp-section">
      <div class="pp-section-title">CSS Classes</div>
      <div class="pp-class-list">
        ${chips || '<span class="pp-class-empty">No classes applied</span>'}
      </div>
      ${built.length > 0 ? `
        <div class="pp-class-add-row">
          <select class="pp-input" id="ppClassSelect">
            <option value="">&#xFF0B; add class&hellip;</option>
            ${options}
          </select>
        </div>` : ""}
    </div>`;
}

function wireClassSection(content, el) {
  content.querySelectorAll(".pp-class-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      el.classList.remove(btn.dataset.class);
      saveIframeToTextarea();
      refresh();
    });
  });

  const sel = content.querySelector("#ppClassSelect");
  if (sel) {
    sel.addEventListener("change", () => {
      if (!sel.value) return;
      el.classList.add(sel.value);
      saveIframeToTextarea();
      refresh();
    });
  }
}

function wireInputs(content, el) {
  // Text / number inputs — apply on change (blur or Enter)
  content.querySelectorAll(".pp-input[data-prop]").forEach(input => {
    input.addEventListener("change", () => applyProp(input, el));
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { input.blur(); }
    });
  });

  // Color swatches — apply live on input
  content.querySelectorAll(".pp-color[data-prop]").forEach(swatch => {
    swatch.addEventListener("input", () => {
      el.style[swatch.dataset.prop] = swatch.value;
      // Sync sibling text input
      const textInput = swatch.nextElementSibling;
      if (textInput) textInput.value = swatch.value;
      saveIframeToTextarea();
    });
  });

  // Opacity range — apply live
  const rangeInput = content.querySelector(".pp-range[data-prop]");
  if (rangeInput) {
    rangeInput.addEventListener("input", () => {
      const val = rangeInput.value;
      el.style.opacity = val;
      const label = rangeInput.nextElementSibling;
      if (label) label.textContent = parseFloat(val).toFixed(2);
      saveIframeToTextarea();
    });
  }
}

function applyProp(input, el) {
  const prop = input.dataset.prop;
  const unit = input.dataset.unit || "";
  let value = input.value.trim();

  // Append px unit for pure-number position/size fields
  if (unit === "px" && value !== "" && !isNaN(Number(value))) {
    value = value + "px";
  }

  el.style[prop] = value;
  saveIframeToTextarea();
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
