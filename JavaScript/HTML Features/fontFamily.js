import { state } from "../State/editorState.js";
import { getSelectedTextRangeInIframe, saveIframeToTextarea } from "./fontSize.js";
import { clearSelectedTextHighlight } from "./textSelection.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True if the element's only inline style is font-family. */
function hasOnlyFontFamily(el) {
  const css = el.style.cssText.replace(/font-family\s*:[^;]+;?/i, "").trim();
  return el.style.fontFamily && !css;
}

/** True if the span has no meaningful class (empty or only whitespace). */
function hasNoClass(el) {
  return !el.className.trim();
}

/**
 * Strip font-family from every span inside `root`, then unwrap any span
 * that has become an empty wrapper (no style, no meaningful class).
 * Loops until stable because unwrapping can expose more candidates.
 */
function flattenFontSpans(root) {
  root.querySelectorAll("span").forEach(span => {
    span.style.fontFamily = "";
    if (!span.style.cssText.trim()) span.removeAttribute("style");
  });

  let dirty = true;
  while (dirty) {
    dirty = false;
    root.querySelectorAll("span").forEach(span => {
      if (span.getAttribute("style")) return; // still has style – keep
      if (!hasNoClass(span)) return;           // has a real class – keep
      const parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
      dirty = true;
    });
  }
}

/**
 * If `span` landed inside a parent span that carries the same font-family
 * (the empty shell left after extractContents), lift our content into that
 * parent and discard the redundant inner span.
 */
function collapseRedundantParentSpan(span) {
  const parent = span.parentNode;
  if (!parent || parent.tagName !== "SPAN") return span;
  if (!hasNoClass(parent)) return span;
  if (parent.style.fontFamily !== span.style.fontFamily) return span;

  // Ensure the parent has no other significant children besides our span
  const others = Array.from(parent.childNodes).filter(
    n => n !== span && !(n.nodeType === Node.TEXT_NODE && !n.nodeValue.trim())
  );
  if (others.length > 0) return span;

  // Move span's children into the parent and remove the now-redundant inner span
  while (span.firstChild) parent.appendChild(span.firstChild);
  parent.removeChild(span);
  return parent;
}

/**
 * If `span` is sitting inside a different-font parent span that now holds
 * *only* our span (its original content was all selected and replaced), remove
 * that outer shell so we can do clean sibling-merging one level up.
 * Only removes the parent when it has no styles other than font-family.
 */
function cleanupOrphanedOuterSpan(span) {
  const parent = span.parentNode;
  if (!parent || parent.tagName !== "SPAN") return span;
  if (!hasNoClass(parent)) return span;
  if (!hasOnlyFontFamily(parent)) return span; // parent has other important styles

  const others = Array.from(parent.childNodes).filter(
    n => n !== span && !(n.nodeType === Node.TEXT_NODE && !n.nodeValue.trim())
  );
  if (others.length > 0) return span;

  const grandparent = parent.parentNode;
  if (!grandparent) return span;
  grandparent.insertBefore(span, parent);
  parent.remove();
  return span;
}

/**
 * Merge adjacent sibling spans inside `container` when they share the same
 * font-family (and only that style) and carry no meaningful class.
 * Transfers the `selected-text` highlight class to the surviving element.
 */
function mergeAdjacentFontSpans(container) {
  let changed = true;
  while (changed) {
    changed = false;
    const nodes = Array.from(container.childNodes);
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1];
      if (
        a.nodeType === Node.ELEMENT_NODE && a.tagName === "SPAN" &&
        b.nodeType === Node.ELEMENT_NODE && b.tagName === "SPAN" &&
        hasNoClass(a) && hasNoClass(b) &&
        hasOnlyFontFamily(a) && hasOnlyFontFamily(b) &&
        a.style.fontFamily === b.style.fontFamily
      ) {
        // Absorb b into a; carry over selected-text if b had it
        if (b.classList.contains("selected-text")) a.classList.add("selected-text");
        while (b.firstChild) a.appendChild(b.firstChild);
        b.remove();
        a.normalize();
        changed = true;
        break; // node list is stale – restart
      }
    }
  }
  container.normalize();
}

// ── Core ──────────────────────────────────────────────────────────────────────

function changeHighlightedTextFontFamily(cssValue) {
  if (!state.iframeDoc || !state.iframeWindow) return false;

  const range = getSelectedTextRangeInIframe();
  if (!range) return false;
  if (!range.toString().trim()) return false;

  // 1. Extract the selection, strip all nested font-family spans, re-wrap
  const fragment = range.extractContents();
  flattenFontSpans(fragment);

  let span = state.iframeDoc.createElement("span");
  span.style.fontFamily = cssValue;
  span.appendChild(fragment);
  range.insertNode(span);

  // 2. Collapse: same-font parent shell? Lift our content into it.
  span = collapseRedundantParentSpan(span);

  // 3. Cleanup: different-font parent shell that now only wraps us? Remove it.
  span = cleanupOrphanedOuterSpan(span);

  // 4. Merge adjacent same-font siblings in the host element
  const host = span.parentNode;
  if (host) mergeAdjacentFontSpans(host);

  // 5. After merging our span may have absorbed a neighbor (still connected),
  //    or been absorbed itself. Find the surviving connected span.
  let activeSpan = span.isConnected ? span : null;
  if (!activeSpan && host) {
    activeSpan = Array.from(host.childNodes).find(
      n => n.nodeType === Node.ELEMENT_NODE &&
           n.tagName === "SPAN" &&
           n.style.fontFamily === cssValue
    ) || host;
  }
  if (!activeSpan) activeSpan = host || span;

  // 6. Update selection and editor state
  const sel = state.iframeWindow.getSelection();
  sel.removeAllRanges();
  const newRange = state.iframeDoc.createRange();
  newRange.selectNodeContents(activeSpan);
  sel.addRange(newRange);

  clearSelectedTextHighlight();
  if (activeSpan.classList) activeSpan.classList.add("selected-text");
  state.selectedTextElement = activeSpan;

  saveIframeToTextarea();
  return true;
}

// ── Public export ─────────────────────────────────────────────────────────────

export function changeSelectedFontFamily(cssValue) {
  if (!cssValue) return;

  if (changeHighlightedTextFontFamily(cssValue)) return;

  // Fallback: apply directly to the clicked/selected element
  if (!state.selectedTextElement) return;
  state.selectedTextElement.style.fontFamily = cssValue;
  saveIframeToTextarea();
}
