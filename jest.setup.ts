import webcrypto from 'node:crypto';

Object.defineProperty(globalThis, "crypto", {
  value: webcrypto
});

if (!("getRandomValues" in webcrypto)) {
  (webcrypto as any).getRandomValues = (arr: Uint8Array) => {
    const bytes = require('crypto').randomBytes(arr.length)
    arr.fill(bytes);
  }
}
