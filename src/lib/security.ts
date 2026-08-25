/**
 * Cryptographic security utilities for Van's Creation
 * Uses standard Web Crypto API (SHA-256) for secure client-side hashing without external libraries.
 */

const BASE_SALT = 'maison_vans_atelier_kinshasa_2026_salt';

/**
 * Hashes a string using SHA-256 with an application-specific salt.
 */
export async function hashPassword(password: string, customSalt: string = BASE_SALT): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password.trim()}:${customSalt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies a password against a stored SHA-256 hash.
 */
export async function verifyPassword(input: string, storedHash: string, customSalt: string = BASE_SALT): Promise<boolean> {
  if (!input || !storedHash) return false;
  const inputHash = await hashPassword(input, customSalt);
  return inputHash === storedHash;
}

export interface AdminAuthConfig {
  email: string;
  passwordHash: string;
  salt: string;
  updatedAt: string;
  isConfigured: boolean;
}

export const ADMIN_AUTH_STORAGE_KEY = 'maison_vans_admin_auth_config_v3';
