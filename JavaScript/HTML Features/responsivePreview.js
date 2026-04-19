/**
 * responsivePreview.js
 *
 * Phone / tablet / desktop width presets for the preview iframe.
 * Clicking a device button constrains the iframe to that width and
 * centers it in the preview panel so it looks like a real device.
 */

import { elements } from "../DOM/elements.js";

const DEVICE_WIDTHS = {
  phone:   375,
  tablet:  768,
  desktop: null,   // full width
};

// ── Init ──────────────────────────────────────────────────────────────────────

export function initResponsivePreview() {
  elements.devicePhoneBtn.addEventListener("click",   () => setDevice("phone"));
  elements.deviceTabletBtn.addEventListener("click",  () => setDevice("tablet"));
  elements.deviceDesktopBtn.addEventListener("click", () => setDevice("desktop"));
}

// ── Core ──────────────────────────────────────────────────────────────────────

function setDevice(device) {
  const width = DEVICE_WIDTHS[device];
  const frame = elements.previewFrame;
  const panel = elements.previewPanel;

  if (width !== null) {
    frame.style.width      = width + "px";
    frame.style.flexShrink = "0";
    panel.style.justifyContent  = "center";
    panel.style.alignItems      = "flex-start";
    panel.style.backgroundColor = "#888";
  } else {
    frame.style.width      = "";
    frame.style.flexShrink = "";
    panel.style.justifyContent  = "";
    panel.style.alignItems      = "";
    panel.style.backgroundColor = "";
  }

  // Update active state on the three device buttons
  elements.devicePhoneBtn.classList.toggle("active",   device === "phone");
  elements.deviceTabletBtn.classList.toggle("active",  device === "tablet");
  elements.deviceDesktopBtn.classList.toggle("active", device === "desktop");
}
