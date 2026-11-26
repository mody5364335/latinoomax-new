import React from "react";

// Opening hours. Display only: no open/closed logic. Times from Mohamed (Nov 26).
// Closings after midnight are labelled "next day". Fridays open at 1:30 PM.
const ROWS = [
  { key: "hoursTakeaway", from: [11, 0], to: [3, 0] },
  { key: "hoursDineIn", from: [11, 0], to: [2, 0] },
];
const FRI_FROM = [13, 30];

function time(lang, [h, m]) {
  const pm = h >= 12, h12 = h % 12 || 12;
  const mm = String(m).padStart(2, "0");
  const num = `${h12}:${mm}`;
  if (lang === "en") return `${num} ${pm ? "PM" : "AM"}`;
  return `${num} ${pm ? "م" : "ص"}`.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

export function Hours({ t, lang }) {
  return (
    <div className="hours" aria-label={t("hoursTitle")}>
      <h3>{t("hoursTitle")}</h3>
      <table>
        <tbody>
          {ROWS.map((r) => (
            <React.Fragment key={r.key}>
              <tr>
                <th scope="row" rowSpan={2}>{t(r.key)}</th>
                <td>{t("hoursDays")}</td>
                <td>
                  <bdi>{time(lang, r.from)}</bdi> – <bdi>{time(lang, r.to)}</bdi>{" "}
                  <small>({t("hoursNext")})</small>
                </td>
              </tr>
              <tr>
                <td>{t("hoursFri")}</td>
                <td>
                  <bdi>{time(lang, FRI_FROM)}</bdi> – <bdi>{time(lang, r.to)}</bdi>{" "}
                  <small>({t("hoursNext")})</small>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <p className="muted">{t("hoursNote")}</p>
    </div>
  );
}
