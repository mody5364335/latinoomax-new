import { menuEn } from "./menuEn.js";
import { catKey } from "./sections.js";

export const LANG = "latino-lang-v1";
export const getLang = () => {
  try { return localStorage.getItem(LANG) === "en" ? "en" : "ar"; } catch { return "ar"; }
};
export const saveLang = (l) => { try { localStorage.setItem(LANG, l); } catch {} };

// UI strings. Arabic is the live text; English is a draft awaiting approval.
const UI = {
  title: ["لاتينو ماكس | المنيو", "Latino Max | Menu"],
  langBtn: ["English", "العربية"],
  langAria: ["Switch to English", "التبديل إلى العربية"],
  cart: ["السلة", "Cart"],
  previewNotice: ["معاينة المسودة المحلية، التغييرات لم تنشر للعملاء.", "Local draft preview. Changes are not published to customers."],
  featuredAria: ["اختيارات مميزة", "Featured picks"],
  eyebrowPicks: ["اختيارات لاتينو", "LATINO PICKS"],
  pickOffer: ["اختار عرضك المفضل", "Pick your favorite offer"],
  prevOffers: ["العروض السابقة", "Previous offers"],
  nextOffers: ["العروض التالية", "Next offers"],
  offerPos: ["موضع العرض", "Offer position"],
  offerN: ["العرض {i} من {n}", "Offer {i} of {n}"],
  offerBadge: ["عرض مميز", "Special offer"],
  fromMenu: ["من المنيو", "From the menu"],
  seeDetails: ["شوف التفاصيل +", "See details +"],
  seeMenu: ["شوف المنيو ↙", "See the menu ↘"],
  heroNote: ["{n} اختيار · طلبك على مزاجك", "{n} choices · your order, your mood"],
  eyebrowMood: ["على مزاجك", "YOUR MOOD"],
  orderToday: ["هتطلب إيه النهارده؟", "What are you ordering today?"],
  searchAria: ["ابحث في كل المنيو", "Search the whole menu"],
  searchPh: ["ابحث في كل المنيو...", "Search the whole menu..."],
  catsAria: ["أقسام المنيو", "Menu sections"],
  mainSecAria: ["الأقسام الرئيسية", "Main sections"],
  filterAria: ["تصفية حسب النوع", "Filter by type"],
  allItems: ["كل الأصناف", "All items"],
  offers: ["العروض", "Offers"],
  searchResults: ["نتائج البحث في كل المنيو", "Search results across the menu"],
  nItems: ["{n} صنف", "{n} items"],
  details: ["تفاصيل {x}", "Details: {x}"],
  addX: ["إضافة {x}", "Add {x}"],
  offerTag: ["عرض", "Offer"],
  from: ["من ", "From "],
  completeOrder: ["كمل طلبك بإضافات ↗", "Complete your order with add-ons ↗"],
  itemDetails: ["تفاصيل الصنف ↗", "Item details ↗"],
  noResults: ["مفيش نتائج، جرب اسم تاني.", "No results. Try another name."],
  moreItems: ["عرض أصناف أكتر ↓", "Show more items ↓"],
  chooseSize: ["اختار الحجم", "Choose size"],
  medium: ["وسط", "Medium"],
  large: ["كبير", "Large"],
  unavailable: ["مش متاح", "Not available"],
  completeTitle: ["كمل طلبك", "Complete your order"],
  addonsNote: ["إضافات اختيارية بأسعارها. راجع حساسيات الطعام مع المطعم.", "Optional add-ons with prices. Check food allergies with the restaurant."],
  sauces: ["إضافة الصوصات", "Add sauces"],
  spiceTitle: ["الشطة", "Spice"],
  spiceNormal: ["عادي", "Normal"],
  spiceHot: ["حار", "Spicy"],
  addToCart: ["أضف للسلة", "Add to cart"],
  addedToast: ["اتضاف للسلة ✓", "Added to cart ✓"],
  yourCart: ["سلتك", "Your cart"],
  cartCount: ["{n} صنف في سلتك", "{n} items in your cart"],
  clearCart: ["تفريغ السلة ×", "Clear cart ×"],
  plus: ["+ {a} ({p})", "+ {a} ({p})"],
  unitPrice: ["سعر الوحدة: {p}", "Unit price: {p}"],
  decrease: ["تقليل {x}", "Decrease {x}"],
  increase: ["زيادة {x}", "Increase {x}"],
  remove: ["حذف", "Remove"],
  itemsTotal: ["إجمالي الأصناف", "Items total"],
  orderDetails: ["تفاصيل الطلب", "Order details"],
  unavailableNow: [" (غير متاح حالياً)", " (not available right now)"],
  waNote: ["هنفتح واتساب برسالة جاهزة. لازم تضغط إرسال هناك.", "We'll open WhatsApp with a ready message. You must tap send there."],
  clearNote: ["السلة هتفضى بمجرد الضغط على متابعة، حتى لو واتساب ما فتحش. ده مش تأكيد استلام الطلب.", "The cart is emptied as soon as you tap continue, even if WhatsApp does not open. This is not an order confirmation."],
  continueWa: ["متابعة على واتساب ↗", "Continue on WhatsApp ↗"],
  emptyCart: ["سلتك فاضية", "Your cart is empty"],
  emptyCartText: ["اختار حاجة حلوة من المنيو.", "Pick something tasty from the menu."],
  backMenu: ["ارجع للمنيو", "Back to the menu"],
  viewCart: ["شوف سلتك", "View your cart"],
  close: ["إغلاق", "Close"],
  errType: ["نوع الطلب غير متاح حالياً", "This order type is not available right now"],
  errPhone: ["اكتب رقم هاتف صحيح من 8 إلى 15 رقم", "Enter a valid phone number, 8 to 15 digits"],
  errRecv: ["استقبال الطلبات غير متاح. راجع المطعم.", "Orders are not being received. Please contact the restaurant."],
  errStore: ["تعذر حفظ السلة في المتصفح", "Could not save the cart in the browser"],
  waReady: ["رسالتك جاهزة في واتساب. اضغط إرسال هناك لتأكيد الطلب.", "Your message is ready in WhatsApp. Tap send there to confirm the order."],
  waBlocked: ["المتصفح منع فتح واتساب. السلة اتفضت؛ اسمح بالنوافذ المنبثقة قبل طلب جديد.", "The browser blocked WhatsApp. The cart was emptied; allow pop-ups before a new order."],
  waFail: ["تعذر فتح واتساب. السلة اتفضت؛ راجع إعدادات المتصفح قبل طلب جديد.", "Could not open WhatsApp. The cart was emptied; check browser settings before a new order."],
  contactsEyebrow: ["LATINOO MAX · GET IN TOUCH", "LATINOO MAX · GET IN TOUCH"],
  callX: ["اتصل بـ {x} {n}", "Call {x} {n}"],
  waX: ["واتساب {x} {n}", "WhatsApp {x} {n}"],
  contactsEmpty: ["بيانات الفروع وأرقام التواصل هتتوفر قريباً.", "Branch details and phone numbers coming soon."],
  footPrices: ["الأسعار بالجنيه المصري ولا تشمل رسوم التوصيل. بعض الصور خاصة بالقسم وليست بالصنف.", "Prices are in Egyptian pounds and do not include delivery fees. Some photos are for the section, not the exact item."],
  footOrder: ["الطلب بيتبعت كرسالة واتساب. تأكيد الطلب ورسوم التوصيل بيكونوا مع المطعم.", "The order is sent as a WhatsApp message. Order confirmation and delivery fees are handled by the restaurant."],
  adminLink: ["محرر المنيو المحلي", "Local menu editor"],
  devBy: ["تطوير", "Developed by"],
  waAria: ["تواصل معنا على واتساب", "Contact us on WhatsApp"],
  // opening hours
  hoursTitle: ["مواعيد العمل", "Opening hours"],
  hoursTakeaway: ["التيك أواي والديلفري", "Takeaway and delivery"],
  hoursDineIn: ["الصالة", "Dine-in"],
  hoursDays: ["كل الأيام", "Every day"],
  hoursFri: ["الجمعة", "Friday"],
  hoursNext: ["اليوم التالي", "next day"],
  hoursNote: ["مواعيد العمل للتوضيح فقط. تأكد من المطعم قبل الطلب.", "Hours are for information only. Confirm with the restaurant before ordering."],
  hoursFriFrom: ["الجمعة من {t}", "Fridays from {t}"],
  // order message (WhatsApp)
  oType: ["نوع الطلب", "Order type"],
  oQty: ["الكمية", "Qty"],
  oItemPrice: ["سعر الصنف", "Item price"],
  oUnit: ["سعر الوحدة بالإضافات", "Unit price with add-ons"],
  oLine: ["إجمالي البند", "Line total"],
  oTotal: ["إجمالي الأصناف", "Items total"],
  oNone: ["لا توجد", "None"],
  greetMorning: ["صباح الخير", "Good morning"],
  greetEvening: ["مساء الخير", "Good evening"],
};
export const makeT = (lang) => (k, v) => {
  let s = (UI[k] || [k, k])[lang === "en" ? 1 : 0];
  if (v) for (const x in v) s = s.split("{" + x + "}").join(v[x]);
  return s;
};

