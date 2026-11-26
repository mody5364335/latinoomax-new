import { money } from "./format.js";
import { defaults } from "./defaults.js";

// رسالة الطلب على واتساب تكتب بالعربي في الحالتين، حتى لو الواجهة إنجليزي (قرار محمد 26 نوفمبر 2026).
// اختيار الشطة يظهر على سطر الصنف: (حار) أو (عادي) للأصناف اللي عليها الاختيار.
export function orderText(s, customer, lines, total) {
  const spice = (l) =>
    l.spice == null ? "" : l.spice ? " (حار)" : " (عادي)";
  return [
    s.whatsappTitle,
    "نوع الطلب: " +
      (customer.type === "dineIn" ? s.dineInLabel : s.deliveryLabel),
    s.nameLabel + ": " + customer.name,
    s.addressLabel + ": " + customer.address,
    s.phoneLabel + ": " + customer.phone,
    "",
    ...lines.flatMap((l, n) => [
      `${n + 1}. ${l.item.name}${l.item.variant ? " (" + l.item.variant + ")" : ""}${spice(l)}`,
      `الكمية: ${l.qty} × سعر الصنف: ${money(l.item.price)}`,
      ...l.addons.map(
        (a) =>
          `  + ${a.name}: ${l.qty} × ${money(a.price)} = ${money(a.price * l.qty)}`,
      ),
      `سعر الوحدة بالإضافات: ${money(l.unit)} | إجمالي البند: ${money(l.unit * l.qty)}`,
      "",
    ]),
    `إجمالي الأصناف: ${money(total)}`,
    s.notesEnabled ? `${s.notesLabel}: ${customer.notes || "لا توجد"}` : "",
    "",
    s.deliveryDisclaimer || defaults.deliveryDisclaimer,
  ]
    .filter((x) => x !== null)
    .join("\n");
}

export function internationalPhone(value) {
  let n = String(value || "").replace(/[^0-9]/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  else if (n.startsWith("0")) n = "20" + n.slice(1);
  return n;
}
