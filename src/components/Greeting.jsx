import React, { useEffect, useState } from "react";

export function Greeting() {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => { const timer = setInterval(() => setHour(new Date().getHours()), 60000); return () => clearInterval(timer); }, []);
  const morning = hour >= 6 && hour < 16;
  return <span className="greeting"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    {morning ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></> : <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>}
  </svg>{morning ? "صباح الخير" : "مساء الخير"}</span>;
}
