/**
 * Reveal
 * -----------------------------------------------------------------------
 * Componente utilitario para animar la aparición de elementos internos de
 * una vista (cards, headers, filas de tabla, etc.) con un efecto
 * "fade + slide up" escalonado (stagger), imitando el patrón SwiftUI donde
 * el contenido interno de una vista aparece con `withAnimation` tras la
 * transición de la vista contenedora.
 *
 * Uso:
 *   <Reveal><h1>Título</h1></Reveal>
 *   <Reveal delay={1}><Card /></Reveal>
 *   <Reveal delay={2} as="section" className="grid gap-4">...</Reveal>
 *
 * `delay` es un índice (0, 1, 2, 3...) que se traduce en un retraso
 * incremental (delay * 60ms) para crear el efecto stagger cuando se anima
 * una lista de elementos.
 */
const Reveal = ({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
  ...rest
}) => {
  return (
    <Tag
      className={`reveal-item ${className}`}
      style={{
        animationDelay: `${delay * 60}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
