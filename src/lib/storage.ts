/**
 * Safe localStorage wrapper with try/catch protection
 *
 * Handles cases where localStorage is unavailable (SSR, private browsing, etc.)
 * and catches quota exceeded or serialization errors.
 */

import { logError } from '@/lib/logger';

/**
 * Safe localStorage operations with error handling
 */
export const safeStorage = {
  /**
   * Get a string value from localStorage
   * @returns The stored value or null if not found/error
   */
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logError('safeStorage.get failed', error, { key });
      return null;
    }
  },

  /**
   * Set a string value in localStorage
   * @returns true if successful, false otherwise
   */
  set: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      logError('safeStorage.set failed', error, { key });
      return false;
    }
  },

  /**
   * Remove a value from localStorage
   * @returns true if successful, false otherwise
   */
  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logError('safeStorage.remove failed', error, { key });
      return false;
    }
  },

  /**
   * Get and parse a JSON value from localStorage
   * @returns The parsed value or null if not found/parse error
   */
  getJSON: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      return JSON.parse(stored) as T;
    } catch (error) {
      logError('safeStorage.getJSON failed', error, { key });
      return null;
    }
  },

  /**
   * Stringify and set a JSON value in localStorage
   * @returns true if successful, false otherwise
   */
  setJSON: (key: string, value: unknown): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logError('safeStorage.setJSON failed', error, { key });
      return false;
    }
  },
};
