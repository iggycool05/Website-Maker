// Get references to the HTML elements

const htmlInput = document.getElementById("htmlInput");
const renderHTMLBtn = document.getElementById("renderHTMLBtn");
const previewFrame = document.getElementById("previewFrame");

// Add event listener to the button to render the HTML code
renderHTMLBtn.addEventListener("click", function () {
  const userCode = htmlInput.value;
  previewFrame.srcdoc = userCode;
});