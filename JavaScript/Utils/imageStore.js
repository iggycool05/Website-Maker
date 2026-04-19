const imageStore = new Map();

export function addUploadedImage(id, dataUrl) {
  imageStore.set(id, dataUrl);
}

export function getUploadedImage(id) {
  return imageStore.get(id);
}

export function preserveImagePlaceholders(bodyClone) {
  const uploadedImages = bodyClone.querySelectorAll("img[data-upload-id]");
  uploadedImages.forEach(function (img) {
    img.removeAttribute("src");
  });
}
