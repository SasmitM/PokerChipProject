import { useState, useCallback } from 'react';

/**
 * Custom hook for button cooldown functionality
 * Disables button for specified duration after click
 * @param cooldownMs - Cooldown duration in milliseconds (default: 2000ms)
 * @returns Object with isCooldown flag and handleClick wrapper function
 */
export function useButtonCooldown(cooldownMs: number = 2000) {
  const [isCooldown, setIsCooldown] = useState(false);

  const handleClick = useCallback(
    async (callback: () => void | Promise<void>) => {
      if (isCooldown) return;

      setIsCooldown(true);
      
      try {
        await callback();
      } finally {
        // Reset cooldown after specified time
        setTimeout(() => {
          setIsCooldown(false);
        }, cooldownMs);
      }
    },
    [isCooldown, cooldownMs]
  );

  return { isCooldown, handleClick };
}

