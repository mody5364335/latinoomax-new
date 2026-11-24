

export async function hash(p, s) {
  let k = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(p),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  let b = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(s),
      iterations: 150000,
      hash: "SHA-256",
    },
    k,
    256,
  );
  return Array.from(new Uint8Array(b))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export function download(name, body, type = "application/json") {
  let u = URL.createObjectURL(new Blob([body], { type }));
  let a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 3000);
}
