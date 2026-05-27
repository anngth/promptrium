import { useState, useEffect, useRef, useCallback } from "react";

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

// Helper function to detect plain objects
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);
  const initialValueRef = useRef(initialValue);
  // Keep a ref to the latest in-memory value so functional updaters
  // (value => newValue) can read current state synchronously without
  // depending on the React state cycle.
  const storedValueRef = useRef<T>(initialValue);

  // Update ref when key or initialValue changes
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [key, initialValue]);

  // Initialize from localStorage after component mounts
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        let resolved: T;
        // Only merge if both parsed and initialValue are plain objects
        if (isPlainObject(parsed) && isPlainObject(initialValueRef.current)) {
          resolved = { ...initialValueRef.current, ...parsed } as T;
        } else {
          resolved = parsed as T;
        }
        storedValueRef.current = resolved;
        setStoredValue(resolved);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      // Set mounted flag only after load completes to avoid extra render with defaults
      setMounted(true);
    }
  }, [key]);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      // Resolve the next value synchronously using the ref so functional
      // updaters get the real current value, not a stale closure.
      const nextValue =
        value instanceof Function ? value(storedValueRef.current) : value;

      // Persist to localStorage BEFORE updating React state.
      // This way, if setItem throws (e.g. QuotaExceededError) the error
      // propagates to the caller and React state is never updated — so the
      // in-memory state stays consistent with what is actually on disk.
      if (mounted && typeof window !== "undefined") {
        // Throws DOMException (QuotaExceededError) when storage is full.
        // Intentionally not caught here — callers are responsible for
        // handling the error and deciding whether to show a toast / rollback.
        window.localStorage.setItem(key, JSON.stringify(nextValue));
      }

      storedValueRef.current = nextValue;
      setStoredValue(nextValue);
    },
    [key, mounted]
  );

  // Return initialValue until mounted to prevent hydration mismatch
  return [mounted ? storedValue : initialValue, setValue, mounted];
}

export type UseLocalStorageReturn<T> = [T, SetValue<T>, boolean];
