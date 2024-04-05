import crypto from 'crypto';
import { validate as validateUUID } from 'uuid';
import fs from 'fs';
import { getEnv } from '../config';

export class CryptError extends Error {}

export const hash512 = (data: string) => {
  // Create a hash object using SHA-512
  const hashObject = crypto.createHash('sha512');

  // Convert the base64 string to bytes and update the hash object
  hashObject.update(Buffer.from(data, 'utf-8'));

  // Get the hexadecimal representation of the hash
  const hash = hashObject.digest('hex');

  return hash;
};

function getKey(keyId?: string) {
  const keyString = fs.readFileSync(getEnv('ENC_KEYS'), 'utf-8');
  const keys = JSON.parse(keyString);

  if (!keyId) {
    const kArr = Object.keys(keys);
    const index = Math.floor(Math.random() * kArr.length);
    keyId = kArr[index];
  }

  return { keyId, key: keys[keyId] };
}

/**
 * Encrypts a given string using AES-256 encryption.
 * @param {string} plainText - The string to encrypt.
 * @param {string} key - The encryption key (must be 32 bytes).
 * @returns {string} The encrypted string in base64 format.
 */
export function encrypt(plainText: string) {
  const { keyId, key } = getKey();
  // Validate the keyId as a valid UUID
  if (!validateUUID(keyId)) {
    throw new Error('Invalid UUID as key identifier');
  }

  // Check if the key length is 32 bytes (required for AES-256)
  if (key.length !== 32) {
    throw new CryptError('Key length must be 32 bytes for AES-256 encryption');
  }

  // Generate a random initialization vector (iv) for encryption
  const iv = crypto.randomBytes(16);

  // Create a Cipher object using the key and iv
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  // Encrypt the plain text
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final()
  ]);

  // Combine the keyId, iv, and encrypted text and return as a base64 encoded string
  const keyIdBuffer = Buffer.from(keyId, 'utf8');
  return Buffer.concat([keyIdBuffer, iv, encrypted]).toString('base64');
}

/**
 * Decrypts a given string using AES-256 encryption.
 * @param {string} encryptedText - The encrypted string in base64 format.
 * @param {string} key - The decryption key (must be 32 bytes).
 * @returns {string} The decrypted string.
 */
export function decrypt(encryptedText: string) {
  // Convert the base64 encoded string to a buffer
  const encryptedBuffer = Buffer.from(encryptedText, 'base64');

  // Extract the UUID keyId, iv, and encrypted text from the buffer
  const keyId = encryptedBuffer.subarray(0, 36).toString('utf8');
  const iv = encryptedBuffer.subarray(36, 52);
  const encrypted = encryptedBuffer.subarray(52);

  // Retrieve the key based on the keyId
  const { key } = getKey(keyId);

  // Create a Decipher object using the key and iv
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  // Decrypt the encrypted text
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  // Return the decrypted text as a string
  return decrypted.toString('utf8');
}
