import { getRawJs, setRawJs } from "./jsStore.js";
import { elements } from "../DOM/elements.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { scheduleSnapshot } from "../Utils/undoRedo.js";
import { scheduleAutosave } from "../Features/projectStorage.js";

// ── Template definitions ──────────────────────────────────────────────────────

const JS_TEMPLATES = [
  // ── UI ───────────────────────────────────────────────────────────────────────
  {
    name: "Dark Mode Toggle",
    category: "UI",
    icon: "◑",
    description: "Toggle dark/light mode on the page and save preference to localStorage.",
    html: `<button id="dark-toggle" style="padding:8px 18px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;">
  🌙 Toggle Dark Mode
</button>`,
    js: `const darkToggleBtn = document.querySelector("#dark-toggle");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
}

darkToggleBtn?.addEventListener("click", () => {
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
});`,
  },
  {
    name: "Hamburger Menu",
    category: "UI",
    icon: "≡",
    description: "Toggle a mobile navigation menu open and closed.",
    html: `<style>
  #nav-menu { display:none; flex-direction:column; gap:8px; padding:12px; background:#f9fafb; }
  #nav-menu.open { display:flex; }
  #hamburger.open { background:#e5e7eb; }
</style>
<header style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #e5e7eb;">
  <span style="font-weight:700;">My Site</span>
  <button id="hamburger" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-size:18px;background:none;">&#9776;</button>
</header>
<nav id="nav-menu">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>`,
    js: `const hamburger = document.querySelector("#hamburger");
const navMenu    = document.querySelector("#nav-menu");

hamburger?.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navMenu?.classList.toggle("open");
});

navMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navMenu.classList.remove("open");
  });
});`,
  },
  {
    name: "Scroll to Top Button",
    category: "UI",
    icon: "↑",
    description: "Show a button when scrolled down; click to smooth-scroll back to top.",
    html: `<style>
  #scroll-top-btn { display:none; position:fixed; bottom:24px; right:24px; z-index:999; }
  #scroll-top-btn.visible { display:block; }
</style>
<button id="scroll-top-btn" style="padding:10px 14px;background:#1f2937;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:18px;">&#8679;</button>`,
    js: `const scrollTopBtn = document.querySelector("#scroll-top-btn");

window.addEventListener("scroll", () => {
  scrollTopBtn?.classList.toggle("visible", window.scrollY > 300);
});

scrollTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});`,
  },
  {
    name: "Modal Open / Close",
    category: "UI",
    icon: "⧠",
    description: "Open and close a modal dialog. Closes on backdrop click or Escape key.",
    html: `<style>
  #my-modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); place-items:center; z-index:1000; }
  #my-modal.open { display:grid; }
</style>
<button id="open-modal" style="padding:10px 20px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;">Open Modal</button>

<div id="my-modal">
  <div style="background:#fff;padding:32px;border-radius:12px;max-width:420px;width:90%;position:relative;">
    <h2 style="margin-top:0;">Modal Title</h2>
    <p style="color:#6b7280;">Your modal content goes here.</p>
    <button id="close-modal" style="padding:8px 18px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;">Close</button>
  </div>
</div>`,
    js: `const modalOpenBtn  = document.querySelector("#open-modal");
const modalCloseBtn = document.querySelector("#close-modal");
const modal         = document.querySelector("#my-modal");

function openModal()  { modal?.classList.add("open"); }
function closeModal() { modal?.classList.remove("open"); }

modalOpenBtn?.addEventListener("click", openModal);
modalCloseBtn?.addEventListener("click", closeModal);
modal?.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });`,
  },
  {
    name: "Tabs Panel",
    category: "UI",
    icon: "⊟",
    description: "Switch between tab panels by clicking tab buttons.",
    html: `<style>
  .tab-panel { display:none; }
  .tab-panel.active { display:block; }
  .tab-btn { padding:8px 18px; border:none; border-bottom:2px solid transparent; background:none; cursor:pointer; font-family:inherit; font-size:13px; color:#6b7280; }
  .tab-btn.active { color:#f59e0b; border-bottom-color:#f59e0b; font-weight:600; }
</style>
<div style="border-bottom:1px solid #e5e7eb;display:flex;gap:4px;margin-bottom:12px;">
  <button class="tab-btn active" data-target="#tab-one">Tab 1</button>
  <button class="tab-btn" data-target="#tab-two">Tab 2</button>
  <button class="tab-btn" data-target="#tab-three">Tab 3</button>
</div>
<div id="tab-one" class="tab-panel active"><p>Content for Tab 1.</p></div>
<div id="tab-two" class="tab-panel"><p>Content for Tab 2.</p></div>
<div id="tab-three" class="tab-panel"><p>Content for Tab 3.</p></div>`,
    js: `const tabBtns   = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(btn.dataset.target)?.classList.add("active");
  });
});`,
  },
  {
    name: "Accordion",
    category: "UI",
    icon: "⊕",
    description: "Expand and collapse accordion items. Only one item open at a time.",
    html: `<style>
  .accordion-body { max-height:0; overflow:hidden; transition:max-height 0.3s ease; }
  .accordion-item.open .accordion-header { background:#f3f4f6; font-weight:600; }
</style>
<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;max-width:520px;">
  <div class="accordion-item">
    <button class="accordion-header" style="width:100%;text-align:left;padding:14px 16px;background:#fafafa;border:none;border-bottom:1px solid #e5e7eb;cursor:pointer;font-family:inherit;font-size:14px;">Section 1 &#9660;</button>
    <div class="accordion-body"><p style="padding:14px 16px;margin:0;color:#374151;">Content for section 1.</p></div>
  </div>
  <div class="accordion-item">
    <button class="accordion-header" style="width:100%;text-align:left;padding:14px 16px;background:#fafafa;border:none;border-bottom:1px solid #e5e7eb;cursor:pointer;font-family:inherit;font-size:14px;">Section 2 &#9660;</button>
    <div class="accordion-body"><p style="padding:14px 16px;margin:0;color:#374151;">Content for section 2.</p></div>
  </div>
  <div class="accordion-item">
    <button class="accordion-header" style="width:100%;text-align:left;padding:14px 16px;background:#fafafa;border:none;cursor:pointer;font-family:inherit;font-size:14px;">Section 3 &#9660;</button>
    <div class="accordion-body"><p style="padding:14px 16px;margin:0;color:#374151;">Content for section 3.</p></div>
  </div>
</div>`,
    js: `document.querySelectorAll(".accordion-item").forEach(item => {
  item.querySelector(".accordion-header")?.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".accordion-item").forEach(i => {
      i.classList.remove("open");
      const b = i.querySelector(".accordion-body");
      if (b) b.style.maxHeight = "0";
    });

    if (!isOpen) {
      item.classList.add("open");
      const body = item.querySelector(".accordion-body");
      if (body) body.style.maxHeight = body.scrollHeight + "px";
    }
  });
});`,
  },

  // ── Forms ────────────────────────────────────────────────────────────────────
  {
    name: "Form Validation",
    category: "Forms",
    icon: "✓",
    description: "Validate required fields and show inline error messages on submit.",
    html: `<style>
  .error { border-color:#ef4444 !important; }
  [data-error] { color:#ef4444; font-size:11px; min-height:15px; display:block; margin-top:2px; }
</style>
<form id="my-form" style="display:flex;flex-direction:column;gap:14px;max-width:400px;padding:24px;border:1px solid #e5e7eb;border-radius:10px;">
  <h3 style="margin:0 0 4px;">Contact Form</h3>
  <div>
    <input type="text" name="name" required placeholder="Your name" style="width:100%;padding:9px 11px;border:1px solid #d1d5db;border-radius:5px;font-family:inherit;box-sizing:border-box;" />
    <span data-error="name"></span>
  </div>
  <div>
    <input type="email" name="email" required placeholder="Email address" style="width:100%;padding:9px 11px;border:1px solid #d1d5db;border-radius:5px;font-family:inherit;box-sizing:border-box;" />
    <span data-error="email"></span>
  </div>
  <button type="submit" style="padding:10px 20px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-size:14px;">Submit</button>
</form>`,
    js: `document.querySelector("#my-form")?.addEventListener("submit", e => {
  e.preventDefault();
  let valid = true;

  e.target.querySelectorAll("[required]").forEach(field => {
    const errEl = document.querySelector(\`[data-error="\${field.name}"]\`);
    if (!field.value.trim()) {
      valid = false;
      field.classList.add("error");
      if (errEl) errEl.textContent = \`\${field.name} is required.\`;
    } else {
      field.classList.remove("error");
      if (errEl) errEl.textContent = "";
    }
  });

  if (valid) {
    console.log("Form is valid — ready to submit.");
    // e.target.submit();
  }
});`,
  },
  {
    name: "Character Counter",
    category: "Forms",
    icon: "#",
    description: "Count characters in a textarea and show how many remain.",
    html: `<div style="max-width:420px;display:flex;flex-direction:column;gap:6px;">
  <label style="font-family:inherit;font-size:13px;font-weight:600;color:#374151;">Your Message</label>
  <textarea id="message-input" placeholder="Type your message here (max 200 characters)..."
    style="padding:10px;border:1px solid #d1d5db;border-radius:6px;resize:vertical;min-height:110px;font-family:inherit;font-size:13px;line-height:1.5;"></textarea>
  <span id="char-count" style="font-size:12px;color:#6b7280;text-align:right;">200 characters remaining</span>
</div>`,
    js: `const msgInput  = document.querySelector("#message-input");
const charCount = document.querySelector("#char-count");
const MAX_CHARS = 200;

msgInput?.addEventListener("input", () => {
  const remaining = MAX_CHARS - msgInput.value.length;
  if (charCount) {
    charCount.textContent = \`\${remaining} characters remaining\`;
    charCount.style.color = remaining < 20 ? "#ef4444" : "#6b7280";
  }
  if (msgInput.value.length > MAX_CHARS) {
    msgInput.value = msgInput.value.slice(0, MAX_CHARS);
  }
});`,
  },
  {
    name: "Copy to Clipboard",
    category: "Forms",
    icon: "⎘",
    description: "Copy text from an input or element to the clipboard on button click.",
    html: `<div style="display:flex;gap:8px;max-width:420px;align-items:center;">
  <input id="copy-target" type="text" value="Text to copy goes here"
    style="flex:1;padding:9px 11px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:13px;" />
  <button id="copy-btn" style="padding:9px 18px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;white-space:nowrap;">Copy</button>
</div>`,
    js: `document.querySelector("#copy-btn")?.addEventListener("click", async function () {
  const target = document.querySelector("#copy-target");
  const text   = target?.value ?? target?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(text);
    this.textContent = "Copied!";
    setTimeout(() => { this.textContent = "Copy"; }, 1500);
  } catch (err) {
    console.error("Copy failed:", err);
  }
});`,
  },

  // ── Navigation ───────────────────────────────────────────────────────────────
  {
    name: "Smooth Scroll to Anchor",
    category: "Navigation",
    icon: "↡",
    description: "Smoothly scroll to anchor targets when navigation links are clicked.",
    html: `<nav style="position:sticky;top:0;background:#fff;padding:12px 24px;display:flex;gap:20px;border-bottom:1px solid #e5e7eb;z-index:100;">
  <a href="#section-one" style="text-decoration:none;color:#374151;">Section 1</a>
  <a href="#section-two" style="text-decoration:none;color:#374151;">Section 2</a>
  <a href="#section-three" style="text-decoration:none;color:#374151;">Section 3</a>
</nav>
<section id="section-one" style="height:400px;padding:40px;background:#f9fafb;"><h2>Section 1</h2></section>
<section id="section-two" style="height:400px;padding:40px;background:#f3f4f6;"><h2>Section 2</h2></section>
<section id="section-three" style="height:400px;padding:40px;background:#f9fafb;"><h2>Section 3</h2></section>`,
    js: `document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});`,
  },
  {
    name: "Sticky Navbar",
    category: "Navigation",
    icon: "📌",
    description: "Add a 'scrolled' class to the navbar after scrolling past a threshold.",
    html: `<style>
  #navbar { transition:box-shadow 0.25s,background 0.25s; }
  #navbar.scrolled { box-shadow:0 2px 16px rgba(0,0,0,0.1); background:#fff; }
</style>
<nav id="navbar" style="position:sticky;top:0;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;">
  <span style="font-weight:700;font-size:16px;">My Site</span>
  <div style="display:flex;gap:20px;">
    <a href="#" style="text-decoration:none;color:#374151;">Home</a>
    <a href="#" style="text-decoration:none;color:#374151;">About</a>
    <a href="#" style="text-decoration:none;color:#374151;">Contact</a>
  </div>
</nav>
<div style="height:1200px;padding:40px;background:#f9fafb;"><p>Scroll down to see the sticky effect.</p></div>`,
    js: `const navbar    = document.querySelector("#navbar");
const THRESHOLD = 80;

window.addEventListener("scroll", () => {
  navbar?.classList.toggle("scrolled", window.scrollY > THRESHOLD);
});`,
  },
  {
    name: "Active Nav on Scroll",
    category: "Navigation",
    icon: "◉",
    description: "Highlight the nav link whose section is currently visible in the viewport.",
    html: `<style>
  .nav-links a { text-decoration:none; color:#374151; padding:4px 2px; border-bottom:2px solid transparent; transition:color 0.15s,border-color 0.15s; }
  .nav-links a.active { color:#f59e0b; border-bottom-color:#f59e0b; font-weight:600; }
</style>
<nav style="position:sticky;top:0;background:#fff;padding:12px 28px;border-bottom:1px solid #e5e7eb;z-index:100;">
  <div class="nav-links" style="display:flex;gap:24px;">
    <a href="#home">Home</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
  </div>
</nav>
<section id="home"    style="height:500px;padding:40px;background:#f9fafb;"><h2>Home</h2></section>
<section id="about"   style="height:500px;padding:40px;background:#f3f4f6;"><h2>About</h2></section>
<section id="contact" style="height:500px;padding:40px;background:#f9fafb;"><h2>Contact</h2></section>`,
    js: `const sections  = document.querySelectorAll("section[id]");
const navLinks  = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let currentId = "";
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 80) currentId = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === \`#\${currentId}\`);
  });
});`,
  },

  // ── Utilities ────────────────────────────────────────────────────────────────
  {
    name: "Countdown Timer",
    category: "Utilities",
    icon: "⏱",
    description: "Countdown to a target date and display days, hours, minutes, seconds.",
    html: `<div style="text-align:center;padding:40px 24px;background:#1f2937;color:#fff;border-radius:12px;max-width:380px;">
  <p style="margin:0 0 12px;font-size:14px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Launching In</p>
  <div id="countdown" style="font-size:36px;font-weight:700;letter-spacing:4px;font-variant-numeric:tabular-nums;">--d --h --m --s</div>
</div>`,
    js: `const COUNTDOWN_TARGET = new Date("2026-01-01T00:00:00");

function updateCountdown() {
  const diff = COUNTDOWN_TARGET - Date.now();
  if (diff <= 0) {
    const el = document.querySelector("#countdown");
    if (el) el.textContent = "Event has started!";
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);
  const el = document.querySelector("#countdown");
  if (el) el.textContent = \`\${d}d \${h}h \${m}m \${s}s\`;
}

updateCountdown();
setInterval(updateCountdown, 1000);`,
  },
  {
    name: "Local Storage Helper",
    category: "Utilities",
    icon: "💾",
    description: "Save and load any value to/from localStorage with JSON serialization.",
    html: null,
    js: `function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("saveData failed:", e);
  }
}

function loadData(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error("loadData failed:", e);
    return defaultValue;
  }
}

// Usage:
// saveData("user", { name: "Alice", score: 42 });
// const user = loadData("user", {});
// console.log(user.name);`,
  },
  {
    name: "Toast Notification",
    category: "Utilities",
    icon: "🔔",
    description: "Show a styled toast message that auto-dismisses after a few seconds.",
    html: `<button onclick="showToast('Hello! This is a toast.', 'success')"
  style="padding:10px 20px;background:#22c55e;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;margin-right:8px;">
  ✓ Success Toast
</button>
<button onclick="showToast('Something went wrong.', 'error')"
  style="padding:10px 20px;background:#ef4444;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;margin-right:8px;">
  ✕ Error Toast
</button>
<button onclick="showToast('Update available.')"
  style="padding:10px 20px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;">
  ℹ Info Toast
</button>`,
    js: `function showToast(message, type = "info", duration = 3000) {
  document.querySelector(".toast-notification")?.remove();
  const colors = { success: "#22c55e", error: "#ef4444", info: "#1f2937" };
  const toast  = document.createElement("div");
  toast.className  = "toast-notification";
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed", bottom: "24px", right: "24px",
    padding: "12px 20px", borderRadius: "6px",
    fontFamily: "sans-serif", fontSize: "14px", fontWeight: "500",
    color: "#fff", zIndex: "9999",
    background: colors[type] ?? colors.info,
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// Usage:
// showToast("Saved!", "success");
// showToast("Something went wrong.", "error");
// showToast("Update available.");`,
  },
];

