import { useState } from 'react';
import { AREAS, area } from '../lib/data.js';
import { areaVars, Badge, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import Img from '../components/Img.jsx';

const ytUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export default function Videos() {
  const [term, setTerm] = useState('');

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Videos</h1>
          <p className="page-sub">Mira cómo es "un día en la vida" de cada profesión. Se abre en YouTube.</p>
        </div>
      </div>

      <Card className="card-pad mb-24">
        <form
          className="row gap-8"
          onSubmit={(e) => { e.preventDefault(); if (term.trim()) window.open(ytUrl(`un día en la vida de ${term}`), '_blank', 'noopener'); }}
        >
          <span className="row gap-8 grow card" style={{ padding: '2px 12px', background: 'var(--surface-2)', border: 0 }}>
            <Icon name="Search" size={18} color="#94a3b8" />
            <input className="input" id="buscar-video" name="buscar" style={{ border: 0, background: 'transparent', padding: '9px 0' }} placeholder="Busca una profesión (ej. enfermera, arquitecto…)" aria-label="Buscar profesión" value={term} onChange={(e) => setTerm(e.target.value)} />
          </span>
          <button className="btn btn-primary" type="submit"><Icon name="Youtube" size={17} /> Buscar</button>
        </form>
      </Card>

      <div className="grid cols-4">
        {AREAS.map((a) => (
          <div key={a.id} className="media-card" style={areaVars(a)}>
            <div style={{ position: 'relative' }}>
              <Img src={a.img} alt={a.nombre} className="thumb" icon={a.icon} ratio="16 / 10" />
              <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <span style={{ width: 46, height: 46, borderRadius: 999, background: 'rgba(220,38,38,.92)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,.3)' }}>
                  <Icon name="Play" size={20} color="#fff" />
                </span>
              </span>
            </div>
            <div className="body">
              <Badge tone="area" icon={a.icon}>{a.nombre}</Badge>
              <h4 style={{ fontWeight: 700 }}>Un día como profesional</h4>
              <a
                href={ytUrl(`un día en la vida de un profesional de ${a.nombre} Perú`)}
                target="_blank" rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 'auto' }}
              >
                <Icon name="Youtube" size={16} /> Ver en YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
