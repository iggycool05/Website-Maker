export const $ = (id) => document.getElementById(id);

export function isTextTypeElement(element) {
  if (!element || !element.tagName) return false;

  const tag = element.tagName;
  return (
    tag === "P" ||
    tag === "H1" ||
    tag === "H2" ||
    tag === "H3" ||
    tag === "H4" ||
    tag === "H5" ||
    tag === "H6" ||
    tag === "SPAN" ||
    tag === "BUTTON"
  );
}