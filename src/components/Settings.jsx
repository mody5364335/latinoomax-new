import React, { useState } from "react";
import { internationalPhone } from "../lib/order.js";
import { Modal } from "./Modal.jsx";

export function Settings({ s, onClose, onSave }) {
  let [v, setV] = useState(s),
    [err, setErr] = useState("");
  let texts = [
    ["brand", "اسم البراند"],
    ["heroTitle", "عنوان الواجهة"],
    ["heroText", "نص الواجهة"],
    ["featuredTitle", "عنوان قسم البطاقات المميزة"],
    ["contactsTitle", "عنوان قسم التواصل والفروع"],
    ["orderPhone", "رقم استقبال واتساب بصيغة دولية بدون +"],
    ["deliveryLabel", "اسم خيار الديلفري"],
    ["dineInLabel", "اسم خيار الصالة"],
    ["nameLabel", "عنوان خانة الاسم"],
    ["addressLabel", "عنوان خانة العنوان"],
    ["phoneLabel", "عنوان خانة الهاتف"],
    ["notesLabel", "عنوان خانة الملاحظات"],
    ["whatsappTitle", "عنوان رسالة واتساب"],
    ["deliveryDisclaimer", "تنبيه رسوم التوصيل آخر الرسالة"],
  ];
  let checks = [
    ["featuredEnabled", "إظهار قسم الاختيارات أعلى الواجهة"],
    ["deliveryEnabled", "تفعيل الديلفري"],
    ["dineInEnabled", "تفعيل الصالة (غير متاحة افتراضياً)"],
    ["nameRequired", "الاسم مطلوب"],
    ["addressRequired", "العنوان مطلوب"],
    ["phoneRequired", "الهاتف مطلوب"],
    ["notesEnabled", "إظهار الملاحظات"],
    ["clearCart", "تفريغ السلة بمجرد الضغط على متابعة الطلب"],
    ["contactsEnabled", "إظهار قسم الفروع والتواصل"],
  ];
  return (
    <Modal title="إعدادات الواجهة والطلب" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\d{10,15}$/.test(v.orderPhone)) {
            setErr("رقم واتساب لازم يكون دولي، أرقام فقط");
            return;
          }
          if (
            !Array.isArray(v.branches) ||
            v.branches.some(
              (b) =>
                !b.name?.trim() ||
                !(b.phones || [b.phone]).length ||
                (b.phones || [b.phone]).some(
                  (phone) =>
                    !/^\+?[\d\s()-]{8,22}$/.test(phone || "") ||
                    !/^\d{10,15}$/.test(internationalPhone(phone)),
                ),
            )
          ) {
            setErr(
              "راجع اسم الفرع وأرقام الهاتف، وافصل الأرقام بفاصلة إنجليزية.",
            );
            return;
          }
          onSave(v);
        }}
      >
        {texts.map(([key, label]) => (
          <label className="field" key={key}>
            {label}
            <input
              required
              value={v[key] ?? ""}
              maxLength={key === "heroText" ? 500 : 250}
              onChange={(e) => setV({ ...v, [key]: e.target.value })}
            />
          </label>
        ))}
        {checks.map(([key, label]) => (
          <label className="check" key={key}>
            <input
              type="checkbox"
              checked={!!v[key]}
              onChange={(e) => setV({ ...v, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
        <fieldset className="branch-editor">
          <legend>الفروع وأرقام التواصل</legend>
          <p className="muted">
            أضف بيانات المطعم فقط. الأرقام المصرية تبدأ بـ 0، ولغيرها استخدم +
            وكود الدولة.
          </p>
          {(Array.isArray(v.branches) ? v.branches : []).map((b, idx) => (
            <div className="branch-edit" key={idx}>
              {[
                ["name", "اسم الفرع"],
                ["address", "العنوان"],
                ["phone", "أرقام الهاتف (افصل بينها بفاصلة إنجليزية ,)"],
              ].map(([key, label]) => (
                <label className="field" key={key}>
                  {label}
                  <input
                    required={key !== "address"}
                    value={
                      key === "phone"
                        ? (b.phoneText ??
                          (b.phones || [b.phone]).filter(Boolean).join(", "))
                        : b[key] || ""
                    }
                    maxLength={key === "address" ? 400 : 150}
                    onChange={(e) =>
                      setV({
                        ...v,
                        branches: v.branches.map((x, n) =>
                          n === idx
                            ? key === "phone"
                              ? {
                                  ...x,
                                  phoneText: e.target.value,
                                  phone: e.target.value.split(",")[0].trim(),
                                  phones: e.target.value
                                    .split(",")
                                    .map((n) => n.trim()),
                                }
                              : { ...x, [key]: e.target.value }
                            : x,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <button
                type="button"
                className="danger"
                onClick={() =>
                  setV({
                    ...v,
                    branches: v.branches.filter((_, n) => n !== idx),
                  })
                }
              >
                حذف الفرع
              </button>
            </div>
          ))}
          <button
            type="button"
            className="secondary"
            onClick={() =>
              setV({
                ...v,
                branches: [
                  ...(Array.isArray(v.branches) ? v.branches : []),
                  { name: "", address: "", phone: "" },
                ],
              })
            }
          >
            + إضافة فرع
          </button>
        </fieldset>
        <p className="notice">
          اختيار الأصناف المعروضة أعلى الصفحة وترتيبها وعنوانها وصورتها من تعديل
          الصنف. واتساب لا يؤكد الإرسال، تفريغ السلة يتم عند الضغط على متابعة
          الطلب حتى لو لم يفتح واتساب.
        </p>
        {err && <p className="error">{err}</p>}
        <button className="primary full">حفظ الإعدادات في المسودة</button>
      </form>
    </Modal>
  );
}
