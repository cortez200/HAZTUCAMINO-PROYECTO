import { useEffect, useMemo, useState } from 'react';
import { UNI_LOGOS } from '../lib/uniLogos.js';

function domainOf(web) {
  if (!web) return '';
  try {
    return new URL(web).hostname.replace(/^www\./, '');
  } catch {
    return String(web)
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '');
  }
}

/* Avatar circular de universidad. Orden de fuentes:
   1) logo local en alta calidad (UNI_LOGOS, hosteado en /public/logos)
   2) favicon del sitio de la universidad
   3) iniciales sobre el color de la universidad */
export default function UniLogo({ uni, size = 46, className = '' }) {
  const local = uni?.id ? UNI_LOGOS[uni.id] : null;
  const domain = useMemo(() => domainOf(uni?.web), [uni?.web]);

  const sources = useMemo(() => {
    const list = [];
    if (local) list.push(local);
    if (domain) list.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
    return list;
  }, [local, domain]);

  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [local, domain]);

  if (idx >= sources.length) {
    return (
      <span
        className={`uni-logo round ${className}`.trim()}
        style={{ width: size, height: size, background: uni?.color || 'var(--primary)', fontSize: Math.round(size * 0.3) }}
      >
        {(uni?.corto || 'U').slice(0, 3)}
      </span>
    );
  }

  return (
    <span className={`uni-logo round logo ${className}`.trim()} style={{ width: size, height: size }}>
      <img
        src={sources[idx]}
        alt={`Logo de ${uni?.nombre || uni?.corto || 'la universidad'}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setIdx((i) => i + 1)}
      />
    </span>
  );
}
