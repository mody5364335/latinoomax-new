

export function suggestions(item, items) {
  if (item.addonIds?.length)
    return item.addonIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i) => i && i.available && i.id !== item.id);
  if (/اضافات|توصيل/.test(item.category)) return [];
  let food =
    /بيتزا|برجر|سندوتش|كريب|تاكو|وجبات|الباستا|جريل|تشيكن|مقبلات|الكومبو/.test(
      item.category,
    );
  let list = items
    .filter(
      (i) =>
        i.available &&
        i.id !== item.id &&
        (/بيتزا/.test(item.category)
          ? /استافت كراست|اطراف سوسيس/.test(i.name)
          : food
            ? i.category === "اضافات فود" && /شيدر|رانش/.test(i.name)
            : /المشروبات الساخنه/.test(i.category)),
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