// ── All available JS event types ──────────────────────────────────────────────

const EVENT_TYPES = [
  { group: "Mouse",    events: ["click","dblclick","mousedown","mouseup","mouseenter","mouseleave","mouseover","mouseout","mousemove","contextmenu","wheel"] },
  { group: "Keyboard", events: ["keydown","keyup","keypress"] },
  { group: "Form",     events: ["submit","input","change","focus","blur","reset","select","focusin","focusout"] },
  { group: "Window / Document", events: ["scroll","resize","load","DOMContentLoaded","beforeunload","hashchange","popstate"] },
  { group: "Drag & Drop", events: ["dragstart","drag","dragend","dragenter","dragleave","dragover","drop"] },
  { group: "Touch",    events: ["touchstart","touchend","touchmove","touchcancel"] },
  { group: "Pointer",  events: ["pointerdown","pointerup","pointermove","pointerenter","pointerleave","pointercancel"] },
  { group: "Media",    events: ["play","pause","ended","timeupdate","volumechange","seeking","seeked","loadeddata","canplay"] },
  { group: "Clipboard",events: ["copy","cut","paste"] },
  { group: "Animation / Transition", events: ["animationstart","animationend","animationiteration","transitionend","transitionstart"] },
  { group: "Document", events: ["visibilitychange","fullscreenchange","selectionchange"] },
];

