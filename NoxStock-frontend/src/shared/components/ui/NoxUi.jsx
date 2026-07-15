import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Children, cloneElement, isValidElement } from 'react';
import { palette } from '../../theme/noxTheme';
import { useReveal } from '../../hooks/useReveal';
import { useRipple } from '../../hooks/useRipple';

const inputStyle = {
  background: palette.surfaceAlt,
  border: `1px solid ${palette.border}`,
  color: palette.textPrimary,
};

export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const { ref, visible } = useReveal();
  return (
    <Tag
      ref={ref}
      className={`nox-reveal ${visible ? 'nox-reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function PageShell({ children, className = '' }) {
  return (
    <section
      className={`nox-page-shell nox-stagger-children space-y-6 ${className}`}
      style={{ color: palette.textPrimary }}
    >
      {Children.map(children, (child, index) =>
        isValidElement(child)
          ? cloneElement(child, {
              className: `${child.props.className || ''} nox-reveal-child`.trim(),
              style: { ...child.props.style, animationDelay: `${0.04 + index * 0.06}s` },
            })
          : child
      )}
    </section>
  );
}

export function PageHeader({ title, subtitle, actions = null, shimmer = true }) {
  return (
    <header
      className="nox-reveal-child flex flex-wrap items-start justify-between gap-4 pb-4"
      style={{ borderBottom: `1px solid ${palette.border}` }}
    >
      <div>
        <h1
          className={`text-2xl font-semibold tracking-[0.02em] ${shimmer ? 'nox-title-shimmer' : ''}`}
          style={shimmer ? undefined : { color: palette.textPrimary }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: palette.textSecondary }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function PageCard({ children, className = '', title = null, hover = true }) {
  return (
    <div
      className={`rounded-2xl border p-4 md:p-5 ${hover ? 'nox-card-hover' : ''} ${className}`}
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      {title && (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: palette.textSecondary }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export function PageAlert({ children, tone = 'info' }) {
  const tones = {
    info: { bg: 'rgba(30, 58, 138, 0.18)', border: palette.navySoft, text: palette.ice },
    warning: { bg: 'rgba(138, 109, 46, 0.2)', border: palette.warning, text: palette.warningText },
    success: { bg: 'rgba(63, 108, 81, 0.18)', border: palette.success, text: palette.successText },
    danger: { bg: 'rgba(122, 48, 48, 0.18)', border: palette.danger, text: palette.dangerText },
  };
  const toneStyle = tones[tone] || tones.info;

  return (
    <div
      className="nox-reveal-child rounded-2xl border px-4 py-3 text-sm"
      style={{ background: toneStyle.bg, borderColor: toneStyle.border, color: toneStyle.text }}
    >
      {children}
    </div>
  );
}

export function PageButton({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
}) {
  const ripple = useRipple(variant === 'ghost' ? 'rgba(63, 95, 196, 0.25)' : 'rgba(255, 255, 255, 0.35)');
  const variants = {
    primary: { background: palette.navy, color: '#fff', border: palette.navy },
    secondary: { background: palette.surfaceAlt, color: palette.textPrimary, border: palette.border },
    ghost: { background: 'transparent', color: palette.textSecondary, border: palette.border },
    danger: { background: palette.accent, color: '#fff', border: palette.accent },
  };
  const variantStyle = variants[variant] || variants.primary;

  const handleClick = (event) => {
    if (disabled) return;
    ripple(event);
    onClick?.(event);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`nox-btn-interactive rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        background: variantStyle.background,
        color: variantStyle.color,
        border: `1px solid ${variantStyle.border}`,
      }}
    >
      {children}
    </button>
  );
}

export function PageLinkButton({ children, to, variant = 'primary', className = '' }) {
  const variants = {
    primary: { background: palette.navy, color: '#fff', border: palette.navy },
    secondary: { background: palette.surfaceAlt, color: palette.textPrimary, border: palette.border },
  };
  const variantStyle = variants[variant] || variants.primary;

  return (
    <Link
      to={to}
      className={`nox-btn-interactive inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${className}`}
      style={{
        background: variantStyle.background,
        color: variantStyle.color,
        border: `1px solid ${variantStyle.border}`,
      }}
    >
      {children}
    </Link>
  );
}

