import React from "react";
import { url } from "../lib/format.js";

export function Photo({ item, ...props }) {
  return item?.image && url(item.image) ? (
    <img
      src={url(item.image)}
      alt={item.name}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
      {...props}
    />
  ) : (
    <div className="placeholder">
      L<span>✳</span>
    </div>
  );
}
