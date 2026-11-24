import React, { useEffect, useRef } from "react";

export function Modal({ title, children, onClose }) {
  let r = useRef();
  useEffect(() => {
    r.current.showModal();
    let el = r.current;
    return () => {
      el.close();
    };
  }, []);
  return (
    <dialog
      ref={r}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === r.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon" aria-label="إغلاق" onClick={onClose}>
          <svg viewBox="0 0 14 14" width="15" height="15" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>
      {children}
    </dialog>
  );
}
