import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { palette } from '../theme';

const WIDTH = 560;
const HEIGHT = 190;
const PADDING = 28;

/**
 * Gráfico de línea (Resumen de Órdenes) construido con SVG puro.
 * Recibe una serie de puntos { dia, total, fecha } de los últimos días.
 */
export default function OrderSummaryLineChart({ serie = [] }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const points = useMemo(() => {
    const values = serie.map((d) => d.total || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const innerWidth = WIDTH - PADDING * 2;
    const innerHeight = HEIGHT - PADDING * 2;

    return serie.map((d, index) => {
      const x = PADDING + (index / Math.max(serie.length - 1, 1)) * innerWidth;
      const y = PADDING + innerHeight - ((d.total - min) / range) * innerHeight;
      return { x, y, ...d };
    });
  }, [serie]);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PADDING} L ${points[0].x} ${HEIGHT - PADDING} Z`
      : '';

  const active = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="orderSummaryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.navyLight} stopOpacity="0.45" />
            <stop offset="100%" stopColor={palette.navyLight} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* líneas guía horizontales */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={PADDING + (HEIGHT - PADDING * 2) * ratio}
            y2={PADDING + (HEIGHT - PADDING * 2) * ratio}
            stroke={palette.border}
            strokeDasharray="4 6"
            strokeWidth="1"
          />
        ))}

        {areaPath && <path d={areaPath} fill="url(#orderSummaryGradient)" />}
        {linePath && (
          <path d={linePath} fill="none" stroke={palette.navyLight} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {points.map((p, index) => (
          <g key={p.fecha || index}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === index ? 5 : 3}
              fill={palette.navyLight}
              stroke={palette.surface}
              strokeWidth="2"
            />
            <rect
              x={p.x - (WIDTH / points.length) / 2}
              y={0}
              width={WIDTH / points.length}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
            />
          </g>
        ))}

        {active && (
          <g transform={`translate(${Math.min(Math.max(active.x - 45, 0), WIDTH - 90)}, ${Math.max(active.y - 42, 4)})`}>
            <rect width="90" height="30" rx="8" fill={palette.surfaceElevated} stroke={palette.border} />
            <text x="45" y="19" textAnchor="middle" fontSize="11" fontWeight="600" fill={palette.textPrimary}>
              Q{Number(active.total).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
            </text>
          </g>
        )}

        {points.map((p, index) => (
          <text
            key={`label-${p.fecha || index}`}
            x={p.x}
            y={HEIGHT - 6}
            textAnchor="middle"
            fontSize="10"
            fill={palette.textSecondary}
          >
            {p.dia}
          </text>
        ))}
      </svg>
    </div>
  );
}

OrderSummaryLineChart.propTypes = {
  serie: PropTypes.arrayOf(
    PropTypes.shape({
      dia: PropTypes.string,
      fecha: PropTypes.string,
      total: PropTypes.number,
    })
  ),
};
