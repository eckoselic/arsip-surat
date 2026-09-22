// Autentikasi Pola B: tanpa akun Supabase Auth, cukup passcode per peran.
// Session disimpan sebagai cookie berisi "role.expiry.signature" yang ditandatangani
// pakai HMAC-SHA256 (SESSION_SECRET) supaya tidak bisa dipalsukan dari client.
// Dipakai baik di middleware (edge runtime) maupun route handler (node runtime),
// karena keduanya sama-sama mendukung Web Crypto (crypto.subtle).

export type Role = "admin_tu" | "kepala_sekolah";

export const SESSION_COOKIE_NAME = "arsip_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

const encoder = new TextEncoder();

async function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET belum diset di environment variables");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(role: Role): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${role}.${expires}`;
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toHex(sig)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<Role | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [role, expiresStr, sigHex] = parts;
  if (role !== "admin_tu" && role !== "kepala_sekolah") return null;

  const expires = Number(expiresStr);
  if (!expires || Number.isNaN(expires) || Date.now() > expires) return null;

  const key = await getKey();
  const payload = `${role}.${expiresStr}`;
  const expectedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expectedHex = toHex(expectedSig);

  if (expectedHex.length !== sigHex.length) return null;
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    diff |= expectedHex.charCodeAt(i) ^ sigHex.charCodeAt(i);
  }
  if (diff !== 0) return null;

  return role;
}
