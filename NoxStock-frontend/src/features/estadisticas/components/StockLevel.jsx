import PropTypes from 'prop-types';
import { palette } from '../theme';

/**
 * Sección "Nivel de Stock": muestra el stock total y el detalle
 * de los productos con menor existencia (barra de progreso por producto).
 */
export default function StockLevel({ porcentaje = 0, totalStock = 0, productos = [] }) {
  const estado = porcentaje >= 60 ? 'Suficiente' : porcentaje >= 30 ? 'Moderado' : 'Crítico';
  const estadoColor = porcentaje >= 60 ? palette.slateSoft : porcentaje >= 30 ? '#C9A24B' : '#E08585';

  return (
    <div
      className="rounded-2xl border p-5 h-full flex flex-col gap-5"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.textSecondary }}>
            Nivel de Stock
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: palette.textPrimary }}>
            {totalStock} <span className="text-sm font-normal" style={{ color: palette.textSecondary }}>unidades</span>
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: palette.surfaceAlt, color: estadoColor }}
        >
          {estado}
        </span>
      </div>

      <div className="space-y-4">
        {productos.map((producto) => (
          <div key={producto._id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: palette.textPrimary }}>{producto.nombre}</span>
              <span style={{ color: palette.textSecondary }}>
                {producto.existencia} de {producto.referencia} restantes
              </span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: palette.surfaceAlt }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(producto.porcentaje, 100)}%`,
                  background:
                    producto.porcentaje <= 25
                      ? '#7A3030'
                      : producto.porcentaje <= 50
                        ? '#8A6D2E'
                        : palette.navyLight,
                }}
              />
            </div>
          </div>
        ))}

        {productos.length === 0 && (
          <p className="text-sm" style={{ color: palette.textSecondary }}>
            No hay productos registrados.
          </p>
        )}
      </div>
    </div>
  );
}

StockLevel.propTypes = {
  porcentaje: PropTypes.number,
  totalStock: PropTypes.number,
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      nombre: PropTypes.string,
      existencia: PropTypes.number,
      referencia: PropTypes.number,
      porcentaje: PropTypes.number,
    })
  ),
};
