import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition
 * -----------------------------------------------------------------------
 * Envuelve el contenido de una ruta (normalmente el <Outlet /> de un layout)
 * y le aplica una animación de entrada tipo "fade + slide desde la derecha"
 * cada vez que cambia la ruta (location.pathname), simulando el
 * comportamiento de `.transition(.move(edge: .trailing).combined(with: .opacity))`
 * + `withAnimation` de SwiftUI cuando navegas entre vistas.
 *
 * Al usar `key={location.pathname}` en el contenedor interno, React desmonta
 * y vuelve a montar el nodo en cada navegación, lo que reinicia la animación
 * CSS (`page-enter`) definida en `styles/index.css`.
 */
const PageTransition = ({ children, className = '' }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [animClass, setAnimClass] = useState('page-enter');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // Dispara la animación de salida (fade + slide hacia la izquierda)
      setAnimClass('page-exit');

      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setAnimClass('page-enter');
      }, 160);
    }

    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, displayLocation]);

  return (
    <div
      key={displayLocation.pathname}
      className={`${animClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
