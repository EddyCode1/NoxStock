import PropTypes from 'prop-types';
import { palette } from '../theme';

/**
 * Panel lateral "Movimientos por Categoría" (reemplaza "Fuentes de Tráfico").
 * Muestra entradas + salidas agrupadas por categoría con barra de porcentaje.
 */
export default function MovimientosPorCategoria({ categorias = [] }) {
  return (
    <div
      className="rounded-2xl border p-5 h-full flex flex-col gap-5"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: palette.textPrimary }}>
          Movimientos por Categoría
        </h3>
        <span className="text-xs" style={{ color: palette.textSecondary }}>
          7 días
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {categorias.map((cat, index) => (
          <div key={cat.categoria} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: palette.textPrimary }}>
                {cat.categoria}
              </span>
              <span className="text-sm font-semibold" style={{ color: palette.textSecondary }}>
                {cat.porcentaje}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: palette.surfaceAlt }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${cat.porcentaje}%`,
                  background: palette.chartSeries[index % palette.chartSeries.length],
                }}
              />
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: palette.textMuted }}>
              <span>Entradas: {cat.entradas}</span>
              <span>Salidas: {cat.salidas}</span>
            </div>
          </div>
        ))}

        {categorias.length === 0 && (
          <p className="text-sm" style={{ color: palette.textSecondary }}>
            No hay movimientos recientes registrados.
          </p>
        )}
      </div>
    </div>
  );
}

MovimientosPorCategoria.propTypes = {
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      categoria: PropTypes.string,
      entradas: PropTypes.number,
      salidas: PropTypes.number,
      porcentaje: PropTypes.number,
    })
  ),
};
