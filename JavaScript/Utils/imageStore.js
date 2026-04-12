const imageStore = new Map();

export function addUploadedImage(id, dataUrl) {
  imageStore.set(id, dataUrl);
}

export function getUploadedImage(id) {
  return imageStore.get(id);
}
