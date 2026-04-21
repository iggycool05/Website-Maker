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

  // ── More UI ──────────────────────────────────────────────────────────────────
  {
    name: "Tooltip",
    category: "UI",
    icon: "💬",
    description: "Show a floating tooltip when hovering any element with a data-tooltip attribute.",
    html: `<div style="display:flex;gap:16px;padding:24px;flex-wrap:wrap;align-items:center;">
  <button data-tooltip="This is a helpful tip!" style="padding:10px 20px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;">Hover Me</button>
  <button data-tooltip="Another tooltip here" style="padding:10px 20px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;">Or Hover Me</button>
  <span data-tooltip="Works on text too!" style="color:#f59e0b;font-weight:600;cursor:default;padding:4px 0;font-family:sans-serif;">Hover over text</span>
</div>`,
    js: `function createTooltip() {
  const tip = document.createElement("div");
  tip.id = "js-tooltip";
  Object.assign(tip.style, {
    position:"fixed", background:"#1f2937", color:"#fff", fontSize:"12px",
    padding:"5px 10px", borderRadius:"6px", pointerEvents:"none",
    opacity:"0", transition:"opacity 0.15s", zIndex:"10000",
    whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(0,0,0,0.25)"
  });
  document.body.appendChild(tip);
  return tip;
}

const tooltip = document.getElementById("js-tooltip") || createTooltip();

document.querySelectorAll("[data-tooltip]").forEach(el => {
  el.addEventListener("mouseenter", () => {
    tooltip.textContent   = el.dataset.tooltip;
    tooltip.style.opacity = "1";
  });
  el.addEventListener("mousemove", e => {
    tooltip.style.top  = (e.clientY - 36) + "px";
    tooltip.style.left = (e.clientX - tooltip.offsetWidth / 2) + "px";
  });
  el.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });
});`,
  },
  {
    name: "Image Lightbox",
    category: "UI",
    icon: "🖼",
    description: "Click any .gallery-img thumbnail to open a full-screen lightbox overlay.",
    html: `<style>
  #lightbox { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.88); place-items:center; z-index:9999; cursor:zoom-out; }
  #lightbox.open { display:grid; }
  #lightbox-img { max-width:90vw; max-height:85vh; border-radius:8px; box-shadow:0 8px 40px rgba(0,0,0,0.5); }
  .gallery-img { cursor:zoom-in; border-radius:8px; object-fit:cover; transition:transform 0.15s,box-shadow 0.15s; }
  .gallery-img:hover { transform:scale(1.04); box-shadow:0 4px 16px rgba(0,0,0,0.18); }
</style>
<div style="display:flex;gap:12px;flex-wrap:wrap;padding:20px;">
  <img class="gallery-img" src="https://picsum.photos/200/150?random=10" width="200" height="150" alt="Photo 1">
  <img class="gallery-img" src="https://picsum.photos/200/150?random=20" width="200" height="150" alt="Photo 2">
  <img class="gallery-img" src="https://picsum.photos/200/150?random=30" width="200" height="150" alt="Photo 3">
</div>
<div id="lightbox"><img id="lightbox-img" src="" alt="Lightbox"></div>`,
    js: `const lightbox    = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightbox-img");

document.querySelectorAll(".gallery-img").forEach(img => {
  img.addEventListener("click", () => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("open");
  });
});

lightbox?.addEventListener("click", () => lightbox.classList.remove("open"));
document.addEventListener("keydown", e => {
  if (e.key === "Escape") lightbox?.classList.remove("open");
});`,
  },
  {
    name: "Star Rating",
    category: "UI",
    icon: "★",
    description: "Interactive 1–5 star rating widget with hover preview and selection.",
    html: `<div style="display:flex;align-items:center;gap:12px;padding:24px;">
  <div id="stars" style="display:flex;gap:4px;">
    <span class="star" data-value="1" style="font-size:36px;cursor:pointer;color:#d1d5db;transition:color 0.1s;">★</span>
    <span class="star" data-value="2" style="font-size:36px;cursor:pointer;color:#d1d5db;transition:color 0.1s;">★</span>
    <span class="star" data-value="3" style="font-size:36px;cursor:pointer;color:#d1d5db;transition:color 0.1s;">★</span>
    <span class="star" data-value="4" style="font-size:36px;cursor:pointer;color:#d1d5db;transition:color 0.1s;">★</span>
    <span class="star" data-value="5" style="font-size:36px;cursor:pointer;color:#d1d5db;transition:color 0.1s;">★</span>
  </div>
  <span id="rating-label" style="font-size:14px;color:#6b7280;font-family:sans-serif;">Select a rating</span>
</div>`,
    js: `const stars        = document.querySelectorAll(".star");
const ratingLabel  = document.querySelector("#rating-label");
let selectedRating = 0;

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function paintStars(value) {
  stars.forEach(s => {
    s.style.color = parseInt(s.dataset.value) <= value ? "#f59e0b" : "#d1d5db";
  });
}

stars.forEach(star => {
  star.addEventListener("mouseenter", () => paintStars(parseInt(star.dataset.value)));
  star.addEventListener("mouseleave", () => paintStars(selectedRating));
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.dataset.value);
    paintStars(selectedRating);
    if (ratingLabel) ratingLabel.textContent = \`\${selectedRating} / 5 — \${LABELS[selectedRating]}\`;
    console.log("Rating selected:", selectedRating);
  });
});`,
  },
  {
    name: "Progress Bar",
    category: "UI",
    icon: "▓",
    description: "Animated progress bar that can be updated programmatically or via buttons.",
    html: `<div style="max-width:480px;padding:24px;display:flex;flex-direction:column;gap:16px;">
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-family:sans-serif;font-size:13px;color:#374151;">
      <span>Progress</span>
      <span id="progress-label">0%</span>
    </div>
    <div style="background:#e5e7eb;border-radius:999px;height:14px;overflow:hidden;">
      <div id="progress-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:999px;transition:width 0.4s ease;"></div>
    </div>
  </div>
  <div style="display:flex;gap:8px;">
    <button id="progress-inc" style="padding:8px 18px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;">+10%</button>
    <button id="progress-dec" style="padding:8px 18px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;">-10%</button>
    <button id="progress-reset" style="padding:8px 18px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;">Reset</button>
  </div>
</div>`,
    js: `let progress = 0;
const bar    = document.querySelector("#progress-bar");
const label  = document.querySelector("#progress-label");

function setProgress(value) {
  progress = Math.max(0, Math.min(100, value));
  if (bar)   bar.style.width    = progress + "%";
  if (label) label.textContent  = progress + "%";
}

document.querySelector("#progress-inc")?.addEventListener("click",   () => setProgress(progress + 10));
document.querySelector("#progress-dec")?.addEventListener("click",   () => setProgress(progress - 10));
document.querySelector("#progress-reset")?.addEventListener("click", () => setProgress(0));`,
  },
  {
    name: "Notification Badge",
    category: "UI",
    icon: "🔴",
    description: "Badge counter on a button that increments with new notifications.",
    html: `<div style="display:flex;align-items:center;gap:20px;padding:24px;flex-wrap:wrap;">
  <div style="position:relative;display:inline-block;">
    <button id="bell-btn" style="padding:12px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;cursor:pointer;font-size:22px;line-height:1;">🔔</button>
    <span id="notif-badge" style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;font-family:sans-serif;min-width:18px;height:18px;border-radius:999px;padding:0 4px;display:none;align-items:center;justify-content:center;box-shadow:0 0 0 2px #fff;"></span>
  </div>
  <button id="add-notif" style="padding:8px 16px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;">+ Add Notification</button>
  <button id="clear-notif" style="padding:8px 16px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;">Clear All</button>
</div>`,
    js: `let notifCount = 0;
const badge    = document.querySelector("#notif-badge");

function updateBadge() {
  if (!badge) return;
  if (notifCount > 0) {
    badge.textContent    = notifCount > 99 ? "99+" : notifCount;
    badge.style.display  = "flex";
  } else {
    badge.style.display  = "none";
  }
}

document.querySelector("#add-notif")?.addEventListener("click", () => { notifCount++; updateBadge(); });
document.querySelector("#clear-notif")?.addEventListener("click", () => { notifCount = 0; updateBadge(); });
document.querySelector("#bell-btn")?.addEventListener("click", () => { notifCount = 0; updateBadge(); });`,
  },
  {
    name: "Flip Card",
    category: "UI",
    icon: "🃏",
    description: "3D flip card that shows the back face on hover or click.",
    html: `<style>
  .flip-card { perspective:1000px; width:220px; height:140px; cursor:pointer; }
  .flip-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform 0.55s ease; }
  .flip-card:hover .flip-inner, .flip-card.flipped .flip-inner { transform:rotateY(180deg); }
  .flip-front, .flip-back { position:absolute; inset:0; border-radius:12px; display:flex; align-items:center; justify-content:center; backface-visibility:hidden; flex-direction:column; gap:8px; font-family:sans-serif; }
  .flip-front { background:linear-gradient(135deg,#1f2937,#374151); color:#fff; }
  .flip-back  { background:linear-gradient(135deg,#f59e0b,#ef4444); color:#fff; transform:rotateY(180deg); }
</style>
<div style="display:flex;gap:20px;padding:24px;flex-wrap:wrap;">
  <div class="flip-card">
    <div class="flip-inner">
      <div class="flip-front"><span style="font-size:28px;">🌑</span><span style="font-size:13px;font-weight:600;">Hover to flip</span></div>
      <div class="flip-back"><span style="font-size:28px;">☀️</span><span style="font-size:13px;font-weight:600;">Back side!</span></div>
    </div>
  </div>
  <div class="flip-card">
    <div class="flip-inner">
      <div class="flip-front"><span style="font-size:28px;">❓</span><span style="font-size:13px;font-weight:600;">What's inside?</span></div>
      <div class="flip-back"><span style="font-size:28px;">🎉</span><span style="font-size:13px;font-weight:600;">Surprise!</span></div>
    </div>
  </div>
</div>`,
    js: `document.querySelectorAll(".flip-card").forEach(card => {
  card.addEventListener("click", () => card.classList.toggle("flipped"));
});`,
  },

  // ── More Forms ───────────────────────────────────────────────────────────────
  {
    name: "Password Strength Meter",
    category: "Forms",
    icon: "🔐",
    description: "Show a color-coded strength bar as the user types a password.",
    html: `<div style="max-width:380px;display:flex;flex-direction:column;gap:8px;padding:24px;">
  <label style="font-family:sans-serif;font-size:13px;font-weight:600;color:#374151;">Password</label>
  <input id="password-input" type="password" placeholder="Enter a password..."
    style="padding:9px 11px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:13px;outline:none;" />
  <div style="height:6px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
    <div id="strength-bar" style="height:100%;width:0%;transition:width 0.3s,background 0.3s;border-radius:999px;"></div>
  </div>
  <span id="strength-label" style="font-family:sans-serif;font-size:11px;color:#9ca3af;">Type a password above</span>
</div>`,
    js: `const passwordInput = document.querySelector("#password-input");
const strengthBar   = document.querySelector("#strength-bar");
const strengthLabel = document.querySelector("#strength-label");

const LEVELS = [
  { label:"Too short",   color:"#ef4444", width:"15%"  },
  { label:"Weak",        color:"#f97316", width:"35%"  },
  { label:"Fair",        color:"#eab308", width:"55%"  },
  { label:"Strong",      color:"#22c55e", width:"80%"  },
  { label:"Very strong", color:"#16a34a", width:"100%" },
];

function getStrength(pw) {
  if (pw.length < 4) return 0;
  let score = 1;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

passwordInput?.addEventListener("input", () => {
  const pw = passwordInput.value;
  if (!pw) {
    if (strengthBar)  strengthBar.style.width = "0%";
    if (strengthLabel) strengthLabel.textContent = "Type a password above";
    return;
  }
  const level = LEVELS[getStrength(pw)];
  if (strengthBar)  { strengthBar.style.width = level.width; strengthBar.style.background = level.color; }
  if (strengthLabel){ strengthLabel.textContent = level.label; strengthLabel.style.color = level.color; }
});`,
  },
  {
    name: "Live Search Filter",
    category: "Forms",
    icon: "🔍",
    description: "Filter a list of items in real-time as the user types into a search box.",
    html: `<div style="max-width:420px;padding:24px;display:flex;flex-direction:column;gap:10px;">
  <input id="search-input" type="search" placeholder="Search items..."
    style="padding:9px 11px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:13px;outline:none;" />
  <ul id="filter-list" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;">
    <li class="filter-item" style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-family:sans-serif;font-size:13px;">Apple</li>
    <li class="filter-item" style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-family:sans-serif;font-size:13px;">Banana</li>
    <li class="filter-item" style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-family:sans-serif;font-size:13px;">Cherry</li>
    <li class="filter-item" style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-family:sans-serif;font-size:13px;">Date</li>
    <li class="filter-item" style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-family:sans-serif;font-size:13px;">Elderberry</li>
    <li class="filter-item" style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-family:sans-serif;font-size:13px;">Fig</li>
    <li class="filter-item" style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-family:sans-serif;font-size:13px;">Grapes</li>
  </ul>
  <p id="no-results" style="display:none;color:#9ca3af;font-family:sans-serif;font-size:13px;margin:0;">No results found.</p>
</div>`,
    js: `const searchInput = document.querySelector("#search-input");
const filterItems = document.querySelectorAll(".filter-item");
const noResults   = document.querySelector("#no-results");

searchInput?.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  filterItems.forEach(item => {
    const match = item.textContent.toLowerCase().includes(query);
    item.style.display = match ? "" : "none";
    if (match) visible++;
  });
  if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
});`,
  },
  {
    name: "Show / Hide Password",
    category: "Forms",
    icon: "👁",
    description: "Toggle password visibility with an eye button inside the input field.",
    html: `<div style="max-width:340px;padding:24px;display:flex;flex-direction:column;gap:8px;">
  <label style="font-family:sans-serif;font-size:13px;font-weight:600;color:#374151;">Password</label>
  <div style="position:relative;display:flex;align-items:center;">
    <input id="pw-field" type="password" placeholder="Enter your password"
      style="width:100%;padding:9px 40px 9px 11px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:13px;outline:none;box-sizing:border-box;" />
    <button id="pw-toggle" type="button"
      style="position:absolute;right:8px;background:none;border:none;cursor:pointer;font-size:16px;line-height:1;color:#9ca3af;padding:2px;">👁</button>
  </div>
</div>`,
    js: `const pwField  = document.querySelector("#pw-field");
const pwToggle = document.querySelector("#pw-toggle");

pwToggle?.addEventListener("click", () => {
  const hidden        = pwField.type === "password";
  pwField.type        = hidden ? "text" : "password";
  pwToggle.textContent = hidden ? "🙈" : "👁";
});`,
  },
  {
    name: "Range Slider Display",
    category: "Forms",
    icon: "🎚",
    description: "Display the live value of a range slider as the user drags it.",
    html: `<div style="max-width:380px;padding:24px;display:flex;flex-direction:column;gap:12px;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <label style="font-family:sans-serif;font-size:13px;font-weight:600;color:#374151;">Volume</label>
    <span id="range-value" style="font-family:sans-serif;font-size:22px;font-weight:700;color:#f59e0b;">50</span>
  </div>
  <input id="range-slider" type="range" min="0" max="100" value="50"
    style="width:100%;accent-color:#f59e0b;cursor:pointer;" />
  <div style="display:flex;justify-content:space-between;font-family:sans-serif;font-size:11px;color:#9ca3af;">
    <span>0</span><span>50</span><span>100</span>
  </div>
</div>`,
    js: `const rangeSlider = document.querySelector("#range-slider");
const rangeValue  = document.querySelector("#range-value");

rangeSlider?.addEventListener("input", () => {
  if (rangeValue) rangeValue.textContent = rangeSlider.value;
});`,
  },

  // ── More Navigation ──────────────────────────────────────────────────────────
  {
    name: "Sidebar Drawer",
    category: "Navigation",
    icon: "◧",
    description: "Slide a sidebar panel in and out from the left side of the screen.",
    html: `<style>
  #sidebar { position:fixed; top:0; left:0; height:100%; width:260px; background:#1f2937; color:#fff; transform:translateX(-100%); transition:transform 0.3s ease; z-index:500; padding:24px 20px; box-sizing:border-box; }
  #sidebar.open { transform:translateX(0); }
  #sidebar-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:none; z-index:499; }
  #sidebar-overlay.open { display:block; }
</style>
<button id="sidebar-open" style="padding:10px 18px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;margin:20px;">☰ Open Sidebar</button>
<div id="sidebar-overlay"></div>
<div id="sidebar">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <span style="font-size:16px;font-weight:700;">Navigation</span>
    <button id="sidebar-close" style="background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;line-height:1;">✕</button>
  </div>
  <nav style="display:flex;flex-direction:column;gap:4px;">
    <a href="#" style="color:#d1d5db;text-decoration:none;padding:10px 12px;border-radius:6px;font-family:sans-serif;font-size:14px;">🏠 Home</a>
    <a href="#" style="color:#d1d5db;text-decoration:none;padding:10px 12px;border-radius:6px;font-family:sans-serif;font-size:14px;">👤 Profile</a>
    <a href="#" style="color:#d1d5db;text-decoration:none;padding:10px 12px;border-radius:6px;font-family:sans-serif;font-size:14px;">⚙️ Settings</a>
    <a href="#" style="color:#d1d5db;text-decoration:none;padding:10px 12px;border-radius:6px;font-family:sans-serif;font-size:14px;">📊 Dashboard</a>
  </nav>
</div>`,
    js: `const sidebar        = document.querySelector("#sidebar");
const sidebarOverlay = document.querySelector("#sidebar-overlay");

function openSidebar()  { sidebar?.classList.add("open");    sidebarOverlay?.classList.add("open"); }
function closeSidebar() { sidebar?.classList.remove("open"); sidebarOverlay?.classList.remove("open"); }

document.querySelector("#sidebar-open")?.addEventListener("click",  openSidebar);
document.querySelector("#sidebar-close")?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });`,
  },
  {
    name: "Reading Progress Bar",
    category: "Navigation",
    icon: "📖",
    description: "Thin progress bar at the top of the page that fills as the user scrolls.",
    html: `<style>
  #read-progress { position:fixed; top:0; left:0; height:4px; width:0%; background:linear-gradient(90deg,#f59e0b,#ef4444); z-index:9999; transition:width 0.05s linear; }
</style>
<div id="read-progress"></div>
<div style="height:3000px;padding:40px;font-family:sans-serif;">
  <h2>Scroll to see the reading progress bar</h2>
  <p style="color:#6b7280;max-width:600px;line-height:1.7;">The amber bar at the very top of the page tracks how far you've scrolled through the content. Scroll all the way down to fill it completely.</p>
</div>`,
    js: `const readProgress = document.querySelector("#read-progress");

window.addEventListener("scroll", () => {
  if (!readProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct       = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  readProgress.style.width = pct.toFixed(1) + "%";
});`,
  },

  // ── Animation ────────────────────────────────────────────────────────────────
  {
    name: "Fade In on Scroll",
    category: "Animation",
    icon: "✨",
    description: "Fade in elements with class .fade-in as they enter the viewport (IntersectionObserver).",
    html: `<style>
  .fade-in { opacity:0; transform:translateY(28px); transition:opacity 0.65s ease,transform 0.65s ease; }
  .fade-in.visible { opacity:1; transform:translateY(0); }
</style>
<div style="display:flex;flex-direction:column;gap:16px;padding:20px;">
  <div class="fade-in" style="padding:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;font-family:sans-serif;"><h3 style="margin:0 0 6px;">Card One</h3><p style="margin:0;color:#6b7280;">This card fades in when it enters the viewport.</p></div>
  <div class="fade-in" style="padding:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;font-family:sans-serif;"><h3 style="margin:0 0 6px;">Card Two</h3><p style="margin:0;color:#6b7280;">Scroll down to see each card animate.</p></div>
  <div class="fade-in" style="padding:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;font-family:sans-serif;"><h3 style="margin:0 0 6px;">Card Three</h3><p style="margin:0;color:#6b7280;">Uses IntersectionObserver for efficient detection.</p></div>
</div>`,
    js: `const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".fade-in").forEach(el => fadeObserver.observe(el));`,
  },
  {
    name: "Typewriter Effect",
    category: "Animation",
    icon: "⌨",
    description: "Animate text being typed one character at a time, cycling through messages.",
    html: `<div style="padding:40px 24px;text-align:center;font-family:sans-serif;">
  <h1 id="typewriter-text" style="font-size:28px;font-weight:700;color:#1f2937;min-height:44px;"></h1>
  <p style="color:#9ca3af;margin-top:8px;font-size:14px;">Cycles through messages automatically</p>
</div>`,
    js: `const messages = [
  "Hello, World!",
  "Welcome to my website.",
  "Build something amazing.",
  "JavaScript is powerful.",
];

const target    = document.querySelector("#typewriter-text");
let msgIndex    = 0;
let charIndex   = 0;
let isDeleting  = false;
let waitPending = false;

function typewrite() {
  if (!target) return;
  const msg = messages[msgIndex];
  target.textContent = msg.slice(0, charIndex) + (isDeleting ? "" : "│");

  if (!isDeleting && charIndex < msg.length) {
    charIndex++;
    setTimeout(typewrite, 80);
  } else if (!isDeleting && charIndex === msg.length) {
    if (waitPending) return;
    waitPending = true;
    setTimeout(() => { isDeleting = true; waitPending = false; typewrite(); }, 1800);
  } else if (isDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(typewrite, 45);
  } else {
    isDeleting = false;
    msgIndex   = (msgIndex + 1) % messages.length;
    setTimeout(typewrite, 300);
  }
}

typewrite();`,
  },
  {
    name: "Count Up Animation",
    category: "Animation",
    icon: "🔢",
    description: "Animate numbers counting up from 0 to their target with easing.",
    html: `<div style="display:flex;gap:24px;flex-wrap:wrap;padding:32px 20px;justify-content:center;">
  <div style="text-align:center;min-width:120px;">
    <div class="count-up" data-target="1284" style="font-size:42px;font-weight:800;color:#f59e0b;font-family:sans-serif;font-variant-numeric:tabular-nums;">0</div>
    <div style="font-family:sans-serif;font-size:13px;color:#6b7280;margin-top:4px;">Users</div>
  </div>
  <div style="text-align:center;min-width:120px;">
    <div class="count-up" data-target="56" style="font-size:42px;font-weight:800;color:#f59e0b;font-family:sans-serif;font-variant-numeric:tabular-nums;">0</div>
    <div style="font-family:sans-serif;font-size:13px;color:#6b7280;margin-top:4px;">Projects</div>
  </div>
  <div style="text-align:center;min-width:120px;">
    <div class="count-up" data-target="99" style="font-size:42px;font-weight:800;color:#f59e0b;font-family:sans-serif;font-variant-numeric:tabular-nums;">0</div>
    <div style="font-family:sans-serif;font-size:13px;color:#6b7280;margin-top:4px;">Satisfaction %</div>
  </div>
</div>`,
    js: `document.querySelectorAll(".count-up").forEach(el => {
  const target   = parseInt(el.dataset.target) || 0;
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});`,
  },
  {
    name: "Ripple Click Effect",
    category: "Animation",
    icon: "💧",
    description: "Add a material-style ripple animation to buttons on click.",
    html: `<style>
  .ripple-btn { position:relative; overflow:hidden; }
  .ripple-btn .ripple { position:absolute; border-radius:50%; background:rgba(255,255,255,0.45); transform:scale(0); animation:ripple-expand 0.55s linear; pointer-events:none; }
  @keyframes ripple-expand { to { transform:scale(4); opacity:0; } }
</style>
<div style="display:flex;gap:12px;padding:24px;flex-wrap:wrap;">
  <button class="ripple-btn" style="padding:12px 28px;background:#f59e0b;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;">Amber</button>
  <button class="ripple-btn" style="padding:12px 28px;background:#1f2937;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;">Dark</button>
  <button class="ripple-btn" style="padding:12px 28px;background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;">Green</button>
</div>`,
    js: `document.querySelectorAll(".ripple-btn").forEach(btn => {
  btn.addEventListener("click", function (e) {
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left  - size / 2;
    const y      = e.clientY - rect.top   - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    Object.assign(ripple.style, { width: size + "px", height: size + "px", left: x + "px", top: y + "px" });
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});`,
  },
  {
    name: "Skeleton Loader",
    category: "Animation",
    icon: "⬜",
    description: "Show animated skeleton placeholder cards while content is loading.",
    html: `<style>
  .skeleton { background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%); background-size:200% 100%; animation:skeleton-shimmer 1.4s infinite; border-radius:4px; }
  @keyframes skeleton-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
</style>
<div id="skeleton-demo" style="display:flex;flex-direction:column;gap:16px;max-width:420px;padding:20px;">
  <div style="display:flex;gap:12px;align-items:center;">
    <div class="skeleton" style="width:48px;height:48px;border-radius:50%;flex-shrink:0;"></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
      <div class="skeleton" style="height:14px;width:60%;"></div>
      <div class="skeleton" style="height:12px;width:40%;"></div>
    </div>
  </div>
  <div class="skeleton" style="height:160px;border-radius:8px;"></div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div class="skeleton" style="height:12px;width:100%;"></div>
    <div class="skeleton" style="height:12px;width:85%;"></div>
    <div class="skeleton" style="height:12px;width:70%;"></div>
  </div>
</div>`,
    js: `// Skeleton loaders are purely CSS-driven.
// Use this pattern to swap skeleton → real content after data loads:

const skeletonDemo = document.querySelector("#skeleton-demo");

setTimeout(() => {
  if (!skeletonDemo) return;
  skeletonDemo.innerHTML = \`
    <div style="display:flex;gap:12px;align-items:center;">
      <div style="width:48px;height:48px;border-radius:50%;background:#f59e0b;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>
      <div>
        <div style="font-family:sans-serif;font-size:14px;font-weight:600;color:#1f2937;">Jane Doe</div>
        <div style="font-family:sans-serif;font-size:12px;color:#6b7280;">Designer · joined 2024</div>
      </div>
    </div>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;height:160px;display:flex;align-items:center;justify-content:center;font-size:32px;">🖼</div>
    <p style="font-family:sans-serif;font-size:13px;color:#374151;line-height:1.6;margin:0;">Content loaded! Replace this with your real data from an API call or database fetch.</p>
  \`;
}, 2500);`,
  },

  // ── Data ─────────────────────────────────────────────────────────────────────
  {
    name: "Fetch JSON (GET)",
    category: "Data",
    icon: "⬇",
    description: "Fetch data from a JSON API and display the results in the page.",
    html: `<div style="max-width:520px;padding:24px;display:flex;flex-direction:column;gap:12px;">
  <div style="display:flex;gap:8px;">
    <button id="fetch-btn" style="padding:9px 20px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;">Fetch Posts</button>
    <button id="fetch-clear" style="padding:9px 16px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;">Clear</button>
  </div>
  <p id="fetch-status" style="font-family:sans-serif;font-size:12px;color:#9ca3af;margin:0;"></p>
  <ul id="fetch-results" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;"></ul>
</div>`,
    js: `const API_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";

document.querySelector("#fetch-btn")?.addEventListener("click", async () => {
  const status  = document.querySelector("#fetch-status");
  const results = document.querySelector("#fetch-results");
  if (!results) return;
  if (status) status.textContent = "Loading…";
  results.innerHTML = "";

  try {
    const res  = await fetch(API_URL);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = await res.json();

    results.innerHTML = data.map(post => \`
      <li style="padding:12px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
        <div style="font-family:sans-serif;font-size:12px;font-weight:600;color:#1f2937;margin-bottom:4px;">#\${post.id} — \${post.title}</div>
        <div style="font-family:sans-serif;font-size:11px;color:#6b7280;">\${post.body.slice(0, 80)}…</div>
      </li>\`).join("");
    if (status) status.textContent = \`Loaded \${data.length} posts.\`;
  } catch (err) {
    if (status) status.textContent = "Error: " + err.message;
    console.error(err);
  }
});

document.querySelector("#fetch-clear")?.addEventListener("click", () => {
  const results = document.querySelector("#fetch-results");
  const status  = document.querySelector("#fetch-status");
  if (results) results.innerHTML = "";
  if (status)  status.textContent = "";
});`,
  },
  {
    name: "Debounce Input",
    category: "Data",
    icon: "⏳",
    description: "Run a function only after the user stops typing for a set delay (debounce).",
    html: `<div style="max-width:420px;padding:24px;display:flex;flex-direction:column;gap:10px;">
  <label style="font-family:sans-serif;font-size:13px;font-weight:600;color:#374151;">Search (fires 400 ms after you stop typing)</label>
  <input id="debounce-input" type="text" placeholder="Start typing..."
    style="padding:9px 11px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:13px;outline:none;" />
  <p id="debounce-output" style="font-family:sans-serif;font-size:12px;color:#6b7280;margin:0;">Waiting for input…</p>
</div>`,
    js: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedSearch = debounce(value => {
  const output = document.querySelector("#debounce-output");
  if (output) output.textContent = \`Searching for: "\${value}"\`;
  console.log("Debounced search fired:", value);
  // Replace with your real API call here
}, 400);

document.querySelector("#debounce-input")?.addEventListener("input", function () {
  debouncedSearch(this.value);
});`,
  },
  {
    name: "Todo List (localStorage)",
    category: "Data",
    icon: "✅",
    description: "Add and remove todo items that persist across reloads using localStorage.",
    html: `<div style="max-width:420px;padding:24px;display:flex;flex-direction:column;gap:12px;">
  <h3 style="margin:0;font-family:sans-serif;font-size:16px;color:#1f2937;">My Todos</h3>
  <div style="display:flex;gap:8px;">
    <input id="todo-input" type="text" placeholder="Add a new todo..."
      style="flex:1;padding:9px 11px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:13px;outline:none;" />
    <button id="todo-add" style="padding:9px 18px;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-weight:600;">Add</button>
  </div>
  <ul id="todo-list" style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto;"></ul>
</div>`,
    js: `const TODO_KEY = "my-todos";

function saveTodos(todos) { localStorage.setItem(TODO_KEY, JSON.stringify(todos)); }
function loadTodos()       { try { return JSON.parse(localStorage.getItem(TODO_KEY)) || []; } catch { return []; } }

function renderTodos() {
  const list  = document.querySelector("#todo-list");
  const todos = loadTodos();
  if (!list) return;
  list.innerHTML = todos.length === 0
    ? \`<li style="font-family:sans-serif;font-size:13px;color:#9ca3af;padding:8px 0;">Nothing yet — add a todo above!</li>\`
    : todos.map((text, i) => \`
      <li style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
        <span style="flex:1;font-family:sans-serif;font-size:13px;color:#1f2937;">\${text}</span>
        <button data-index="\${i}" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:14px;padding:2px 4px;border-radius:3px;" title="Remove">✕</button>
      </li>\`).join("");

  list.querySelectorAll("[data-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      const todos = loadTodos();
      todos.splice(parseInt(btn.dataset.index), 1);
      saveTodos(todos);
      renderTodos();
    });
  });
}

document.querySelector("#todo-add")?.addEventListener("click", () => {
  const input = document.querySelector("#todo-input");
  const text  = input?.value.trim();
  if (!text) return;
  const todos = loadTodos();
  todos.push(text);
  saveTodos(todos);
  if (input) input.value = "";
  renderTodos();
});

document.querySelector("#todo-input")?.addEventListener("keydown", e => {
  if (e.key === "Enter") document.querySelector("#todo-add")?.click();
});

renderTodos();`,
  },
  {
    name: "Simple State Manager",
    category: "Data",
    icon: "⚙",
    description: "Minimal reactive state object that notifies subscribers on change.",
    html: `<div style="max-width:420px;padding:24px;display:flex;flex-direction:column;gap:12px;font-family:sans-serif;">
  <h3 style="margin:0;color:#1f2937;">Shopping Cart (state demo)</h3>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <button id="add-apple"  style="padding:8px 14px;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;">+ Apple</button>
    <button id="add-banana" style="padding:8px 14px;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;">+ Banana</button>
    <button id="clear-cart" style="padding:8px 14px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;">Clear</button>
  </div>
  <div id="cart-display" style="padding:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#374151;">Cart is empty</div>
</div>`,
    js: `function createStore(initialState) {
  let state       = { ...initialState };
  const listeners = new Set();

  return {
    getState: ()   => ({ ...state }),
    setState: (partial) => {
      state = { ...state, ...partial };
      listeners.forEach(fn => fn(state));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

const cartStore = createStore({ items: [] });

cartStore.subscribe(state => {
  const display = document.querySelector("#cart-display");
  if (!display) return;
  display.textContent = state.items.length === 0
    ? "Cart is empty"
    : state.items.join(", ") + \` (\${state.items.length} item\${state.items.length > 1 ? "s" : ""})\`;
});

document.querySelector("#add-apple")?.addEventListener("click",  () => {
  cartStore.setState({ items: [...cartStore.getState().items, "🍎 Apple"] });
});
document.querySelector("#add-banana")?.addEventListener("click", () => {
  cartStore.setState({ items: [...cartStore.getState().items, "🍌 Banana"] });
});
document.querySelector("#clear-cart")?.addEventListener("click", () => {
  cartStore.setState({ items: [] });
});`,
  },

  // ── Fun ──────────────────────────────────────────────────────────────────────
  {
    name: "Random Color Palette",
    category: "Fun",
    icon: "🎨",
    description: "Generate a random color palette and copy any hex code by clicking a swatch.",
    html: `<div style="max-width:520px;padding:24px;display:flex;flex-direction:column;gap:14px;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <h3 style="margin:0;font-family:sans-serif;font-size:15px;color:#1f2937;">Color Palette Generator</h3>
    <button id="gen-palette" style="padding:8px 18px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;">Generate</button>
  </div>
  <div id="palette-swatches" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
  <p id="palette-msg" style="font-family:sans-serif;font-size:12px;color:#22c55e;min-height:18px;margin:0;"></p>
</div>`,
    js: `function randomHex() {
  return "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0").toUpperCase();
}

function contrastColor(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 128 ? "#000" : "#fff";
}

function generatePalette() {
  const container = document.querySelector("#palette-swatches");
  if (!container) return;
  container.innerHTML = Array.from({ length: 6 }, () => {
    const hex  = randomHex();
    const text = contrastColor(hex);
    return \`<div class="swatch" data-hex="\${hex}"
      style="flex:1;min-width:70px;height:80px;background:\${hex};border-radius:8px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.12);transition:transform 0.15s;"
      onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
      <span style="font-family:monospace;font-size:11px;font-weight:700;color:\${text};">\${hex}</span>
    </div>\`;
  }).join("");

  container.querySelectorAll(".swatch").forEach(s => {
    s.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(s.dataset.hex); } catch {}
      const msg = document.querySelector("#palette-msg");
      if (msg) { msg.textContent = \`Copied \${s.dataset.hex}!\`; setTimeout(() => msg.textContent = "", 1500); }
    });
  });
}

document.querySelector("#gen-palette")?.addEventListener("click", generatePalette);
generatePalette();`,
  },
  {
    name: "Dice Roll",
    category: "Fun",
    icon: "🎲",
    description: "Roll two dice with an animated spin effect and display the total.",
    html: `<div style="text-align:center;padding:32px;display:flex;flex-direction:column;align-items:center;gap:20px;font-family:sans-serif;">
  <div id="dice-faces" style="display:flex;gap:20px;justify-content:center;font-size:72px;min-height:80px;align-items:center;">🎲 🎲</div>
  <button id="roll-dice" style="padding:12px 36px;background:#1f2937;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:600;">Roll the Dice</button>
  <p id="dice-total" style="font-size:14px;color:#6b7280;margin:0;"></p>
</div>`,
    js: `const DICE_FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];

document.querySelector("#roll-dice")?.addEventListener("click", function () {
  const facesEl = document.querySelector("#dice-faces");
  const totalEl = document.querySelector("#dice-total");
  this.disabled = true;
  let tick = 0;

  const spin = setInterval(() => {
    const r1 = DICE_FACES[Math.floor(Math.random() * 6)];
    const r2 = DICE_FACES[Math.floor(Math.random() * 6)];
    if (facesEl) facesEl.textContent = r1 + "  " + r2;
    if (++tick >= 14) {
      clearInterval(spin);
      const v1 = DICE_FACES.indexOf(r1) + 1;
      const v2 = DICE_FACES.indexOf(r2) + 1;
      if (totalEl) totalEl.textContent = \`Total: \${v1 + v2}  (\${v1} + \${v2})\`;
      this.disabled = false;
    }
  }, 60);
});`,
  },
  {
    name: "Confetti Burst",
    category: "Fun",
    icon: "🎉",
    description: "Fire a burst of colorful confetti particles from a button click.",
    html: `<div style="text-align:center;padding:40px;font-family:sans-serif;">
  <h2 style="margin-bottom:8px;color:#1f2937;">Celebrate! 🎊</h2>
  <p style="color:#6b7280;margin-bottom:20px;">Click the button to fire confetti.</p>
  <button id="confetti-btn" style="padding:14px 36px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;border:none;border-radius:50px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:700;box-shadow:0 4px 16px rgba(245,158,11,0.4);">🎉 Celebrate!</button>
</div>`,
    js: `function launchConfetti(originEl) {
  const colors  = ["#f59e0b","#ef4444","#3b82f6","#22c55e","#a855f7","#ec4899","#f97316"];
  const rect    = originEl.getBoundingClientRect();
  const cx      = rect.left + rect.width  / 2;
  const cy      = rect.top  + rect.height / 2;

  for (let i = 0; i < 80; i++) {
    const el     = document.createElement("div");
    const size   = Math.random() * 8 + 6;
    const angle  = Math.random() * 360;
    const speed  = Math.random() * 200 + 60;
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const dur    = 0.6 + Math.random() * 0.8;

    Object.assign(el.style, {
      position:"fixed", left:cx+"px", top:cy+"px",
      width:size+"px", height:size+"px",
      background:color, borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      pointerEvents:"none", zIndex:"99999",
      transition:\`all \${dur}s cubic-bezier(0.1,0.8,0.3,1)\`, opacity:"1",
    });
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      const rad = angle * Math.PI / 180;
      el.style.transform = \`translate(\${Math.cos(rad)*speed}px,\${Math.sin(rad)*speed - 80}px) rotate(\${angle*3}deg)\`;
      el.style.opacity   = "0";
    });

    setTimeout(() => el.remove(), (dur + 0.1) * 1000);
  }
}

document.querySelector("#confetti-btn")?.addEventListener("click", function () {
  launchConfetti(this);
});`,
  },
  {
    name: "Quiz / Trivia",
    category: "Fun",
    icon: "🧠",
    description: "Simple multi-choice quiz with score tracking and instant feedback.",
    html: `<div id="quiz-app" style="max-width:480px;padding:24px;font-family:sans-serif;display:flex;flex-direction:column;gap:16px;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <h3 style="margin:0;color:#1f2937;">Quick Quiz</h3>
    <span id="quiz-score" style="font-size:13px;color:#6b7280;">Score: 0 / 0</span>
  </div>
  <div id="quiz-question" style="font-size:15px;font-weight:600;color:#1f2937;line-height:1.5;"></div>
  <div id="quiz-options" style="display:flex;flex-direction:column;gap:8px;"></div>
  <p id="quiz-feedback" style="font-size:13px;min-height:20px;margin:0;font-weight:600;"></p>
  <button id="quiz-next" style="display:none;padding:9px 20px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;align-self:flex-start;">Next Question →</button>
</div>`,
    js: `const QUIZ = [
  { q:"What does CSS stand for?",           a:"Cascading Style Sheets",  opts:["Creative Style System","Cascading Style Sheets","Computer Style Syntax","Colorful Styling Solution"] },
  { q:"Which tag creates a hyperlink?",     a:"<a>",                      opts:["<link>","<href>","<a>","<url>"] },
  { q:"What does JSON stand for?",          a:"JavaScript Object Notation", opts:["Java Serialized Object Notation","JavaScript Object Notation","Java Simple Object Name","JavaScript Optional Node"] },
  { q:"Which method adds to an array?",     a:"push()",                   opts:["add()","append()","push()","insert()"] },
  { q:"What is the output of typeof null?", a:"object",                   opts:["null","undefined","object","string"] },
];

let qIndex = 0;
let score  = 0;
let answered = false;

function showQuestion() {
  const data = QUIZ[qIndex];
  document.querySelector("#quiz-question").textContent = \`Q\${qIndex+1}. \${data.q}\`;
  document.querySelector("#quiz-feedback").textContent = "";
  document.querySelector("#quiz-next").style.display   = "none";
  answered = false;

  const opts   = [...data.opts].sort(() => Math.random() - 0.5);
  const optsEl = document.querySelector("#quiz-options");
  optsEl.innerHTML = opts.map(o => \`
    <button class="quiz-opt" style="text-align:left;padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;font-family:inherit;font-size:13px;transition:background 0.1s;">\${o}</button>
  \`).join("");

  optsEl.querySelectorAll(".quiz-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const correct = btn.textContent === data.a;
      if (correct) { score++; btn.style.background = "#d1fae5"; btn.style.borderColor = "#6ee7b7"; }
      else         { btn.style.background = "#fee2e2"; btn.style.borderColor = "#fca5a5"; }
      const fb = document.querySelector("#quiz-feedback");
      fb.textContent = correct ? "✓ Correct!" : \`✗ Answer: \${data.a}\`;
      fb.style.color = correct ? "#16a34a" : "#ef4444";
      document.querySelector("#quiz-score").textContent = \`Score: \${score} / \${qIndex+1}\`;
      document.querySelector("#quiz-next").style.display = qIndex < QUIZ.length - 1 ? "" : "none";
    });
  });
}

document.querySelector("#quiz-next")?.addEventListener("click", () => { qIndex++; showQuestion(); });

showQuestion();`,
  },

  // ── UI (extra) ───────────────────────────────────────────────────────────────
  {
    name: "Accordion / FAQ",
    category: "UI",
    icon: "▾",
    description: "Click a question to expand its answer; only one open at a time.",
    html: `<style>
  .acc-item { border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; overflow:hidden; }
  .acc-btn  { width:100%; text-align:left; padding:14px 18px; background:#f9fafb; border:none; cursor:pointer; font-size:14px; font-weight:600; font-family:inherit; display:flex; justify-content:space-between; }
  .acc-btn .arrow { transition:transform 0.3s; }
  .acc-btn.open .arrow { transform:rotate(180deg); }
  .acc-body { max-height:0; overflow:hidden; transition:max-height 0.35s ease, padding 0.35s; padding:0 18px; font-size:13px; color:#374151; }
  .acc-body.open { max-height:200px; padding:14px 18px; }
</style>
<div class="acc-item">
  <button class="acc-btn">What is HTML? <span class="arrow">▾</span></button>
  <div class="acc-body">HTML (HyperText Markup Language) is the standard language for creating web pages.</div>
</div>
<div class="acc-item">
  <button class="acc-btn">What is CSS? <span class="arrow">▾</span></button>
  <div class="acc-body">CSS (Cascading Style Sheets) describes how HTML elements are displayed on screen.</div>
</div>
<div class="acc-item">
  <button class="acc-btn">What is JavaScript? <span class="arrow">▾</span></button>
  <div class="acc-body">JavaScript is a scripting language that enables interactive web pages and is an essential part of web applications.</div>
</div>`,
    js: `document.querySelectorAll(".acc-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const isOpen = btn.classList.contains("open");
    document.querySelectorAll(".acc-btn").forEach(b => { b.classList.remove("open"); b.nextElementSibling.classList.remove("open"); });
    if (!isOpen) { btn.classList.add("open"); btn.nextElementSibling.classList.add("open"); }
  });
});`,
  },
  {
    name: "Tabs Panel",
    category: "UI",
    icon: "▭",
    description: "Switch between content panels with a tab bar.",
    html: `<style>
  .tab-bar  { display:flex; border-bottom:2px solid #e5e7eb; margin-bottom:16px; }
  .tab-btn  { padding:10px 20px; border:none; background:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; color:#6b7280; border-bottom:2px solid transparent; margin-bottom:-2px; }
  .tab-btn.active { color:#1f2937; border-bottom-color:#1f2937; }
  .tab-panel { display:none; font-size:14px; color:#374151; }
  .tab-panel.active { display:block; }
</style>
<div class="tab-bar">
  <button class="tab-btn active" data-tab="tab1">Profile</button>
  <button class="tab-btn" data-tab="tab2">Settings</button>
  <button class="tab-btn" data-tab="tab3">Billing</button>
</div>
<div id="tab1" class="tab-panel active"><p>This is your <strong>Profile</strong> tab content.</p></div>
<div id="tab2" class="tab-panel"><p>This is your <strong>Settings</strong> tab content.</p></div>
<div id="tab3" class="tab-panel"><p>This is your <strong>Billing</strong> tab content.</p></div>`,
    js: `document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector("#" + btn.dataset.tab).classList.add("active");
  });
});`,
  },
  {
    name: "Modal Dialog",
    category: "UI",
    icon: "⬜",
    description: "Open and close a centered modal overlay with keyboard and backdrop support.",
    html: `<style>
  #modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:999; align-items:center; justify-content:center; }
  #modal-overlay.open { display:flex; }
  #modal-box { background:#fff; border-radius:12px; padding:32px; max-width:400px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.2); position:relative; }
  #modal-close { position:absolute; top:12px; right:14px; background:none; border:none; font-size:20px; cursor:pointer; color:#6b7280; }
</style>
<button id="open-modal" style="padding:10px 20px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Open Modal</button>
<div id="modal-overlay">
  <div id="modal-box">
    <button id="modal-close">×</button>
    <h2 style="margin:0 0 10px;font-size:18px;">Modal Title</h2>
    <p style="font-size:14px;color:#6b7280;margin:0 0 20px;">This is modal content. Press Escape or click outside to close.</p>
    <button id="modal-confirm" style="padding:9px 20px;background:#1f2937;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;">Confirm</button>
  </div>
</div>`,
    js: `const overlay   = document.querySelector("#modal-overlay");
const openBtn   = document.querySelector("#open-modal");
const closeBtn  = document.querySelector("#modal-close");
const confirmBtn = document.querySelector("#modal-confirm");

const openModal  = () => overlay.classList.add("open");
const closeModal = () => overlay.classList.remove("open");

openBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);
confirmBtn?.addEventListener("click", closeModal);
overlay?.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });`,
  },
  {
    name: "Countdown Timer",
    category: "UI",
    icon: "⏱",
    description: "Visual countdown timer with start, pause, and reset controls.",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px;font-family:inherit;">
  <div id="timer-display" style="font-size:52px;font-weight:700;letter-spacing:4px;color:#1f2937;">05:00</div>
  <div style="display:flex;gap:10px;">
    <button id="timer-start" style="padding:9px 18px;background:#16a34a;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Start</button>
    <button id="timer-pause" style="padding:9px 18px;background:#ca8a04;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Pause</button>
    <button id="timer-reset" style="padding:9px 18px;background:#dc2626;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Reset</button>
  </div>
</div>`,
    js: `let totalSeconds = 5 * 60;
let remaining   = totalSeconds;
let interval    = null;
const display   = document.querySelector("#timer-display");

function fmt(s) { return \`\${String(Math.floor(s/60)).padStart(2,"0")}:\${String(s%60).padStart(2,"0")}\`; }
function tick()  { if (remaining <= 0) { clearInterval(interval); interval = null; display.textContent = "00:00"; return; } remaining--; display.textContent = fmt(remaining); }

document.querySelector("#timer-start")?.addEventListener("click", () => { if (!interval && remaining > 0) interval = setInterval(tick, 1000); });
document.querySelector("#timer-pause")?.addEventListener("click", () => { clearInterval(interval); interval = null; });
document.querySelector("#timer-reset")?.addEventListener("click", () => { clearInterval(interval); interval = null; remaining = totalSeconds; display.textContent = fmt(remaining); });`,
  },
  {
    name: "Character Counter",
    category: "UI",
    icon: "🔢",
    description: "Live character counter for a textarea with a max limit.",
    html: `<div style="display:flex;flex-direction:column;gap:8px;max-width:400px;">
  <label style="font-size:13px;font-weight:600;color:#374151;">Your Message</label>
  <textarea id="char-input" maxlength="280" placeholder="Type something..." style="resize:vertical;min-height:100px;padding:10px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:14px;"></textarea>
  <div style="display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;">
    <span id="char-hint">Markdown supported</span>
    <span id="char-count">0 / 280</span>
  </div>
</div>`,
    js: `const charInput = document.querySelector("#char-input");
const charCount = document.querySelector("#char-count");
charInput?.addEventListener("input", () => {
  const len = charInput.value.length;
  charCount.textContent = \`\${len} / 280\`;
  charCount.style.color = len > 250 ? (len >= 280 ? "#dc2626" : "#ca8a04") : "#9ca3af";
});`,
  },
  {
    name: "Color Picker Preview",
    category: "UI",
    icon: "🎨",
    description: "Native color picker that live-previews the selected color as a swatch and hex value.",
    html: `<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;padding:20px;">
  <label style="font-size:13px;font-weight:600;color:#374151;">Pick a Color</label>
  <input type="color" id="color-picker" value="#3b82f6" style="width:60px;height:40px;border:none;cursor:pointer;border-radius:6px;">
  <div id="color-swatch" style="width:120px;height:80px;border-radius:10px;background:#3b82f6;box-shadow:0 4px 14px rgba(0,0,0,0.15);transition:background 0.2s;"></div>
  <code id="color-hex" style="font-size:16px;font-weight:700;color:#1f2937;">#3b82f6</code>
</div>`,
    js: `const picker  = document.querySelector("#color-picker");
const swatch  = document.querySelector("#color-swatch");
const hexLabel = document.querySelector("#color-hex");
picker?.addEventListener("input", () => {
  swatch.style.background = picker.value;
  hexLabel.textContent    = picker.value;
});`,
  },

  // ── Forms (extra) ────────────────────────────────────────────────────────────
  {
    name: "Multi-Step Form",
    category: "Forms",
    icon: "📋",
    description: "Step-by-step form wizard with progress indicator and back/next navigation.",
    html: `<style>
  .step { display:none; flex-direction:column; gap:12px; }
  .step.active { display:flex; }
  .step-input { padding:10px; border:1px solid #d1d5db; border-radius:7px; font-family:inherit; font-size:14px; }
  .step-progress { display:flex; gap:6px; margin-bottom:18px; }
  .step-dot { width:28px; height:8px; border-radius:4px; background:#e5e7eb; transition:background 0.3s; }
  .step-dot.done { background:#1f2937; }
</style>
<div style="max-width:360px;padding:24px;font-family:inherit;">
  <div class="step-progress">
    <div class="step-dot done" id="dot1"></div>
    <div class="step-dot" id="dot2"></div>
    <div class="step-dot" id="dot3"></div>
  </div>
  <div class="step active" id="step1">
    <h3 style="margin:0;font-size:16px;">Step 1 — Your Info</h3>
    <input class="step-input" id="sf-name" placeholder="Full Name">
    <input class="step-input" id="sf-email" placeholder="Email">
    <button id="sf-next1" style="padding:10px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Next →</button>
  </div>
  <div class="step" id="step2">
    <h3 style="margin:0;font-size:16px;">Step 2 — Preferences</h3>
    <select class="step-input" id="sf-plan"><option>Free</option><option>Pro</option><option>Enterprise</option></select>
    <div style="display:flex;gap:8px;">
      <button id="sf-back1" style="flex:1;padding:10px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:7px;cursor:pointer;font-family:inherit;">← Back</button>
      <button id="sf-next2" style="flex:1;padding:10px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Next →</button>
    </div>
  </div>
  <div class="step" id="step3">
    <h3 style="margin:0;font-size:16px;">Step 3 — Confirm</h3>
    <p id="sf-summary" style="font-size:13px;color:#6b7280;margin:0;"></p>
    <div style="display:flex;gap:8px;">
      <button id="sf-back2" style="flex:1;padding:10px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:7px;cursor:pointer;font-family:inherit;">← Back</button>
      <button id="sf-submit" style="flex:1;padding:10px;background:#16a34a;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Submit ✓</button>
    </div>
  </div>
</div>`,
    js: `function goStep(from, to) {
  document.querySelector("#step"+from).classList.remove("active");
  document.querySelector("#step"+to).classList.add("active");
  [1,2,3].forEach(i => document.querySelector("#dot"+i).classList.toggle("done", i <= to));
}
document.querySelector("#sf-next1")?.addEventListener("click", () => goStep(1,2));
document.querySelector("#sf-back1")?.addEventListener("click", () => goStep(2,1));
document.querySelector("#sf-next2")?.addEventListener("click", () => {
  const name = document.querySelector("#sf-name").value;
  const plan = document.querySelector("#sf-plan").value;
  document.querySelector("#sf-summary").textContent = \`Name: \${name} · Plan: \${plan}\`;
  goStep(2,3);
});
document.querySelector("#sf-back2")?.addEventListener("click", () => goStep(3,2));
document.querySelector("#sf-submit")?.addEventListener("click", () => alert("Form submitted!"));`,
  },
  {
    name: "Tag Input",
    category: "Forms",
    icon: "🏷",
    description: "Add and remove tags by pressing Enter or comma; stores values in an array.",
    html: `<style>
  #tag-wrap { display:flex; flex-wrap:wrap; gap:6px; padding:8px; border:1px solid #d1d5db; border-radius:8px; min-height:44px; align-items:center; }
  .tag-chip { display:inline-flex; align-items:center; gap:5px; background:#e0e7ff; color:#3730a3; border-radius:20px; padding:3px 10px; font-size:13px; font-weight:600; }
  .tag-del  { cursor:pointer; font-size:16px; line-height:1; opacity:0.7; }
  .tag-del:hover { opacity:1; }
  #tag-input-field { border:none; outline:none; font-family:inherit; font-size:14px; min-width:120px; flex:1; }
</style>
<label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Skills</label>
<div id="tag-wrap">
  <input id="tag-input-field" placeholder="Add tag, press Enter…">
</div>
<p style="font-size:12px;color:#9ca3af;margin-top:6px;">Press <kbd>Enter</kbd> or <kbd>,</kbd> to add</p>`,
    js: `const tags  = [];
const wrap  = document.querySelector("#tag-wrap");
const field = document.querySelector("#tag-input-field");

function addTag(val) {
  val = val.trim().replace(/,$/,"");
  if (!val || tags.includes(val)) return;
  tags.push(val);
  const chip = document.createElement("span");
  chip.className = "tag-chip";
  chip.innerHTML = \`\${val}<span class="tag-del">×</span>\`;
  chip.querySelector(".tag-del").addEventListener("click", () => { tags.splice(tags.indexOf(val),1); chip.remove(); });
  wrap.insertBefore(chip, field);
}

field.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(field.value); field.value = ""; }
  if (e.key === "Backspace" && !field.value && tags.length) {
    const last = wrap.querySelectorAll(".tag-chip");
    last[last.length-1]?.remove();
    tags.pop();
  }
});`,
  },
  {
    name: "File Drag & Drop",
    category: "Forms",
    icon: "📁",
    description: "Drag a file onto the drop zone to display its name and size.",
    html: `<style>
  #drop-zone { border:2px dashed #d1d5db; border-radius:12px; padding:40px; text-align:center; color:#9ca3af; font-size:14px; transition:border-color 0.2s, background 0.2s; cursor:pointer; }
  #drop-zone.over { border-color:#3b82f6; background:#eff6ff; color:#3b82f6; }
</style>
<div id="drop-zone">
  <div style="font-size:32px;margin-bottom:8px;">📂</div>
  Drag & drop a file here, or click to browse
  <input type="file" id="file-input" style="display:none;">
</div>
<p id="file-info" style="font-size:13px;color:#374151;margin-top:10px;"></p>`,
    js: `const zone = document.querySelector("#drop-zone");
const info = document.querySelector("#file-info");
const fileInput = document.querySelector("#file-input");

function showFile(file) {
  info.textContent = \`📄 \${file.name}  ·  \${(file.size/1024).toFixed(1)} KB  ·  \${file.type || "unknown type"}\`;
}

zone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => fileInput.files[0] && showFile(fileInput.files[0]));
zone.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("over"); });
zone.addEventListener("dragleave", () => zone.classList.remove("over"));
zone.addEventListener("drop", e => {
  e.preventDefault();
  zone.classList.remove("over");
  const file = e.dataTransfer.files[0];
  if (file) showFile(file);
});`,
  },
  {
    name: "OTP / PIN Input",
    category: "Forms",
    icon: "🔑",
    description: "6-digit OTP input that auto-advances focus on each keystroke.",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:24px;font-family:inherit;">
  <p style="font-size:14px;font-weight:600;color:#374151;margin:0;">Enter 6-Digit Code</p>
  <div id="otp-wrap" style="display:flex;gap:10px;">
    <input class="otp-box" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;border:2px solid #d1d5db;border-radius:8px;font-family:inherit;outline:none;">
    <input class="otp-box" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;border:2px solid #d1d5db;border-radius:8px;font-family:inherit;outline:none;">
    <input class="otp-box" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;border:2px solid #d1d5db;border-radius:8px;font-family:inherit;outline:none;">
    <input class="otp-box" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;border:2px solid #d1d5db;border-radius:8px;font-family:inherit;outline:none;">
    <input class="otp-box" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;border:2px solid #d1d5db;border-radius:8px;font-family:inherit;outline:none;">
    <input class="otp-box" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;border:2px solid #d1d5db;border-radius:8px;font-family:inherit;outline:none;">
  </div>
  <button id="otp-verify" style="padding:10px 28px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Verify</button>
  <p id="otp-result" style="font-size:13px;color:#6b7280;margin:0;"></p>
</div>`,
    js: `const boxes = document.querySelectorAll(".otp-box");
boxes.forEach((box, i) => {
  box.addEventListener("input", () => { box.value = box.value.slice(-1); if (box.value && boxes[i+1]) boxes[i+1].focus(); });
  box.addEventListener("keydown", e => { if (e.key === "Backspace" && !box.value && boxes[i-1]) boxes[i-1].focus(); });
});
document.querySelector("#otp-verify")?.addEventListener("click", () => {
  const code = [...boxes].map(b => b.value).join("");
  const el   = document.querySelector("#otp-result");
  el.textContent = code.length === 6 ? \`✓ Code entered: \${code}\` : "✗ Please fill all 6 digits.";
  el.style.color = code.length === 6 ? "#16a34a" : "#dc2626";
});`,
  },

  // ── Navigation (extra) ───────────────────────────────────────────────────────
  {
    name: "Sticky Header on Scroll",
    category: "Navigation",
    icon: "📌",
    description: "Header becomes sticky with a shadow when the user scrolls past it.",
    html: `<style>
  #sticky-header { position:sticky; top:0; z-index:100; background:#fff; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; transition:box-shadow 0.3s; }
  #sticky-header.scrolled { box-shadow:0 2px 16px rgba(0,0,0,0.12); }
</style>
<div id="sticky-header">
  <span style="font-weight:700;font-size:16px;">MySite</span>
  <nav style="display:flex;gap:20px;font-size:13px;color:#6b7280;"><a href="#">Home</a><a href="#">About</a><a href="#">Docs</a></nav>
</div>
<div style="height:600px;padding:24px;color:#9ca3af;font-size:14px;">Scroll down to see the sticky header shadow effect.</div>`,
    js: `const header = document.querySelector("#sticky-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
});`,
  },
  {
    name: "Breadcrumb Builder",
    category: "Navigation",
    icon: "›",
    description: "Dynamically build a breadcrumb trail from a path string.",
    html: `<nav id="breadcrumb" aria-label="Breadcrumb" style="font-size:13px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:12px;"></nav>
<div style="margin-top:12px;display:flex;gap:8px;">
  <input id="bc-input" value="Home/Products/Electronics/Laptops" style="flex:1;padding:9px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:13px;">
  <button id="bc-build" style="padding:9px 16px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Build</button>
</div>`,
    js: `function buildBreadcrumb(path) {
  const crumb = document.querySelector("#breadcrumb");
  const parts = path.split("/").filter(Boolean);
  crumb.innerHTML = parts.map((p, i) => {
    const isLast = i === parts.length - 1;
    return isLast
      ? \`<span style="color:#1f2937;font-weight:600;">\${p}</span>\`
      : \`<a href="#" style="color:#6b7280;text-decoration:none;">\${p}</a><span style="color:#d1d5db;">›</span>\`;
  }).join(" ");
}
buildBreadcrumb(document.querySelector("#bc-input").value);
document.querySelector("#bc-build")?.addEventListener("click", () => buildBreadcrumb(document.querySelector("#bc-input").value));`,
  },
  {
    name: "Pagination",
    category: "Navigation",
    icon: "◀▶",
    description: "Simple numbered pagination with previous/next buttons.",
    html: `<div id="page-content" style="padding:20px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;color:#374151;margin-bottom:16px;min-height:60px;"></div>
<div id="page-controls" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;"></div>`,
    js: `const pages  = ["Page 1 — Introduction to JavaScript.", "Page 2 — Variables and Types.", "Page 3 — Functions and Scope.", "Page 4 — Arrays and Objects.", "Page 5 — Async/Await and Promises."];
let current  = 0;

function render() {
  document.querySelector("#page-content").textContent = pages[current];
  const ctrl = document.querySelector("#page-controls");
  ctrl.innerHTML = "";
  const prev = document.createElement("button");
  prev.textContent = "← Prev";
  prev.disabled    = current === 0;
  prev.style.cssText = "padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;background:#f9fafb;";
  prev.addEventListener("click", () => { current--; render(); });
  ctrl.appendChild(prev);

  pages.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.style.cssText = \`padding:7px 12px;border:1px solid \${i===current?"#1f2937":"#d1d5db"};border-radius:6px;cursor:pointer;font-family:inherit;background:\${i===current?"#1f2937":"#f9fafb"};color:\${i===current?"#fff":"#374151"};\`;
    btn.addEventListener("click", () => { current = i; render(); });
    ctrl.appendChild(btn);
  });

  const next = document.createElement("button");
  next.textContent = "Next →";
  next.disabled    = current === pages.length - 1;
  next.style.cssText = "padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-family:inherit;background:#f9fafb;";
  next.addEventListener("click", () => { current++; render(); });
  ctrl.appendChild(next);
}
render();`,
  },

  // ── Utilities (extra) ────────────────────────────────────────────────────────
  {
    name: "Text to Speech",
    category: "Utilities",
    icon: "🔊",
    description: "Use the Web Speech API to speak text aloud with pitch and rate controls.",
    html: `<div style="display:flex;flex-direction:column;gap:12px;max-width:380px;font-family:inherit;">
  <textarea id="tts-text" style="min-height:90px;padding:10px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:14px;resize:vertical;">Hello! This is a text-to-speech demo using the Web Speech API.</textarea>
  <div style="display:flex;gap:12px;align-items:center;font-size:13px;color:#374151;">
    <label>Rate <input id="tts-rate" type="range" min="0.5" max="2" step="0.1" value="1" style="width:80px;"> <span id="tts-rate-val">1</span></label>
    <label>Pitch <input id="tts-pitch" type="range" min="0" max="2" step="0.1" value="1" style="width:80px;"> <span id="tts-pitch-val">1</span></label>
  </div>
  <div style="display:flex;gap:8px;">
    <button id="tts-speak" style="flex:1;padding:10px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">▶ Speak</button>
    <button id="tts-stop"  style="flex:1;padding:10px;background:#dc2626;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">■ Stop</button>
  </div>
</div>`,
    js: `const rateInput  = document.querySelector("#tts-rate");
const pitchInput = document.querySelector("#tts-pitch");
rateInput?.addEventListener("input",  () => document.querySelector("#tts-rate-val").textContent  = rateInput.value);
pitchInput?.addEventListener("input", () => document.querySelector("#tts-pitch-val").textContent = pitchInput.value);

document.querySelector("#tts-speak")?.addEventListener("click", () => {
  if (!window.speechSynthesis) return alert("Not supported in this browser.");
  speechSynthesis.cancel();
  const utt   = new SpeechSynthesisUtterance(document.querySelector("#tts-text").value);
  utt.rate    = parseFloat(rateInput.value);
  utt.pitch   = parseFloat(pitchInput.value);
  speechSynthesis.speak(utt);
});
document.querySelector("#tts-stop")?.addEventListener("click", () => speechSynthesis.cancel());`,
  },
  {
    name: "URL Query Parser",
    category: "Utilities",
    icon: "🔗",
    description: "Parse a URL query string into a readable key/value table.",
    html: `<div style="display:flex;flex-direction:column;gap:10px;max-width:480px;font-family:inherit;">
  <input id="qp-input" value="https://example.com/search?q=hello&page=2&sort=asc&theme=dark" style="padding:10px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:13px;">
  <button id="qp-parse" style="padding:9px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Parse →</button>
  <table id="qp-table" style="border-collapse:collapse;font-size:13px;width:100%;"></table>
</div>`,
    js: `document.querySelector("#qp-parse")?.addEventListener("click", () => {
  const raw = document.querySelector("#qp-input").value;
  const table = document.querySelector("#qp-table");
  try {
    const url    = new URL(raw);
    const params = [...url.searchParams.entries()];
    table.innerHTML = \`<tr style="background:#f3f4f6;"><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Key</th><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Value</th></tr>\`
      + params.map(([k,v]) => \`<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#7c3aed;">\${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">\${v}</td></tr>\`).join("");
  } catch { table.innerHTML = \`<tr><td style="color:#dc2626;padding:8px;">Invalid URL</td></tr>\`; }
});`,
  },
  {
    name: "JSON Formatter",
    category: "Utilities",
    icon: "{ }",
    description: "Paste raw JSON and format / validate it with syntax highlighting.",
    html: `<div style="display:flex;flex-direction:column;gap:10px;max-width:520px;font-family:inherit;">
  <textarea id="json-input" placeholder='Paste JSON here…' style="min-height:100px;padding:10px;border:1px solid #d1d5db;border-radius:7px;font-family:monospace;font-size:13px;resize:vertical;">{"name":"Alice","age":30,"skills":["JS","CSS","HTML"]}</textarea>
  <div style="display:flex;gap:8px;">
    <button id="json-fmt"  style="flex:1;padding:9px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Format ↵</button>
    <button id="json-mini" style="flex:1;padding:9px;background:#6b7280;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Minify</button>
  </div>
  <pre id="json-out" style="background:#1e293b;color:#93c5fd;border-radius:8px;padding:16px;font-size:13px;overflow:auto;max-height:200px;margin:0;"></pre>
  <p id="json-err" style="color:#ef4444;font-size:12px;margin:0;"></p>
</div>`,
    js: `const jsonInput = document.querySelector("#json-input");
const jsonOut   = document.querySelector("#json-out");
const jsonErr   = document.querySelector("#json-err");

function tryParse() {
  try { jsonErr.textContent = ""; return JSON.parse(jsonInput.value); }
  catch(e) { jsonErr.textContent = e.message; return null; }
}
document.querySelector("#json-fmt")?.addEventListener("click",  () => { const d = tryParse(); if (d) jsonOut.textContent = JSON.stringify(d, null, 2); });
document.querySelector("#json-mini")?.addEventListener("click", () => { const d = tryParse(); if (d) jsonOut.textContent = JSON.stringify(d); });`,
  },
  {
    name: "Unit Converter",
    category: "Utilities",
    icon: "⇄",
    description: "Convert between common length units (km, m, cm, mm, miles, feet, inches).",
    html: `<div style="display:flex;flex-direction:column;gap:12px;max-width:340px;font-family:inherit;">
  <h3 style="margin:0;font-size:15px;color:#1f2937;">Length Converter</h3>
  <div style="display:flex;gap:8px;">
    <input id="uc-val" type="number" value="1" style="flex:1;padding:9px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:14px;">
    <select id="uc-from" style="padding:9px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:14px;">
      <option value="m">Meter</option><option value="km">Kilometer</option><option value="cm">Centimeter</option>
      <option value="mm">Millimeter</option><option value="mi">Mile</option><option value="ft">Foot</option><option value="in">Inch</option>
    </select>
  </div>
  <div id="uc-results" style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#374151;"></div>
</div>`,
    js: `const TO_M = { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, ft:0.3048, in:0.0254 };
const LABELS = { m:"Meter", km:"Kilometer", cm:"Centimeter", mm:"Millimeter", mi:"Mile", ft:"Foot", in:"Inch" };

function convert() {
  const val  = parseFloat(document.querySelector("#uc-val").value) || 0;
  const from = document.querySelector("#uc-from").value;
  const meters = val * TO_M[from];
  document.querySelector("#uc-results").innerHTML = Object.entries(TO_M)
    .filter(([u]) => u !== from)
    .map(([u, m]) => \`<div style="padding:7px 10px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;"><strong>\${(meters/m).toLocaleString(undefined,{maximumFractionDigits:6})}</strong> \${LABELS[u]}</div>\`)
    .join("");
}
document.querySelector("#uc-val")?.addEventListener("input",  convert);
document.querySelector("#uc-from")?.addEventListener("change", convert);
convert();`,
  },
  {
    name: "Stopwatch",
    category: "Utilities",
    icon: "⏲",
    description: "Stopwatch with lap recording, displayed in mm:ss.ms format.",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px;font-family:inherit;">
  <div id="sw-display" style="font-size:48px;font-weight:700;letter-spacing:3px;color:#1f2937;font-variant-numeric:tabular-nums;">00:00.00</div>
  <div style="display:flex;gap:10px;">
    <button id="sw-start" style="padding:9px 18px;background:#16a34a;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Start</button>
    <button id="sw-lap"   style="padding:9px 18px;background:#2563eb;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Lap</button>
    <button id="sw-reset" style="padding:9px 18px;background:#dc2626;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Reset</button>
  </div>
  <ol id="sw-laps" style="font-size:13px;color:#6b7280;list-style-position:inside;max-height:120px;overflow-y:auto;width:100%;padding:0;margin:0;"></ol>
</div>`,
    js: `let swStart = 0, swElapsed = 0, swRunning = false, swInterval = null;
const display = document.querySelector("#sw-display");

function fmt(ms) {
  const m = Math.floor(ms/60000), s = Math.floor((ms%60000)/1000), cs = Math.floor((ms%1000)/10);
  return \`\${String(m).padStart(2,"0")}:\${String(s).padStart(2,"0")}.\${String(cs).padStart(2,"0")}\`;
}

document.querySelector("#sw-start")?.addEventListener("click", function() {
  if (swRunning) { clearInterval(swInterval); swElapsed += Date.now()-swStart; swRunning=false; this.textContent="Start"; }
  else           { swStart=Date.now(); swInterval=setInterval(()=>{ display.textContent=fmt(swElapsed+Date.now()-swStart); },50); swRunning=true; this.textContent="Stop"; }
});
document.querySelector("#sw-lap")?.addEventListener("click",   () => { if (!swRunning) return; const li=document.createElement("li"); li.textContent=\`Lap \${document.querySelectorAll("#sw-laps li").length+1}: \${display.textContent}\`; document.querySelector("#sw-laps").prepend(li); });
document.querySelector("#sw-reset")?.addEventListener("click", () => { clearInterval(swInterval); swRunning=false; swElapsed=0; display.textContent="00:00.00"; document.querySelector("#sw-laps").innerHTML=""; document.querySelector("#sw-start").textContent="Start"; });`,
  },

  // ── Animation (extra) ────────────────────────────────────────────────────────
  {
    name: "Parallax Scroll",
    category: "Animation",
    icon: "🏔",
    description: "Move a background image at a slower rate than the scroll for a parallax effect.",
    html: `<style>
  #parallax-hero { height:280px; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:12px; position:relative; }
  #parallax-bg   { position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='28' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3C/svg%3E"); will-change:transform; }
</style>
<div id="parallax-hero">
  <div id="parallax-bg"></div>
  <h2 style="color:#fff;font-size:24px;font-weight:700;position:relative;text-shadow:0 2px 8px rgba(0,0,0,0.3);">Parallax Hero</h2>
</div>
<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;">Scroll to see the parallax effect above</div>`,
    js: `const parallaxBg = document.querySelector("#parallax-bg");
window.addEventListener("scroll", () => {
  const hero   = document.querySelector("#parallax-hero");
  const rect   = hero.getBoundingClientRect();
  const offset = (rect.top / window.innerHeight) * 60;
  parallaxBg.style.transform = \`translateY(\${offset}px)\`;
}, { passive: true });`,
  },
  {
    name: "Animated Number Ticker",
    category: "Animation",
    icon: "🎰",
    description: "Slot-machine style number ticker that animates digit by digit.",
    html: `<style>
  .ticker-wrap  { display:inline-flex; overflow:hidden; height:1.2em; align-items:flex-end; }
  .ticker-col   { display:flex; flex-direction:column; transition:transform 0.6s cubic-bezier(.22,.61,.36,1); }
  .ticker-digit { line-height:1.2; }
</style>
<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:32px;font-family:inherit;">
  <div id="ticker" style="font-size:56px;font-weight:900;color:#1f2937;display:flex;"></div>
  <button id="ticker-btn" style="padding:10px 24px;background:#1f2937;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;">Randomize</button>
</div>`,
    js: `const tickerEl = document.querySelector("#ticker");
const DIGITS = "0123456789";

function buildTicker(num) {
  const str = String(num).padStart(6, "0");
  tickerEl.innerHTML = str.split("").map(d => {
    const idx = parseInt(d);
    const col = DIGITS.split("").map(n => \`<div class="ticker-digit">\${n}</div>\`).join("");
    return \`<div class="ticker-wrap"><div class="ticker-col" style="transform:translateY(-\${idx * 1.2}em)">\${col}</div></div>\`;
  }).join("");
}

function animate(num) {
  const str = String(num).padStart(6,"0");
  tickerEl.querySelectorAll(".ticker-col").forEach((col, i) => {
    const idx = parseInt(str[i]);
    col.style.transform = \`translateY(-\${idx * 1.2}em)\`;
  });
}

buildTicker(0);
setTimeout(() => animate(123456), 100);
document.querySelector("#ticker-btn")?.addEventListener("click", () => {
  const n = Math.floor(Math.random() * 999999);
  buildTicker(n);
  setTimeout(() => animate(n), 50);
});`,
  },
  {
    name: "Pulse / Ping Animation",
    category: "Animation",
    icon: "📡",
    description: "CSS keyframe pulse rings around a dot — useful for map markers or live indicators.",
    html: `<style>
  @keyframes ping { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.5);opacity:0} }
  .ping-wrap { position:relative; display:inline-flex; align-items:center; justify-content:center; }
  .ping-ring { position:absolute; width:40px; height:40px; border-radius:50%; background:#3b82f6; opacity:0; animation:ping 1.4s ease-out infinite; }
  .ping-ring:nth-child(2) { animation-delay:0.5s; }
  .ping-dot  { width:16px; height:16px; border-radius:50%; background:#1d4ed8; position:relative; }
</style>
<div style="display:flex;align-items:center;gap:20px;padding:32px;font-family:inherit;">
  <div class="ping-wrap">
    <div class="ping-ring"></div>
    <div class="ping-ring"></div>
    <div class="ping-dot"></div>
  </div>
  <span style="font-size:14px;color:#374151;font-weight:600;">Live — Broadcasting</span>
</div>`,
    js: `// No JS needed — pure CSS animation. Add class .ping-wrap to any element to activate.`,
  },
  {
    name: "Smooth Scroll to Section",
    category: "Animation",
    icon: "⬇",
    description: "Anchor nav links that smooth-scroll to page sections with an active highlight.",
    html: `<style>
  .ss-nav a { padding:8px 16px; text-decoration:none; color:#6b7280; font-size:13px; font-weight:600; border-radius:6px; transition:color 0.2s,background 0.2s; }
  .ss-nav a.active { color:#1f2937; background:#f3f4f6; }
  .ss-section { padding:40px 20px; margin:8px 0; border-radius:10px; font-size:14px; }
</style>
<nav class="ss-nav" style="display:flex;gap:4px;position:sticky;top:0;background:#fff;z-index:10;padding:8px;border-bottom:1px solid #e5e7eb;">
  <a href="#ss1">Home</a><a href="#ss2">About</a><a href="#ss3">Services</a><a href="#ss4">Contact</a>
</nav>
<div id="ss1" class="ss-section" style="background:#eff6ff;">🏠 Home Section</div>
<div id="ss2" class="ss-section" style="background:#f0fdf4;">👋 About Section</div>
<div id="ss3" class="ss-section" style="background:#fefce8;">⚙ Services Section</div>
<div id="ss4" class="ss-section" style="background:#fdf4ff;">✉ Contact Section</div>`,
    js: `document.querySelectorAll('.ss-nav a').forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior:"smooth" });
  });
});
const sections = document.querySelectorAll(".ss-section");
const navLinks  = document.querySelectorAll(".ss-nav a");
const ssObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#"+entry.target.id));
    }
  });
}, { threshold: 0.5 });
sections.forEach(s => ssObs.observe(s));`,
  },

  // ── Data (extra) ─────────────────────────────────────────────────────────────
  {
    name: "LocalStorage Notes",
    category: "Data",
    icon: "📝",
    description: "Simple persistent notepad that saves to localStorage automatically.",
    html: `<div style="display:flex;flex-direction:column;gap:10px;max-width:400px;font-family:inherit;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <h3 style="margin:0;font-size:15px;color:#1f2937;">Quick Notes</h3>
    <button id="notes-clear" style="padding:5px 12px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px;">Clear</button>
  </div>
  <textarea id="notes-area" placeholder="Start typing…" style="min-height:180px;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical;"></textarea>
  <p id="notes-status" style="font-size:12px;color:#9ca3af;margin:0;text-align:right;">Unsaved</p>
</div>`,
    js: `const notesArea   = document.querySelector("#notes-area");
const notesStatus = document.querySelector("#notes-status");
const NOTES_KEY   = "quick_notes_v1";

notesArea.value = localStorage.getItem(NOTES_KEY) || "";
notesStatus.textContent = notesArea.value ? "Loaded from storage" : "Nothing saved yet";

let saveTimer;
notesArea.addEventListener("input", () => {
  notesStatus.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(NOTES_KEY, notesArea.value);
    notesStatus.textContent = "Saved ✓";
  }, 800);
});
document.querySelector("#notes-clear")?.addEventListener("click", () => {
  if (!confirm("Clear all notes?")) return;
  notesArea.value = "";
  localStorage.removeItem(NOTES_KEY);
  notesStatus.textContent = "Cleared";
});`,
  },
  {
    name: "IndexedDB Key-Value Store",
    category: "Data",
    icon: "🗄",
    description: "Store and retrieve key-value pairs using the browser's IndexedDB.",
    html: `<div style="display:flex;flex-direction:column;gap:10px;max-width:380px;font-family:inherit;">
  <h3 style="margin:0;font-size:15px;color:#1f2937;">IndexedDB Store</h3>
  <div style="display:flex;gap:6px;">
    <input id="idb-key"   placeholder="Key"   style="flex:1;padding:9px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:13px;">
    <input id="idb-val"   placeholder="Value" style="flex:2;padding:9px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:13px;">
  </div>
  <div style="display:flex;gap:6px;">
    <button id="idb-set" style="flex:1;padding:9px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Set</button>
    <button id="idb-get" style="flex:1;padding:9px;background:#2563eb;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Get</button>
    <button id="idb-del" style="flex:1;padding:9px;background:#dc2626;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Delete</button>
  </div>
  <p id="idb-output" style="font-size:13px;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px;margin:0;">Output will appear here…</p>
</div>`,
    js: `let idbDB;
const req = indexedDB.open("kv_store", 1);
req.onupgradeneeded = e => e.target.result.createObjectStore("kv", { keyPath:"k" });
req.onsuccess = e => { idbDB = e.target.result; };

function idbTx(mode) { return idbDB.transaction("kv", mode).objectStore("kv"); }
function out(msg) { document.querySelector("#idb-output").textContent = msg; }
const key = () => document.querySelector("#idb-key").value.trim();
const val = () => document.querySelector("#idb-val").value.trim();

document.querySelector("#idb-set")?.addEventListener("click", () => {
  if (!key()) return out("Key required");
  idbTx("readwrite").put({ k:key(), v:val() }).onsuccess = () => out(\`Saved: \${key()} = \${val()}\`);
});
document.querySelector("#idb-get")?.addEventListener("click", () => {
  idbTx("readonly").get(key()).onsuccess = e => out(e.target.result ? \`\${key()} = \${e.target.result.v}\` : \`Key "\${key()}" not found\`);
});
document.querySelector("#idb-del")?.addEventListener("click", () => {
  idbTx("readwrite").delete(key()).onsuccess = () => out(\`Deleted: \${key()}\`);
});`,
  },
  {
    name: "CSV to Table",
    category: "Data",
    icon: "📊",
    description: "Paste CSV text and render it as an HTML table with headers.",
    html: `<div style="display:flex;flex-direction:column;gap:10px;max-width:520px;font-family:inherit;">
  <textarea id="csv-input" style="min-height:90px;padding:10px;border:1px solid #d1d5db;border-radius:7px;font-family:monospace;font-size:13px;resize:vertical;">Name,Age,City
Alice,30,New York
Bob,25,London
Carol,35,Tokyo</textarea>
  <button id="csv-render" style="padding:9px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Render Table →</button>
  <div id="csv-out" style="overflow:auto;"></div>
</div>`,
    js: `document.querySelector("#csv-render")?.addEventListener("click", () => {
  const lines = document.querySelector("#csv-input").value.trim().split("\\n").map(l => l.split(","));
  if (!lines.length) return;
  const [headers, ...rows] = lines;
  const thCss = "padding:9px 14px;border:1px solid #e5e7eb;background:#f3f4f6;font-weight:700;text-align:left;white-space:nowrap;";
  const tdCss = "padding:8px 14px;border:1px solid #e5e7eb;";
  document.querySelector("#csv-out").innerHTML =
    \`<table style="border-collapse:collapse;font-size:13px;width:100%;">
      <thead><tr>\${headers.map(h=>\`<th style="\${thCss}">\${h.trim()}</th>\`).join("")}</tr></thead>
      <tbody>\${rows.map(r=>\`<tr>\${r.map(c=>\`<td style="\${tdCss}">\${c.trim()}</td>\`).join("")}</tr>\`).join("")}</tbody>
    </table>\`;
});`,
  },
  {
    name: "Event Bus (pub/sub)",
    category: "Data",
    icon: "📻",
    description: "Minimal publish/subscribe event bus for decoupled component communication.",
    html: `<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;font-family:inherit;padding:20px;border:1px solid #e5e7eb;border-radius:10px;">
  <h3 style="margin:0;font-size:15px;">Event Bus Demo</h3>
  <div style="display:flex;gap:8px;">
    <input id="eb-msg" placeholder="Message to publish…" style="flex:1;padding:9px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:13px;">
    <button id="eb-pub" style="padding:9px 14px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Publish</button>
  </div>
  <p style="margin:0;font-size:12px;color:#9ca3af;">Subscribers A and B both listen to the same "message" event:</p>
  <div id="eb-subA" style="padding:10px;background:#f0fdf4;border-radius:6px;font-size:13px;color:#15803d;">Subscriber A: waiting…</div>
  <div id="eb-subB" style="padding:10px;background:#eff6ff;border-radius:6px;font-size:13px;color:#1d4ed8;">Subscriber B: waiting…</div>
</div>`,
    js: `const EventBus = (() => {
  const listeners = {};
  return {
    on:  (event, fn) => { (listeners[event] ??= []).push(fn); },
    off: (event, fn) => { listeners[event] = (listeners[event]||[]).filter(f=>f!==fn); },
    emit:(event, data) => { (listeners[event]||[]).forEach(fn=>fn(data)); },
  };
})();

EventBus.on("message", data => document.querySelector("#eb-subA").textContent = \`Subscriber A: "\${data}"\`);
EventBus.on("message", data => document.querySelector("#eb-subB").textContent = \`Subscriber B received \${data.length} chars.\`);

document.querySelector("#eb-pub")?.addEventListener("click", () => {
  const msg = document.querySelector("#eb-msg").value.trim();
  if (msg) EventBus.emit("message", msg);
});`,
  },

  // ── Fun (extra) ──────────────────────────────────────────────────────────────
  {
    name: "Snake Game",
    category: "Fun",
    icon: "🐍",
    description: "Playable Snake game on a canvas — use arrow keys to move.",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;font-family:inherit;">
  <canvas id="snake-canvas" width="300" height="300" style="border:2px solid #1f2937;border-radius:8px;background:#111827;"></canvas>
  <div id="snake-score" style="font-size:14px;font-weight:700;color:#374151;">Score: 0</div>
  <button id="snake-start" style="padding:9px 24px;background:#16a34a;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Start / Restart</button>
  <p style="font-size:12px;color:#9ca3af;margin:0;">Arrow keys to move</p>
</div>`,
    js: `const canvas  = document.querySelector("#snake-canvas");
const ctx     = canvas.getContext("2d");
const CELL    = 15, COLS = canvas.width/CELL, ROWS = canvas.height/CELL;
let snake, dir, food, score, interval;

function rand(max) { return Math.floor(Math.random()*max); }
function placeFood() { food = { x:rand(COLS), y:rand(ROWS) }; }
function draw() {
  ctx.fillStyle="#111827"; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#ef4444"; ctx.fillRect(food.x*CELL,food.y*CELL,CELL-1,CELL-1);
  snake.forEach((s,i) => { ctx.fillStyle=i===0?"#4ade80":"#22c55e"; ctx.fillRect(s.x*CELL,s.y*CELL,CELL-1,CELL-1); });
}
function tick() {
  const head = { x:snake[0].x+dir.x, y:snake[0].y+dir.y };
  if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)) { clearInterval(interval); ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle="#fff"; ctx.font="20px sans-serif"; ctx.textAlign="center"; ctx.fillText("Game Over!",canvas.width/2,canvas.height/2); return; }
  snake.unshift(head);
  if (head.x===food.x&&head.y===food.y) { score++; document.querySelector("#snake-score").textContent=\`Score: \${score}\`; placeFood(); } else snake.pop();
  draw();
}
document.querySelector("#snake-start")?.addEventListener("click", () => {
  clearInterval(interval);
  snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]; dir={x:1,y:0}; score=0;
  document.querySelector("#snake-score").textContent="Score: 0";
  placeFood(); draw(); interval=setInterval(tick,120);
});
document.addEventListener("keydown", e => {
  const MAP={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
  if (MAP[e.key] && !(MAP[e.key].x===-dir.x && MAP[e.key].y===-dir.y)) { e.preventDefault(); dir=MAP[e.key]; }
});`,
  },
  {
    name: "Memory Card Game",
    category: "Fun",
    icon: "🃏",
    description: "Flip and match pairs of emoji cards. Tracks moves and time.",
    html: `<style>
  #mem-grid { display:grid; grid-template-columns:repeat(4,64px); gap:8px; }
  .mem-card { width:64px; height:64px; perspective:600px; cursor:pointer; }
  .mem-inner { width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.4s; }
  .mem-card.flipped .mem-inner { transform:rotateY(180deg); }
  .mem-front,.mem-back { position:absolute; inset:0; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:26px; backface-visibility:hidden; }
  .mem-front { background:#1f2937; }
  .mem-back  { background:#f0fdf4; transform:rotateY(180deg); border:2px solid #d1d5db; }
</style>
<div style="display:flex;flex-direction:column;align-items:center;gap:14px;font-family:inherit;">
  <div style="display:flex;gap:20px;font-size:13px;color:#6b7280;">
    <span>Moves: <strong id="mem-moves">0</strong></span>
    <span>Time: <strong id="mem-time">0s</strong></span>
  </div>
  <div id="mem-grid"></div>
  <button id="mem-restart" style="padding:9px 20px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">New Game</button>
</div>`,
    js: `const EMOJIS = ["🍎","🍊","🍋","🍇","🍓","🫐","🍒","🍉"];
let flipped=[], matched=0, moves=0, timer=null, elapsed=0;

function shuffle(a) { for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } return a; }

function startGame() {
  clearInterval(timer); elapsed=0; moves=0; matched=0; flipped=[];
  document.querySelector("#mem-moves").textContent=0;
  document.querySelector("#mem-time").textContent="0s";
  const cards = shuffle([...EMOJIS,...EMOJIS]);
  const grid  = document.querySelector("#mem-grid");
  grid.innerHTML = cards.map((e,i)=>\`<div class="mem-card" data-idx="\${i}" data-emoji="\${e}"><div class="mem-inner"><div class="mem-front">?</div><div class="mem-back">\${e}</div></div></div>\`).join("");
  grid.querySelectorAll(".mem-card").forEach(card=>{
    card.addEventListener("click",()=>{
      if (card.classList.contains("flipped")||card.classList.contains("matched")||flipped.length===2) return;
      card.classList.add("flipped"); flipped.push(card);
      if (flipped.length===2) {
        moves++; document.querySelector("#mem-moves").textContent=moves;
        if (!timer) timer=setInterval(()=>{ elapsed++; document.querySelector("#mem-time").textContent=elapsed+"s"; },1000);
        if (flipped[0].dataset.emoji===flipped[1].dataset.emoji) {
          flipped.forEach(c=>c.classList.add("matched")); flipped=[]; matched++;
          if (matched===EMOJIS.length) { clearInterval(timer); setTimeout(()=>alert(\`You won in \${moves} moves and \${elapsed}s!\`),300); }
        } else { setTimeout(()=>{ flipped.forEach(c=>c.classList.remove("flipped")); flipped=[]; },900); }
      }
    });
  });
}
document.querySelector("#mem-restart")?.addEventListener("click", startGame);
startGame();`,
  },
  {
    name: "Spinning Wheel",
    category: "Fun",
    icon: "🎡",
    description: "Click to spin a customizable prize wheel and land on a random segment.",
    html: `<style>
  #wheel-canvas { border-radius:50%; box-shadow:0 4px 20px rgba(0,0,0,0.15); cursor:pointer; }
</style>
<div style="display:flex;flex-direction:column;align-items:center;gap:16px;font-family:inherit;">
  <div style="position:relative;">
    <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:28px;z-index:10;pointer-events:none;">▼</div>
    <canvas id="wheel-canvas" width="260" height="260"></canvas>
  </div>
  <button id="wheel-spin" style="padding:10px 28px;background:#1f2937;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:15px;">Spin!</button>
  <p id="wheel-result" style="font-size:15px;font-weight:700;color:#1f2937;min-height:24px;margin:0;"></p>
</div>`,
    js: `const SEGMENTS = ["🍕 Pizza","🍦 Ice Cream","🎁 Prize","🎉 Party","💰 Cash","🍫 Chocolate","⭐ Star","🎮 Games"];
const COLORS   = ["#f87171","#fb923c","#fbbf24","#4ade80","#34d399","#60a5fa","#818cf8","#e879f9"];
const wCanvas  = document.querySelector("#wheel-canvas");
const wCtx     = wCanvas.getContext("2d");
const R        = wCanvas.width / 2;
let wAngle = 0, spinning = false;

function drawWheel(rotation) {
  const arc = (Math.PI*2) / SEGMENTS.length;
  wCtx.clearRect(0,0,wCanvas.width,wCanvas.height);
  SEGMENTS.forEach((seg,i) => {
    const start = rotation + i*arc;
    wCtx.beginPath(); wCtx.moveTo(R,R); wCtx.arc(R,R,R-2,start,start+arc); wCtx.closePath();
    wCtx.fillStyle = COLORS[i]; wCtx.fill(); wCtx.strokeStyle="#fff"; wCtx.lineWidth=2; wCtx.stroke();
    wCtx.save(); wCtx.translate(R,R); wCtx.rotate(start+arc/2); wCtx.textAlign="right";
    wCtx.font="bold 11px sans-serif"; wCtx.fillStyle="#fff"; wCtx.fillText(seg, R-10, 5); wCtx.restore();
  });
}

function spin() {
  if (spinning) return; spinning=true;
  document.querySelector("#wheel-result").textContent="";
  const extra  = Math.PI*2 * (5 + Math.floor(Math.random()*5));
  const target = wAngle + extra + Math.random()*Math.PI*2;
  const duration = 3500, start = performance.now(), from = wAngle;
  function frame(now) {
    const t   = Math.min((now-start)/duration,1);
    const ease = 1-Math.pow(1-t,4);
    wAngle = from + (target-from)*ease;
    drawWheel(wAngle);
    if (t<1) { requestAnimationFrame(frame); return; }
    spinning=false;
    const arc    = (Math.PI*2)/SEGMENTS.length;
    const norm   = ((-wAngle % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
    const idx    = Math.floor(norm/arc) % SEGMENTS.length;
    document.querySelector("#wheel-result").textContent = \`🎯 \${SEGMENTS[(SEGMENTS.length-idx)%SEGMENTS.length]}\`;
  }
  requestAnimationFrame(frame);
}
drawWheel(0);
document.querySelector("#wheel-spin")?.addEventListener("click", spin);`,
  },
  {
    name: "Typing Speed Test",
    category: "Fun",
    icon: "⌨",
    description: "Measure words per minute and accuracy as you type a sample passage.",
    html: `<div style="display:flex;flex-direction:column;gap:12px;max-width:460px;font-family:inherit;">
  <div id="wpm-sample" style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;line-height:1.7;letter-spacing:0.01em;color:#374151;"></div>
  <textarea id="wpm-input" placeholder="Start typing here…" rows="4" style="padding:12px;border:1px solid #d1d5db;border-radius:8px;font-family:inherit;font-size:14px;resize:none;" disabled></textarea>
  <div style="display:flex;gap:12px;font-size:13px;color:#6b7280;">
    <span>WPM: <strong id="wpm-val">—</strong></span>
    <span>Accuracy: <strong id="wpm-acc">—</strong></span>
    <span>Time: <strong id="wpm-time">—</strong></span>
  </div>
  <div style="display:flex;gap:8px;">
    <button id="wpm-start"  style="flex:1;padding:9px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Start Test</button>
    <button id="wpm-reset"  style="flex:1;padding:9px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:7px;cursor:pointer;font-family:inherit;">Reset</button>
  </div>
</div>`,
    js: `const PASSAGE = "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!";
const sample  = document.querySelector("#wpm-sample");
const input   = document.querySelector("#wpm-input");
let startTime=null, wpmTimer=null;

sample.textContent = PASSAGE;

document.querySelector("#wpm-start")?.addEventListener("click", () => {
  input.value=""; input.disabled=false; input.focus();
  startTime=null; clearInterval(wpmTimer);
  ["#wpm-val","#wpm-acc","#wpm-time"].forEach(id=>document.querySelector(id).textContent="—");
});
document.querySelector("#wpm-reset")?.addEventListener("click", () => {
  input.value=""; input.disabled=true; startTime=null; clearInterval(wpmTimer);
  ["#wpm-val","#wpm-acc","#wpm-time"].forEach(id=>document.querySelector(id).textContent="—");
});

input.addEventListener("input", () => {
  if (!startTime) { startTime=Date.now(); wpmTimer=setInterval(updateStats,500); }
  updateStats();
  if (input.value.length >= PASSAGE.length) { clearInterval(wpmTimer); input.disabled=true; }
});

function updateStats() {
  if (!startTime) return;
  const elapsed  = (Date.now()-startTime)/1000;
  const typed    = input.value;
  const words    = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm      = Math.round((words/elapsed)*60);
  const correct  = [...typed].filter((c,i)=>c===PASSAGE[i]).length;
  const accuracy = typed.length ? Math.round((correct/typed.length)*100) : 100;
  document.querySelector("#wpm-val").textContent  = isFinite(wpm) ? wpm : 0;
  document.querySelector("#wpm-acc").textContent  = accuracy+"%";
  document.querySelector("#wpm-time").textContent = Math.round(elapsed)+"s";
}`,
  },
  {
    name: "Emoji Reaction Bar",
    category: "Fun",
    icon: "😄",
    description: "Click emoji reactions to increment their count, persisted in localStorage.",
    html: `<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;font-family:inherit;">
  <p style="font-size:14px;color:#374151;margin:0;max-width:380px;">This is a sample article or post. React to it with an emoji below!</p>
  <div id="reaction-bar" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
</div>`,
    js: `const REACTIONS = [
  { emoji:"👍", label:"Like" }, { emoji:"❤️", label:"Love" }, { emoji:"😂", label:"Haha" },
  { emoji:"😮", label:"Wow"  }, { emoji:"😢", label:"Sad"  }, { emoji:"🔥", label:"Fire" },
];
const STORE_KEY = "emoji_reactions_v1";
let counts = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");

const bar = document.querySelector("#reaction-bar");
REACTIONS.forEach(({ emoji, label }) => {
  counts[emoji] ??= 0;
  const btn = document.createElement("button");
  btn.style.cssText = "display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid #e5e7eb;border-radius:20px;background:#f9fafb;cursor:pointer;font-family:inherit;font-size:14px;transition:background 0.15s;";
  btn.innerHTML = \`<span>\${emoji}</span><span id="rc-\${label}" style="font-size:12px;font-weight:700;color:#6b7280;">\${counts[emoji]}</span>\`;
  btn.title = label;
  btn.addEventListener("click", () => {
    counts[emoji]++;
    document.querySelector(\`#rc-\${label}\`).textContent = counts[emoji];
    localStorage.setItem(STORE_KEY, JSON.stringify(counts));
    btn.style.background = "#e0e7ff";
    setTimeout(() => btn.style.background = "#f9fafb", 300);
  });
  bar.appendChild(btn);
});`,
  },
  {
    name: "Word Cloud Generator",
    category: "Fun",
    icon: "☁",
    description: "Paste text and visualize word frequency as a simple weighted word cloud.",
    html: `<div style="display:flex;flex-direction:column;gap:10px;max-width:480px;font-family:inherit;">
  <textarea id="wc-input" rows="4" style="padding:10px;border:1px solid #d1d5db;border-radius:7px;font-family:inherit;font-size:13px;resize:vertical;" placeholder="Paste text here…">The quick brown fox jumps over the lazy dog. The dog barked at the fox. The fox ran away quickly. Dogs and foxes are both animals that live in the wild.</textarea>
  <button id="wc-generate" style="padding:9px;background:#1f2937;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit;">Generate Cloud →</button>
  <div id="wc-cloud" style="display:flex;flex-wrap:wrap;gap:8px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;min-height:80px;align-items:center;"></div>
</div>`,
    js: `const STOP_WORDS = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","is","it","its","that","this","was","with","as","by","from","are","be","been","have","has","had","do","does","did","will","would","could","should","may","might","not","no","so","if","then","than","into","about","over","up","out","i","you","he","she","we","they","his","her","our","their","me","him","us","them"]);
document.querySelector("#wc-generate")?.addEventListener("click", () => {
  const text  = document.querySelector("#wc-input").value.toLowerCase().replace(/[^a-z\\s]/g,"");
  const words = text.split(/\\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const freq  = {};
  words.forEach(w => freq[w] = (freq[w]||0)+1);
  const max   = Math.max(...Object.values(freq));
  const COLORS = ["#3b82f6","#ef4444","#16a34a","#f59e0b","#8b5cf6","#ec4899","#06b6d4"];
  const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,40);
  document.querySelector("#wc-cloud").innerHTML = sorted.map(([w,c],i) => {
    const size = 12 + Math.round((c/max)*28);
    return \`<span style="font-size:\${size}px;font-weight:700;color:\${COLORS[i%COLORS.length]};cursor:default;" title="\${c} times">\${w}</span>\`;
  }).join("");
});`,
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

let _currentMode      = "snippets";
let _wireTemplate     = null;
let _selectedTemplate = null;

// Favorites persisted in localStorage as an array of template names
const _FAV_KEY = "jl_favorites_v1";
let _favorites = new Set(JSON.parse(localStorage.getItem(_FAV_KEY) || "[]"));

function _saveFavorites() {
  localStorage.setItem(_FAV_KEY, JSON.stringify([..._favorites]));
}

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
      _closePreview();
      _renderList(tab.dataset.cat);
    });
  });

  // Search
  document.getElementById("jlSearch")?.addEventListener("input", () => {
    const activeTab = document.querySelector(".jl-cat-tab.active");
    _renderList(activeTab?.dataset.cat || "All");
  });

  document.getElementById("jlModeSnippets")?.addEventListener("click", () => _setMode("snippets"));
  document.getElementById("jlModeWire")?.addEventListener("click",     () => _setMode("wire"));

  // Preview pane buttons
  document.getElementById("jlPrevInsertBtn")?.addEventListener("click", () => {
    if (_selectedTemplate) _insertTemplate(_selectedTemplate);
  });
  document.getElementById("jlPrevCloseBtn")?.addEventListener("click", _closePreview);

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
  const search = document.getElementById("jlSearch");
  if (search) search.value = "";
  _closePreview();
  _renderList("All");
  modal.classList.add("open");
}

function closeJsLibrary() {
  _closePreview();
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

  const query = document.getElementById("jlSearch")?.value.toLowerCase().trim() || "";

  let items;
  if (category === "Favorites") {
    items = JS_TEMPLATES.filter(t => _favorites.has(t.name));
  } else {
    items = category === "All" ? JS_TEMPLATES : JS_TEMPLATES.filter(t => t.category === category);
  }

  if (query) {
    items = items.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }

  if (!items.length) {
    list.innerHTML = `<div class="jl-no-results">${
      category === "Favorites" ? "No favorites yet — click ⭐ on any template to save it."
      : query ? `No templates match "${query}".`
      : "No templates in this category."
    }</div>`;
    return;
  }

  list.innerHTML = items.map(t => {
    const globalIdx = JS_TEMPLATES.indexOf(t);
    const htmlBadge = t.html ? `<span class="jl-html-badge">HTML</span>` : "";
    const isFav     = _favorites.has(t.name);
    const isPreviewSelected = _selectedTemplate === t;
    const actionBtn = _currentMode === "wire"
      ? `<button class="jl-insert-btn jl-wire-btn" data-index="${globalIdx}">&#9889; Wire</button>`
      : `<button class="jl-insert-btn" data-index="${globalIdx}">Insert</button>`;
    return `<div class="jl-card${isPreviewSelected ? " preview-selected" : ""}" data-index="${globalIdx}">
      <div class="jl-card-icon">${t.icon}</div>
      <div class="jl-card-info">
        <div class="jl-card-name">${t.name} ${htmlBadge}</div>
        <div class="jl-card-desc">${t.description}</div>
      </div>
      <span class="jl-card-cat">${t.category}</span>
      <button class="jl-fav-btn${isFav ? " active" : ""}" data-index="${globalIdx}" title="${isFav ? "Remove from favorites" : "Add to favorites"}">&#11088;</button>
      ${actionBtn}
    </div>`;
  }).join("");

  // Favorites toggle
  list.querySelectorAll(".jl-fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const template = JS_TEMPLATES[parseInt(btn.dataset.index)];
      if (_favorites.has(template.name)) {
        _favorites.delete(template.name);
        btn.classList.remove("active");
        btn.title = "Add to favorites";
      } else {
        _favorites.add(template.name);
        btn.classList.add("active");
        btn.title = "Remove from favorites";
      }
      _saveFavorites();
    });
  });

  // Insert buttons (direct, no preview)
  list.querySelectorAll(".jl-insert-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const template = JS_TEMPLATES[parseInt(btn.dataset.index)];
      if (_currentMode === "wire") _openWireConfig(template);
      else _insertTemplate(template);
    });
  });

  // Card click → preview (snippets) or wire config
  list.querySelectorAll(".jl-card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.classList.contains("jl-fav-btn") || e.target.classList.contains("jl-insert-btn") || e.target.classList.contains("jl-wire-btn")) return;
      const template = JS_TEMPLATES[parseInt(card.dataset.index)];
      if (_currentMode === "wire") _openWireConfig(template);
      else _showPreview(template);
    });
  });
}