// English text for the hero/settings defaults (used only when the setting is not customised).
export const enSettings = {
  heroTitle: "Everything you love, in one place.",
  heroText: "Pick your mood from the Latino Max menu and finish your order on WhatsApp.",
  featuredTitle: "Featured picks and offers",
  deliveryLabel: "Delivery",
  dineInLabel: "Dine-in",
  nameLabel: "Name",
  addressLabel: "Address",
  phoneLabel: "Contact phone",
  notesLabel: "Order notes",
  deliveryDisclaimer: "Prices do not include delivery fees.",
  contactsTitle: "Latino Max | LatinooMax",
  whatsappTitle: "New order from Latino Max",
};
export const enBranch = { name: "Latino Max | LatinooMax", address: "Faqous, El Adawy Street, Latino Max" };

const en = (lang) => lang === "en";
export const locName = (lang, i) => (en(lang) && menuEn.names[i.name]) || i.name;
export const locGroup = (lang, g) => (en(lang) && menuEn.groups[g]) || g;
export const locDesc = (lang, d) => (en(lang) && menuEn.descriptions[d]) || d;
export const locSize = (lang, s) => (en(lang) && menuEn.sizes[s]) || s;
export const locCat = (lang, c) => (en(lang) && menuEn.categories[c]) || c;
export const locCatKey = (lang, item) => locCat(lang, catKey(item));
// Arabic left in English mode means no approved translation yet.
export const sectionEn = { main: "Main Menu", sweets: "Dessert Corner", drinks: "Drinks Corner" };

export const fmtMoney = (lang, n) =>
  en(lang) ? Number(n).toLocaleString("en-US") + " EGP" : Number(n).toLocaleString("ar-EG") + " ج.م";

// English search: matches the draft English name, group, category and description (works in either language).
export const matchesEn = (item, query) => {
  const text = [locName("en", item), item.group ? locGroup("en", item.group) : "", locCat("en", catKey(item)), locDesc("en", item.description || "")].join(" ").toLowerCase();
  const words = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((w) => text.includes(w));
};
