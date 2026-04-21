/**
 * widgetLibrary.js
 *
 * Inserts self-contained, interactive widget bundles (HTML + CSS + JS)
 * into the current page. Each widget button opens a visual config panel
 * so non-coders can customise it before insertion.
 */

import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "../CSS Features/cssStore.js";
import { getRawJs, setRawJs }   from "../JS Features/jsStore.js";
import {
  getCurrentJsFile, getJsFileContent, setJsFileContent,
} from "../JS Features/jsFileStore.js";
import { getCurrentPage, setPageHtml } from "../Features/pageStore.js";
import { renderPreview }   from "../Preview/renderPreview.js";
import { scheduleAutosave } from "../Features/projectStorage.js";

let _ribbon     = null;
let _tabBtn     = null;
let _configModal = null;
let _currentDef = null;

// ── Public API ────────────────────────────────────────────────────────────────

export function initWidgetLibrary() {
  _ribbon = document.getElementById("widgetsRibbon");
  _tabBtn  = document.getElementById("widgetsTabBtn");

  _injectConfigStyles();
  _buildConfigModal();

  const map = {
    wgNavbarBtn:    WIDGETS.navbar,
    wgSliderBtn:    WIDGETS.slider,
    wgTabsBtn:      WIDGETS.tabs,
    wgAccordionBtn: WIDGETS.accordion,
    wgModalBtn:     WIDGETS.modal,
    wgCounterBtn:   WIDGETS.counter,
    wgProgressBtn:  WIDGETS.progress,
  };

  Object.entries(map).forEach(([btnId, def]) => {
    document.getElementById(btnId)?.addEventListener("click", () => _showConfig(def));
  });
}

export function toggleWidgetRibbon() {
  const hidden = _ribbon.classList.toggle("hidden");
  _tabBtn.classList.toggle("active", !hidden);
}

export function hideWidgetRibbon() {
  if (!_ribbon) return;
  _ribbon.classList.add("hidden");
  _tabBtn?.classList.remove("active");
}

// ── Config Modal styles (injected once) ───────────────────────────────────────

function _injectConfigStyles() {
  const style = document.createElement("style");
  style.textContent = `
.wg-cfg-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .2s}
.wg-cfg-overlay.open{opacity:1;pointer-events:auto}
.wg-cfg-dialog{background:#1a1a2e;border:1px solid #2a2a4a;border-radius:14px;width:480px;max-width:calc(100vw - 32px);max-height:calc(100vh - 48px);display:flex;flex-direction:column;box-shadow:0 32px 80px rgba(0,0,0,.6);transform:scale(.96) translateY(-8px);transition:transform .2s}
.wg-cfg-overlay.open .wg-cfg-dialog{transform:none}
.wg-cfg-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 13px;border-bottom:1px solid #252545;flex-shrink:0}
.wg-cfg-title{font-size:14px;font-weight:700;color:#e0e0ff}
.wg-cfg-close-btn{background:none;border:none;color:#555;font-size:20px;cursor:pointer;padding:2px 7px;border-radius:6px;line-height:1;transition:background .15s,color .15s}
.wg-cfg-close-btn:hover{background:#252545;color:#aaa}
.wg-cfg-body{padding:16px 20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:13px}
.wg-cfg-field{display:flex;flex-direction:column;gap:5px}
.wg-cfg-label{font-size:10px;font-weight:700;color:#7070a0;text-transform:uppercase;letter-spacing:.07em}
.wg-cfg-input,.wg-cfg-textarea{background:#111128;border:1px solid #2a2a4a;border-radius:7px;color:#d0d0f0;font-size:13px;padding:7px 10px;outline:none;transition:border-color .15s;font-family:inherit;width:100%;box-sizing:border-box}
.wg-cfg-input:focus,.wg-cfg-textarea:focus{border-color:#6366f1}
.wg-cfg-textarea{resize:vertical;min-height:70px}
.wg-cfg-color-row{display:flex;align-items:center;gap:8px}
.wg-cfg-color-swatch{position:relative;width:34px;height:34px;border-radius:7px;border:1px solid #2a2a4a;flex-shrink:0;overflow:hidden}
.wg-cfg-color-swatch input[type=color]{position:absolute;inset:0;width:100%;height:100%;border:none;padding:0;cursor:pointer;opacity:0}
.wg-cfg-list{display:flex;flex-direction:column;gap:6px}
.wg-cfg-list-item{display:flex;align-items:flex-start;gap:6px;background:#111128;border:1px solid #1e1e40;border-radius:8px;padding:8px}
.wg-cfg-list-item-fields{flex:1;display:flex;flex-direction:column;gap:5px}
.wg-cfg-rm-btn{background:#1a1a30;border:1px solid #2a2a4a;color:#555;border-radius:6px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:1px;transition:background .15s,color .15s}
.wg-cfg-rm-btn:hover{background:#2d1028;color:#e05}
.wg-cfg-add-btn{background:#111128;border:1px dashed #3a3a6a;color:#6366f1;border-radius:7px;padding:7px;cursor:pointer;font-size:12px;font-weight:600;transition:background .15s;width:100%;text-align:center}
.wg-cfg-add-btn:hover{background:#1a1a3a}
.wg-cfg-footer{display:flex;justify-content:flex-end;gap:10px;padding:13px 20px 17px;border-top:1px solid #252545;flex-shrink:0}
.wg-cfg-cancel{background:#1f1f3a;border:1px solid #2a2a4a;color:#777;border-radius:8px;padding:8px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
.wg-cfg-cancel:hover{background:#252545;color:#aaa}
.wg-cfg-insert{background:#6366f1;border:none;color:#fff;border-radius:8px;padding:8px 22px;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s}
.wg-cfg-insert:hover{background:#4f46e5}
.wg-cfg-range-row{display:flex;align-items:center;gap:10px}
.wg-cfg-range{flex:1;accent-color:#6366f1;cursor:pointer}
.wg-cfg-range-val{font-size:13px;font-weight:700;color:#6366f1;min-width:40px;text-align:right}
.wg-cfg-divider{border:none;border-top:1px solid #1e1e3a;margin:4px 0}
`;
  document.head.appendChild(style);
}

