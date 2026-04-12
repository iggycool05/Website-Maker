import { elements } from "./DOM/elements.js";
import { renderPreview } from "./Preview/renderPreview.js";
import { setupIframe } from "./Preview/setupIframe.js";
import { changeSelectedFontSize } from "./Features/fontSize.js";
import { addParagraph } from "./Features/addParagraph.js";

elements.decreaseFontBtn.addEventListener("click", function () {
  changeSelectedFontSize(-1);
});

elements.increaseFontBtn.addEventListener("click", function () {
  changeSelectedFontSize(1);
});

elements.renderHTMLBtn.addEventListener("click", function () {
  renderPreview();
});

elements.addParagraphBtn.addEventListener("click", function () {
  addParagraph();
});

elements.previewFrame.addEventListener("load", function () {
  setupIframe();
});

renderPreview();