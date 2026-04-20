/**
 * jsConsole.js
 *
 * Live console panel that captures console.log / warn / error / info output
 * and uncaught JS errors from the preview iframe.
 *
 * The renderPreview module injects a small interceptor <script> into every
 * iframe srcdoc that forwards each console call back to the parent window
 * via postMessage.  This module receives those messages and renders them
 * in a collapsible panel at the bottom of the preview area.
 *
 * A thin divider is inserted between render cycles so the user can tell
 * which log lines belong to the current render vs the previous one.
 */

import { elements } from "../DOM/elements.js";

let _isOpen = false;
let _hasOutput = false;   // true once at least one entry exists after last divider

// ── Public API ────────────────────────────────────────────────────────────────

export function toggleConsole() {
  _isOpen = !_isOpen;
  document.getElementById("jsConsolePanel").classList.toggle("open", _isOpen);
  elements.jsConsoleToggleBtn?.classList.toggle("active", _isOpen);
}

export function clearConsole() {
  const out = document.getElementById("jsConsoleOutput");
  if (out) out.innerHTML = "";
  _hasOutput = false;
}

/** Called by main.js on each iframe reload to visually separate render cycles. */
export function markRenderDivider() {
  if (!_hasOutput) return;   // nothing logged yet — skip clutter
  const out = document.getElementById("jsConsoleOutput");
  if (!out) return;
  const div = document.createElement("div");
  div.className = "jsc-divider";
  div.textContent = "re-render";
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
  _hasOutput = false;
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initJsConsole() {
  window.addEventListener("message", _onMessage);

  document.getElementById("jsConsoleClearBtn")
    ?.addEventListener("click", clearConsole);
  document.getElementById("jsConsoleCloseBtn")
    ?.addEventListener("click", () => { if (_isOpen) toggleConsole(); });

  elements.jsConsoleToggleBtn
    ?.addEventListener("click", toggleConsole);
}

// ── Private ───────────────────────────────────────────────────────────────────

function _onMessage(e) {
  if (!e.data || e.data.__from !== "ob-console") return;
  _appendEntry(e.data.level, e.data.args);
}

function _appendEntry(level, args) {
  const out = document.getElementById("jsConsoleOutput");
  if (!out) return;

  const entry = document.createElement("div");
  entry.className = `jsc-entry jsc-${level}`;

  const icon = document.createElement("span");
  icon.className = "jsc-icon";
  icon.textContent = level === "error" ? "✖" : level === "warn" ? "⚠" : "›";
  entry.appendChild(icon);

  const msg = document.createElement("span");
  msg.className = "jsc-msg";
  msg.textContent = (args || []).join(" ");
  entry.appendChild(msg);

  out.appendChild(entry);
  out.scrollTop = out.scrollHeight;
  _hasOutput = true;

  // Auto-open the panel on errors so the user notices
  if (level === "error" && !_isOpen) toggleConsole();
}