// ── State ─────────────────────────────────────────────────────────────────────

let _currentMode  = "snippets";
let _wireTemplate = null;

// ── Init / open / close ───────────────────────────────────────────────────────

export function initJsLibrary() {
  const btn      = document.getElementById("jsLibraryBtn");
  const modal    = document.getElementById("jsLibraryModal");
  const closeBtn = document.getElementById("jsLibCloseBtn");

  if (!btn || !modal) return;

  btn.addEventListener("click", openJsLibrary);
  closeBtn?.addEventListener("click", closeJsLibrary);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeJsLibrary();
  });
  modal.addEventListener("keydown", e => {
    if (e.key === "Escape") closeJsLibrary();
  });

  modal.querySelectorAll(".jl-cat-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      modal.querySelectorAll(".jl-cat-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _renderList(tab.dataset.cat);
    });
  });

  document.getElementById("jlModeSnippets")?.addEventListener("click", () => _setMode("snippets"));
  document.getElementById("jlModeWire")?.addEventListener("click",     () => _setMode("wire"));

  _buildEventTypeSelect();
  document.getElementById("jlTriggerSel")?.addEventListener("input",  _updateWirePreview);
  document.getElementById("jlEventType")?.addEventListener("change",  _updateWirePreview);
  document.getElementById("jlWireInsertBtn")?.addEventListener("click", _insertWiredCode);

  _renderList("All");
}

