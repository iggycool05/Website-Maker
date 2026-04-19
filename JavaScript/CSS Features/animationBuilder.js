/**
 * animationBuilder.js
 *
 * Advanced CSS Animation & Transition Builder modal.
 * Opened from the CSS Editor ribbon via "Animate" button.
 *
 * Two tabs:
 *   Transition — generates `transition: property duration timing delay;`
 *   Animation  — generates `@keyframes name { … }` + `animation: …;`
 *
 * Results are appended to the raw CSS store and immediately re-rendered.
 */

import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "./cssStore.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { scheduleAutosave } from "../Features/projectStorage.js";

// ── Animation presets ─────────────────────────────────────────────────────────

const PRESETS = {
  "Fade In": {
    name: "fade-in", duration: 400, durationUnit: "ms",
    timing: "ease", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "both",
    stops: [
      { pct: "0",   props: { opacity: "0" } },
      { pct: "100", props: { opacity: "1" } },
    ],
  },
  "Fade Out": {
    name: "fade-out", duration: 400, durationUnit: "ms",
    timing: "ease", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "both",
    stops: [
      { pct: "0",   props: { opacity: "1" } },
      { pct: "100", props: { opacity: "0" } },
    ],
  },
  "Slide Up": {
    name: "slide-up", duration: 400, durationUnit: "ms",
    timing: "ease", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "both",
    stops: [
      { pct: "0",   props: { transform: "translateY(24px)", opacity: "0" } },
      { pct: "100", props: { transform: "translateY(0)",    opacity: "1" } },
    ],
  },
  "Slide Down": {
    name: "slide-down", duration: 400, durationUnit: "ms",
    timing: "ease", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "both",
    stops: [
      { pct: "0",   props: { transform: "translateY(-24px)", opacity: "0" } },
      { pct: "100", props: { transform: "translateY(0)",      opacity: "1" } },
    ],
  },
  "Slide Left": {
    name: "slide-left", duration: 400, durationUnit: "ms",
    timing: "ease", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "both",
    stops: [
      { pct: "0",   props: { transform: "translateX(24px)", opacity: "0" } },
      { pct: "100", props: { transform: "translateX(0)",    opacity: "1" } },
    ],
  },
  "Zoom In": {
    name: "zoom-in", duration: 350, durationUnit: "ms",
    timing: "ease", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "both",
    stops: [
      { pct: "0",   props: { transform: "scale(0.8)", opacity: "0" } },
      { pct: "100", props: { transform: "scale(1)",   opacity: "1" } },
    ],
  },
  "Bounce": {
    name: "bounce", duration: 700, durationUnit: "ms",
    timing: "ease", delay: 0, delayUnit: "ms",
    iterations: "infinite", direction: "normal", fillMode: "none",
    stops: [
      { pct: "0",   props: { transform: "translateY(0)" } },
      { pct: "25",  props: { transform: "translateY(-22px)" } },
      { pct: "50",  props: { transform: "translateY(0)" } },
      { pct: "75",  props: { transform: "translateY(-11px)" } },
      { pct: "100", props: { transform: "translateY(0)" } },
    ],
  },
  "Spin": {
    name: "spin", duration: 1000, durationUnit: "ms",
    timing: "linear", delay: 0, delayUnit: "ms",
    iterations: "infinite", direction: "normal", fillMode: "none",
    stops: [
      { pct: "0",   props: { transform: "rotate(0deg)" } },
      { pct: "100", props: { transform: "rotate(360deg)" } },
    ],
  },
  "Pulse": {
    name: "pulse", duration: 800, durationUnit: "ms",
    timing: "ease-in-out", delay: 0, delayUnit: "ms",
    iterations: "infinite", direction: "alternate", fillMode: "none",
    stops: [
      { pct: "0",   props: { transform: "scale(1)" } },
      { pct: "100", props: { transform: "scale(1.06)" } },
    ],
  },
  "Shake": {
    name: "shake", duration: 450, durationUnit: "ms",
    timing: "ease-in-out", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "none",
    stops: [
      { pct: "0",   props: { transform: "translateX(0)" } },
      { pct: "15",  props: { transform: "translateX(-5px)" } },
      { pct: "30",  props: { transform: "translateX(5px)" } },
      { pct: "45",  props: { transform: "translateX(-5px)" } },
      { pct: "60",  props: { transform: "translateX(5px)" } },
      { pct: "75",  props: { transform: "translateX(-3px)" } },
      { pct: "90",  props: { transform: "translateX(3px)" } },
      { pct: "100", props: { transform: "translateX(0)" } },
    ],
  },
  "Flip": {
    name: "flip", duration: 600, durationUnit: "ms",
    timing: "ease-in-out", delay: 0, delayUnit: "ms",
    iterations: "1", direction: "normal", fillMode: "both",
    stops: [
      { pct: "0",   props: { transform: "perspective(400px) rotateY(0)" } },
      { pct: "40",  props: { transform: "perspective(400px) rotateY(-170deg)" } },
      { pct: "100", props: { transform: "perspective(400px) rotateY(-180deg)" } },
    ],
  },
};

