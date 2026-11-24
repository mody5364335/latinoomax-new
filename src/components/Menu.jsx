import React, { useEffect, useState, useRef, useMemo, useDeferredValue } from "react";
import { brandLogo } from "../assets/brandLogo.js";
import { CART, read, store } from "../lib/storage.js";
import { defaults } from "../lib/defaults.js";
import { matchesSearch, money } from "../lib/format.js";
import { sectionOf, sectionTitle, categoryRank, catKey } from "../lib/sections.js";
import { suggestions } from "../lib/suggestions.js";
import { internationalPhone, orderText } from "../lib/order.js";
import { Greeting } from "./Greeting.jsx";
import { Photo } from "./Photo.jsx";
import { Modal } from "./Modal.jsx";
import { Icon } from "./Icon.jsx";

export function Menu({ data }) {
  const s = { ...defaults, ...data.settings },
    items = data.items;
  const [query, setQuery] = useState(""),
    [section, setSection] = useState("main"),
    [cat, setCat] = useState(""),
    [count, setCount] = useState(24),
    [selected, setSelected] = useState(null),
    [extra, setExtra] = useState([]),
    [cart, setCart] = useState(() => read(CART, [])),
    [open, setOpen] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const featureTrack = useRef(null);
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    phone: "",
    notes: "",
    type: s.deliveryEnabled ? "delivery" : s.dineInEnabled ? "dineIn" : "",
  });
  useEffect(() => {
    try {
      store(CART, cart);
    } catch {
      setError("تعذر حفظ السلة في المتصفح");
    }
  }, [cart]);
  const lines = cart
      .map((l) => {
        let item = items.find((i) => i.id === l.id && i.available);
        if (!item) return null;
        let addons = (l.extras || [])
          .map((id) => items.find((i) => i.id === id && i.available))
          .filter(Boolean);
        return {
          ...l,
          item,
          addons,
          unit: item.price + addons.reduce((a, b) => a + b.price, 0),
        };
      })
      .filter(Boolean),
    total = lines.reduce((a, l) => a + l.unit * l.qty, 0),
    qty = lines.reduce((a, l) => a + l.qty, 0);
  const deferredQuery = useDeferredValue(query);
  const cats = [
      ...new Set(items.filter((i) => i.available && sectionOf(i) === section).map((i) => catKey(i))),
    ].sort((a, b) => (section === "main" ? categoryRank(a) - categoryRank(b) : 0)),
    filtered = useMemo(() => {
      const seen = new Set();
      return items
      .filter(
        (i) =>
          i.available &&
          (deferredQuery.trim() || sectionOf(i) === section) &&
          (deferredQuery.trim() ||
            !cat ||
            (cat === "@offers" ? i.offer : catKey(i) === cat)) &&
          (!deferredQuery.trim() || matchesSearch(i, deferredQuery)),
      )
      .sort((a, b) => (section === "main" && !cat && !deferredQuery.trim() ? categoryRank(catKey(a)) - categoryRank(catKey(b)) : 0) || a.priority - b.priority)
      .filter((i) => !i.group || (!seen.has(i.group) && seen.add(i.group)));
    }, [items, section, cat, deferredQuery]);
  const featured = items
    .filter(
      (i) =>
        i.available &&
        (i.featured === true || (i.featured === undefined && i.offer)),
    )
    .sort(
      (a, b) =>
        (a.featuredPriority ?? a.priority) - (b.featuredPriority ?? b.priority),
    );
  const suggestCache = useMemo(() => new Map(), [items]);
  function hasSuggestions(i) { let v = suggestCache.get(i.id); if (v === undefined) { v = suggestions(i, items).length > 0; suggestCache.set(i.id, v); } return v; }
  const [offerIndex, setOfferIndex] = useState(0);
  const offerIndexRef = useRef(0), offerHolding = useRef(false);
  const offerNextAt = useRef(Date.now() + 6000);
  function pauseOffers() { offerNextAt.current = Date.now() + 5000; }
  function holdOffers() { offerHolding.current = true; pauseOffers(); }
  function releaseOffers() { if (offerHolding.current) { offerHolding.current = false; pauseOffers(); } }
  function goOffer(index, smooth = true) {
    const track = featureTrack.current;
    if (!track || !featured.length) return;
    const next = (index + featured.length) % featured.length;
    const card = track.children[next];
    const a = card.getBoundingClientRect(), b = track.getBoundingClientRect();
    track.scrollBy({left: a.left - b.left - (b.width - a.width) / 2, behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant"});
    offerIndexRef.current = next; setOfferIndex(next);
  }
  function syncOffer() {
    const track = featureTrack.current;
    if (!track) return;
    const b = track.getBoundingClientRect();
    let best = 0, distance = Infinity;
    [...track.children].forEach((card, index) => { const a = card.getBoundingClientRect(); const d = Math.abs((a.left+a.right)/2-(b.left+b.right)/2); if(d < distance){best=index;distance=d;} });
    offerIndexRef.current = best; setOfferIndex(best);
  }
  useEffect(() => {
    // Keep regular rotation at six seconds; each interaction gives five seconds to read.
    offerNextAt.current = Date.now() + 6000;
    const release = () => releaseOffers();
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    const timer = setInterval(() => {
      if (offerHolding.current || document.hidden || document.querySelector("dialog[open]")) {
        offerNextAt.current = Date.now() + 5000;
        return;
      }
      if (Date.now() >= offerNextAt.current) {
        goOffer(offerIndexRef.current + 1);
        offerNextAt.current = Date.now() + 6000;
      }
    }, 100);
    return () => { clearInterval(timer); window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); };
  }, [featured.length]);
  const sizesOf = (i) => i.group ? items.filter((x) => x.available && x.group === i.group).sort((a, b) => a.price - b.price) : [];
  function details(i) {
    const sizes = sizesOf(i);
    setSelected(sizes[0] || i);
    setExtra([]);
  }
  function add() {
    let extras = [...extra].sort(),
      key = selected.id + "|" + extras.join(",");
    setCart((c) => {
      let found = c.find((l) => l.key === key);
      return found
        ? c.map((l) =>
            l.key === key ? { ...l, qty: Math.min(l.qty + 1, 99) } : l,
          )
        : [...c, { key, id: selected.id, extras, qty: 1 }];
    });
    setSelected(null);
    setNotice("اتضاف للسلة ✓");
    setTimeout(() => setNotice(""), 2500);
  }
  function change(key, delta) {
    setCart((c) =>
      c
        .map((l) =>
          l.key === key ? { ...l, qty: Math.min(99, l.qty + delta) } : l,
        )
        .filter((l) => l.qty > 0),
    );
  }
  function checkout(e) {
    e.preventDefault();
    setError("");
    if (!lines.length) return;
    if (
      !customer.type ||
      (customer.type === "delivery" && !s.deliveryEnabled) ||
      (customer.type === "dineIn" && !s.dineInEnabled)
    ) {
      setError("نوع الطلب غير متاح حالياً");
      return;
    }
    let phone = customer.phone
      .replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c))
      .replace(/[\s()+-]/g, "");
    if (customer.phone && !/^\d{8,15}$/.test(phone)) {
      setError("اكتب رقم هاتف صحيح من 8 إلى 15 رقم");
      return;
    }
    if (!/^\d{10,15}$/.test(s.orderPhone)) {
      setError("استقبال الطلبات غير متاح. راجع المطعم.");
      return;
    }
    const text = orderText(s, customer, lines, total);
    // Clear on a valid order tap, independently of the WhatsApp popup result.
    if (s.clearCart) {
      setCart([]);
      try {
        localStorage.removeItem(CART);
      } catch {}
    }
    setOpen(false);
    setCustomer((c) => ({ ...c, notes: "" }));
    try {
      let win = window.open(
        "https://wa.me/" + s.orderPhone + "?text=" + encodeURIComponent(text),
        "_blank",
      );
      if (win) win.opener = null;
      setNotice(
        win
          ? "رسالتك جاهزة في واتساب. اضغط إرسال هناك لتأكيد الطلب."
          : "المتصفح منع فتح واتساب. السلة اتفضت؛ اسمح بالنوافذ المنبثقة قبل طلب جديد.",
      );
    } catch {
      setNotice(
        "تعذر فتح واتساب. السلة اتفضت؛ راجع إعدادات المتصفح قبل طلب جديد.",
      );
    }
  }
  const hero =
    items.find((i) => /بيتزا/.test(i.category) && i.image) ||
    items.find((i) => i.image);
  return (
    <>
      <header className="menu-header">
        <a href="./" className="brand">
          <span className="brand-plaque">
            <img className="brand-logo" src={brandLogo} alt={s.brand} />
          </span>
          <span className="brand-tagline">
            لاتينو ماكس<small>طعم على مزاجك</small>
          </span>
        </a>
        <Greeting />
        <button className="primary" onClick={() => setOpen(true)}>
          السلة <span className="bubble">{qty}</span>
        </button>
      </header>
      <main>
        {new URLSearchParams(location.search).has("preview") && (
          <div className="notice">
            معاينة المسودة المحلية، التغييرات لم تنشر للعملاء.
          </div>
        )}
        {s.featuredEnabled && featured.length > 0 && (
          <section className="featured" aria-label="اختيارات مميزة"
            onPointerDownCapture={holdOffers} onPointerUpCapture={releaseOffers}
            onPointerCancelCapture={releaseOffers} onWheelCapture={pauseOffers}
            onKeyDownCapture={pauseOffers} onClickCapture={pauseOffers}>
            <div className="section-head">
              <div>
                <p className="eyebrow">اختيارات لاتينو</p>
                <h2>{s.featuredTitle}</h2>
              </div>
              <div className="offer-controls">
                <span className="muted">اختار عرضك المفضل</span>
                <button
                  className="offer-arrow"
                  aria-label="العروض السابقة"
                  onClick={() => goOffer(offerIndexRef.current - 1)}
                >
                  →
                </button>
                <button
                  className="offer-arrow"
                  aria-label="العروض التالية"
                  onClick={() => goOffer(offerIndexRef.current + 1)}
                >
                  ←
                </button>
              </div>
            </div>
            <div className="feature-track" ref={featureTrack} onScroll={syncOffer}>
              {featured.map((i) => (
                <button
                  className="feature-card"
                  key={i.id}
                  onClick={() => details(i)}
                >
                  <Photo item={i} />
                  <span className="offer-spark" aria-hidden="true">
                    ✦
                  </span>
                  <span className="feature-copy">
                    <small>
                      {i.featuredBadge || (i.offer ? "عرض مميز" : "من المنيو")}
                    </small>
                    <b>{i.featuredTitle || i.name}</b>
                    <span>
                      <strong>{money(i.price)}</strong> <i>شوف التفاصيل +</i>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="offer-pagination" aria-label="موضع العرض">
              <div className="offer-bars">{featured.map((item,index) => <button key={item.id} className={offerIndex === index ? "current" : ""} aria-label={`العرض ${index+1} من ${featured.length}`} aria-current={offerIndex === index ? "true" : undefined} onClick={() => goOffer(index)} />)}</div>
            </div>
          </section>
        )}
        <section className="hero">
          <div>
            <p className="eyebrow">FRESH PICKS. GOOD MOOD.</p>
            <h1>{s.heroTitle}</h1>
            <p>{s.heroText}</p>
            <a className="accent" href="#menu">
              شوف المنيو ↙
            </a>
            <div className="hero-note">
              {items.length} اختيار · طلبك على مزاجك
            </div>
          </div>
          <div className="hero-photo">
            <Photo item={hero} />
            <span className="stamp">
              LATINOO
              <br />
              GOOD FOOD
              <br />
              GOOD MOOD
            </span>
          </div>
        </section>
        <section id="menu">
          <div className="section-head menu-head">
            <div>
              <p className="eyebrow">على مزاجك</p>
              <h2>هتطلب إيه النهارده؟</h2>
            </div>
            <input
              className="search"
              aria-label="ابحث في كل المنيو"
              placeholder="ابحث في كل المنيو..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCount(24);
              }}
            />
          </div>
          <div className="menu-layout">
            <nav className="categories" aria-label="أقسام المنيو">
              <div className="menu-sections" aria-label="الأقسام الرئيسية">
                {["main", "sweets", "drinks"].map((id) => (
                  <button key={id} className={section === id ? "active" : ""}
                    aria-pressed={section === id}
                    onClick={() => { setSection(id); setCat(""); setQuery(""); setCount(24); }}>
                    {sectionTitle(id)}
                  </button>
                ))}
              </div>
              <div className="category-filter" key={section} aria-label="تصفية حسب النوع">
                {[["", "كل الأصناف"], ["@offers", "العروض"], ...cats.map((c) => [c, c])].map(([id, title]) => (
                  <button key={id} aria-pressed={!deferredQuery.trim() && cat === id} className={!deferredQuery.trim() && cat === id ? "active" : ""}
                    onClick={() => { setCat(id); setCount(24); }}>
                    {title}
                  </button>
                ))}
              </div>
            </nav>
            <div>
              <div className="results">
                <h3>
                  {deferredQuery.trim()
                    ? "نتائج البحث في كل المنيو"
                    : cat === "@offers"
                      ? "العروض"
                      : cat || sectionTitle(section)}
                </h3>
                <span>{filtered.length} صنف</span>
              </div>
              <div className="grid">
                {filtered.slice(0, count).map((i) => (
                  <article className="card" key={i.id} onClick={() => details(i)}>
                    <button
                      className="card-photo"
                      aria-label={"تفاصيل " + (i.group || i.name)}
                      onClick={() => details(i)}
                    >
                      <Photo item={i} />
                      {i.offer && <span className="badge">عرض</span>}
                    </button>
                    <div className="card-body">
                      <small>{deferredQuery.trim() ? `${sectionTitle(sectionOf(i))} · ${catKey(i)}` : catKey(i)}</small>
                      <h3>{i.group || i.name}</h3>
                      {i.description && <p className="item-description">{i.description}</p>}
                      {i.variant && <p className="muted">{i.variant}</p>}
                      {i.group && <p className="muted">{sizesOf(i).map((x) => x.size).join(" · ")}</p>}
                      <div className="card-bottom">
                        <strong>{i.group ? <><small className="from">من </small>{money(Math.min(...sizesOf(i).map((x) => x.price)))}</> : money(i.price)}</strong>
                        <button
                          className="add"
                          aria-label={"إضافة " + (i.group || i.name)}
                          onClick={() => details(i)}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>
                      <button
                        className="detail-link"
                        onClick={() => details(i)}
                      >
                        {hasSuggestions(i)
                          ? "كمل طلبك بإضافات ↗"
                          : "تفاصيل الصنف ↗"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty">مفيش نتائج، جرب اسم تاني.</div>
              )}
              {count < filtered.length && (
                <button
                  className="secondary more"
                  onClick={() => setCount(count + 24)}
                >
                  عرض أصناف أكتر ↓
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
      {s.contactsEnabled && (
        <section className="contacts" aria-label={s.contactsTitle}>
          <div className="section-head">
            <div>
              <p className="eyebrow">LATINOO MAX · GET IN TOUCH</p>
              <h2>{s.contactsTitle}</h2>
            </div>
            <span className="contact-mark" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="branch-grid">
            {(Array.isArray(s.branches) ? s.branches : [])
              .filter((b) => b.name && (b.phones?.length || b.phone))
              .map((b, idx) => (
                <article className="branch-card" key={idx}>
                  <h3>
                    <span className="branch-dot" aria-hidden="true" />
                    {b.name}
                  </h3>
                  {b.address && (
                    <p className="branch-address">
                      <Icon type="pin" />
                      {b.address}
                    </p>
                  )}
                  <div className="branch-phones">
                    {(b.phones || [b.phone]).filter(Boolean).map((phone, n) => (
                      <div className="branch-actions" key={n}>
                        <a
                          className="branch-call"
                          href={"tel:" + phone.replace(/[^+0-9]/g, "")}
                          aria-label={"اتصل بـ " + b.name + " " + (n + 1)}
                        >
                          <Icon type="phone" />
                          <b dir="ltr">{phone}</b>
                        </a>
                        <a
                          className="branch-whatsapp"
                          href={"https://wa.me/" + internationalPhone(phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={"واتساب " + b.name + " " + (n + 1)}
                        >
                          <Icon type="chat" />
                        </a>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
          </div>
          {!(
            Array.isArray(s.branches) &&
            s.branches.some((b) => b.name && (b.phones?.length || b.phone))
          ) && (
            <p className="contacts-empty">
              بيانات الفروع وأرقام التواصل هتتوفر قريباً.
            </p>
          )}
        </section>
      )}
      <footer>
        <b>{s.brand}</b>
        <p>
          الأسعار بالجنيه المصري ولا تشمل رسوم التوصيل. بعض الصور خاصة بالقسم
          وليست بالصنف.
        </p>
        <p>
          الطلب بيتبعت كرسالة واتساب. تأكيد الطلب ورسوم التوصيل بيكونوا مع
          المطعم.
        </p>
        <a href="./admin.html">محرر المنيو المحلي</a>
      </footer>
      {qty > 0 && !open && (
        <button className="floating" onClick={() => setOpen(true)}>
          <span>
            شوف سلتك <b>{qty}</b>
          </span>
          <strong>{money(total)} ←</strong>
        </button>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {selected && (
        <Modal title={selected.group || selected.name} onClose={() => setSelected(null)}>
          <Photo item={selected} className="detail-photo" />
          <p>
            {selected.description || selected.category} {selected.variant}
          </p>
          {selected.group ? (
            <>
              <h3>اختار الحجم</h3>
              {sizesOf(selected).map((x) => (
                <label className="check addon size" key={x.id}>
                  <input type="radio" name="pizza-size" checked={x.id === selected.id}
                    onChange={() => { setSelected(x); setExtra([]); }} />
                  <span>{x.size}</span>
                  <b>{money(x.price)}</b>
                </label>
              ))}
            </>
          ) : <strong>{money(selected.price)}</strong>}
          {suggestions(selected, items).length > 0 && (
            <>
              <h3>كمل طلبك</h3>
              <p className="muted">
                إضافات اختيارية بأسعارها. راجع حساسيات الطعام مع المطعم.
              </p>
              {suggestions(selected, items).map((a) => (
                <label className="check addon" key={a.id}>
                  <input
                    type="checkbox"
                    checked={extra.includes(a.id)}
                    onChange={(e) =>
                      setExtra(
                        e.target.checked
                          ? [...extra, a.id]
                          : extra.filter((id) => id !== a.id),
                      )
                    }
                  />
                  <span>{a.name}</span>
                  <b>+ {money(a.price)}</b>
                </label>
              ))}
            </>
          )}
          <button className="accent full" onClick={add}>
            <span>أضف للسلة</span>
            <bdi>{money(
              selected.price +
                extra.reduce(
                  (sum, id) =>
                    sum + (items.find((i) => i.id === id)?.price || 0),
                  0,
                ),
            )}</bdi>
          </button>
        </Modal>
      )}
      {open && (
        <Modal title="سلتك" onClose={() => setOpen(false)}>
          {lines.length ? (
            <>
              <div className="cart-toolbar">
                <span>{qty} صنف في سلتك</span>
                <button
                  type="button"
                  className="clear-cart"
                  onClick={() => {
                    setCart([]);
                    try {
                      localStorage.removeItem(CART);
                    } catch {}
                  }}
                >
                  تفريغ السلة ×
                </button>
              </div>
              <div className="cart-lines">
                {lines.map((l) => (
                  <div className="cart-line" key={l.key}>
                    <div>
                      <b>{l.item.name}</b>
                      {l.addons.map((a) => (
                        <p key={a.id} className="muted">
                          + {a.name} ({money(a.price)})
                        </p>
                      ))}
                      <p className="muted">سعر الوحدة: {money(l.unit)}</p>
                      <div className="qty">
                        <button
                          aria-label={"تقليل " + l.item.name}
                          onClick={() => change(l.key, -1)}
                        >
                          −
                        </button>
                        <span>{l.qty}</span>
                        <button
                          aria-label={"زيادة " + l.item.name}
                          onClick={() => change(l.key, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <strong>{money(l.unit * l.qty)}</strong>
                      <button
                        className="danger"
                        onClick={() =>
                          setCart((c) => c.filter((x) => x.key !== l.key))
                        }
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="total">
                <span>إجمالي الأصناف</span>
                <b>{money(total)}</b>
              </div>
              <p className="notice">{s.deliveryDisclaimer}</p>
              <form onSubmit={checkout}>
                <h3>تفاصيل الطلب</h3>
                <div className="order-types">
                  <label className={!s.deliveryEnabled ? "disabled" : ""}>
                    <input
                      type="radio"
                      name="type"
                      value="delivery"
                      disabled={!s.deliveryEnabled}
                      checked={customer.type === "delivery"}
                      onChange={() =>
                        setCustomer({ ...customer, type: "delivery" })
                      }
                    />
                    {s.deliveryLabel}
                    {!s.deliveryEnabled && " (غير متاح حالياً)"}
                  </label>
                  <label className={!s.dineInEnabled ? "disabled" : ""}>
                    <input
                      type="radio"
                      name="type"
                      value="dineIn"
                      disabled={!s.dineInEnabled}
                      checked={customer.type === "dineIn"}
                      onChange={() =>
                        setCustomer({ ...customer, type: "dineIn" })
                      }
                    />
                    {s.dineInLabel}
                    {!s.dineInEnabled && " (غير متاح حالياً)"}
                  </label>
                </div>
                {[
                  ["name", s.nameLabel, s.nameRequired, "text"],
                  ["address", s.addressLabel, s.addressRequired, "text"],
                  ["phone", s.phoneLabel, s.phoneRequired, "tel"],
                ].map(([key, label, required, type]) => (
                  <label className="field" key={key}>
                    {label} {required && "*"}
                    <input
                      name={key}
                      type={type}
                      required={required}
                      maxLength={key === "address" ? 500 : 100}
                      value={customer[key]}
                      onChange={(e) =>
                        setCustomer({ ...customer, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
                {s.notesEnabled && (
                  <label className="field">
                    {s.notesLabel}
                    <textarea
                      name="notes"
                      maxLength={1500}
                      value={customer.notes}
                      onChange={(e) =>
                        setCustomer({ ...customer, notes: e.target.value })
                      }
                    />
                  </label>
                )}
                <p className="muted">
                  هنفتح واتساب برسالة جاهزة. لازم تضغط إرسال هناك.{" "}
                  {s.clearCart
                    ? "السلة هتفضى بمجرد الضغط على متابعة، حتى لو واتساب ما فتحش. ده مش تأكيد استلام الطلب."
                    : ""}
                </p>
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
                <button
                  className="primary full"
                  disabled={!s.deliveryEnabled && !s.dineInEnabled}
                >
                  متابعة على واتساب ↗
                </button>
              </form>
            </>
          ) : (
            <div className="empty">
              <h3>سلتك فاضية</h3>
              <p>اختار حاجة حلوة من المنيو.</p>
              <button className="primary" onClick={() => setOpen(false)}>
                ارجع للمنيو
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
