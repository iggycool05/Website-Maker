/**
 * codeEditor.js
 *
 * Replaces the three plain <textarea> elements in #editorArea with
 * CodeMirror 6 editors that provide syntax highlighting, bracket
 * matching, and auto-indent for HTML, CSS, and JavaScript.
 *
 * Integration contract
 * ────────────────────
 * Every other module continues to read/write content through the three
 * textarea DOM elements (elements.htmlInput / cssInput / jsInput) exactly
 * as before.  This module intercepts each textarea's `.value` setter via
 * Object.defineProperty so that any programmatic assignment (undo, project
 * load, toolbar insertion …) is forwarded to the matching CodeMirror
 * editor.  Conversely, every user keystroke inside CodeMirror is written
 * back into the textarea's DOM value, and — for genuine user edits only —
 * a synthetic `input` event is dispatched so that sourceEditor.js's render
 * / snapshot debounce continues to fire exactly as before.
 */

import { EditorView, basicSetup }    from "https://esm.sh/codemirror";
import { html as langHtml }          from "https://esm.sh/@codemirror/lang-html";
import { css  as langCss  }          from "https://esm.sh/@codemirror/lang-css";
import { javascript as langJs }      from "https://esm.sh/@codemirror/lang-javascript";
import { oneDark }                   from "https://esm.sh/@codemirror/theme-one-dark";
import { elements }                  from "../DOM/elements.js";

// ── Native HTMLTextAreaElement value descriptor ───────────────────────────────
// Stored once so we can call it directly, bypassing any instance overrides.

const _proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");

// ── Module-level flag ─────────────────────────────────────────────────────────
// Set to true while a programmatic view.dispatch() is in flight so the
// update listener knows not to fire a synthetic `input` event.

let _isProgrammatic = false;

// ── Editor instances and their wrapper divs ───────────────────────────────────

let htmlEditor = null, cssEditor = null, jsEditor = null;
let htmlWrap   = null, cssWrap   = null, jsWrap   = null;

// ── Build the CM → textarea sync listener ────────────────────────────────────

function makeSyncListener(textarea) {
  return EditorView.updateListener.of(update => {
    if (!update.docChanged) return;
    const val = update.state.doc.toString();
    // Write via native setter so it doesn't re-trigger our instance override.
    _proto.set.call(textarea, val);
    // Dispatch `input` only for real user edits, not programmatic sets.
    if (!_isProgrammatic) {
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

// ── Create one EditorView ─────────────────────────────────────────────────────

function makeEditor(textarea, langExt, parent) {
  return new EditorView({
    doc: _proto.get.call(textarea),   // seed from textarea's current content
    extensions: [
      basicSetup,
      langExt,
      oneDark,
      makeSyncListener(textarea),
      EditorView.theme({
        "&": {
          height: "100%",
          fontFamily: "'Consolas', 'Courier New', monospace",
          fontSize: "14px",
        },
        ".cm-scroller": { overflow: "auto", lineHeight: "1.65" },
        ".cm-content": { padding: "16px 20px" },
        ".cm-focused": { outline: "none" },
      }),
    ],
    parent,
  });
}

// ── Intercept textarea.value = … assignments ──────────────────────────────────

function _overrideTextarea(textarea, getView) {
  Object.defineProperty(textarea, "value", {
    configurable: true,
    get() { return _proto.get.call(this); },
    set(v) {
      // 1. Always update the underlying DOM value first.
      _proto.set.call(this, v);
      // 2. Propagate the change into CodeMirror if content differs.
      const view = getView();
      if (!view) return;
      const current = view.state.doc.toString();
      if (current === v) return;
      _isProgrammatic = true;
      view.dispatch({ changes: { from: 0, to: current.length, insert: v } });
      _isProgrammatic = false;
    },
  });
}

// ── Public: show the editor for one file, hide the others ────────────────────

export function showEditor(file) {
  if (!htmlWrap) return;
  htmlWrap.style.display = file === "html" ? "flex" : "none";
  cssWrap.style.display  = file === "css"  ? "flex" : "none";
  jsWrap.style.display   = file === "js"   ? "flex" : "none";
  const view = file === "html" ? htmlEditor : file === "css" ? cssEditor : jsEditor;
  if (view) setTimeout(() => view.focus(), 0);
}

/**
 * Jump the HTML CodeMirror editor to a specific 1-based line number.
 * Switches the editor pane to HTML if it is not already showing.
 * The matching line is selected and scrolled to the centre of the viewport.
 */
export function goToLineInHtml(lineNumber) {
  if (!htmlEditor) return;
  const doc     = htmlEditor.state.doc;
  const clamped = Math.max(1, Math.min(lineNumber, doc.lines));
  const line    = doc.line(clamped);
  htmlEditor.dispatch({
    selection:     { anchor: line.from, head: line.to },
    scrollIntoView: true,
  });
  htmlEditor.focus();
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initCodeEditors() {
  const area = elements.editorArea;

  // Hide native textareas — they stay in the DOM as source-of-truth buffers
  // that all other modules continue to read/write unchanged.
  for (const ta of [elements.htmlInput, elements.cssInput, elements.jsInput]) {
    ta.style.display = "none";
  }

  // Wrapper divs that house each CodeMirror instance
  function makeWrap(visible) {
    const div = document.createElement("div");
    div.style.cssText =
      `flex:1; display:${visible ? "flex" : "none"}; flex-direction:column; min-height:0; overflow:hidden;`;
    area.appendChild(div);
    return div;
  }

  htmlWrap = makeWrap(true);   // HTML editor visible by default
  cssWrap  = makeWrap(false);
  jsWrap   = makeWrap(false);

  // Build CodeMirror editors seeded with textarea content
  htmlEditor = makeEditor(elements.htmlInput, langHtml(),              htmlWrap);
  cssEditor  = makeEditor(elements.cssInput,  langCss(),               cssWrap);
  jsEditor   = makeEditor(elements.jsInput,   langJs({ jsx: false }), jsWrap);

  // Intercept programmatic textarea.value = … so CM stays in sync
  _overrideTextarea(elements.htmlInput, () => htmlEditor);
  _overrideTextarea(elements.cssInput,  () => cssEditor);
  _overrideTextarea(elements.jsInput,   () => jsEditor);
}
