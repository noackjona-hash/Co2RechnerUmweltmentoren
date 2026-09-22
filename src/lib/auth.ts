import { EncryptJWT, jwtDecrypt, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const rawSecret = process.env.JWT_SECRET || 'fallback-secret-change-me-co2-rechner';
const SIGNING_SECRET = new TextEncoder().encode(rawSecret);

// Derive exact 256-bit key using Web Crypto subtle digest (100% Edge Runtime & Node.js compatible)
async function getEncryptionKey(): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-256', SIGNING_SECRET);
  return new Uint8Array(hash);
}

export type UserRole = 'super-admin' | 'school-admin' | 'teacher' | 'student';

export interface JWTPayload {
  id: string;
  role: UserRole;
  email?: string;
  adminRole?: 'super-admin' | 'editor' | 'viewer';
  schoolName?: string;
  licenseId?: string;
  classId?: string;
  teacherName?: string;
  className?: string;
  accessKey?: string;
}

/**
 * Creates an encrypted JSON Web Token (JWE) using AES-256-GCM (Authenticated Encryption).
 * Zero payload plaintext leakage: payload is 100% opaque ciphertext.
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const key = await getEncryptionKey();
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .encrypt(key);
}

/**
 * Decrypts and authenticates a JWE token.
 * Falls back to verifying legacy JWS signature for seamless session upgrades.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const key = await getEncryptionKey();
    const { payload } = await jwtDecrypt(token, key);
    return payload as unknown as JWTPayload;
  } catch {
    // Fallback for existing legacy sessions signed with HS256
    try {
      const { payload } = await jwtVerify(token, SIGNING_SECRET);
      return payload as unknown as JWTPayload;
    } catch {
      return null;
    }
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(payload: JWTPayload): Promise<void> {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
