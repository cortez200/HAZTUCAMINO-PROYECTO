import { useState } from 'react';
import { CARRERAS, area } from '../lib/data.js';
import { areaVars, Badge, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

const idOf = (url) => (url || '').split('/').pop();

export default function Videos() {
  const [term, setTerm] = useState('');
  const [active, setActive] = useState(null);

  const q = term.trim().toLowerCase();
  const list = CARRERAS.filter((c) => {
    if (!c.video) return false;
    if (!q) return true;
    const ar = area(c.area);
    return c.nombre.toLowerCase().includes(q) || (ar?.nombre || '').toLowerCase().includes(q);
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Videos</h1>
          <p className="page-sub">Mira cómo es "un día en la vida" de cada carrera. Haz clic para reproducir.</p>
        </div>
      </div>

      <Card className="card-pad mb-24">
        <span className="row gap-8 card" style={{ padding: '2px 12px', background: 'var(--surface-2)', border: 0 }}>
          <Icon name="Search" size={18} color="var(--muted)" />
          <input className="input" id="filtrar-video" name="filtrar" style={{ border: 0, background: 'transparent', padding: '9px 0' }} placeholder="Filtra por carrera o área (ej. enfermería, derecho…)" aria-label="Filtrar carreras" value={term} onChange={(e) => setTerm(e.target.value)} />
        </span>
      </Card>

      <div className="grid cols-3">
        {list.map((c) => {
          const ar = area(c.area);
          const vid = idOf(c.video);
          const playing = active === c.id;
          return (
            <div key={c.id} className="media-card" style={areaVars(ar)}>
              {playing ? (
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`}
                    title={`Video: ${c.nombre}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(c.id)}
                  aria-label={`Reproducir video de ${c.nombre}`}
                  style={{ position: 'relative', border: 0, padding: 0, cursor: 'pointer', background: 'var(--surface-2)', display: 'block' }}
                >
                  <img className="thumb" style={{ height: 180 }} src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt={c.nombre} loading="lazy" onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`; }} />
                  <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <span style={{ width: 52, height: 52, borderRadius: 999, background: 'rgba(220,38,38,.94)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,.35)' }}>
                      <Icon name="Play" size={22} color="#fff" />
                    </span>
                  </span>
                </button>
              )}
              <div className="body">
                <Badge tone="area" icon={ar?.icon}>{ar?.nombre}</Badge>
                <h4 style={{ fontWeight: 700, marginTop: 8 }}>{c.nombre}</h4>
                <a href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 'auto' }}>
                  <Icon name="Youtube" size={16} /> Ver en YouTube
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {!list.length && <p className="muted center mt-24">No encontramos carreras para "{term}".</p>}
    </>
  );
}