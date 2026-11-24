

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
  // البيتزا: استافت كراست، اطراف سوسيس، وبعدهم الصوصات (رانش، باربكيو، تشيز صوص) من أصناف الإضافات. من غير مشروب.
  if (/بيتزا/.test(item.category))
    return ["استافت كراست", "اطراف سوسيس", "رانش", "بربكيو", "تشيز صوص"]
      .map((n) => items.find((i) => i.available && i.category === "اضافات فود" && i.name.includes(n)))
      .filter(Boolean);
  let list = items
    .filter(
      (i) =>
        i.available &&
        i.id !== item.id &&
        (/بيتزا/.test(item.category)
          ? /استافت كراست|اطراف سوسيس/.test(i.name)
          : food
            ? i.category === "اضافات فود" && /شيدر|رانش/.test(i.name)
            : false),
    )
    .slice(0, 2);
  if (food) {
    let drink = items.find(
      (i) => i.available && i.category === "مشروبات غازية",
    );
    if (drink) list.push(drink);
  }
  return list;
}

