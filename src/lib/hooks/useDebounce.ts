import { useState, useEffect } from 'react';

/**
 * Debounce a value - delays updating the value until after the delay period
 * Perfect for search inputs to avoid filtering on every keystroke
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 * 
 * @example
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 300);
 * 
 * // User types: "hello"
 * // searchInput updates: h -> he -> hel -> hell -> hello (instant)
 * // debouncedSearch updates: "" -> (300ms) -> "hello" (once)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup - cancel timer if value changes before delay expires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Alias for useDebounce with clearer naming
 */
export const useDebouncedValue = useDebounce;
