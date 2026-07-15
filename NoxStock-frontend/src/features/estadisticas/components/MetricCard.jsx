import PropTypes from 'prop-types';
import { palette } from '../theme';
import { useCountUp } from '../../../shared/hooks/useCountUp';

/**
 * Tarjeta de métrica simple (una de las 4 tarjetas superiores del dashboard).
 */
export default function MetricCard({ label, value, changeLabel, tone = 'neutral', icon = null, animate = true }) {
  const toneColors = {
    positive: { bg: 'rgba(63, 108, 81, 0.16)', text: '#7FE3A3' },
    negative: { bg: 'rgba(122, 48, 48, 0.18)', text: '#F09B9B' },
    neutral: { bg: 'rgba(100, 116, 139, 0.18)', text: palette.slateSoft },
  };

  const chip = toneColors[tone] || toneColors.neutral;
  const isNumeric = typeof value === 'number' || (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value)));
  const displayValue = useCountUp(isNumeric && animate ? Number(value) : 0, {
    enabled: isNumeric && animate,
    duration: 1100,
  });

  const renderedValue = isNumeric && animate
    ? displayValue.toLocaleString('es-GT')
    : value;

  return (
    <div
      className="nox-card-hover nox-reveal-child rounded-2xl border p-5 flex flex-col gap-3 shadow-sm"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.textSecondary }}>
          {label}
        </p>
        {icon && (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: palette.surfaceAlt, color: palette.slateSoft }}
          >
            {icon}
          </span>
        )}
      </div>

      <p className="text-3xl font-semibold tabular-nums" style={{ color: palette.textPrimary }}>
        {renderedValue}
      </p>

      {changeLabel && (
        <span
          className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            tone === 'negative' ? 'nox-badge-pulse' : ''
          }`}
          style={{ background: chip.bg, color: chip.text }}
        >
          {changeLabel}
        </span>
      )}
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  changeLabel: PropTypes.string,
  tone: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  icon: PropTypes.node,
  animate: PropTypes.bool,
};
