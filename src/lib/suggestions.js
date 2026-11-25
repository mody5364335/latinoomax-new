

const FOOD_ADDONS = "اضافات فود";
const pickAddon = (items, n) =>
  items.find(
    (i) => i.available && i.category === FOOD_ADDONS && i.name.includes(n),
  );

// الصوصات بتتعرض في قسم لوحدها ("إضافة الصوصات") تحت الإضافات العادية
// للبيتزا والبرجر والتاكو. بطلب يوسف 25 نوفمبر 2026.
export function sauceSuggestions(item, items) {
  if (item.addonIds?.length) return [];
  if (/اضافات|توصيل/.test(item.category)) return [];
  if (item.section === "sweets" || item.section === "drinks") return [];
  // البيتزا: رانش، بربكيو، تشيز صوص (من غير كاتشب، زي ما كانت في الإضافات)
  if (/بيتزا/.test(item.category))
    return ["رانش", "بربكيو", "تشيز صوص"]
      .map((n) => pickAddon(items, n))
      .filter(Boolean);
  // البرجر والتاكو: الشيدر مع الصوصات الأربعة (كلها صوصات خارجية، بطلب يوسف)
  if (item.category === "البرجر" || /تاكو/.test(item.category))
    return ["شيدر", "رانش", "بربكيو", "تشيز صوص", "كاتشب"]
      .map((n) => pickAddon(items, n))
      .filter(Boolean);
  return [];
}

export function suggestions(item, items) {
  if (item.addonIds?.length)
    return item.addonIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i) => i && i.available && i.id !== item.id);
  if (/اضافات|توصيل/.test(item.category)) return [];
  // الحلو والمشروبات: مفيش اقتراحات إلا لو الصنف نفسه محدد له addonIds
  if (item.section === "sweets" || item.section === "drinks") return [];
  let food =
    /بيتزا|برجر|سندوتش|كريب|تاكو|وجبات|الباستا|جريل|تشيكن|مقبلات|الكومبو/.test(
      item.category,
    );
  // البيتزا: استافت كراست، اطراف سوسيس، وحبة كاملة (+10 بطلب محمد) إضافات عادية؛ الصوصات قسم منفصل تحتهم
  if (/بيتزا/.test(item.category))
    return ["استافت كراست", "اطراف سوسيس", "حبة كاملة"]
      .map((n) => pickAddon(items, n))
      .filter(Boolean);
  // البرجر: مفيش إضافات عادية - الشيدر بقى في قسم الصوصات
  if (item.category === "البرجر") return [];
  // باقي الأكل: من غير ما نكرر صنف ظاهر في قسم الصوصات
  let sauces = new Set(sauceSuggestions(item, items).map((i) => i.id));
  let list = items
    .filter(
      (i) =>
        i.available &&
        i.id !== item.id &&
        !sauces.has(i.id) &&
        (food
          ? i.category === FOOD_ADDONS && /شيدر|رانش/.test(i.name)
          : false),
    )
    .slice(0, 2);
  // التاكو من غير مشروب غازي (بطلب يوسف 25 نوفمبر 2026)
  if (food && !/تاكو/.test(item.category)) {
    let drink = items.find(
      (i) => i.available && i.category === "مشروبات غازية",
    );
    if (drink) list.push(drink);
  }
  return list;
}
