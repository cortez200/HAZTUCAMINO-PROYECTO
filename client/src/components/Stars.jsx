import Icon from './Icon.jsx';

/* Estrellas de solo lectura (muestra un promedio). */
export function Stars({ value = 0, size = 15, className = '' }) {
  const full = Math.round(value);
  return (
    <span className={`stars ${className}`} role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="Star"
          size={size}
          style={{ color: n <= full ? 'var(--star)' : 'var(--border-strong)', fill: n <= full ? 'var(--star)' : 'transparent' }}
        />
      ))}
    </span>
  );
}

/* Estrellas para elegir una calificación (1-5). */
export function StarInput({ value = 0, onChange, size = 28 }) {
  return (
    <span className="star-input" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'on' : ''}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          aria-checked={n === value}
          role="radio"
          onClick={() => onChange && onChange(n)}
        >
          <Icon name="Star" size={size} style={{ fill: n <= value ? 'var(--star)' : 'transparent' }} />
        </button>
      ))}
    </span>
  );
}
