import { elements } from "../DOM/elements.js";
import { getUploadedImage } from "../Utils/imageStore.js";

function resolveImagePlaceholders(html) {
  return html.replace(/<img\b([^>]*?)\sdata-upload-id="([^"]+)"([^>]*?)>/gi, (match, before, id, after) => {
    const src = getUploadedImage(id);
    return src ? `<img${before} src="${src}" data-upload-id="${id}"${after}>` : match;
  });
}

export function renderPreview() {
  const userCode = resolveImagePlaceholders(elements.htmlInput.value);

  const fullHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Preview</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          min-height: 100vh;
          position: relative;
          margin: 0;
        }

        .draggable-item {
          position: absolute;
        }

        .draggable-item:hover {
          outline: 2px dashed #007BFF;
        }

        .selected-text {
          outline: 2px solid red;
        }

        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border: 1px solid #007BFF;
          border-radius: 50%;
          z-index: 10;
        }

        .top-right {
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        }

        .top-left {
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        }

        .bottom-right {
          bottom: -5px;
          right: -5px;
          cursor: nwse-resize;
        }

        .bottom-left {
          bottom: -5px;
          left: -5px;
          cursor: nesw-resize;
        }

        [contenteditable="true"] {
          user-select: text;
          -webkit-user-select: text;
          cursor: text;
        }
      </style>
    </head>
    <body>
      ${userCode}
    </body>
    </html>
  `;

  elements.previewFrame.srcdoc = fullHTML;
}