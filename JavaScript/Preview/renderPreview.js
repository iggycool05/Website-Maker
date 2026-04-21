import { elements } from "../DOM/elements.js";
import { getUploadedImage } from "../Utils/imageStore.js";
import { toCssString } from "../CSS Features/cssStore.js";
import { getRawJs } from "../JS Features/jsStore.js";
import { getAllJsContent } from "../JS Features/jsFileStore.js";

// Interceptor injected into every iframe srcdoc.
// Overrides console.* and window.onerror to forward messages to the parent
// via postMessage so jsConsole.js can display them in the console panel.
const _CONSOLE_INTERCEPTOR = (() => {
  const body = `(function(){
  var c=window.console,ov=function(l,o){
    c[l]=function(){
      var a=[].slice.call(arguments).map(function(v){
        if(v===null)return'null';
        if(v===undefined)return'undefined';
        if(typeof v==='object'){try{return JSON.stringify(v,null,2)}catch(e){return String(v)}}
        return String(v);
      });
      try{window.parent.postMessage({__from:'ob-console',level:l,args:a},'*')}catch(e){}
      o.apply(c,arguments);
    };
  };
  ov('log',c.log.bind(c));ov('warn',c.warn.bind(c));
  ov('error',c.error.bind(c));ov('info',c.info.bind(c));
  window.onerror=function(m,s,l){
    try{window.parent.postMessage({__from:'ob-console',level:'error',args:[m+' (line '+l+')']}, '*')}catch(e){}
  };
})();`;
  return `<script>${body}<` + `/script>`;
})();

function resolveImagePlaceholders(html) {
  return html.replace(/<img\b([^>]*?)\sdata-upload-id="([^"]+)"([^>]*?)>/gi, (match, before, id, after) => {
    const src = getUploadedImage(id);
    return src ? `<img${before} src="${src}" data-upload-id="${id}"${after}>` : match;
  });
}

export function renderPreview() {
  const userCode = resolveImagePlaceholders(elements.htmlInput.value);
  const userCss  = toCssString();
  const userJs   = getAllJsContent(elements.jsInput.value);
  // Prevent user's </script from prematurely closing the injected script tag
  const safeJs   = userJs ? userJs.replace(/<\/script/gi, "<\\/script") : "";

  const fullHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Preview</title>
      ${_CONSOLE_INTERCEPTOR}
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
          outline: 2px solid #0078d4 !important;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.12);
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
      ${userCss ? `<style>\n${userCss}</style>` : ""}
    </head>
    <body>
      ${userCode}
      ${safeJs ? `<script>\n${safeJs}\n<\/script>` : ""}
    </body>
    </html>
  `;

  elements.previewFrame.srcdoc = fullHTML;
}
