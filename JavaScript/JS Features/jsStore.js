/**
 * jsStore.js
 * Single source of truth for the user's JavaScript content.
 */

let rawJs = "";

export function getRawJs()     { return rawJs; }
export function setRawJs(text) { rawJs = text; }
