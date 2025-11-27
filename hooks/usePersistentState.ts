// FIX: Import `Dispatch` and `SetStateAction` to resolve 'Cannot find namespace' error.
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// Custom hook to persist state in localStorage
// FIX: Support lazy initializer for initialValue, aligning with useState behavior.
// This resolves a type error in App.tsx where a function was passed as the initial value.
// FIX: Use imported `Dispatch` and `SetStateAction` types directly.
export function usePersistentState<T>(key: string, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const getInitialValue = () => {
      if (typeof initialValue === 'function') {
        return (initialValue as () => T)();
      }
      return initialValue;
    };

    if (typeof window === 'undefined') {
      return getInitialValue();
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : getInitialValue();
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return getInitialValue();
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, state]);

  return [state, setState];
}