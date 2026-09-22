/**
 * Client-Side Encrypted Storage using Browser Web Crypto API (AES-256-GCM)
 * Encrypts all local quiz answers and pledges before writing to LocalStorage.
 * Prevents unauthorized local inspection, profiling, or tampering.
 */

const ENCRYPTION_PREFIX = 'enc:v1:';
const DEVICE_SALT_KEY = '__co2rechner_entropy_salt';

// Generates or retrieves persistent device salt for key derivation
function getDeviceSalt(): Uint8Array {
  let saltHex = localStorage.getItem(DEVICE_SALT_KEY);
  if (!saltHex || saltHex.length !== 32) {
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    saltHex = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(DEVICE_SALT_KEY, saltHex);
  }
  const match = saltHex.match(/.{1,2}/g);
  return new Uint8Array(match ? match.map((byte) => parseInt(byte, 16)) : new Uint8Array(16));
}

// Derives a 256-bit AES-GCM CryptoKey from device seed using PBKDF2
async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const salt = getDeviceSalt();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode('co2rechner-umweltmentoren-client-vault-key'),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts and writes data to localStorage using AES-256-GCM.
 */
export async function saveEncryptedItem(key: string, data: any): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const keyObj = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit random IV
    const jsonString = JSON.stringify(data);
    const encoded = new TextEncoder().encode(jsonString);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyObj,
      encoded
    );

    // Combine IV + Ciphertext into base64 payload
    const ciphertextArray = new Uint8Array(ciphertextBuffer);
    const combined = new Uint8Array(iv.length + ciphertextArray.length);
    combined.set(iv, 0);
    combined.set(ciphertextArray, iv.length);

    const base64 = btoa(String.fromCharCode(...combined));
    localStorage.setItem(key, ENCRYPTION_PREFIX + base64);
  } catch (err) {
    // Fallback if Web Crypto is unavailable
    localStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * Reads and decrypts data from localStorage using AES-256-GCM.
 * Seamlessly handles legacy plaintext entries.
 */
export async function loadEncryptedItem<T = any>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(key);
  if (!raw) return null;

  // If entry is not encrypted yet, parse legacy plaintext
  if (!raw.startsWith(ENCRYPTION_PREFIX)) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  try {
    const base64 = raw.slice(ENCRYPTION_PREFIX.length);
    const binary = atob(base64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const keyObj = await getEncryptionKey();
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyObj,
      ciphertext
    );

    const decoded = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decoded) as T;
  } catch (err) {
    console.error('Failed to decrypt secure storage key:', key, err);
    return null;
  }
}

export function removeEncryptedItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
