

export const DRAFT = "latino-draft-v1";
export const LOCK = "latino-editor-lock-v1";
export const CART = "latino-react-cart-v2";
export const read = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};
export const store = (k, v) => {
  localStorage.setItem(k, JSON.stringify(v));
};