export function openJsLibrary() {
  const modal = document.getElementById("jsLibraryModal");
  if (!modal) return;
  modal.querySelectorAll(".jl-cat-tab").forEach(t => t.classList.remove("active"));
  modal.querySelector('[data-cat="All"]')?.classList.add("active");
  _renderList("All");
  modal.classList.add("open");
}

function closeJsLibrary() {
  document.getElementById("jsLibraryModal")?.classList.remove("open");
}

// ── Mode switching ────────────────────────────────────────────────────────────

function _setMode(mode) {
  _currentMode = mode;

  const box   = document.getElementById("jsLibBox");
  const panel = document.getElementById("jlWirePanel");

  document.getElementById("jlModeSnippets")?.classList.toggle("active", mode === "snippets");
  document.getElementById("jlModeWire")?.classList.toggle("active",     mode === "wire");
  box?.classList.toggle("wire-mode", mode === "wire");
  panel?.classList.toggle("hidden", mode === "snippets");

  if (mode === "snippets") {
    _wireTemplate = null;
    document.getElementById("jlWirePlaceholder")?.classList.remove("hidden");
    document.getElementById("jlWireConfig")?.classList.add("hidden");
  }

  const activeTab = document.querySelector(".jl-cat-tab.active");
  _renderList(activeTab?.dataset.cat || "All");
}

