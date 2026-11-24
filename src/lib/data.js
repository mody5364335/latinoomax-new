import { sectionOf } from "./sections.js";

export function valid(d) {
  if (!d || !Array.isArray(d.items) || !d.items.length)
    throw Error("الملف لا يحتوي على أصناف");
  let ids = new Set();
  for (const i of d.items) {
    i.id = String(i.id || "");
    if (
      !i.id ||
      ids.has(i.id) ||
      !String(i.name || "").trim() ||
      !String(i.category || "").trim() ||
      !Number.isFinite(+i.price) ||
      +i.price < 0
    )
      throw Error("راجع الأسماء والأقسام والأسعار والمعرفات");
    ids.add(i.id);
    i.section = sectionOf(i);
    i.price = +i.price;
    i.priority = +i.priority || 0;
    i.available = i.available !== false;
    i.addonIds = Array.isArray(i.addonIds) ? i.addonIds.map(String) : [];
    if (d.images?.[i.image]) i.image = d.images[i.image];
  }
  return d;
}
