/**
 * jsLibrary.js
 *
 * A modal library of 15 pre-built JavaScript templates covering everyday
 * UI patterns, form utilities, navigation helpers, and general utilities.
 * Clicking a template appends its code to script.js and re-renders the preview.
 */

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

// ── List rendering ────────────────────────────────────────────────────────────

function _renderList(category) {
  const list = document.getElementById("jsLibList");
  if (!list) return;

  const items = category === "All"
    ? JS_TEMPLATES
    : JS_TEMPLATES.filter(t => t.category === category);

  list.innerHTML = items.map((t, i) => {
    const globalIdx = JS_TEMPLATES.indexOf(t);
    return `<div class="jl-card" data-index="${globalIdx}">
      <div class="jl-card-icon">${t.icon}</div>
      <div class="jl-card-info">
        <div class="jl-card-name">${t.name}</div>
        <div class="jl-card-desc">${t.description}</div>
      </div>
      <span class="jl-card-cat">${t.category}</span>
      <button class="jl-insert-btn" data-index="${globalIdx}">Insert</button>
    </div>`;
  }).join("");

  list.querySelectorAll(".jl-insert-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      _insertTemplate(JS_TEMPLATES[parseInt(btn.dataset.index)]);
    });
  });

  list.querySelectorAll(".jl-card").forEach(card => {
    card.addEventListener("click", () => {
      _insertTemplate(JS_TEMPLATES[parseInt(card.dataset.index)]);
    });
  });
}

// ── Template insertion ────────────────────────────────────────────────────────

function _insertTemplate(template) {
  const current   = getRawJs().trimEnd();
  const separator = current.length > 0 ? "\n\n" : "";
  const newJs     = current + separator + `// ── ${template.name} ──\n` + template.js;

  setRawJs(newJs);
  elements.jsInput.value = newJs;

  renderPreview();
  scheduleSnapshot();
  scheduleAutosave();
  closeJsLibrary();
}