// ── Config Modal DOM ──────────────────────────────────────────────────────────

function _buildConfigModal() {
  _configModal = document.createElement("div");
  _configModal.className = "wg-cfg-overlay";
  _configModal.innerHTML = `
    <div class="wg-cfg-dialog">
      <div class="wg-cfg-header">
        <span class="wg-cfg-title" id="wgCfgTitle">Configure Widget</span>
        <button class="wg-cfg-close-btn" id="wgCfgClose">&times;</button>
      </div>
      <div class="wg-cfg-body" id="wgCfgBody"></div>
      <div class="wg-cfg-footer">
        <button class="wg-cfg-cancel" id="wgCfgCancel">Cancel</button>
        <button class="wg-cfg-insert" id="wgCfgInsert">&#10003; Insert Widget</button>
      </div>
    </div>`;
  document.body.appendChild(_configModal);

  document.getElementById("wgCfgClose").addEventListener("click",  _closeConfig);
  document.getElementById("wgCfgCancel").addEventListener("click", _closeConfig);
  _configModal.addEventListener("click", e => { if (e.target === _configModal) _closeConfig(); });
}

function _showConfig(def) {
  _currentDef = def;
  document.getElementById("wgCfgTitle").textContent = `Configure — ${def.name}`;
  const body = document.getElementById("wgCfgBody");
  body.innerHTML = "";
  _buildFields(def.fields, body);
  _configModal.classList.add("open");

  document.getElementById("wgCfgInsert").onclick = () => {
    const opts = _collectOpts(def.fields, body);
    _closeConfig();
    _insert(def, opts);
  };
}

function _closeConfig() {
  _configModal.classList.remove("open");
  _currentDef = null;
}

// ── Field Builder ─────────────────────────────────────────────────────────────

function _buildFields(fields, container) {
  fields.forEach(f => {
    const wrap = document.createElement("div");
    wrap.className = "wg-cfg-field";

    if (f.type === "divider") {
      const hr = document.createElement("hr");
      hr.className = "wg-cfg-divider";
      container.appendChild(hr);
      return;
    }

    const lbl = document.createElement("label");
    lbl.className = "wg-cfg-label";
    lbl.textContent = f.label;
    wrap.appendChild(lbl);

    if (f.type === "text") {
      const inp = _inp("text", f.key, f.default ?? "");
      wrap.appendChild(inp);

    } else if (f.type === "number") {
      const inp = _inp("number", f.key, f.default ?? 0);
      if (f.min != null) inp.min = f.min;
      if (f.max != null) inp.max = f.max;
      wrap.appendChild(inp);

    } else if (f.type === "textarea") {
      const ta = document.createElement("textarea");
      ta.className = "wg-cfg-textarea";
      ta.dataset.key = f.key;
      ta.value = f.default ?? "";
      wrap.appendChild(ta);

    } else if (f.type === "color") {
      wrap.appendChild(_colorField(f));

    } else if (f.type === "range") {
      wrap.appendChild(_rangeField(f));

    } else if (f.type === "list") {
      wrap.appendChild(_listField(f));
    }

    container.appendChild(wrap);
  });
}

function _inp(type, key, val) {
  const inp = document.createElement("input");
  inp.type = type;
  inp.className = "wg-cfg-input";
  inp.dataset.key = key;
  inp.value = val;
  return inp;
}

