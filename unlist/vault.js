/* ===========================================================================
   The vault: what actually keeps an unlisted page unlisted.

   A static host has no server-side auth. Anything gated only by JavaScript is
   theatre -- the file is still sitting at a URL and `curl` does not run your
   gate. So the gate here is not a check, it is a key: a vaulted page is stored
   ONLY as AES-GCM ciphertext, and the plaintext exists nowhere on the server.
   Fetching a payload without the password gets you a few kilobytes of noise.

   Key derivation is PBKDF2-SHA256 at 600,000 iterations (OWASP's 2023 floor)
   over one random 16-byte salt per vault. One derivation unlocks the whole
   vault, so opening a page after unlocking costs nothing; every encryption
   gets its own random 96-bit IV, which is what AES-GCM needs to stay safe
   under a reused key.

   Wrong password needs no separate check value: GCM is authenticated, so
   decrypt() throws on a bad key. That IS the check.

   What this does not protect against: someone who has the ciphertext can
   guess offline, as fast as their hardware allows. 600k iterations makes each
   guess expensive but the real defence is a long password. Use a passphrase.
   =========================================================================== */

export const KDF_ITERATIONS = 600000;
export const VAULT_VERSION = 1;

const enc = new TextEncoder();
const dec = new TextDecoder();

/* base64 <-> bytes. Chunked, because String.fromCharCode(...bytes) on a
   50KB page blows the argument limit and throws RangeError. */
export function toB64(bytes) {
  let s = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(s);
}
export function fromB64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

/* The slow part. ~0.5-1.5s on a phone, which is the point: it is the same
   cost an attacker pays per guess. Callers should show a spinner. */
export async function deriveKey(password, saltBytes, iterations = KDF_ITERATIONS) {
  const base = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(key, text) {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, enc.encode(text)
  );
  return { iv: toB64(iv), ct: toB64(new Uint8Array(ct)) };
}

/* Throws on a wrong key, a truncated file, or any tampering. Callers treat
   every throw as "wrong password" because from here they are the same thing. */
export async function decryptText(key, blob) {
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(blob.iv) }, key, fromB64(blob.ct)
  );
  return dec.decode(pt);
}

/* ---------------------------------------------------------------------------
   Vault shape on disk

   vault/index.json   { v, kdf:{alg,iterations,salt}, manifest:{iv,ct} }
   vault/<id>.enc     { iv, ct }

   The manifest is the list of entries, and it is encrypted too -- so the
   titles of your unlisted pages are not readable either. That is also what
   makes the index dynamic: /unlist renders whatever the manifest says is
   there, and the tool rewrites the manifest whenever you add or remove.
   --------------------------------------------------------------------------- */

export async function loadIndex(base = 'vault/') {
  const res = await fetch(base + 'index.json', { cache: 'no-store' });
  if (res.status === 404) return null;            // no vault set up yet
  if (!res.ok) throw new Error('vault/index.json: HTTP ' + res.status);
  return res.json();
}

export async function unlock(index, password) {
  const key = await deriveKey(
    password, fromB64(index.kdf.salt), index.kdf.iterations || KDF_ITERATIONS
  );
  const manifest = JSON.parse(await decryptText(key, index.manifest));
  return { key, manifest };
}

export async function loadEntry(key, id, base = 'vault/') {
  const res = await fetch(base + encodeURIComponent(id) + '.enc', { cache: 'no-store' });
  if (!res.ok) throw new Error(id + '.enc: HTTP ' + res.status);
  return decryptText(key, await res.json());
}

export async function buildIndex(key, salt, manifest) {
  return {
    v: VAULT_VERSION,
    kdf: { alg: 'PBKDF2-SHA256', iterations: KDF_ITERATIONS, salt: toB64(salt) },
    manifest: await encryptText(key, JSON.stringify(manifest))
  };
}

/* An id that is safe as a filename and as a URL fragment. */
export function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'pagina';
}
