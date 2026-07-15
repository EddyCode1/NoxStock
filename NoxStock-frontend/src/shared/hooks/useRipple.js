import { useCallback } from 'react';

/**
 * Efecto ripple al hacer clic (material-style, sin librerías).
 */
export function useRipple(color = 'rgba(255, 255, 255, 0.35)') {
  return useCallback(
    (event) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'nox-btn-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.background = color;

      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    },
    [color]
  );
}

export default useRipple;
