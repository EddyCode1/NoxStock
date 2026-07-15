import PropTypes from 'prop-types';
import { palette } from '../theme';

const SIZE = 200;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Gráfico de dona (Ganancia por Categoría) construido con SVG puro.
 * Recibe una lista de categorías con { categoria, porcentaje, valorEstimado }.
 */
export default function DonutChart({ categorias = [], totalLabel, totalValue }) {
  const segments = categorias.reduce((acc, cat, index) => {
    const cumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    const dash = (cat.porcentaje / 100) * CIRCUMFERENCE;
    const offset = CIRCUMFERENCE - (cumulative / 100) * CIRCUMFERENCE;

    acc.push({
      ...cat,
      dashArray: `${dash} ${CIRCUMFERENCE - dash}`,
      dashOffset: offset,
      color: palette.chartSeries[index % palette.chartSeries.length],
      cumulative: cumulative + cat.porcentaje,
    });

    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={palette.surfaceAlt}
            strokeWidth={STROKE}
          />
          {segments.map((segment) => (
            <circle
              key={segment.categoria}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.textSecondary }}>
            {totalLabel}
          </p>
          <p className="text-xl font-bold" style={{ color: palette.textPrimary }}>
            {totalValue}
          </p>
        </div>
      </div>

      <ul className="flex-1 space-y-3 w-full">
        {segments.map((segment) => (
          <li key={segment.categoria} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: segment.color }}
              />
              <span
                className="text-sm truncate"
                style={{ color: palette.textPrimary }}
                title={segment.categoria}
              >
                {segment.categoria}
              </span>
              <span className="text-xs shrink-0" style={{ color: palette.textSecondary }}>
                ({segment.porcentaje}%)
              </span>
            </div>
            <span className="text-sm font-semibold shrink-0" style={{ color: palette.textPrimary }}>
              Q{Number(segment.valorEstimado).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
            </span>
          </li>
        ))}
        {segments.length === 0 && (
          <li className="text-sm" style={{ color: palette.textSecondary }}>
            No hay datos de categorías disponibles.
          </li>
        )}
      </ul>
    </div>
  );
}

DonutChart.propTypes = {
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      categoria: PropTypes.string,
      porcentaje: PropTypes.number,
      valorEstimado: PropTypes.number,
    })
  ),
  totalLabel: PropTypes.string,
  totalValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
