

export const sweetCategories = new Set(["الحلو", "الوافل", "الكعك والبسكويت", "الايس كريم", "ايس كريم تارتات"]);
export const drinkCategories = new Set(["ميلك شيك", "مشروبات غازية", "عصائر رمضان", "العصائر", "سموزى", "المشروبات الساخنه", "ايس ماتشا", "القهوه المثلجه", "فراابيه", "الكوكتيلات", "الزبادي", "ميكسات زبادي", "ميكسات سموزي", "هوت ماتشا", "اضافات بار", "اضافات فلفر"]);
export const sectionOf = (item) => ["main", "sweets", "drinks"].includes(item.section)
  ? item.section : sweetCategories.has(item.category) ? "sweets" : drinkCategories.has(item.category) ? "drinks" : "main";
export const sectionTitle = (section) => ({main: "المنيو الأساسي", sweets: "ركن الحلو", drinks: "ركن المشروبات"})[section] || "المنيو الأساسي";
