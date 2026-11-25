import React from "react";

export function Icon({ type }) {
  const paths = {
    phone:
      "M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.9L8.7 10.7a16 16 0 0 0 4.6 4.6l1.3-1.3a2 2 0 0 1 1.9-.6l2.8.5a2 2 0 0 1 1.7 2z",
    chat: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z",
    pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z",
    instagram: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
  };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[type]} />
      {type === "pin" && <circle cx="12" cy="10" r="2.5" />}
      {type === "instagram" && (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </>
      )}
    </svg>
  );
}

