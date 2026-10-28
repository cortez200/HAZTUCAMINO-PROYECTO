import { useState } from 'react';
import Icon from './Icon.jsx';

/* Imagen con respaldo elegante: si la URL falla, se muestra un degradado
   con el icono del área en lugar de una imagen rota. */
export default function Img({ src, alt = '', className, style, icon = 'Compass', ratio, priority = false }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: 'linear-gradient(135deg, var(--area-soft, var(--primary-soft)), var(--teal-soft))',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--area-dark, var(--primary))',
          aspectRatio: ratio
        }}
        role="img"
        aria-label={alt}
      >
        <Icon name={icon} size={30} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity .4s', aspectRatio: ratio }}
      loading={priority ? 'eager' : 'lazy'}
      {...(priority ? { fetchpriority: 'high' } : {})}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}
