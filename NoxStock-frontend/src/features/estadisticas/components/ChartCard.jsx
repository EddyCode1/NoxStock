import PropTypes from 'prop-types';
import { palette } from '../theme';

/**
 * Contenedor de tarjeta reutilizable para gráficos (título + slot opcional a la derecha).
 */
export default function ChartCard({ title, subtitle, headerRight = null, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4 ${className}`}
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: palette.textPrimary }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: palette.textSecondary }}>
              {subtitle}
            </p>
          )}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  headerRight: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
