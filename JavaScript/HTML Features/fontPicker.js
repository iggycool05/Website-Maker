/**
 * fontPicker.js
 * Word-style font family picker:
 *  – Typeable / searchable input
 *  – Dropdown renders each font name in its own typeface
 *  – "Recently Used" section pinned at the top (up to 5)
 *  – Keyboard navigation (↑ ↓ Enter Escape)
 *  – Fires a custom "fontchange" event on the hidden <select>
 *    so the rest of the codebase keeps working unchanged.
 */

// ── Full font list ────────────────────────────────────────────────────────────
const ALL_FONTS = [
  // Sans-serif
  { name: "Arial",           value: "Arial, sans-serif" },
  { name: "Arial Black",     value: "'Arial Black', sans-serif" },
  { name: "Calibri",         value: "Calibri, sans-serif" },
  { name: "Candara",         value: "Candara, sans-serif" },
  { name: "Century Gothic",  value: "'Century Gothic', sans-serif" },
  { name: "Franklin Gothic Medium", value: "'Franklin Gothic Medium', sans-serif" },
  { name: "Gill Sans",       value: "'Gill Sans', sans-serif" },
  { name: "Impact",          value: "Impact, sans-serif" },
  { name: "Lucida Sans",     value: "'Lucida Sans Unicode', sans-serif" },
  { name: "Segoe UI",        value: "'Segoe UI', sans-serif" },
  { name: "Tahoma",          value: "Tahoma, sans-serif" },
  { name: "Trebuchet MS",    value: "'Trebuchet MS', sans-serif" },
  { name: "Verdana",         value: "Verdana, sans-serif" },
  // Serif
  { name: "Book Antiqua",    value: "'Book Antiqua', serif" },
  { name: "Cambria",         value: "Cambria, serif" },
  { name: "Garamond",        value: "Garamond, serif" },
  { name: "Georgia",         value: "Georgia, serif" },
  { name: "Palatino",        value: "'Palatino Linotype', serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  // Monospace
  { name: "Consolas",        value: "Consolas, monospace" },
  { name: "Courier New",     value: "'Courier New', monospace" },
  { name: "Lucida Console",  value: "'Lucida Console', monospace" },
  // Decorative / other
  { name: "Comic Sans MS",   value: "'Comic Sans MS', cursive" },
  { name: "Copperplate",     value: "Copperplate, fantasy" },
  { name: "Papyrus",         value: "Papyrus, fantasy" },
];

const MAX_RECENT = 5;

// ── State ─────────────────────────────────────────────────────────────────────
let recentFonts  = []; // array of font objects, most-recent first
let currentValue = ""; // CSS font-family string currently shown
let focusedIndex = -1; // keyboard navigation index into visible items
let isOpen       = false;

// ── DOM refs (set in init) ────────────────────────────────────────────────────
let pickerEl, inputEl, arrowEl, dropdownEl, hiddenSelectEl;

// ── Public init ───────────────────────────────────────────────────────────────
export function initFontPicker() {
  pickerEl     = document.getElementById("fontPicker");
  inputEl      = document.getElementById("fontFamilyInput");
  arrowEl      = document.getElementById("fontPickerArrow");
  dropdownEl   = document.getElementById("fontPickerDropdown");
  hiddenSelectEl = document.getElementById("fontFamilySelect");

  if (!pickerEl || !inputEl || !dropdownEl) return;

  // Seed the hidden select with all fonts (keeps old code that reads .value happy)
  hiddenSelectEl.innerHTML =
    '<option value="">-- Font --</option>' +
    ALL_FONTS.map(f => `<option value="${f.value}">${f.name}</option>`).join("");

  // ── Events ──
  inputEl.addEventListener("focus",   onInputFocus);
  inputEl.addEventListener("input",   onInputChange);
  inputEl.addEventListener("keydown", onInputKeydown);
  inputEl.addEventListener("blur",    onInputBlur);

  arrowEl.addEventListener("mousedown", e => {
    e.preventDefault(); // don't steal focus from input
    isOpen ? closeDropdown() : openDropdown();
  });

  // Close when clicking outside
  document.addEventListener("mousedown", e => {
    if (!pickerEl.contains(e.target)) closeDropdown();
  });
}

// ── Called externally to update the displayed font (e.g. on selection change) ─
export function setFontPickerValue(cssValue) {
  currentValue = cssValue;
  const match = ALL_FONTS.find(f => f.value === cssValue);
  inputEl.value = match ? match.name : (cssValue || "");
  hiddenSelectEl.value = cssValue;
}

// ── Open / close ──────────────────────────────────────────────────────────────
function openDropdown() {
  isOpen = true;
  renderDropdown(inputEl.value.trim());
  positionDropdown();
  dropdownEl.classList.add("open");
  focusedIndex = -1;
  // Select all text in input so user can type immediately
  inputEl.select();
}

function closeDropdown() {
  isOpen = false;
  dropdownEl.classList.remove("open");
  focusedIndex = -1;
  // Restore input text to current font name
  const match = ALL_FONTS.find(f => f.value === currentValue);
  inputEl.value = match ? match.name : (currentValue || "");
}

function positionDropdown() {
  const rect = inputEl.closest(".fp-input-wrap").getBoundingClientRect();
  dropdownEl.style.top  = rect.bottom + "px";
  dropdownEl.style.left = rect.left + "px";
  dropdownEl.style.width = "220px";
}

// ── Render dropdown ───────────────────────────────────────────────────────────
function renderDropdown(query) {
  const q = query.toLowerCase();
  const filtered = q
    ? ALL_FONTS.filter(f => f.name.toLowerCase().includes(q))
    : ALL_FONTS;

  dropdownEl.innerHTML = "";

  // Recently used (only shown when not filtering)
  if (!q && recentFonts.length > 0) {
    dropdownEl.appendChild(makeSectionHeader("Recently Used"));
    recentFonts.forEach(f => dropdownEl.appendChild(makeItem(f)));
    dropdownEl.appendChild(makeDivider());
    dropdownEl.appendChild(makeSectionHeader("All Fonts"));
  }

  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.className = "fp-no-results";
    msg.textContent = `No fonts match "${query}"`;
    dropdownEl.appendChild(msg);
    return;
  }

  filtered.forEach(f => dropdownEl.appendChild(makeItem(f)));
}

