/**
 * Security & Cryptographic utilities for Van's Creation
 * Uses standard Web Crypto API (SHA-256) for secure client-side hashing without external libraries.
 */

const APP_SALT = 'maison_vans_creation_kinshasa_2026_salt';

/**
 * Hashes a string using SHA-256 with an application-specific salt.
 */
export async function hashSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${secret.trim()}:${APP_SALT}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies a secret against a stored SHA-256 hash.
 */
export async function verifySecret(input: string, storedHash: string): Promise<boolean> {
  if (!input || !storedHash) return false;
  const inputHash = await hashSecret(input);
  return inputHash === storedHash;
}

export interface AdminSecurityConfig {
  email: string;
  passwordHash: string;
  recoveryPinHash: string;
  updatedAt: string;
  isInitialized: boolean;
}

export const ADMIN_SECURITY_STORAGE_KEY = 'maison_vans_admin_security_v2';
