import PropTypes from 'prop-types';
import { palette } from '../theme';

const estadoStyles = {
  Disponible: { bg: 'rgba(63, 108, 81, 0.16)', text: '#7FE3A3' },
  'Bajo stock': { bg: 'rgba(138, 109, 46, 0.2)', text: '#E0BE7A' },
  'Sin stock': { bg: 'rgba(122, 48, 48, 0.2)', text: '#F09B9B' },
};

/**
 * Tabla de productos (sección inferior del dashboard).
 */
export default function ProductsTable({ productos = [] }) {
  return (
    <div
      className="nox-card-hover rounded-2xl border p-5 overflow-hidden"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: palette.textPrimary }}>
          Producto
        </h3>
        <span className="text-xs" style={{ color: palette.textSecondary }}>
          {productos.length} artículos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${palette.border}` }}>
              <th className="py-3 pr-4 text-left font-medium" style={{ color: palette.textSecondary }}>#</th>
              <th className="py-3 pr-4 text-left font-medium" style={{ color: palette.textSecondary }}>Nombre del Producto</th>
              <th className="py-3 pr-4 text-left font-medium" style={{ color: palette.textSecondary }}>Categoría</th>
              <th className="py-3 pr-4 text-right font-medium" style={{ color: palette.textSecondary }}>Precio</th>
              <th className="py-3 pr-4 text-right font-medium" style={{ color: palette.textSecondary }}>Cant.</th>
              <th className="py-3 pr-4 text-left font-medium" style={{ color: palette.textSecondary }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => {
              const estado = estadoStyles[producto.estado] || estadoStyles.Disponible;
              return (
                <tr
                  key={producto._id}
                  style={{ borderBottom: `1px solid ${palette.border}` }}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="py-3 pr-4" style={{ color: palette.textMuted }}>{index + 1}</td>
                  <td className="py-3 pr-4 font-medium" style={{ color: palette.textPrimary }}>{producto.nombre}</td>
                  <td className="py-3 pr-4" style={{ color: palette.textSecondary }}>{producto.categoria}</td>
                  <td className="py-3 pr-4 text-right" style={{ color: palette.textPrimary }}>
                    Q{Number(producto.precio).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 pr-4 text-right" style={{ color: palette.textPrimary }}>{producto.existencia}</td>
                  <td className="py-3 pr-4">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: estado.bg, color: estado.text }}
                    >
                      {producto.estado}
                    </span>
                  </td>
                </tr>
              );
            })}

            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center" style={{ color: palette.textSecondary }}>
                  No hay productos registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ProductsTable.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      nombre: PropTypes.string,
      categoria: PropTypes.string,
      precio: PropTypes.number,
      existencia: PropTypes.number,
      estado: PropTypes.string,
    })
  ),
};
