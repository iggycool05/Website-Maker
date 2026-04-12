import { state } from "../State/editorState.js";
import { saveIframeToTextarea } from "./fontSize.js";
import { updateFontSizeFromSelection } from "./textSelection.js";

export function startDragging(item, e) {
  const rect = item.getBoundingClientRect();

  state.dragItem = item;
  state.dragOffsetX = e.clientX - rect.left;
  state.dragOffsetY = e.clientY - rect.top;
}

export function startResizing(item, handle, e) {
  const rect = item.getBoundingClientRect();
  const bodyRect = state.iframeDoc.body.getBoundingClientRect();

  state.resizeItem = item;
  state.resizeHandle = handle;

  state.startX = e.clientX;
  state.startY = e.clientY;
  state.startWidth = rect.width;
  state.startHeight = rect.height;
  state.startLeft = rect.left - bodyRect.left;
  state.startTop = rect.top - bodyRect.top;
}

export function handleMouseDown(e) {
  const handle = e.target.closest(".resize-handle");
  if (handle) {
    const item = handle.closest(".draggable-item");
    if (!item) return;

    e.preventDefault();
    e.stopPropagation();
    startResizing(item, handle, e);
    return;
  }

  const item = e.target.closest(".draggable-item");
  if (!item) return;

  const rect = item.getBoundingClientRect();
  const edgeSize = 10;

  const isNearLeft = e.clientX - rect.left < edgeSize;
  const isNearRight = rect.right - e.clientX < edgeSize;
  const isNearTop = e.clientY - rect.top < edgeSize;
  const isNearBottom = rect.bottom - e.clientY < edgeSize;

  const isOnEdge = isNearLeft || isNearRight || isNearTop || isNearBottom;

  if (!isOnEdge) return;

  e.preventDefault();
  startDragging(item, e);
}

export function handleMouseMove(e) {
  const bodyRect = state.iframeDoc.body.getBoundingClientRect();

  if (state.dragItem) {
    const newLeft = e.clientX - bodyRect.left - state.dragOffsetX;
    const newTop = e.clientY - bodyRect.top - state.dragOffsetY;

    state.dragItem.style.left = newLeft + "px";
    state.dragItem.style.top = newTop + "px";
  }

  if (state.resizeItem && state.resizeHandle) {
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    let newWidth = state.startWidth;
    let newHeight = state.startHeight;
    let newLeft = state.startLeft;
    let newTop = state.startTop;

    if (state.resizeHandle.classList.contains("bottom-right")) {
      newWidth = state.startWidth + dx;
      newHeight = state.startHeight + dy;
    }

    if (state.resizeHandle.classList.contains("bottom-left")) {
      newWidth = state.startWidth - dx;
      newHeight = state.startHeight + dy;
      newLeft = state.startLeft + dx;
    }

    if (state.resizeHandle.classList.contains("top-right")) {
      newWidth = state.startWidth + dx;
      newHeight = state.startHeight - dy;
      newTop = state.startTop + dy;
    }

    if (state.resizeHandle.classList.contains("top-left")) {
      newWidth = state.startWidth - dx;
      newHeight = state.startHeight - dy;
      newLeft = state.startLeft + dx;
      newTop = state.startTop + dy;
    }

    if (newWidth > 50) {
      state.resizeItem.style.width = newWidth + "px";
      state.resizeItem.style.left = newLeft + "px";
    }

    if (newHeight > 40) {
      state.resizeItem.style.height = newHeight + "px";
      state.resizeItem.style.top = newTop + "px";
    }
  }
}

export function handleMouseUp() {
  if (state.dragItem || state.resizeItem) {
    state.dragItem = null;
    state.resizeItem = null;
    state.resizeHandle = null;
    saveIframeToTextarea();
  }

  updateFontSizeFromSelection();
}