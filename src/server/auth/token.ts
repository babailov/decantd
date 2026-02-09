function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export async function hashToken(raw: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToHex(hash);
}

export async function generateResetToken(): Promise<{ raw: string; hash: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = arrayBufferToHex(bytes.buffer);
  const hash = await hashToken(raw);
  return { raw, hash };
}