// ── Wire panel ────────────────────────────────────────────────────────────────

function _openWireConfig(template) {
  _wireTemplate = template;

  document.getElementById("jlWirePlaceholder")?.classList.add("hidden");
  document.getElementById("jlWireConfig")?.classList.remove("hidden");

  document.getElementById("jlWireIcon").textContent = template.icon;
  document.getElementById("jlWireName").textContent = template.name;
  document.getElementById("jlWireDesc").textContent = template.description;

  const triggerInput = document.getElementById("jlTriggerSel");
  if (triggerInput) triggerInput.value = "";

  // Show / hide the HTML preview section depending on whether this template has HTML
  const htmlField = document.getElementById("jlWireHtmlPreview")?.closest(".jl-wire-field");
  if (htmlField) htmlField.style.display = template.html ? "" : "none";

  if (template.html) {
    const htmlPreview = document.getElementById("jlWireHtmlPreview");
    if (htmlPreview) htmlPreview.textContent = template.html;
  }

  _populateSelectorSuggestions();
  _updateWirePreview();

  document.querySelectorAll(".jl-card").forEach(c => c.classList.remove("wire-selected"));
  document.querySelectorAll(`.jl-card[data-index="${JS_TEMPLATES.indexOf(template)}"]`)
    .forEach(c => c.classList.add("wire-selected"));
}

