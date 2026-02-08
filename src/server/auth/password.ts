const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const derived = await deriveKey(password, salt);
  const saltB64 = arrayBufferToBase64(salt.buffer);
  const hashB64 = arrayBufferToBase64(derived);
  return `${saltB64}:${hashB64}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltB64, hashB64] = storedHash.split(':');
  if (!saltB64 || !hashB64) return false;

  const salt = new Uint8Array(base64ToArrayBuffer(saltB64));
  const derived = await deriveKey(password, salt);
  const derivedB64 = arrayBufferToBase64(derived);

  // Constant-time comparison
  if (derivedB64.length !== hashB64.length) return false;
  let result = 0;
  for (let i = 0; i < derivedB64.length; i++) {
    result |= derivedB64.charCodeAt(i) ^ hashB64.charCodeAt(i);
  }
  return result === 0;
}
