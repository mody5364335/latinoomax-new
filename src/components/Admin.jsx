import React, { useState } from "react";
import { DRAFT, LOCK, read, store } from "../lib/storage.js";
import { money, norm, url } from "../lib/format.js";
import { defaults } from "../lib/defaults.js";
import { sectionOf } from "../lib/sections.js";
import { valid } from "../lib/data.js";
import { download, hash } from "../lib/adminTools.js";
import { Photo } from "./Photo.jsx";
import { Modal } from "./Modal.jsx";
import { Settings } from "./Settings.jsx";

export function Admin({ published }) {
  let [unlocked, setUnlocked] = useState(false),
    [data, setData] = useState(() => {
      try {
        return valid(read(DRAFT, published));
      } catch {
        return published;
      }
    }),
    [err, setErr] = useState(""),
    [message, setMessage] = useState(""),
    [edit, setEdit] = useState(null),
    [query, setQuery] = useState(""),
    [cat, setCat] = useState(""),
    [settings, setSettings] = useState(false);
  let exists = !!read(LOCK, null),
    s = { ...defaults, ...data.settings };
  function update(d) {
    try {
      store(DRAFT, d);
      setData(d);
      setMessage(
        "اتحفظ في المسودة المحلية فقط. صدّر items.json وارفعه على GitHub للنشر.",
      );
      return true;
    } catch {
      setErr("تعذر الحفظ، التخزين المحلي ممتلئ. صدّر نسخة من شغلك.");
      return false;
    }
  }
  async function login(e) {
    e.preventDefault();
    let form = e.currentTarget,
      u = form.username.value.trim(),
      p = form.password.value;
    try {
      let lock = read(LOCK, null);
      if (!u) throw Error("اكتب اسم مستخدم");
      if (lock) {
        if (u !== lock.username || (await hash(p, lock.salt)) !== lock.hash)
          throw Error("الاسم أو كلمة المرور غير صحيحين");
      } else {
        let salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
        store(LOCK, { username: u, salt, hash: await hash(p, salt) });
      }
      form.reset();
      setUnlocked(true);
      setErr("");
    } catch (e) {
      setErr(e.message);
    }
  }
  async function excel() {
    if (!window.XLSX) {
      await new Promise((res, rej) => {
        let sc = document.createElement("script");
        sc.src =
          "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        sc.onload = res;
        sc.onerror = () =>
          rej(Error("تعذر تحميل أدوات Excel. استخدم JSON أو حاول لاحقاً."));
        document.head.append(sc);
      });
    }
    return window.XLSX;
  }
  async function exportExcel() {
    try {
      let X = await excel(),
        wb = X.utils.book_new();
      X.utils.book_append_sheet(
        wb,
        X.utils.json_to_sheet(
          data.items.map((i) => ({
            Section: sectionOf(i),
            Category: i.category,
            Item: i.name,
            Description: i.description,
            "Size/Variant": i.variant,
            Group: i.group || "",
            Size: i.size || "",
            Price: i.price,
            Currency: "EGP",
            ID: i.id,
            Image: i.image,
            Priority: i.priority,
            Available: i.available,
            Offer: i.offer,
            Featured: i.featured ?? i.offer,
            "Featured Title": i.featuredTitle || "",
            "Featured Badge": i.featuredBadge || "",
            "Featured Priority": i.featuredPriority ?? i.priority,
            "Addon IDs": i.addonIds.join(","),
          })),
        ),
        "Menu",
      );
      X.utils.book_append_sheet(
        wb,
        X.utils.json_to_sheet(
          Object.entries(s).map(([Key, Value]) => ({
            Key,
            Value: Array.isArray(Value) ? JSON.stringify(Value) : Value,
          })),
        ),
        "Settings",
      );
      X.writeFile(wb, "latinoo-menu.xlsx");
    } catch (e) {
      setErr(e.message);
    }
  }
  async function imp(e) {
    let f = e.target.files[0];
    if (!f) return;
    try {
      if (f.size > 25000000) throw Error("الحد الأقصى 25MB");
      let d;
      if (/\.json$/i.test(f.name)) d = valid(JSON.parse(await f.text()));
      else {
        let X = await excel(),
          wb = X.read(await f.arrayBuffer()),
          rows = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
            defval: "",
          }),
          old = new Map(data.items.map((i) => [i.id, i]));
        const bool = (v, f) =>
          v === "" || v === undefined
            ? f
            : !["false", "0", "no"].includes(String(v).toLowerCase());
        d = {
          ...data,
          items: rows.map((r, n) => {
            let prev = old.get(String(r.ID)) || {};
            return {
              ...prev,
              id: String(r.ID || crypto.randomUUID()),
              name: String(r.Item || ""),
              category: String(r.Category || ""),
              section: r.Section || (r.Category === prev.category ? prev.section : undefined),
              price: +r.Price,
              description: r.Description || "",
              variant: r["Size/Variant"] || "",
              group: r.Group ?? prev.group ?? "",
              size: r.Size ?? prev.size ?? "",
              currency: "EGP",
              image: r.Image || "",
              priority: +r.Priority || 0,
              available: bool(r.Available, true),
              offer: bool(r.Offer, false),
              featured: bool(r.Featured, prev.featured),
              featuredTitle: r["Featured Title"] ?? prev.featuredTitle,
              featuredBadge: r["Featured Badge"] ?? prev.featuredBadge,
              featuredPriority: +r["Featured Priority"] || 0,
              addonIds: String(r["Addon IDs"] || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            };
          }),
        };
        if (wb.Sheets.Settings) {
          let rs = X.utils.sheet_to_json(wb.Sheets.Settings);
          d.settings = {
            ...d.settings,
            ...Object.fromEntries(
              rs
                .filter((r) => r.Key in defaults)
                .map((r) => [
                  r.Key,
                  r.Key === "branches"
                    ? JSON.parse(r.Value || "[]")
                    : typeof defaults[r.Key] === "boolean"
                      ? bool(r.Value, defaults[r.Key])
                      : String(r.Value),
                ]),
            ),
          };
        }
        valid(d);
      }
      if (
        confirm(
          "استبدال المسودة بـ " +
            d.items.length +
            " صنف؟ صدّر نسخة احتياطية أولاً.",
        )
      )
        update(d);
    } catch (e) {
      setErr(e.message);
    }
    e.target.value = "";
  }
  function saveItem(e) {
    e.preventDefault();
    try {
      let obj = {
        ...edit,
        id: edit.id || crypto.randomUUID(),
        price: +edit.price,
        priority: +edit.priority || 0,
        featuredPriority: +edit.featuredPriority || 0,
      };
      valid({ items: [obj] });
      if (obj.image && !url(obj.image)) throw Error("رابط الصورة غير صالح");
      let d = {
        ...data,
        items: data.items.some((i) => i.id === obj.id)
          ? data.items.map((i) => (i.id === obj.id ? obj : i))
          : [...data.items, obj],
      };
      if (update(d)) setEdit(null);
    } catch (e) {
      setErr(e.message);
    }
  }
  function editItem(i) {
    setErr("");
    setEdit({
      ...i,
      featured: i.featured ?? i.offer,
      featuredPriority: i.featuredPriority ?? i.priority,
    });
  }
  return (
    <>
      <header>
        <a href="./" className="brand">
          <span className="logo">L✳</span>
          <b>محرر لاتينو</b>
        </a>
        {unlocked && (
          <button
            className="secondary"
            onClick={() => {
              setUnlocked(false);
              setEdit(null);
              setSettings(false);
            }}
          >
            قفل المحرر
          </button>
        )}
      </header>
      <main className="admin">
        <h1>لوحة التحكم المحلية</h1>
        <p className="notice">
          المحرر ده بيحفظ مسودة في المتصفح فقط. القفل مش حماية سيرفر ومش حساب
          نشر. عشان التعديلات تظهر للكل، صدّر items.json وارفعه على GitHub.
          متخزنش بيانات عملاء هنا.
        </p>
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        {!unlocked ? (
          <form className="panel login" onSubmit={login}>
            <h2>{exists ? "افتح المحرر" : "إعداد المحرر على الجهاز ده"}</h2>
            <label className="field">
              اسم المستخدم
              <input name="username" required autoComplete="username" />
            </label>
            <label className="field">
              كلمة المرور
              <input
                name="password"
                type="password"
                minLength={10}
                required
                autoComplete={exists ? "current-password" : "new-password"}
              />
            </label>
            <p className="muted">
              استخدم كلمة مرور محلية فريدة من 10 حروف على الأقل. مفيش حساب أو
              كلمة مرور افتراضية.
            </p>
            <button className="primary full">
              {exists ? "فتح المحرر" : "إنشاء القفل وفتح المحرر"}
            </button>
          </form>
        ) : (
          <>
            <div className="status" role="status">
              {message ||
                `مسودة محلية · ${data.items.length} صنف · ${new Set(data.items.map((i) => i.category)).size} قسم`}
            </div>
            <div className="actions">
              <button
                className="accent"
                onClick={() =>
                  editItem({
                    name: "",
                    category: "",
                    description: "",
                    variant: "",
                    price: 0,
                    priority: 0,
                    available: true,
                    offer: false,
                    featured: false,
                    addonIds: [],
                    image: "",
                  })
                }
              >
                + صنف جديد
              </button>
              <button
                className="primary"
                onClick={() =>
                  download("items.json", JSON.stringify(data, null, 2))
                }
              >
                تصدير items.json للنشر
              </button>
              <button className="secondary" onClick={exportExcel}>
                تصدير Excel
              </button>
              <label className="secondary file">
                استيراد Excel / JSON
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={imp}
                />
              </label>
              <button className="secondary" onClick={() => setSettings(true)}>
                إعدادات الواجهة والطلب والعروض
              </button>
              <a
                className="secondary"
                href="./?preview=1"
                target="_blank"
                rel="noopener"
              >
                معاينة المسودة ↗
              </a>
              <button
                className="secondary"
                onClick={() => {
                  if (confirm("استرجاع النسخة المنشورة وإلغاء المسودة؟"))
                    update(structuredClone(published));
                }}
              >
                استرجاع المنشور
              </button>
            </div>
            <div className="filters">
              <input
                aria-label="بحث الأدمن"
                placeholder="ابحث بالاسم أو القسم..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                aria-label="قسم الأدمن"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="">كل الأقسام</option>
                {[...new Set(data.items.map((i) => i.category))].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="panel table">
              <table>
                <thead>
                  <tr>
                    {[
                      "الصنف",
                      "القسم",
                      "السعر",
                      "الأولوية",
                      "الحالة",
                      "الإجراء",
                    ].map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items
                    .filter(
                      (i) =>
                        (!cat || cat === i.category) &&
                        norm(i.name + " " + i.category).includes(norm(query)),
                    )
                    .sort((a, b) => a.priority - b.priority)
                    .map((i) => (
                      <tr key={i.id}>
                        <td>{i.name}</td>
                        <td>{i.category}</td>
                        <td>{money(i.price)}</td>
                        <td>{i.priority}</td>
                        <td>
                          {i.available ? "متاح" : "مخفي"}
                          {i.offer ? " · عرض" : ""}
                          {(i.featured ?? i.offer) ? " · في الواجهة" : ""}
                        </td>
                        <td>
                          <button
                            className="secondary"
                            onClick={() => editItem(i)}
                          >
                            تعديل
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {unlocked && edit && (
          <Modal
            title={edit.id ? "تعديل صنف" : "صنف جديد"}
            onClose={() => setEdit(null)}
          >
            <form onSubmit={saveItem}>
              <div className="form-grid">
                <label className="field">القسم الرئيسي
                  <select value={sectionOf(edit)} onChange={(e) => setEdit({ ...edit, section: e.target.value })}>
                    <option value="main">المنيو الأساسي</option>
                    <option value="sweets">ركن الحلو</option>
                    <option value="drinks">ركن المشروبات</option>
                  </select>
                </label>
                {[
                  ["name", "اسم الصنف", "text"],
                  ["category", "القسم", "text"],
                  ["price", "السعر", "number"],
                  ["priority", "أولوية داخل القسم (الأقل أولاً)", "number"],
                  ["variant", "الحجم / الوصف المختصر", "text"],
                  ["group", "اسم المجموعة (لدمج أحجام نفس الصنف في كارت واحد، مثال: بيتزا مرجريتا)", "text"],
                  ["size", "الحجم داخل المجموعة (مثال: وسط، كبير)", "text"],
                  ["image", "رابط الصورة", "text"],
                  ["featuredTitle", "عنوان بطاقة الواجهة (اختياري)", "text"],
                  ["featuredBadge", "شارة بطاقة الواجهة (اختياري)", "text"],
                  [
                    "featuredPriority",
                    "ترتيب بطاقة الواجهة (الأقل أولاً)",
                    "number",
                  ],
                ].map(([key, label, type]) => (
                  <label className="field" key={key}>
                    {label}
                    <input
                      type={type}
                      min={key === "price" ? 0 : undefined}
                      step={key === "price" ? "0.01" : undefined}
                      required={["name", "category", "price"].includes(key)}
                      value={edit[key] ?? ""}
                      onChange={(e) =>
                        setEdit({ ...edit, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </div>
              <label className="field">
                الوصف
                <textarea
                  value={edit.description || ""}
                  onChange={(e) =>
                    setEdit({ ...edit, description: e.target.value })
                  }
                />
              </label>
              <label className="field">
                أو ارفع صورة (JPG/PNG/WebP، حتى 500KB)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    let f = e.target.files[0];
                    if (!f) return;
                    if (
                      f.size > 500000 ||
                      !["image/png", "image/jpeg", "image/webp"].includes(
                        f.type,
                      )
                    ) {
                      setErr("اختار صورة أقل من 500KB");
                      return;
                    }
                    let r = new FileReader();
                    r.onload = () => setEdit({ ...edit, image: r.result });
                    r.readAsDataURL(f);
                  }}
                />
              </label>
              {edit.image && <Photo item={edit} className="admin-photo" />}
              {[
                ["available", "متاح للعملاء"],
                ["offer", "عرض في قسم العروض"],
                ["featured", "عرض البطاقة أعلى الواجهة"],
              ].map(([key, label]) => (
                <label className="check" key={key}>
                  <input
                    type="checkbox"
                    checked={!!edit[key]}
                    onChange={(e) =>
                      setEdit({ ...edit, [key]: e.target.checked })
                    }
                  />
                  {label}
                </label>
              ))}
              <label className="field">
                الإضافات المقترحة (اختار أكتر من صنف)
                <select
                  multiple
                  size="6"
                  value={edit.addonIds || []}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      addonIds: [...e.target.selectedOptions].map(
                        (o) => o.value,
                      ),
                    })
                  }
                >
                  {data.items
                    .filter((i) => i.id !== edit.id)
                    .map((i) => (
                      <option value={i.id} key={i.id}>
                        {i.category} / {i.name} · {money(i.price)}
                      </option>
                    ))}
                </select>
              </label>
              <p className="muted">
                لو مفيش إضافات محددة، هتظهر اقتراحات مناسبة من المنيو تلقائياً.
              </p>
              {err && <p className="error">{err}</p>}
              <button className="primary full">حفظ الصنف في المسودة</button>
              {edit.id && (
                <button
                  type="button"
                  className="danger full"
                  onClick={() => {
                    if (confirm("حذف الصنف من المسودة؟")) {
                      let d = {
                        ...data,
                        items: data.items
                          .filter((i) => i.id !== edit.id)
                          .map((i) => ({
                            ...i,
                            addonIds: i.addonIds.filter((id) => id !== edit.id),
                          })),
                      };
                      if (!d.items.length) {
                        setErr("لا يمكن حذف آخر صنف");
                        return;
                      }
                      if (update(d)) setEdit(null);
                    }
                  }}
                >
                  حذف الصنف
                </button>
              )}
            </form>
          </Modal>
        )}
        {unlocked && settings && (
          <Settings
            s={s}
            onClose={() => setSettings(false)}
            onSave={(v) => {
              if (update({ ...data, settings: v })) setSettings(false);
            }}
          />
        )}
      </main>
    </>
  );
}