function _colorField(f) {
  const row = document.createElement("div");
  row.className = "wg-cfg-color-row";

  const swatch = document.createElement("div");
  swatch.className = "wg-cfg-color-swatch";
  swatch.style.background = f.default;

  const colorInp = document.createElement("input");
  colorInp.type = "color";
  colorInp.value = f.default;
  colorInp.dataset.key = f.key;
  swatch.appendChild(colorInp);

  const textInp = _inp("text", "__color_text__", f.default);
  textInp.style.flex = "1";

  colorInp.addEventListener("input", () => {
    swatch.style.background = colorInp.value;
    textInp.value = colorInp.value;
  });
  textInp.addEventListener("input", () => {
    const v = textInp.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      colorInp.value = v;
      swatch.style.background = v;
    }
  });

  row.appendChild(swatch);
  row.appendChild(textInp);
  return row;
}

function _rangeField(f) {
  const row = document.createElement("div");
  row.className = "wg-cfg-range-row";

  const range = document.createElement("input");
  range.type = "range";
  range.className = "wg-cfg-range";
  range.dataset.key = f.key;
  range.min  = f.min  ?? 0;
  range.max  = f.max  ?? 100;
  range.value = f.default ?? 50;

  const valSpan = document.createElement("span");
  valSpan.className = "wg-cfg-range-val";
  valSpan.textContent = (f.suffix ? `${range.value}${f.suffix}` : range.value);
  range.addEventListener("input", () => {
    valSpan.textContent = f.suffix ? `${range.value}${f.suffix}` : range.value;
  });

  row.appendChild(range);
  row.appendChild(valSpan);
  return row;
}

function _listField(f) {
  const container = document.createElement("div");
  container.className = "wg-cfg-list";
  container.dataset.key  = f.key;
  container.dataset.list = "true";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "wg-cfg-add-btn";
  addBtn.textContent = `+ Add ${f.itemLabel || "Item"}`;
  addBtn.addEventListener("click", () => _addListItem(f, container, addBtn, null));
  container.appendChild(addBtn);

  (f.default || []).forEach(vals => _addListItem(f, container, addBtn, vals));
  return container;
}

function _addListItem(f, container, addBtn, vals) {
  const item = document.createElement("div");
  item.className = "wg-cfg-list-item";

  const fieldsWrap = document.createElement("div");
  fieldsWrap.className = "wg-cfg-list-item-fields";

  f.schema.forEach(s => {
    const inp = document.createElement("input");
    inp.type = s.type === "number" ? "number" : "text";
    inp.className = "wg-cfg-input";
    inp.dataset.field = s.key;
    inp.placeholder = s.label;
    inp.value = vals?.[s.key] ?? s.default ?? "";
    if (s.type === "number") { inp.min = s.min ?? 0; inp.max = s.max ?? 9999; }
    fieldsWrap.appendChild(inp);
  });

  const rm = document.createElement("button");
  rm.type = "button";
  rm.className = "wg-cfg-rm-btn";
  rm.innerHTML = "&#215;";
  rm.addEventListener("click", () => item.remove());

  item.appendChild(fieldsWrap);
  item.appendChild(rm);
  container.insertBefore(item, addBtn);
}

// ── Options Collection ────────────────────────────────────────────────────────

function _collectOpts(fields, body) {
  const opts = {};
  fields.forEach(f => {
    if (f.type === "divider") return;

    if (f.type === "list") {
      const cont = body.querySelector(`[data-key="${f.key}"][data-list]`);
      opts[f.key] = Array.from(cont.querySelectorAll(".wg-cfg-list-item")).map(item => {
        const obj = {};
        f.schema.forEach(s => {
          const el = item.querySelector(`[data-field="${s.key}"]`);
          obj[s.key] = s.type === "number" ? +(el?.value || 0) : (el?.value || "");
        });
        return obj;
      });

    } else if (f.type === "color") {
      const colorInp = body.querySelector(`input[type=color][data-key="${f.key}"]`);
      opts[f.key] = colorInp?.value ?? f.default;

    } else if (f.type === "range") {
      const range = body.querySelector(`input[type=range][data-key="${f.key}"]`);
      opts[f.key] = range ? +range.value : (f.default ?? 0);

    } else if (f.type === "number") {
      const inp = body.querySelector(`[data-key="${f.key}"]`);
      opts[f.key] = inp ? +inp.value : (f.default ?? 0);

    } else {
      const inp = body.querySelector(`[data-key="${f.key}"]`);
      opts[f.key] = inp?.value ?? f.default ?? "";
    }
  });
  return opts;
}

// ── Insertion ─────────────────────────────────────────────────────────────────

