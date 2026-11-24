import React, { useEffect, useState } from "react";
import { DRAFT, read } from "./lib/storage.js";
import { valid } from "./lib/data.js";
import { Menu } from "./components/Menu.jsx";
import { Admin } from "./components/Admin.jsx";

export function App() {
  let [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("./items.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw Error("تعذر تحميل المنيو");
        return r.json();
      })
      .then((d) => setData(valid(d)))
      .catch((e) => setError(e.message));
  }, []);
  if (error)
    return (
      <main className="empty">
        <h1>{error}</h1>
        <button onClick={() => location.reload()}>حاول تاني</button>
      </main>
    );
  if (!data)
    return (
      <div className="loading">
        LATINOO MAX
        <br />
        بنجهز المنيو...
      </div>
    );
  let isAdmin = location.pathname.endsWith("/admin.html");
  let shown = data;
  if (!isAdmin && new URLSearchParams(location.search).has("preview")) {
    try {
      shown = valid(read(DRAFT, data));
    } catch {
      shown = data;
    }
  }
  return isAdmin ? <Admin published={data} /> : <Menu data={shown} />;
}
