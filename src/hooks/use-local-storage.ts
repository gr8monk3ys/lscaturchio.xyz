// Rule: TypeScript Usage - Use explicit return types for all functions
"use client";

import { useState, useEffect } from "react";

/**
 * Hook for using localStorage with type safety and SSR support
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage on initial mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") {
        return;
      }
      
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or return initialValue if null
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)): void => {
    try {
      if (typeof window === "undefined") {
        console.warn(`Tried to set localStorage key "${key}" but window is undefined`);
        return;
      }
      
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch a custom event so other instances can update
      window.dispatchEvent(new StorageEvent("storage", {
        key,
        newValue: JSON.stringify(valueToStore),
        storageArea: localStorage,
      }));
      
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    
    // Handler for storage events from other tabs
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };
    
    // Listen for storage events
    window.addEventListener("storage", handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