function _uid() {
  return Math.random().toString(36).slice(2, 7);
}

function _esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function _insert(def, opts) {
  const id = _uid();

  // 1. Append HTML
  const currentHtml = elements.htmlInput.value;
  const newHtml = currentHtml + "\n\n" + def.html(id, opts);
  elements.htmlInput.value = newHtml;
  setPageHtml(getCurrentPage(), newHtml);

  // 2. Inject CSS once per widget type
  let css = getRawCss();
  const cssMarker = `/* @widget:${def.id} */`;
  if (!css.includes(cssMarker)) {
    css = css + "\n\n" + cssMarker + "\n" + def.css();
    setRawCss(css);
    elements.cssInput.value = css;
  }

  // 3. Append per-instance JS
  const file = getCurrentJsFile();
  let js = getJsFileContent(file);
  js = js + "\n\n" + def.js(id, opts);
  setJsFileContent(file, js);
  setRawJs(js);
  elements.jsInput.value = js;

  renderPreview();
  scheduleAutosave();
}

// ── Slide gradients ───────────────────────────────────────────────────────────

const SLIDE_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];

// ── Widget Definitions ────────────────────────────────────────────────────────

const WIDGETS = {

  // ── Navbar ──────────────────────────────────────────────────────────────────
  navbar: {
    id:   "navbar",
    name: "Navbar",
    fields: [
      { key: "brand", label: "Brand Name",       type: "text",  default: "Brand Name" },
      { key: "cta",   label: "CTA Button Text",  type: "text",  default: "Get Started" },
      { key: "bg",    label: "Background Color", type: "color", default: "#ffffff" },
      { key: "accent",label: "Accent Color",     type: "color", default: "#6366f1" },
      { type: "divider" },
      {
        key: "links", label: "Nav Links", type: "list", itemLabel: "Link",
        schema: [{ key: "text", label: "Link Text", default: "Page" }],
        default: [{ text: "Home" }, { text: "About" }, { text: "Services" }, { text: "Contact" }],
      },
    ],
    html: (id, opts) => {
      const links = (opts.links || []).map((l, i) =>
        `    <li><a href="#"${i === 0 ? ' class="wb-active"' : ""}>${_esc(l.text)}</a></li>`
      ).join("\n");
      const acc = opts.accent || "#6366f1";
      return `<nav class="wb-navbar" id="navbar-${id}" style="background:${opts.bg || "#fff"}">
  <a class="wb-nav-brand" href="#" style="color:${acc}">${_esc(opts.brand)}</a>
  <ul class="wb-nav-links" id="navlinks-${id}">
${links}
  </ul>
  <a class="wb-nav-cta" href="#" style="background:${acc}">${_esc(opts.cta)}</a>
  <button class="wb-nav-burger" id="burger-${id}" aria-label="Menu">
    <span class="wb-burger-bar"></span>
    <span class="wb-burger-bar"></span>
    <span class="wb-burger-bar"></span>
  </button>
</nav>`;
    },
    css: () => `.wb-navbar{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:64px;box-shadow:0 1px 0 rgba(0,0,0,.08);position:relative;z-index:50}
.wb-nav-brand{font-size:18px;font-weight:800;text-decoration:none;letter-spacing:-.02em}
.wb-nav-links{display:flex;list-style:none;gap:4px;margin:0;padding:0}
.wb-nav-links a{display:block;padding:7px 14px;color:#555;text-decoration:none;font-size:14px;font-weight:500;border-radius:7px;transition:background .15s,color .15s}
.wb-nav-links a:hover{background:#f4f4f8;color:#1a1a2e}
.wb-nav-links a.wb-active{background:#eef2ff;font-weight:700}
.wb-nav-cta{padding:9px 22px;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:filter .15s;white-space:nowrap}
.wb-nav-cta:hover{filter:brightness(1.1)}
.wb-nav-burger{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:8px;border-radius:7px;transition:background .15s}
.wb-nav-burger:hover{background:#f4f4f8}
.wb-burger-bar{display:block;width:22px;height:2px;background:#333;border-radius:2px;transition:transform .2s,opacity .2s;pointer-events:none}
@media(max-width:768px){.wb-nav-cta{display:none}.wb-nav-burger{display:flex}.wb-nav-links{display:none;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.1);padding:10px 16px 18px;gap:2px}.wb-nav-links.open{display:flex}}`,
    js: (id) => `(function(){
  var nav=document.getElementById('navbar-${id}');
  if(!nav)return;
  nav.addEventListener('click',function(e){
    if(e.target.closest('#burger-${id}')){
      var nl=document.getElementById('navlinks-${id}');
      if(nl)nl.classList.toggle('open');
    }
  },true);
})();`,
  },

  // ── Slider ───────────────────────────────────────────────────────────────────
  slider: {
    id:   "slider",
    name: "Image Slider",
    fields: [
      {
        key: "slides", label: "Slides", type: "list", itemLabel: "Slide",
        schema: [
          { key: "heading", label: "Heading", default: "Slide Heading" },
          { key: "sub",     label: "Subtitle", default: "Add your subtitle here" },
        ],
        default: [
          { heading: "Slide One",   sub: "Add your subtitle here" },
          { heading: "Slide Two",   sub: "Add your subtitle here" },
          { heading: "Slide Three", sub: "Add your subtitle here" },
        ],
      },
    ],
    html: (id, opts) => {
      const slides = opts.slides || [];
      const slideHtml = slides.map((s, i) =>
        `    <div class="wb-slide" style="background:${SLIDE_GRADIENTS[i % SLIDE_GRADIENTS.length]}">
      <span class="wb-slide-heading">${_esc(s.heading)}</span>
      <span class="wb-slide-sub">${_esc(s.sub)}</span>
    </div>`
      ).join("\n");
      const dotsHtml = slides.map((_, i) =>
        `    <button class="wb-dot${i === 0 ? " active" : ""}" aria-label="Slide ${i + 1}"></button>`
      ).join("\n");
      return `<div class="wb-slider" id="slider-${id}">
  <div class="wb-slider-track" id="track-${id}">
${slideHtml}
  </div>
  <button class="wb-slider-btn wb-slider-prev" id="prev-${id}" aria-label="Previous">&#8249;</button>
  <button class="wb-slider-btn wb-slider-next" id="next-${id}" aria-label="Next">&#8250;</button>
  <div class="wb-slider-dots" id="dots-${id}">
${dotsHtml}
  </div>
</div>`;
    },
    css: () => `.wb-slider{position:relative;overflow:hidden;border-radius:12px;user-select:none;background:#111}
.wb-slider-track{display:flex;transition:transform .45s cubic-bezier(.25,.1,.25,1)}
.wb-slide{min-width:100%;padding:90px 48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center}
.wb-slide-heading{font-size:28px;font-weight:800;color:#fff;letter-spacing:-.02em}
.wb-slide-sub{font-size:15px;color:rgba(255,255,255,.75)}
.wb-slider-btn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.2);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.25);color:#fff;width:44px;height:44px;font-size:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:50%;transition:background .2s;z-index:2;padding:0}
.wb-slider-btn:hover{background:rgba(255,255,255,.35)}
.wb-slider-prev{left:16px}.wb-slider-next{right:16px}
.wb-slider-dots{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px}
.wb-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.35);border:none;padding:0;cursor:pointer;transition:background .2s,transform .2s}
.wb-dot.active{background:#fff;transform:scale(1.35)}`,
    js: (id) => `(function(){
  var slider=document.getElementById('slider-${id}');
  var track=document.getElementById('track-${id}');
  if(!slider||!track)return;
  var dots=Array.from(slider.querySelectorAll('.wb-dot'));
  var n=track.children.length,cur=0;
  function go(i){cur=((i%n)+n)%n;track.style.transform='translateX(-'+(cur*100)+'%)';dots.forEach(function(d,j){d.classList.toggle('active',j===cur);});}
  slider.addEventListener('click',function(e){
    if(e.target.closest('.wb-slider-prev'))go(cur-1);
    else if(e.target.closest('.wb-slider-next'))go(cur+1);
    else{var dot=e.target.closest('.wb-dot');if(dot)go(dots.indexOf(dot));}
  },true);
  var auto=setInterval(function(){go(cur+1);},4500);
  slider.addEventListener('mouseenter',function(){clearInterval(auto);});
  slider.addEventListener('mouseleave',function(){auto=setInterval(function(){go(cur+1);},4500);});
})();`,
  },

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  tabs: {
    id:   "tabs",
    name: "Tab Panel",
    fields: [
      { key: "accent", label: "Accent Color", type: "color", default: "#6366f1" },
      { type: "divider" },
      {
        key: "tabs", label: "Tabs", type: "list", itemLabel: "Tab",
        schema: [
          { key: "label",   label: "Tab Label", default: "Tab" },
          { key: "content", label: "Content",   default: "Tab content goes here." },
        ],
        default: [
          { label: "Tab One",   content: "Content for Tab One. Click the tabs above to switch." },
          { label: "Tab Two",   content: "Content for Tab Two. Add text, images, or any HTML." },
          { label: "Tab Three", content: "Content for Tab Three. Each panel is fully editable." },
        ],
      },
    ],
    html: (id, opts) => {
      const tabs = opts.tabs || [];
      const acc  = opts.accent || "#6366f1";
      const btnHtml = tabs.map((t, i) =>
        `    <button class="wb-tab-btn${i === 0 ? " active" : ""}" style="${i === 0 ? `color:${acc};border-bottom-color:${acc}` : ""}">${_esc(t.label)}</button>`
      ).join("\n");
      const panelHtml = tabs.map((t, i) =>
        `    <div class="wb-tab-panel${i === 0 ? " active" : ""}"><p>${_esc(t.content)}</p></div>`
      ).join("\n");
      return `<div class="wb-tabs" id="tabs-${id}" data-accent="${_esc(acc)}">
  <div class="wb-tab-nav">
${btnHtml}
  </div>
  <div class="wb-tab-panels">
${panelHtml}
  </div>
</div>`;
    },
    css: () => `.wb-tabs{border-radius:10px;overflow:hidden;border:1px solid #e8eaed;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.wb-tab-nav{display:flex;background:#f8f9fb;border-bottom:1px solid #e8eaed;padding:6px 6px 0;gap:3px}
.wb-tab-btn{flex:1;padding:9px 16px;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:500;color:#666;border-radius:7px 7px 0 0;transition:background .15s,color .15s;border-bottom:2px solid transparent;white-space:nowrap}
.wb-tab-btn.active{background:#fff;font-weight:700}
.wb-tab-btn:hover:not(.active){background:rgba(0,0,0,.04);color:#333}
.wb-tab-panels{background:#fff}
.wb-tab-panel{display:none;padding:24px 26px;font-size:14px;color:#444;line-height:1.75}
.wb-tab-panel.active{display:block}`,
    js: (id) => `(function(){
  var root=document.getElementById('tabs-${id}');
  if(!root)return;
  var acc=root.dataset.accent||'#6366f1';
  var btns=Array.from(root.querySelectorAll('.wb-tab-btn'));
  var panels=Array.from(root.querySelectorAll('.wb-tab-panel'));
  root.addEventListener('click',function(e){
    var btn=e.target.closest('.wb-tab-btn');
    if(!btn)return;
    var i=btns.indexOf(btn);
    btns.forEach(function(b){b.classList.remove('active');b.style.color='';b.style.borderBottomColor='';});
    panels.forEach(function(p){p.classList.remove('active');});
    btn.classList.add('active');btn.style.color=acc;btn.style.borderBottomColor=acc;
    if(panels[i])panels[i].classList.add('active');
  },true);
})();`,
  },

  // ── Accordion ────────────────────────────────────────────────────────────────
  accordion: {
    id:   "accordion",
    name: "Accordion / FAQ",
    fields: [
      { key: "accent", label: "Accent Color", type: "color", default: "#6366f1" },
      { type: "divider" },
      {
        key: "items", label: "Accordion Items", type: "list", itemLabel: "Item",
        schema: [
          { key: "q", label: "Question / Heading", default: "Question here?" },
          { key: "a", label: "Answer / Body",       default: "Answer goes here." },
        ],
        default: [
          { q: "What is this accordion?",    a: "Click any header to expand its section. Great for FAQs." },
          { q: "How do I edit the content?", a: "Open the HTML editor and find the accordion elements." },
          { q: "Can I add more items?",      a: "Yes — use the config panel or duplicate items in the HTML." },
        ],
      },
    ],
    html: (id, opts) => {
      const items = opts.items || [];
      const acc   = opts.accent || "#6366f1";
      const itemHtml = items.map(item =>
        `  <div class="wb-acc-item">
    <button class="wb-acc-header">${_esc(item.q)} <span class="wb-acc-icon" style="color:${acc}">+</span></button>
    <div class="wb-acc-body"><div class="wb-acc-inner">${_esc(item.a)}</div></div>
  </div>`
      ).join("\n");
      return `<div class="wb-accordion" id="acc-${id}" data-accent="${_esc(acc)}">
${itemHtml}
</div>`;
    },
    css: () => `.wb-accordion{border-radius:10px;overflow:hidden;border:1px solid #e8eaed;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.wb-acc-item{border-bottom:1px solid #efefef}.wb-acc-item:last-child{border-bottom:none}
.wb-acc-header{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 20px;background:#fff;border:none;cursor:pointer;font-size:14px;font-weight:600;color:#1a1a2e;text-align:left;transition:background .15s}
.wb-acc-header:hover{background:#fafbfc}
.wb-acc-icon{font-size:20px;font-weight:300;flex-shrink:0;transition:transform .25s;line-height:1;pointer-events:none}
.wb-acc-header.open .wb-acc-icon{transform:rotate(45deg)}
.wb-acc-body{max-height:0;overflow:hidden;transition:max-height .32s ease}
.wb-acc-body.open{max-height:500px}
.wb-acc-inner{padding:2px 20px 18px;font-size:14px;color:#555;line-height:1.75}`,
    js: (id) => `(function(){
  var root=document.getElementById('acc-${id}');
  if(!root)return;
  root.addEventListener('click',function(e){
    var h=e.target.closest('.wb-acc-header');
    if(!h)return;
    var body=h.nextElementSibling,isOpen=h.classList.contains('open');
    Array.from(root.querySelectorAll('.wb-acc-header')).forEach(function(oh){
      oh.classList.remove('open');
      if(oh.nextElementSibling)oh.nextElementSibling.classList.remove('open');
    });
    if(!isOpen&&body){h.classList.add('open');body.classList.add('open');}
  },true);
})();`,
  },

  // ── Modal ────────────────────────────────────────────────────────────────────
  modal: {
    id:   "modal",
    name: "Modal Dialog",
    fields: [
      { key: "accent",       label: "Accent Color",     type: "color",    default: "#6366f1" },
      { type: "divider" },
      { key: "triggerText",  label: "Trigger Button",   type: "text",     default: "Open Modal" },
      { key: "title",        label: "Modal Title",      type: "text",     default: "Modal Title" },
      { key: "body",         label: "Body Text",        type: "textarea", default: "This is your modal content. Add text, forms, images — anything you need here." },
      { key: "primaryLabel", label: "Primary Button",   type: "text",     default: "Confirm" },
      { key: "cancelLabel",  label: "Cancel Button",    type: "text",     default: "Cancel" },
    ],
    html: (id, opts) => {
      const acc = opts.accent || "#6366f1";
      return `<button class="wb-modal-trigger" id="trigger-${id}" style="background:${acc}">${_esc(opts.triggerText)}</button>
<div class="wb-modal" id="modal-${id}">
  <div class="wb-modal-backdrop" id="mbackdrop-${id}"></div>
  <div class="wb-modal-dialog">
    <button class="wb-modal-close" id="mclose-${id}">&times;</button>
    <h2 class="wb-modal-title">${_esc(opts.title)}</h2>
    <p class="wb-modal-body">${_esc(opts.body)}</p>
    <div class="wb-modal-footer">
      <button class="wb-modal-btn wb-modal-secondary" id="mcancel-${id}">${_esc(opts.cancelLabel)}</button>
      <button class="wb-modal-btn wb-modal-primary" style="background:${acc}">${_esc(opts.primaryLabel)}</button>
    </div>
  </div>
</div>`;
    },
    css: () => `.wb-modal-trigger{display:inline-flex;align-items:center;padding:12px 28px;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;transition:filter .2s,transform .15s}
.wb-modal-trigger:hover{filter:brightness(1.1);transform:translateY(-1px)}
.wb-modal{display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;padding:20px}
.wb-modal.open{display:flex}
.wb-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px)}
.wb-modal-dialog{position:relative;background:#fff;border-radius:16px;padding:38px;max-width:500px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.3);animation:wbMdIn .2s ease}
@keyframes wbMdIn{from{opacity:0;transform:scale(.95) translateY(-12px)}to{opacity:1;transform:none}}
.wb-modal-close{position:absolute;top:15px;right:16px;background:#f0f0f5;border:none;border-radius:50%;width:30px;height:30px;font-size:18px;cursor:pointer;color:#777;display:flex;align-items:center;justify-content:center;transition:background .15s;line-height:1}
.wb-modal-close:hover{background:#e0e0ea;color:#333}
.wb-modal-title{margin:0 0 10px;font-size:22px;font-weight:800;color:#1a1a2e;letter-spacing:-.02em}
.wb-modal-body{font-size:15px;color:#555;line-height:1.7;margin:0 0 26px}
.wb-modal-footer{display:flex;justify-content:flex-end;gap:10px}
.wb-modal-btn{padding:10px 22px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:filter .15s}
.wb-modal-secondary{background:#f0f0f5;color:#444}.wb-modal-secondary:hover{background:#e2e2ea}
.wb-modal-primary{color:#fff}.wb-modal-primary:hover{filter:brightness(1.1)}`,
    js: (id) => `(function(){
  var modal=document.getElementById('modal-${id}');
  if(!modal)return;
  function open(){modal.classList.add('open');}
  function close(){modal.classList.remove('open');}
  document.addEventListener('click',function(e){
    if(e.target.closest('#trigger-${id}'))open();
    else if(e.target.closest('#mclose-${id}')||e.target.closest('#mcancel-${id}'))close();
    else if(e.target===document.getElementById('mbackdrop-${id}'))close();
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
})();`,
  },

  // ── Counter ──────────────────────────────────────────────────────────────────
  counter: {
    id:   "counter",
    name: "Stats Counter",
    fields: [
      { key: "accent", label: "Number Color", type: "color", default: "#6366f1" },
      { type: "divider" },
      {
        key: "stats", label: "Stats", type: "list", itemLabel: "Stat",
        schema: [
          { key: "target", label: "Number",   type: "number", min: 0, max: 999999, default: 100 },
          { key: "label",  label: "Label",    default: "Stat" },
          { key: "suffix", label: "Suffix (e.g. +, %)", default: "" },
        ],
        default: [
          { target: 1250, label: "Happy Clients",  suffix: "+" },
          { target: 340,  label: "Projects Done",  suffix: "" },
          { target: 99,   label: "Team Members",   suffix: "" },
          { target: 12,   label: "Years Active",   suffix: "+" },
        ],
      },
    ],
    html: (id, opts) => {
      const stats = opts.stats || [];
      const acc   = opts.accent || "#6366f1";
      const cardsHtml = stats.map(s =>
        `  <div class="wb-counter-card">
    <div class="wb-counter-num" data-target="${+s.target}" data-suffix="${_esc(s.suffix || "")}" style="color:${acc}">0</div>
    <div class="wb-counter-label">${_esc(s.label)}</div>
  </div>`
      ).join("\n");
      return `<div class="wb-counter-grid" id="counter-${id}">
${cardsHtml}
</div>`;
    },
    css: () => `.wb-counter-grid{display:flex;gap:20px;flex-wrap:wrap}
.wb-counter-card{flex:1;min-width:120px;text-align:center;padding:32px 16px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.07);border:1px solid #f0f0f5}
.wb-counter-num{font-size:44px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}
.wb-counter-label{font-size:12px;color:#999;margin-top:8px;font-weight:600;text-transform:uppercase;letter-spacing:.08em}`,
    js: (id) => `(function(){
  function animCount(el,target,suffix,dur){var start=0,step=target/(dur/16),t=setInterval(function(){start=Math.min(start+step,target);el.textContent=Math.round(start).toLocaleString()+suffix;if(start>=target)clearInterval(t);},16);}
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){document.querySelectorAll('#counter-${id} .wb-counter-num').forEach(function(el){animCount(el,+el.dataset.target,el.dataset.suffix||'',1500);});obs.disconnect();}});},{threshold:0});
  var el=document.getElementById('counter-${id}');if(el)obs.observe(el);
})();`,
  },

  // ── Progress Bars ────────────────────────────────────────────────────────────
  progress: {
    id:   "progress",
    name: "Progress Bars",
    fields: [
      { key: "accent", label: "Bar Color", type: "color", default: "#6366f1" },
      { type: "divider" },
      {
        key: "bars", label: "Progress Bars", type: "list", itemLabel: "Bar",
        schema: [
          { key: "label", label: "Label",      default: "Skill" },
          { key: "pct",   label: "Percentage", type: "number", min: 0, max: 100, default: 75 },
        ],
        default: [
          { label: "Web Design",  pct: 90 },
          { label: "Development", pct: 80 },
          { label: "Marketing",   pct: 65 },
        ],
      },
    ],
    html: (id, opts) => {
      const bars = opts.bars || [];
      const acc  = opts.accent || "#6366f1";
      const barsHtml = bars.map(b =>
        `  <div class="wb-progress-item">
    <div class="wb-progress-hdr">
      <span class="wb-progress-label">${_esc(b.label)}</span>
      <span class="wb-progress-pct" style="color:${acc}">${+b.pct}%</span>
    </div>
    <div class="wb-progress-track">
      <div class="wb-progress-bar" data-pct="${+b.pct}" style="background:${acc}"></div>
    </div>
  </div>`
      ).join("\n");
      return `<div class="wb-progress-list" id="progress-${id}">
${barsHtml}
</div>`;
    },
    css: () => `.wb-progress-list{display:flex;flex-direction:column;gap:18px}
.wb-progress-item{display:flex;flex-direction:column;gap:7px}
.wb-progress-hdr{display:flex;justify-content:space-between;align-items:center}
.wb-progress-label{font-size:13px;font-weight:700;color:#333}
.wb-progress-pct{font-size:12px;font-weight:700}
.wb-progress-track{height:8px;background:#f0f0f5;border-radius:99px;overflow:hidden}
.wb-progress-bar{height:100%;border-radius:99px;width:0;transition:width 1.2s cubic-bezier(.25,.1,.25,1)}`,
    js: (id) => `(function(){
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){document.querySelectorAll('#progress-${id} .wb-progress-bar').forEach(function(bar){bar.style.width=bar.dataset.pct+'%';});obs.disconnect();}});},{threshold:0});
  var el=document.getElementById('progress-${id}');if(el)obs.observe(el);
})();`,
  },

};
