import { state } from "../State/editorState.js";

const SNAP_THRESHOLD = 6; // px — how close before snapping kicks in

let guideLayer  = null;
let gridEnabled = false;
const GRID_SIZE = 20; // px

// ── Grid toggle ───────────────────────────────────────────────────────────────

export function toggleGrid() {
  gridEnabled = !gridEnabled;
  _applyGridOverlay();
  return gridEnabled;
}

export function isGridEnabled() { return gridEnabled; }

function _applyGridOverlay() {
  if (!state.iframeDoc) return;
  const body = state.iframeDoc.body;
  if (gridEnabled) {
    body.style.backgroundImage = [
      `linear-gradient(rgba(0,120,212,0.10) 1px, transparent 1px)`,
      `linear-gradient(90deg, rgba(0,120,212,0.10) 1px, transparent 1px)`,
    ].join(",");
    body.style.backgroundSize = `${GRID_SIZE}px ${GRID_SIZE}px`;
  } else {
    body.style.backgroundImage = "";
    body.style.backgroundSize  = "";
  }
}

// Called once per iframe load from setupIframe.js
export function initSnapGuides() {
  const prev = state.iframeDoc.getElementById("_snap-guides");
  if (prev) prev.remove();

  guideLayer = state.iframeDoc.createElement("div");
  guideLayer.id = "_snap-guides";
  Object.assign(guideLayer.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "99999",
    overflow: "hidden",
  });
  state.iframeDoc.body.appendChild(guideLayer);

  // Restore grid overlay if it was enabled before the iframe reloaded
  _applyGridOverlay();
}

// Wipe all visible guides (called every frame during drag and on mouseup)
export function clearGuides() {
  if (guideLayer) guideLayer.innerHTML = "";
}

// Core function: given a raw drag position, return the snapped position and
// draw red guide lines at every active snap position.
// Pass ctrlHeld=true to bypass snapping entirely.
export function computeSnap(dragEl, rawLeft, rawTop, ctrlHeld) {
  clearGuides();
  if (ctrlHeld) return { left: rawLeft, top: rawTop };

  const doc = state.iframeDoc;
  const win = state.iframeWindow;
  const cW  = doc.documentElement.clientWidth;   // visible canvas width
  const cH  = doc.documentElement.clientHeight;  // visible canvas height
  const dragW = dragEl.offsetWidth;
  const dragH = dragEl.offsetHeight;

  // ── Build snap candidate lists (in body/document coordinates) ────────────
  // Vertical guide candidates (fixed x positions)
  const xCands = [
    0,        // canvas left wall
    cW / 2,   // canvas horizontal center
    cW,       // canvas right wall
  ];

  // Horizontal guide candidates (fixed y positions)
  const yCands = [
    0,        // canvas top wall
    cH / 2,   // canvas vertical center
    cH,       // canvas bottom wall
  ];

  // Grid lines (when grid is enabled)
  if (gridEnabled) {
    for (let x = 0; x <= cW; x += GRID_SIZE) xCands.push(x);
    for (let y = 0; y <= cH; y += GRID_SIZE) yCands.push(y);
  }

  // Add each other draggable element's left, center, and right edges
  for (const el of doc.querySelectorAll(".draggable-item")) {
    if (el === dragEl) continue;
    const l = el.offsetLeft;
    const t = el.offsetTop;
    const r = l + el.offsetWidth;
    const b = t + el.offsetHeight;
    xCands.push(l, (l + r) / 2, r);
    yCands.push(t, (t + b) / 2, b);
  }

  // ── Snap each axis independently ─────────────────────────────────────────
  const xSnap = findSnap(rawLeft, dragW, xCands);
  const ySnap = findSnap(rawTop,  dragH, yCands);

  const left = xSnap !== null ? xSnap.pos : rawLeft;
  const top  = ySnap !== null ? ySnap.pos : rawTop;

  // Convert body coords → viewport coords for guide line placement
  const scrollX = win.scrollX || 0;
  const scrollY = win.scrollY || 0;

  if (xSnap !== null) drawVertical(xSnap.guide - scrollX);
  if (ySnap !== null) drawHorizontal(ySnap.guide - scrollY);

  return { left, top };
}

// ── Snap maths ────────────────────────────────────────────────────────────────

// Tests the element's three anchors (leading edge, center, trailing edge) against
// all candidates. Returns the closest snap within SNAP_THRESHOLD, or null.
function findSnap(rawPos, size, candidates) {
  const anchors = [
    { rawAnchor: rawPos,          offset: 0 },
    { rawAnchor: rawPos + size/2, offset: size / 2 },
    { rawAnchor: rawPos + size,   offset: size },
  ];

  let best     = null;
  let bestDist = SNAP_THRESHOLD + 1;

  for (const { rawAnchor, offset } of anchors) {
    for (const c of candidates) {
      const dist = Math.abs(rawAnchor - c);
      if (dist < bestDist) {
        bestDist = dist;
        best = {
          pos:   c - offset, // adjusted element position if snapped
          guide: c,          // where to draw the guide line
        };
      }
    }
  }

  return bestDist <= SNAP_THRESHOLD ? best : null;
}

// ── Guide line drawing ────────────────────────────────────────────────────────

// Vertical red line (spans full height, fixed x)
function drawVertical(viewportX) {
  if (!guideLayer) return;
  const line = state.iframeDoc.createElement("div");
  Object.assign(line.style, {
    position:   "absolute",
    top:        "0",
    bottom:     "0",
    left:       `${viewportX}px`,
    width:      "1px",
    background: "rgba(255, 40, 40, 0.9)",
    boxShadow:  "0 0 3px rgba(255, 40, 40, 0.5)",
  });
  guideLayer.appendChild(line);
}

// Horizontal red line (spans full width, fixed y)
function drawHorizontal(viewportY) {
  if (!guideLayer) return;
  const line = state.iframeDoc.createElement("div");
  Object.assign(line.style, {
    position:   "absolute",
    left:       "0",
    right:      "0",
    top:        `${viewportY}px`,
    height:     "1px",
    background: "rgba(255, 40, 40, 0.9)",
    boxShadow:  "0 0 3px rgba(255, 40, 40, 0.5)",
  });
  guideLayer.appendChild(line);
}
