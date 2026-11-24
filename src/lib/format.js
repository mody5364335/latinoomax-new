

export const money = (n) => Number(n).toLocaleString("ar-EG") + " ج.م";
export const norm = (s) =>
  String(s || "")
    .normalize("NFKD")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/[ىی]/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase().trim();
export const searchTerm = (s) => norm(s)
  .replace(/عصاير|عصير/g, "عصائر")
  .replace(/فطير|فطاير/g, "فطائر");
export const matchesSearch = (item, query) => {
  const text = searchTerm(item.name + " " + item.category + " " + (item.description || ""));
  return searchTerm(query).split(/\s+/).filter(Boolean).every((word) => text.includes(word));
};
export const url = (s) => {
  try {
    let u = new URL(s, location.href);
    return ["https:", "http:"].includes(u.protocol) ||
      /^data:image\/(png|jpeg|webp);base64,/.test(s)
      ? u.href
      : "";
  } catch {
    return "";
  }
};
