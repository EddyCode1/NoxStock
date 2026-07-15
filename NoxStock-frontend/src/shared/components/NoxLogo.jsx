import PropTypes from 'prop-types';
import logoSrc from '../assets/img/noxstock-logo.png';

const SIZES = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 96,
};

export default function NoxLogo({
  size = 'md',
  animated = false,
  showText = false,
  className = '',
  alt = 'NoxStock',
}) {
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt={alt}
        width={px}
        height={px}
        className={`object-contain ${animated ? 'nox-logo-animated' : ''}`}
        style={{ width: px, height: px }}
        draggable={false}
      />
      {showText && (
        <div className="leading-tight">
          <p className="nox-title-shimmer text-lg font-bold tracking-[0.04em]">NoxStock</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Inventario</p>
        </div>
      )}
    </div>
  );
}

NoxLogo.propTypes = {
  size: PropTypes.oneOfType([PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']), PropTypes.number]),
  animated: PropTypes.bool,
  showText: PropTypes.bool,
  className: PropTypes.string,
  alt: PropTypes.string,
};
