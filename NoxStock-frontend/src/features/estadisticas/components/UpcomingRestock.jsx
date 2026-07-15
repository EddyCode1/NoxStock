import PropTypes from 'prop-types';
import { palette } from '../theme';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

/**
 * Sección "Próximo Reabastecimiento": lista de productos con stock bajo
 * que requieren reposición próxima.
 */
export default function UpcomingRestock({ productos = [] }) {
  return (
    <div
      className="nox-card-hover rounded-2xl border p-5 h-full flex flex-col gap-4"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: palette.textPrimary }}>
          Próximo Reabastecimiento
        </h3>
        <span className="text-xs" style={{ color: palette.textSecondary }}>
          Ver todos ({productos.length})
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {productos.map((producto) => (
          <li key={producto._id} className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
              style={{ background: palette.surfaceAlt, color: palette.slateSoft }}
            >
              {initials(producto.nombre) || '—'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: palette.textPrimary }}>
                {producto.nombre}
              </p>
              <p className="text-xs" style={{ color: palette.textSecondary }}>
                {producto.categoria}
              </p>
            </div>
            <span
              className="text-sm font-semibold shrink-0"
              style={{ color: producto.existencia === 0 ? '#E08585' : palette.textPrimary }}
            >
              {producto.existencia} Uds.
            </span>
          </li>
        ))}

        {productos.length === 0 && (
          <p className="text-sm" style={{ color: palette.textSecondary }}>
            No hay productos pendientes de reabastecimiento.
          </p>
        )}
      </ul>
    </div>
  );
}

UpcomingRestock.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      nombre: PropTypes.string,
      categoria: PropTypes.string,
      existencia: PropTypes.number,
    })
  ),
};
