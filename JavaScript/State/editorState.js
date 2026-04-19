export const state = {
  iframeDoc: null,
  iframeWindow: null,
  selectedTextElement: null,

  dragItem: null,
  resizeItem: null,
  resizeHandle: null,

  dragOffsetX: 0,
  dragOffsetY: 0,

  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
  startLeft: 0,
  startTop: 0
};

// Callbacks fired whenever the selected element changes (select or deselect).
// Register by pushing a function; avoid circular imports by using this array.
export const onSelectionChange = [];

// Callbacks fired each time the iframe reloads and setupIframe() runs.
// Use this to re-attach iframe-document listeners (selectionchange, etc.).
export const onIframeLoad = [];