// ── Module state ──────────────────────────────────────────────────────────────

let _tab   = "transition"; // "transition" | "animation"
let _stops = [];           // array of { pct, props: { prop: value } }

// ── Shorthand DOM accessor ────────────────────────────────────────────────────

const $id = id => document.getElementById(id);

// ── Tab switching ─────────────────────────────────────────────────────────────

function _switchTab(tab) {
  _tab = tab;
  $id("abTransitionTab").classList.toggle("active", tab === "transition");
  $id("abAnimationTab").classList.toggle("active",  tab === "animation");
  $id("abTransitionPanel").style.display = tab === "transition" ? "" : "none";
  $id("abAnimationPanel").style.display  = tab === "animation"  ? "" : "none";
  _updatePreview();
}

// ── Keyframe stop list ────────────────────────────────────────────────────────

function _renderStops() {
  const container = $id("abKeyframeStops");
  container.innerHTML = "";

  _stops.forEach((stop, i) => {
    const row = document.createElement("div");
    row.className = "ab-stop-row";

    const bgVal = stop.props["background-color"] || "#ffffff";
    const colVal = stop.props["color"] || "#000000";

    row.innerHTML = `
      <input type="number" class="ab-stop-pct" value="${stop.pct}" min="0" max="100" title="Stop position (%)">
      <span class="ab-stop-sep">%</span>
      <input type="text"   class="ab-stop-field" data-prop="transform"        value="${stop.props.transform        || ""}" placeholder="transform">
      <input type="text"   class="ab-stop-field" data-prop="opacity"          value="${stop.props.opacity          || ""}" placeholder="opacity">
      <label class="ab-stop-color-wrap" title="background-color">
        <input type="color" class="ab-stop-color" data-prop="background-color" value="${bgVal}">
        <span class="ab-stop-color-lbl">bg</span>
      </label>
      <label class="ab-stop-color-wrap" title="color">
        <input type="color" class="ab-stop-color" data-prop="color" value="${colVal}">
        <span class="ab-stop-color-lbl">fg</span>
      </label>
      <button class="ab-stop-remove" title="Remove stop">&#x2715;</button>
    `;

    // Sync any field change back to _stops[i]
    row.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("input", () => {
        _syncStopFromRow(row, i);
        _updatePreview();
      });
    });

    row.querySelector(".ab-stop-remove").addEventListener("click", () => {
      _stops.splice(i, 1);
      _renderStops();
      _updatePreview();
    });

    container.appendChild(row);
  });
}

function _syncStopFromRow(row, i) {
  const pctInput = row.querySelector(".ab-stop-pct");
  _stops[i].pct = pctInput.value;

  row.querySelectorAll("[data-prop]").forEach(inp => {
    const prop = inp.dataset.prop;
    const val  = inp.type === "color" ? inp.value : inp.value.trim();
    // Only store color fields if they differ from the default placeholder
    if (inp.type === "color") {
      // Store if color is not #ffffff/#000000 placeholder OR if there's already a value set
      if (val !== "#ffffff" && val !== "#000000") {
        _stops[i].props[prop] = val;
      } else if (prop in _stops[i].props) {
        // keep the existing value (user set it intentionally)
        _stops[i].props[prop] = val;
      }
    } else {
      if (val) _stops[i].props[prop] = val;
      else    delete _stops[i].props[prop];
    }
  });
}

// ── CSS generation ────────────────────────────────────────────────────────────

function _durStr(val, unit) {
  const n = parseFloat(val) || 0;
  return unit === "s" ? `${n}s` : `${n}ms`;
}

function _buildTransitionCss(cls) {
  const prop     = $id("abTrProperty").value;
  const dur      = _durStr($id("abTrDuration").value,  $id("abTrDurationUnit").value);
  const timing   = $id("abTrTiming").value;
  const delay    = _durStr($id("abTrDelay").value,     $id("abTrDelayUnit").value);

  return `.${cls} {\n  transition: ${prop} ${dur} ${timing} ${delay};\n}`;
}

function _buildAnimationCss(cls) {
  const name       = ($id("abAnName").value.trim() || "my-animation").replace(/\s+/g, "-");
  const dur        = _durStr($id("abAnDuration").value,  $id("abAnDurationUnit").value);
  const timing     = $id("abAnTiming").value;
  const delay      = _durStr($id("abAnDelay").value,     $id("abAnDelayUnit").value);
  const iterations = $id("abAnIterations").value.trim() || "1";
  const direction  = $id("abAnDirection").value;
  const fillMode   = $id("abAnFillMode").value;

  // @keyframes block
  const sortedStops = [..._stops].sort((a, b) => parseFloat(a.pct) - parseFloat(b.pct));
  const stopsStr = sortedStops.map(s => {
    const propLines = Object.entries(s.props)
      .filter(([, v]) => v)
      .map(([k, v]) => `    ${k}: ${v};`)
      .join("\n");
    return `  ${s.pct}% {\n${propLines || "    /* empty */"}\n  }`;
  }).join("\n");

  const keyframes  = `@keyframes ${name} {\n${stopsStr}\n}`;
  const shorthand  = `${name} ${dur} ${timing} ${delay} ${iterations} ${direction} ${fillMode}`;
  const classCss   = `.${cls} {\n  animation: ${shorthand};\n}`;

  return `${keyframes}\n\n${classCss}`;
}