function _populateSelectorSuggestions() {
  const datalist = document.getElementById("jlSelectorSuggestions");
  if (!datalist) return;

  const iframeDoc = elements.previewFrame?.contentDocument;
  if (!iframeDoc) { datalist.innerHTML = ""; return; }

  const suggestions = new Set();
  iframeDoc.querySelectorAll("[id]").forEach(el => {
    if (el.id) suggestions.add(`#${el.id}`);
  });
  iframeDoc.querySelectorAll("[class]").forEach(el => {
    el.classList.forEach(cls => {
      if (!cls.startsWith("selected") && !cls.startsWith("hover-") && !cls.includes("builder")) {
        suggestions.add(`.${cls}`);
      }
    });
  });

  datalist.innerHTML = [...suggestions].slice(0, 60)
    .map(s => `<option value="${s}">`)
    .join("");
}

function _buildEventTypeSelect() {
  const sel = document.getElementById("jlEventType");
  if (!sel) return;
  sel.innerHTML = EVENT_TYPES.map(group =>
    `<optgroup label="${group.group}">` +
    group.events.map(e =>
      `<option value="${e}"${e === "click" ? " selected" : ""}>${e}</option>`
    ).join("") +
    `</optgroup>`
  ).join("");
}

function _updateWirePreview() {
  if (!_wireTemplate) return;
  const triggerSel = document.getElementById("jlTriggerSel")?.value.trim() || "#my-trigger";
  const eventType  = document.getElementById("jlEventType")?.value || "click";

  const body = _wireTemplate.js.split("\n").map(l => "  " + l).join("\n");
  const code =
    `// ── ${_wireTemplate.name} ──\n` +
    `document.querySelector("${triggerSel}")?.addEventListener("${eventType}", function(event) {\n` +
    `${body}\n` +
    `});`;

  const preview = document.getElementById("jlWireCodePreview");
  if (preview) preview.textContent = code;
}

