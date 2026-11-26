

export const sweetCategories = new Set(["الحلو", "الوافل", "الكعك والبسكويت", "الايس كريم", "ايس كريم تارتات"]);
// سجلات الإضافات (مش أصناف قائمة بذاتها): ما تظهرش ككروت في نتائج البحث، بطلب يوسف 25 نوفمبر 2026
export const addonCategories = new Set(["اضافات فود", "اضافات بار", "اضافات فلفر"]);
export const drinkCategories = new Set(["ميلك شيك", "مشروبات غازية", "عصائر رمضان", "العصائر", "سموزى", "المشروبات الساخنه", "ايس ماتشا", "القهوه المثلجه", "فراابيه", "الكوكتيلات", "الزبادي", "ميكسات زبادي", "ميكسات سموزي", "هوت ماتشا", "اضافات بار", "اضافات فلفر"]);
export const sectionOf = (item) => ["main", "sweets", "drinks"].includes(item.section)
  ? item.section : sweetCategories.has(item.category) ? "sweets" : drinkCategories.has(item.category) ? "drinks" : "main";
export const sectionTitle = (section) => ({main: "المنيو الأساسي", sweets: "ركن الحلو", drinks: "ركن المشروبات"})[section] || "المنيو الأساسي";

// ترتيب أقسام المنيو الأساسي: البيتزا ثم البرجر ثم التاكو، وبعدها باقي الأقسام. أي قسم جديد بيظهر قبل الإضافات والتوصيل.
const mainOrder = ["البيتزا", "البرجر", "التاكو", "سندوتش الدجاج", "سندوتش اللحوم", "سندوتش سي فوود", "وجبات الدجاج", "لاتينو فراي تشيكن", "وجبات اللحوم", "لاتينو جريل", "اطباق لاتينو المشتعله", "الكريب", "الباستا", "الكومبو", "عرض 11/11", "مقبلات", "سلاطات", "الشوربة", "السحور", "وجبات الرمضانيه", "اضافات فود", "توصيل"];
export const categoryRank = (category) => {
  const i = mainOrder.indexOf(category);
  return i >= 0 ? i : mainOrder.length - 2 - 0.5;
};

// كل أقسام البيتزا (وسط / كبير / حبة كاملة) بتظهر تحت زرار واحد اسمه "البيتزا".
export const catKey = (item) => /^بيتزا |^البيتزا$/.test(item.category) ? "البيتزا" : item.category;

// اختيار الشطة (عادي/حار): على الأكل والشوربة فقط — المقبلات والسلاطات والإضافات والتوصيل من غير الاختيار (محمد 26 نوفمبر 2026)
const noSpiceCategories = new Set(["مقبلات", "سلاطات", "اضافات فود", "توصيل"]);
export const hasSpice = (item) => sectionOf(item) === "main" && !noSpiceCategories.has(catKey(item));

// أصناف حارة بطبيعتها: الاختيار يبدأ على حار (قائمة محمد المؤكدة 26 نوفمبر 2026)
const spicyNames = new Set(["تشيلى برجر", "زنجر شيلي البيتزا وسط", "زنجر تشيلي البيتزا كبير", "لاتينو تشيلي فرايز ماكس", "موتزاريلا ستيكس هالبينو", "هالبينو فريش", "ارابياتا"]);
export const spicyDefault = (item) => spicyNames.has(item.name);
