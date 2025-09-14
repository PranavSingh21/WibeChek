import { useEffect, useRef } from 'react';

interface UseKeyboardAdjustmentOptions {
  enabled?: boolean;
  offset?: number;
  behavior?: ScrollBehavior;
}

export function useKeyboardAdjustment(options: UseKeyboardAdjustmentOptions = {}) {
  const {
    enabled = true,
    offset = 20,
    behavior = 'smooth'
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Only handle input elements
      if (!target || !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Delay to allow keyboard to appear
      timeoutRef.current = setTimeout(() => {
        // Check if element is still focused
        if (document.activeElement !== target) return;

        const rect = target.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate if element is in the lower half of viewport
        const isInLowerHalf = rect.top > viewportHeight / 2;
        
        // On mobile, assume keyboard takes up bottom 40% of screen
        const isMobile = window.innerWidth <= 768;
        const keyboardHeight = isMobile ? viewportHeight * 0.4 : 0;
        const availableHeight = viewportHeight - keyboardHeight;
        
        // Check if input is covered by keyboard
        const isInputCovered = rect.bottom > availableHeight;
        
        if (isInputCovered || isInLowerHalf) {
          // Calculate scroll position to center input in available space
          const targetPosition = rect.top + window.scrollY - (availableHeight / 2) + (rect.height / 2) - offset;
          
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior
          });
        }
      }, 300); // Wait for keyboard animation
    };

    const handleBlur = () => {
      // Clear timeout on blur
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    // Add event listeners
    document.addEventListener('focusin', handleFocus, { passive: true });
    document.addEventListener('focusout', handleBlur, { passive: true });

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, offset, behavior]);
}