function _updatePreview() {
  const rawClass  = $id("abTargetClass").value.trim().replace(/^\./, "");
  const className = rawClass || "my-class";
  try {
    const css = _tab === "transition"
      ? _buildTransitionCss(className)
      : _buildAnimationCss(className);
    $id("abCssPreview").textContent = css;
    $id("abError").textContent = "";
  } catch (e) {
    $id("abCssPreview").textContent = "";
  }
}

// ── Preset application ────────────────────────────────────────────────────────

function _applyPreset(presetName) {
  const p = PRESETS[presetName];
  if (!p) return;

  _switchTab("animation");

  $id("abAnName").value         = p.name;
  $id("abAnDuration").value     = p.duration;
  $id("abAnDurationUnit").value = p.durationUnit;
  $id("abAnTiming").value       = p.timing;
  $id("abAnDelay").value        = p.delay;
  $id("abAnDelayUnit").value    = p.delayUnit;
  $id("abAnIterations").value   = String(p.iterations);
  $id("abAnDirection").value    = p.direction;
  $id("abAnFillMode").value     = p.fillMode;

  _stops = p.stops.map(s => ({ pct: s.pct, props: { ...s.props } }));
  _renderStops();
  _updatePreview();
}

// ── Apply to project ──────────────────────────────────────────────────────────

function _applyToProject() {
  const rawClass = $id("abTargetClass").value.trim().replace(/^\./, "");
  if (!rawClass) {
    $id("abError").textContent = "Enter a target class name first.";
    return;
  }

  const css = _tab === "transition"
    ? _buildTransitionCss(rawClass)
    : _buildAnimationCss(rawClass);

  const sep = getRawCss().trimEnd().length > 0 ? "\n\n" : "";
  setRawCss(getRawCss().trimEnd() + sep + css + "\n");
  renderPreview();
  scheduleAutosave();
  _closeModal();
}

// ── Modal lifecycle ───────────────────────────────────────────────────────────

function _closeModal() {
  $id("animBuilderModal").classList.remove("open");
}

export function openAnimationBuilder() {
  // Pre-fill target class from the CSS class picker if one is selected
  const picked = elements.cssClassInput?.value.trim() || "";
  $id("abTargetClass").value = picked;

  // Reset to transition tab with clean defaults
  _switchTab("transition");

  $id("abTrProperty").value     = "all";
  $id("abTrDuration").value     = 300;
  $id("abTrDurationUnit").value = "ms";
  $id("abTrTiming").value       = "ease";
  $id("abTrDelay").value        = 0;
  $id("abTrDelayUnit").value    = "ms";

  $id("abAnName").value         = "";
  $id("abAnDuration").value     = 500;
  $id("abAnDurationUnit").value = "ms";
  $id("abAnTiming").value       = "ease";
  $id("abAnDelay").value        = 0;
  $id("abAnDelayUnit").value    = "ms";
  $id("abAnIterations").value   = "1";
  $id("abAnDirection").value    = "normal";
  $id("abAnFillMode").value     = "none";

  _stops = [
    { pct: "0",   props: {} },
    { pct: "100", props: {} },
  ];
  _renderStops();

  $id("abError").textContent = "";
  _updatePreview();

  $id("animBuilderModal").classList.add("open");
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initAnimationBuilder() {
  // Tab buttons
  $id("abTransitionTab").addEventListener("click", () => _switchTab("transition"));
  $id("abAnimationTab").addEventListener("click",  () => _switchTab("animation"));

  // Live preview — listen on all fields
  const liveIds = [
    "abTargetClass",
    "abTrProperty", "abTrDuration", "abTrDurationUnit", "abTrTiming", "abTrDelay", "abTrDelayUnit",
    "abAnName", "abAnDuration", "abAnDurationUnit", "abAnTiming", "abAnDelay", "abAnDelayUnit",
    "abAnIterations", "abAnDirection", "abAnFillMode",
  ];
  liveIds.forEach(id => {
    $id(id)?.addEventListener("input",  _updatePreview);
    $id(id)?.addEventListener("change", _updatePreview);
  });

  // Add keyframe stop
  $id("abAddStopBtn").addEventListener("click", () => {
    _stops.push({ pct: "50", props: {} });
    _renderStops();
    _updatePreview();
  });

  // Preset pills
  document.querySelectorAll(".ab-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => _applyPreset(btn.dataset.preset));
  });

  // Apply / Cancel / overlay-click
  $id("abApplyBtn").addEventListener("click", _applyToProject);
  $id("abCancelBtn").addEventListener("click", _closeModal);
  $id("animBuilderClose").addEventListener("click", _closeModal);
  $id("animBuilderModal").addEventListener("click", e => {
    if (e.target === $id("animBuilderModal")) _closeModal();
  });

  // Ribbon "Animate" button
  $id("animBuilderBtn")?.addEventListener("click", openAnimationBuilder);
}