function _insertWiredCode() {
  if (!_wireTemplate) return;

  const triggerSel = document.getElementById("jlTriggerSel")?.value.trim() || "#my-trigger";
  const eventType  = document.getElementById("jlEventType")?.value || "click";

  const body = _wireTemplate.js.split("\n").map(l => "  " + l).join("\n");
  const jsCode =
    `// ── ${_wireTemplate.name} (wired: ${eventType} on "${triggerSel}") ──\n` +
    `document.querySelector("${triggerSel}")?.addEventListener("${eventType}", function(event) {\n` +
    `${body}\n` +
    `});`;

  _applyHtml(_wireTemplate);
  _applyJs(jsCode);

  renderPreview();
  scheduleSnapshot();
  scheduleAutosave();
  closeJsLibrary();
}

// ── List rendering ────────────────────────────────────────────────────────────

function _renderList(category) {
  const list = document.getElementById("jsLibList");
  if (!list) return;

  const items = category === "All"
    ? JS_TEMPLATES
    : JS_TEMPLATES.filter(t => t.category === category);

  list.innerHTML = items.map(t => {
    const globalIdx = JS_TEMPLATES.indexOf(t);
    const htmlBadge = t.html ? `<span class="jl-html-badge">HTML</span>` : "";
    const actionBtn = _currentMode === "wire"
      ? `<button class="jl-insert-btn jl-wire-btn" data-index="${globalIdx}">&#9889; Wire</button>`
      : `<button class="jl-insert-btn" data-index="${globalIdx}">Insert</button>`;
    return `<div class="jl-card" data-index="${globalIdx}">
      <div class="jl-card-icon">${t.icon}</div>
      <div class="jl-card-info">
        <div class="jl-card-name">${t.name} ${htmlBadge}</div>
        <div class="jl-card-desc">${t.description}</div>
      </div>
      <span class="jl-card-cat">${t.category}</span>
      ${actionBtn}
    </div>`;
  }).join("");

  list.querySelectorAll(".jl-insert-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const template = JS_TEMPLATES[parseInt(btn.dataset.index)];
      if (_currentMode === "wire") _openWireConfig(template);
      else _insertTemplate(template);
    });
  });

  list.querySelectorAll(".jl-card").forEach(card => {
    card.addEventListener("click", () => {
      const template = JS_TEMPLATES[parseInt(card.dataset.index)];
      if (_currentMode === "wire") _openWireConfig(template);
      else _insertTemplate(template);
    });
  });
}

// ── Template insertion (Snippets mode) ───────────────────────────────────────

function _insertTemplate(template) {
  _applyHtml(template);
  _applyJs(`// ── ${template.name} ──\n` + template.js);

  renderPreview();
  scheduleSnapshot();
  scheduleAutosave();
  closeJsLibrary();
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function _applyJs(code) {
  const current   = getRawJs().trimEnd();
  const separator = current.length > 0 ? "\n\n" : "";
  const newJs     = current + separator + code;
  setRawJs(newJs);
  elements.jsInput.value = newJs;
}

function _applyHtml(template) {
  if (!template.html) return;
  const current   = elements.htmlInput.value;
  const snippet   = `\n<!-- ── ${template.name} ── -->\n${template.html}\n`;
  const bodyClose = current.lastIndexOf("</body>");
  elements.htmlInput.value = bodyClose !== -1
    ? current.slice(0, bodyClose) + snippet + current.slice(bodyClose)
    : current.trimEnd() + "\n" + snippet;
}