// ── Template preview pane ─────────────────────────────────────────────────────

function _showPreview(template) {
  _selectedTemplate = template;

  const pane = document.getElementById("jlPreviewPane");
  const box  = document.getElementById("jsLibBox");
  pane?.classList.remove("hidden");
  box?.classList.add("preview-mode");

  document.getElementById("jlPrevIcon").textContent = template.icon;
  document.getElementById("jlPrevName").textContent = template.name;
  document.getElementById("jlPrevCat").textContent  = template.category;
  document.getElementById("jlPrevDesc").textContent = template.description;

  const frame = document.getElementById("jlPreviewFrame");
  if (frame) {
    const html   = template.html || "";
    const js     = template.js   || "";
    const safeJs = js.replace(/<\/script/gi, "<\\/script");
    frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;padding:16px;margin:0;font-size:14px;}</style></head><body>${html}${safeJs ? `<script>\n${safeJs}\n<\/script>` : ""}</body></html>`;
  }

  // Highlight selected card
  document.querySelectorAll(".jl-card").forEach(c => c.classList.remove("preview-selected"));
  document.querySelectorAll(`.jl-card[data-index="${JS_TEMPLATES.indexOf(template)}"]`).forEach(c => c.classList.add("preview-selected"));
}

function _closePreview() {
  _selectedTemplate = null;
  document.getElementById("jlPreviewPane")?.classList.add("hidden");
  document.getElementById("jsLibBox")?.classList.remove("preview-mode");
  document.querySelectorAll(".jl-card").forEach(c => c.classList.remove("preview-selected"));
}

// ── Template insertion (Snippets mode) ───────────────────────────────────────

function _insertTemplate(template) {
  _applyHtml(template);
  _applyJs(`// ── ${template.name} ──\n` + template.js);

  renderPreview();
  scheduleSnapshot();
  scheduleAutosave();
  _closePreview();
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
