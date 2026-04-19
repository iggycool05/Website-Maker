/**
 * cssStore.js
 *
 * Stores all user-defined CSS as a single raw string (rawCss).
 * This is the single source of truth shared by:
 *   - The Class Builder (reads/writes specific blocks via regex)
 *   - The CSS file editor (reads/writes the full string directly)
 *   - renderPreview.js (injects via toCssString())
 */

let rawCss = "";

// ── Public getters / setters ──────────────────────────────────────────────────

export function getRawCss()      { return rawCss; }
export function setRawCss(text)  { rawCss = text; }
export function toCssString()    { return rawCss; }

// ── Class builder API ─────────────────────────────────────────────────────────

/** Create or replace a named class block. */
export function setClass(name, props) {
  const block = buildBlock(name, props);
  if (hasClass(name)) {
    rawCss = rawCss.replace(
      new RegExp(`\\.${escapeRe(name)}\\s*\\{[\\s\\S]*?\\}`),
      block
    );
  } else {
    const sep = rawCss.trimEnd().length > 0 ? "\n\n" : "";
    rawCss = rawCss.trimEnd() + sep + block;
  }
}

/** Parse a named class block back into a { prop: value } object, or null. */
export function getClass(name) {
  const re = new RegExp(`\\.${escapeRe(name)}\\s*\\{([\\s\\S]*?)\\}`);
  const m  = rawCss.match(re);
  if (!m) return null;

  const props = {};
  m[1].split(";").forEach(decl => {
    const i = decl.indexOf(":");
    if (i < 0) return;
    const p = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (p && v) props[p] = v;
  });
  return props;
}

/** Remove a named class block AND all its pseudo-class blocks. */
export function deleteClass(name) {
  // Remove base block
  rawCss = rawCss.replace(new RegExp(`\\.${escapeRe(name)}\\s*\\{[\\s\\S]*?\\}`), "");
  // Remove any pseudo-class blocks (.name:hover, .name:focus, etc.)
  rawCss = rawCss.replace(new RegExp(`\\.${escapeRe(name)}:[a-z-]+\\s*\\{[\\s\\S]*?\\}`, "g"), "");
  rawCss = rawCss.replace(/\n{3,}/g, "\n\n").trim();
}

// ── Pseudo-class state API ────────────────────────────────────────────────────

/** Create or replace a pseudo-class block (e.g. name="btn", pseudo=":hover"). */
export function setClassState(name, pseudo, props) {
  const hasDecls = Object.values(props).some(v => v && v.trim());
  if (!hasDecls) { deleteClassState(name, pseudo); return; }
  const block = buildBlock(`${name}${pseudo}`, props);
  const re = new RegExp(`\\.${escapeRe(name)}${escapeRe(pseudo)}\\s*\\{[\\s\\S]*?\\}`);
  if (re.test(rawCss)) {
    rawCss = rawCss.replace(re, block);
  } else {
    const sep = rawCss.trimEnd().length > 0 ? "\n\n" : "";
    rawCss = rawCss.trimEnd() + sep + block;
  }
}

/** Parse a pseudo-class block back into a { prop: value } object, or null. */
export function getClassState(name, pseudo) {
  const re = new RegExp(`\\.${escapeRe(name)}${escapeRe(pseudo)}\\s*\\{([\\s\\S]*?)\\}`);
  const m  = rawCss.match(re);
  if (!m) return null;
  const props = {};
  m[1].split(";").forEach(decl => {
    const i = decl.indexOf(":");
    if (i < 0) return;
    const p = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (p && v) props[p] = v;
  });
  return props;
}

/** Remove a pseudo-class block. */
export function deleteClassState(name, pseudo) {
  rawCss = rawCss
    .replace(new RegExp(`\\.${escapeRe(name)}${escapeRe(pseudo)}\\s*\\{[\\s\\S]*?\\}`), "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Return all class names found in rawCss. */
export function getAllClasses() {
  const names = [];
  const re = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*\{/g;
  let m;
  while ((m = re.exec(rawCss)) !== null) {
    if (!names.includes(m[1])) names.push(m[1]);
  }
  return names;
}

/** True if a class with this name already exists in rawCss. */
export function hasClass(name) {
  return new RegExp(`\\.${escapeRe(name)}\\s*\\{`).test(rawCss);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildBlock(name, props) {
  const decls = Object.entries(props)
    .filter(([, v]) => v && v.trim())
    .map(([p, v]) => `  ${p}: ${v};`)
    .join("\n");
  return `.${name} {\n${decls}\n}`;
}

function escapeRe(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}