export function PageInput(props) {
  const { className = '', ...rest } = props;
  return (
    <input
      {...rest}
      className={`nox-input-glow w-full rounded-xl px-3 py-2 text-sm outline-none transition ${className}`}
      style={inputStyle}
    />
  );
}

export function PageSelect(props) {
  const { className = '', children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`nox-input-glow w-full rounded-xl px-3 py-2 text-sm outline-none transition ${className}`}
      style={inputStyle}
    >
      {children}
    </select>
  );
}

export function PageTextarea(props) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`nox-input-glow w-full rounded-xl px-3 py-2 text-sm outline-none transition ${className}`}
      style={inputStyle}
    />
  );
}

export function PageLabel({ children, className = '' }) {
  return (
    <label className={`text-xs uppercase tracking-[0.16em] ${className}`} style={{ color: palette.textSecondary }}>
      {children}
    </label>
  );
}

export function PageTable({ children, className = '' }) {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border ${className}`}
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function PageTableHead({ children }) {
  return (
    <thead style={{ background: palette.surfaceAlt, color: palette.textSecondary }}>
      {children}
    </thead>
  );
}

export function PageTableRow({ children, highlight = false }) {
  return (
    <tr
      className="nox-table-row-hover border-t"
      style={{
        borderColor: palette.border,
        background: highlight ? palette.surfaceElevated : 'transparent',
        color: palette.textPrimary,
      }}
    >
      {children}
    </tr>
  );
}

export function PageTableCell({ children, align = 'left', className = '' }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return <td className={`px-3 py-2.5 ${alignClass} ${className}`}>{children}</td>;
}

export function PageTableHeaderCell({ children, align = 'left' }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] ${alignClass}`}>
      {children}
    </th>
  );
}

export function StatusBadge({ children, tone = 'neutral', pulse = false }) {
  const tones = {
    success: { bg: 'rgba(63, 108, 81, 0.22)', color: palette.successText },
    warning: { bg: 'rgba(138, 109, 46, 0.22)', color: palette.warningText },
    danger: { bg: 'rgba(122, 48, 48, 0.22)', color: palette.dangerText },
    neutral: { bg: 'rgba(100, 116, 139, 0.22)', color: palette.slateSoft },
    navy: { bg: 'rgba(30, 58, 138, 0.22)', color: palette.ice },
  };
  const toneStyle = tones[tone] || tones.neutral;
  const shouldPulse = pulse || tone === 'warning' || tone === 'danger';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${shouldPulse ? 'nox-badge-pulse' : ''}`}
      style={{ background: toneStyle.bg, color: toneStyle.color }}
    >
      {children}
    </span>
  );
}

export function PageLoading({ message = 'Cargando...' }) {
  return (
    <div className="flex items-center gap-3 text-sm" style={{ color: palette.textSecondary }}>
      <span className="nox-spinner" aria-hidden />
      <span>{message}</span>
      <span className="nox-dots-loading" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

export function PageEmpty({ message }) {
  return <p className="text-sm" style={{ color: palette.textMuted }}>{message}</p>;
}

export function PageMessage({ children, tone = 'success' }) {
  return <PageAlert tone={tone}>{children}</PageAlert>;
}

Reveal.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  delay: PropTypes.number,
  as: PropTypes.string,
};

PageShell.propTypes = { children: PropTypes.node, className: PropTypes.string };
PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  shimmer: PropTypes.bool,
};
PageCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  hover: PropTypes.bool,
};
PageAlert.propTypes = { children: PropTypes.node, tone: PropTypes.string };
PageButton.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
  variant: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};
PageLinkButton.propTypes = { children: PropTypes.node, to: PropTypes.string.isRequired, variant: PropTypes.string, className: PropTypes.string };
StatusBadge.propTypes = { children: PropTypes.node, tone: PropTypes.string, pulse: PropTypes.bool };
PageLoading.propTypes = { message: PropTypes.string };
PageEmpty.propTypes = { message: PropTypes.string };
PageMessage.propTypes = { children: PropTypes.node, tone: PropTypes.string };
PageTableRow.propTypes = { children: PropTypes.node, highlight: PropTypes.bool };
PageTableCell.propTypes = { children: PropTypes.node, align: PropTypes.string, className: PropTypes.string };
PageTableHeaderCell.propTypes = { children: PropTypes.node, align: PropTypes.string };
