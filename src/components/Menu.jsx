import React, { useEffect, useState, useRef, useMemo, useDeferredValue } from "react";
import { brandLogo } from "../assets/brandLogo.js";
import { bullMark } from "../assets/bullMark.js";
import { qodraLockup } from "../assets/qodraLockup.js";
import { CART, read, store } from "../lib/storage.js";
import { defaults } from "../lib/defaults.js";
import { matchesSearch } from "../lib/format.js";
import { matchesEn, getLang, saveLang, makeT, enSettings, enBranch, locName, locGroup, locDesc, locSize, locCat, locCatKey, sectionEn, fmtMoney } from "../lib/i18n.js";
import { Hours } from "./Hours.jsx";
import { addonCategories, sectionOf, sectionTitle, categoryRank, catKey, hasSpice, spicyDefault } from "../lib/sections.js";
import { suggestions, sauceSuggestions } from "../lib/suggestions.js";
import { internationalPhone, orderText } from "../lib/order.js";
import { Greeting } from "./Greeting.jsx";
import { Photo } from "./Photo.jsx";
import { Modal } from "./Modal.jsx";
import { Icon } from "./Icon.jsx";

export function Menu({ data }) {
  const [lang, setLangState] = useState(getLang);
  const t = makeT(lang), isEn = lang === "en";
  const money = (n) => fmtMoney(lang, n);
  const setLang = (l) => { setLangState(l); saveLang(l); };
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isEn ? "ltr" : "rtl";
    document.title = t("title");
  }, [lang]);
  const base = { ...defaults, ...data.settings };
  // English only replaces a setting still at its default; custom settings are shown as written.
  const s = isEn ? Object.fromEntries(Object.entries(base).map(([k, v]) => [k, enSettings[k] && v === defaults[k] ? enSettings[k] : v])) : base,
    items = data.items;
  const secTitle = (id) => (isEn ? sectionEn[id] || sectionEn.main : sectionTitle(id));
  const isDefaultBranch = (b) => b.name === defaults.branches[0].name;
  const bName = (b) => (isEn && isDefaultBranch(b) ? enBranch.name : b.name);
  const bAddr = (b) => (isEn && isDefaultBranch(b) ? enBranch.address : b.address);
  const iName = (i) => locName(lang, i);
  const iDesc = (i) => locDesc(lang, i.description);
  const [query, setQuery] = useState(""),
    [section, setSection] = useState("main"),
    [cat, setCat] = useState(""),
    [count, setCount] = useState(24),
    [selected, setSelected] = useState(null),
    [extra, setExtra] = useState([]),
    [spice, setSpice] = useState(false),
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
      setError(t("errStore"));
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
          (!deferredQuery.trim() || !addonCategories.has(i.category)) &&
          (!deferredQuery.trim() || matchesSearch(i, deferredQuery) || matchesEn(i, deferredQuery)),
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
  function hasSuggestions(i) { let v = suggestCache.get(i.id); if (v === undefined) { v = suggestions(i, items).length + sauceSuggestions(i, items).length > 0; suggestCache.set(i.id, v); } return v; }
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
    const first = sizes[0] || i;
    setSelected(first);
    setExtra([]);
    setSpice(hasSpice(first) && spicyDefault(first));
  }
  function add() {
    let extras = [...extra].sort(),
      sp = hasSpice(selected) ? spice : null,
      key = selected.id + "|" + extras.join(",") + (sp === null ? "" : sp ? "|hot" : "|normal");
    setCart((c) => {
      let found = c.find((l) => l.key === key);
      return found
        ? c.map((l) =>
            l.key === key ? { ...l, qty: Math.min(l.qty + 1, 99) } : l,
          )
        : [...c, { key, id: selected.id, extras, qty: 1, spice: sp }];
    });
    setSelected(null);
    setNotice(t("addedToast"));
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
      setError(t("errType"));
      return;
    }
    let phone = customer.phone
      .replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c))
      .replace(/[\s()+-]/g, "");
    if (customer.phone && !/^\d{8,15}$/.test(phone)) {
      setError(t("errPhone"));
      return;
    }
    if (!/^\d{10,15}$/.test(s.orderPhone)) {
      setError(t("errRecv"));
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
          ? t("waReady")
          : t("waBlocked"),
      );
    } catch {
      setNotice(
        t("waFail"),
      );
    }
  }
  const hero =
    items.find((i) => i.available && /بيتزا/.test(i.category) && i.image) ||
    items.find((i) => i.available && i.image);
  return (
    <>
      <header className="menu-header">
        <a href="./" className="brand">
          <span className="brand-plaque">
            <img className="brand-logo" src={brandLogo} alt={s.brand} />
          </span>
        </a>
        <Greeting t={t} />
        <button className="lang-toggle" lang={isEn ? "ar" : "en"} aria-label={t("langAria")}
          onClick={() => setLang(isEn ? "ar" : "en")}>{t("langBtn")}</button>
        <button className="primary" onClick={() => setOpen(true)}>
          {t("cart")} <span className="bubble">{qty}</span>
        </button>
      </header>
      <main>
        {new URLSearchParams(location.search).has("preview") && (
          <div className="notice">
            {t("previewNotice")}
          </div>
        )}
        {s.featuredEnabled && featured.length > 0 && (
          <section className="featured" aria-label={t("featuredAria")}
            onPointerDownCapture={holdOffers} onPointerUpCapture={releaseOffers}
            onPointerCancelCapture={releaseOffers} onWheelCapture={pauseOffers}
            onKeyDownCapture={pauseOffers} onClickCapture={pauseOffers}>
            <div className="section-head">
              <div>
                <p className="eyebrow">{t("eyebrowPicks")}</p>
                <h2>{s.featuredTitle}</h2>
              </div>
              <div className="offer-controls">
                <span className="muted">{t("pickOffer")}</span>
                <button
                  className="offer-arrow offer-prev"
                  aria-label={t("prevOffers")}
                  onClick={() => goOffer(offerIndexRef.current - 1)}
                >
                  {isEn ? "←" : "→"}
                </button>
                <button
                  className="offer-arrow offer-next"
                  aria-label={t("nextOffers")}
                  onClick={() => goOffer(offerIndexRef.current + 1)}
                >
                  {isEn ? "→" : "←"}
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
                      {isEn ? (i.offer ? t("offerBadge") : t("fromMenu")) : (i.featuredBadge || (i.offer ? t("offerBadge") : t("fromMenu")))}
                    </small>
                    <b>{isEn ? iName(i) : (i.featuredTitle || i.name)}</b>
                    <span>
                      <strong>{money(i.price)}</strong> <i>{t("seeDetails")}</i>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="offer-pagination" aria-label={t("offerPos")}>
              <div className="offer-bars">{featured.map((item,index) => <button key={item.id} className={offerIndex === index ? "current" : ""} aria-label={t("offerN", {i: index+1, n: featured.length})} aria-current={offerIndex === index ? "true" : undefined} onClick={() => goOffer(index)} />)}</div>
            </div>
          </section>
        )}
        <section className="hero">
          <div>
            <p className="eyebrow">FRESH PICKS. GOOD MOOD.</p>
            <h1>{s.heroTitle}</h1>
            <p>{s.heroText}</p>
            <a className="accent" href="#menu">
              {t("seeMenu")}
            </a>
            <div className="hero-note">
              {t("heroNote", { n: items.filter((i) => i.available).length })}
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
              <p className="eyebrow">{t("eyebrowMood")}</p>
              <h2>{t("orderToday")}</h2>
            </div>
            <input
              className="search"
              aria-label={t("searchAria")}
              placeholder={t("searchPh")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCount(24);
              }}
            />
          </div>
          <div className="menu-layout">
            <nav className="categories" aria-label={t("catsAria")}>
              <div className="menu-sections" aria-label={t("mainSecAria")}>
                {["main", "sweets", "drinks"].map((id) => (
                  <button key={id} className={section === id ? "active" : ""}
                    aria-pressed={section === id}
                    onClick={() => { setSection(id); setCat(""); setQuery(""); setCount(24); }}>
                    {secTitle(id)}
                  </button>
                ))}
              </div>
              <div className="category-filter" key={section} aria-label={t("filterAria")}>
                {[["", t("allItems")], ["@offers", t("offers")], ...cats.map((c) => [c, locCat(lang, c)])].map(([id, title]) => (
                  <button key={id} aria-pressed={!deferredQuery.trim() && cat === id} className={!deferredQuery.trim() && cat === id ? "active" : ""}
                    onClick={() => { setCat(id); setQuery(""); setCount(24); }}>
                    {title}
                  </button>
                ))}
              </div>
            </nav>
            <div>
              <div className="results">
                <h3>
                  {deferredQuery.trim()
                    ? t("searchResults")
                    : cat === "@offers"
                      ? t("offers")
                      : cat ? locCat(lang, cat) : secTitle(section)}
                </h3>
                <span>{t("nItems", { n: filtered.length })}</span>
              </div>
              <div className="grid">
                {filtered.slice(0, count).map((i) => (
                  <article className="card" key={i.id} onClick={() => details(i)}>
                    <button
                      className="card-photo"
                      aria-label={t("details", { x: i.group ? locGroup(lang, i.group) : iName(i) })}
                      onClick={() => details(i)}
                    >
                      <Photo item={i} />
                      {i.offer && <span className="badge">{t("offerTag")}</span>}
                    </button>
                    <div className="card-body">
                      <small>{deferredQuery.trim() ? `${secTitle(sectionOf(i))} · ${locCatKey(lang, i)}` : locCatKey(lang, i)}</small>
                      <h3>{i.group ? locGroup(lang, i.group) : iName(i)}</h3>
                      {i.description && <p className="item-description">{iDesc(i)}</p>}
                      {i.variant && <p className="muted">{i.variant}</p>}
                      {i.group && <p className="muted">{sizesOf(i).map((x) => locSize(lang, x.size)).join(" · ")}</p>}
                      <div className="card-bottom">
                        <strong>{i.group ? <><small className="from">{t("from")}</small>{money(Math.min(...sizesOf(i).map((x) => x.price)))}</> : money(i.price)}</strong>
                        <button
                          className="add"
                          aria-label={t("addX", { x: i.group ? locGroup(lang, i.group) : iName(i) })}
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
                          ? t("completeOrder")
                          : t("itemDetails")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty">{t("noResults")}</div>
              )}
              {count < filtered.length && (
                <button
                  className="secondary more"
                  onClick={() => setCount(count + 24)}
                >
                  {t("moreItems")}
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
              <p className="eyebrow">{t("contactsEyebrow")}</p>
              <h2>{s.contactsTitle}</h2>
            </div>
            <img
              className="contact-mark"
              src={bullMark}
              alt=""
              aria-hidden="true"
            />
          </div>
          <Hours t={t} lang={lang} />
          <div className="branch-grid">
            {(Array.isArray(s.branches) ? s.branches : [])
              .filter((b) => b.name && (b.phones?.length || b.phone))
              .map((b, idx) => (
                <article className="branch-card" key={idx}>
                  <h3>
                    <span className="branch-dot" aria-hidden="true" />
                    {bName(b)}
                  </h3>
                  {b.address && (
                    <p className="branch-address">
                      <Icon type="pin" />
                      {bAddr(b)}
                    </p>
                  )}
                  <div className="branch-phones">
                    {(b.phones || [b.phone]).filter(Boolean).map((phone, n) => (
                      <div className="branch-actions" key={n}>
                        <a
                          className="branch-call"
                          href={"tel:" + phone.replace(/[^+0-9]/g, "")}
                          aria-label={t("callX", { x: bName(b), n: n + 1 })}
                        >
                          <Icon type="phone" />
                          <b dir="ltr">{phone}</b>
                        </a>
                        <a
                          className="branch-whatsapp"
                          href={"https://wa.me/" + internationalPhone(phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("waX", { x: bName(b), n: n + 1 })}
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
              {t("contactsEmpty")}
            </p>
          )}
        </section>
      )}
      <footer>
        <b className="foot-brand"><img className="foot-mark" src={bullMark} alt="" aria-hidden="true" />{s.brand}</b>
        <p>
          {t("footPrices")}
        </p>
        <p>
          {t("footOrder")}
        </p>
        <a href="./admin.html">{t("adminLink")}</a>
        <div className="credit">
          <p className="credit-rights" dir="ltr">
            LatinooMax Restaurant &amp; Cafe. All Rights Reserved 2026 - 2027
          </p>
          <p className="credit-dev">
            <span>{t("devBy")}</span>
            <img
              className="credit-lockup"
              src={qodraLockup}
              alt="Qodra | قدرة"
            />
          </p>
          <a
            className="credit-link credit-wa"
            href="https://wa.me/201040580225"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("waAria")}
          >
            <Icon type="chat" />
            <span>get in touch</span>
            <b dir="ltr">01040580225</b>
          </a>
        </div>
      </footer>
      {qty > 0 && !open && (
        <button className="floating" onClick={() => setOpen(true)}>
          <span>
            {t("viewCart")} <b>{qty}</b>
          </span>
          <strong>{money(total)} {isEn ? "→" : "←"}</strong>
        </button>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {selected && (
        <Modal title={selected.group ? locGroup(lang, selected.group) : iName(selected)} closeLabel={t("close")} onClose={() => setSelected(null)}>
          <Photo item={selected} className="detail-photo" />
          <p>
            {selected.description ? iDesc(selected) : locCat(lang, selected.category)} {selected.variant}
          </p>
          {selected.group ? (
            <>
              <h3>{t("chooseSize")}</h3>
              {sizesOf(selected).map((x) => (
                <label className="check addon size" key={x.id}>
                  <input type="radio" name="pizza-size" checked={x.id === selected.id}
                    onChange={() => { setSelected(x); setExtra([]); }} />
                  <span>{locSize(lang, x.size)}</span>
                  <b>{money(x.price)}</b>
                </label>
              ))}
            </>
          ) : /بيتزا كبير/.test(selected.category) ? (
            <>
              <h3>{t("chooseSize")}</h3>
              <label className="check addon size unavailable">
                <input type="radio" name="pizza-size" disabled />
                <span>{t("medium")}</span>
                <b className="muted">{t("unavailable")}</b>
              </label>
              <label className="check addon size">
                <input type="radio" name="pizza-size" checked readOnly />
                <span>{t("large")}</span>
                <b>{money(selected.price)}</b>
              </label>
            </>
          ) : <strong>{money(selected.price)}</strong>}
          {hasSpice(selected) && (
            <>
              <h3>{t("spiceTitle")}</h3>
              <label className="check addon size">
                <input type="radio" name="spice" checked={!spice} onChange={() => setSpice(false)} />
                <span>{t("spiceNormal")}</span>
              </label>
              <label className="check addon size">
                <input type="radio" name="spice" checked={spice} onChange={() => setSpice(true)} />
                <span>{t("spiceHot")}</span>
              </label>
            </>
          )}
          {(() => {
            const addonRow = (a) => (
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
                <span>{iName(a)}</span>
                <b>+ {money(a.price)}</b>
              </label>
            );
            const addons = suggestions(selected, items);
            const sauces = sauceSuggestions(selected, items);
            return (
              <>
                {addons.length > 0 && (
                  <>
                    <h3>{t("completeTitle")}</h3>
                    <p className="muted">
                      {t("addonsNote")}
                    </p>
                    {addons.map(addonRow)}
                  </>
                )}
                {sauces.length > 0 && (
                  <>
                    <h3>{t("sauces")}</h3>
                    {sauces.map(addonRow)}
                  </>
                )}
              </>
            );
          })()}
          <button className="accent full" onClick={add}>
            <span>{t("addToCart")}</span>
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
        <Modal title={t("yourCart")} closeLabel={t("close")} onClose={() => setOpen(false)}>
          {lines.length ? (
            <>
              <div className="cart-toolbar">
                <span>{t("cartCount", { n: qty })}</span>
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
                  {t("clearCart")}
                </button>
              </div>
              <div className="cart-lines">
                {lines.map((l) => (
                  <div className="cart-line" key={l.key}>
                    <div>
                      <b>{iName(l.item)}</b>
                      {l.spice != null && (
                        <p className="muted">{l.spice ? t("spiceHot") : t("spiceNormal")}</p>
                      )}
                      {l.addons.map((a) => (
                        <p key={a.id} className="muted">
                          + {iName(a)} ({money(a.price)})
                        </p>
                      ))}
                      <p className="muted">{t("unitPrice", { p: money(l.unit) })}</p>
                      <div className="qty">
                        <button
                          aria-label={t("decrease", { x: iName(l.item) })}
                          onClick={() => change(l.key, -1)}
                        >
                          −
                        </button>
                        <span>{l.qty}</span>
                        <button
                          aria-label={t("increase", { x: iName(l.item) })}
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
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="total">
                <span>{t("itemsTotal")}</span>
                <b>{money(total)}</b>
              </div>
              <p className="notice">{s.deliveryDisclaimer}</p>
              <form onSubmit={checkout}>
                <h3>{t("orderDetails")}</h3>
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
                    {!s.deliveryEnabled && t("unavailableNow")}
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
                    {!s.dineInEnabled && t("unavailableNow")}
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
                  {t("waNote")}{" "}
                  {s.clearCart
                    ? t("clearNote")
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
                  {t("continueWa")}
                </button>
              </form>
            </>
          ) : (
            <div className="empty">
              <h3>{t("emptyCart")}</h3>
              <p>{t("emptyCartText")}</p>
              <button className="primary" onClick={() => setOpen(false)}>
                {t("backMenu")}
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