function makeSectionHeader(text) {
  const el = document.createElement("div");
  el.className = "fp-section-header";
  el.textContent = text;
  return el;
}

function makeDivider() {
  const el = document.createElement("div");
  el.className = "fp-divider";
  return el;
}

function makeItem(font) {
  const el = document.createElement("div");
  el.className = "fp-item";
  if (font.value === currentValue) el.classList.add("selected");
  el.dataset.value = font.value;
  el.dataset.name  = font.name;

  const preview = document.createElement("span");
  preview.className = "fp-item-preview";
  preview.style.fontFamily = font.value;
  preview.textContent = font.name;

  el.appendChild(preview);

  // mousedown (not click) so we fire before blur closes it
  el.addEventListener("mousedown", e => {
    e.preventDefault();
    selectFont(font);
    closeDropdown();
  });

  el.addEventListener("mousemove", () => {
    clearFocus();
    el.classList.add("focused");
    focusedIndex = getVisibleItems().indexOf(el);
  });

  return el;
}

// ── Select a font ─────────────────────────────────────────────────────────────
function selectFont(font) {
  currentValue = font.value;
  inputEl.value = font.name;
  hiddenSelectEl.value = font.value;

  // Add to recently used
  recentFonts = [font, ...recentFonts.filter(f => f.value !== font.value)].slice(0, MAX_RECENT);

  // Fire change event on hidden select so the rest of the code picks it up
  hiddenSelectEl.dispatchEvent(new Event("change", { bubbles: true }));
}

// ── Input events ──────────────────────────────────────────────────────────────
function onInputFocus() {
  openDropdown();
}

function onInputChange() {
  if (!isOpen) openDropdown();
  renderDropdown(inputEl.value.trim());
  positionDropdown();
  focusedIndex = -1;
}

function onInputBlur() {
  // Delay so mousedown on item fires first
  setTimeout(() => {
    if (!isOpen) return;
    // Try to commit what's typed if it matches a font name exactly
    const typed = inputEl.value.trim().toLowerCase();
    const match = ALL_FONTS.find(f => f.name.toLowerCase() === typed);
    if (match) selectFont(match);
    closeDropdown();
  }, 150);
}

function onInputKeydown(e) {
  if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
    openDropdown();
    return;
  }

  const items = getVisibleItems();

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
      applyFocus(items);
      scrollIntoView(items[focusedIndex]);
      break;

    case "ArrowUp":
      e.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, 0);
      applyFocus(items);
      scrollIntoView(items[focusedIndex]);
      break;

    case "Enter":
      e.preventDefault();
      if (focusedIndex >= 0 && items[focusedIndex]) {
        const val   = items[focusedIndex].dataset.value;
        const name  = items[focusedIndex].dataset.name;
        selectFont({ value: val, name });
      } else {
        // Try to match exactly what's typed
        const typed = inputEl.value.trim().toLowerCase();
        const match = ALL_FONTS.find(f => f.name.toLowerCase() === typed);
        if (match) selectFont(match);
      }
      closeDropdown();
      break;

    case "Escape":
      closeDropdown();
      break;

    case "Tab":
      closeDropdown();
      break;
  }
}

// ── Keyboard focus helpers ────────────────────────────────────────────────────
function getVisibleItems() {
  return Array.from(dropdownEl.querySelectorAll(".fp-item"));
}

function clearFocus() {
  getVisibleItems().forEach(el => el.classList.remove("focused"));
}

function applyFocus(items) {
  clearFocus();
  if (items[focusedIndex]) {
    items[focusedIndex].classList.add("focused");
    // Show font name in input for preview
    inputEl.value = items[focusedIndex].dataset.name;
  }
}

function scrollIntoView(el) {
  if (!el) return;
  const containerTop    = dropdownEl.scrollTop;
  const containerBottom = containerTop + dropdownEl.clientHeight;
  const elTop    = el.offsetTop;
  const elBottom = elTop + el.offsetHeight;

  if (elTop < containerTop) {
    dropdownEl.scrollTop = elTop - 4;
  } else if (elBottom > containerBottom) {
    dropdownEl.scrollTop = elBottom - dropdownEl.clientHeight + 4;
  }
}