import Icon from './Icon.jsx';

/* Aplica las variables CSS del área a un contenedor. */
export const areaVars = (area) => ({ '--area': area.color, '--area-soft': area.soft, '--area-dark': area.dark || area.color });

export function Btn({ variant = 'outline', size, icon, iconRight, children, className = '', type = 'button', ...rest }) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </button>
  );
}

export function Card({ className = '', children, style, ...rest }) {
  return <div className={`card ${className}`} style={style} {...rest}>{children}</div>;
}

export function Badge({ tone = 'soft', icon, children }) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

export function Progress({ value, area = false, style }) {
  return (
    <div className={`progress ${area ? 'progress-area' : ''}`} style={style}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Stat({ value, label, icon, tone }) {
  return (
    <div className="stat">
      <div className="row gap-8 between">
        <div className="k" style={tone ? { color: tone } : undefined}>{value}</div>
        {icon && <Icon name={icon} size={18} color="var(--muted)" />}
      </div>
      <div className="l">{label}</div>
    </div>
  );
}

export function EmptyState({ icon = 'Info', title, text, action }) {
  return (
    <Card className="card-pad center" style={{ padding: '48px 24px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: 'var(--muted)' }}>
        <Icon name={icon} size={26} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{title}</h3>
      {text && <p className="dim mt-8" style={{ maxWidth: 380, margin: '8px auto 0' }}>{text}</p>}
      {action && <div className="mt-24">{action}</div>}
    </Card>
  );
}

export function Modal({ open, onClose, children, maxWidth = 460 }) {
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" style={{ maxWidth }} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}
