import { useEffect, useRef, useState } from 'react';

/**
 * Anima un número de 0 (o start) hasta target con easing suave.
 */
export function useCountUp(target, options = {}) {
  const {
    duration = 900,
    start = 0,
    enabled = true,
    decimals = 0,
  } = options;

  const [value, setValue] = useState(start);
  const frameRef = useRef(null);
  const numericTarget = Number(target) || 0;

  useEffect(() => {
    if (!enabled) {
      setValue(numericTarget);
      return undefined;
    }

    const from = start;
    const to = numericTarget;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = from + (to - from) * eased;
      setValue(decimals > 0 ? Number(current.toFixed(decimals)) : Math.round(current));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [numericTarget, duration, start, enabled, decimals]);

  return value;
}

export default useCountUp;
