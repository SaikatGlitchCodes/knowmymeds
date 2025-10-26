import { useCallback, useRef } from 'react';

export const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: any[]) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  const cancel = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return { debouncedCallback, cancel };
};