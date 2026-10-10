import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CARRERAS, carrera, area, isPremium } from '../lib/data.js';
import { useAuth } from '../lib/store.jsx';
import { areaVars, Badge, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

const ROWS = [
  { k: 'descripcion', label: 'Descripción' },
  { k: 'habilidades', label: 'Habilidades clave' },
  { k: 'lugares', label: 'Dónde trabaja' },
  { k: 'cursos', label: 'Cursos' },
  { k: 'emprender', label: 'Emprender' },
  { k: 'especializaciones', label: 'Especializaciones' }
];

export default function Comparar() {
  const { account } = useAuth();
  const [params] = useSearchParams();
  const initialA = (params.get('c') && carrera(params.get('c'))?.id) || account?.saved?.[0] || CARRERAS[0].id;
  const initialB = (CARRERAS.find((c) => c.id !== initialA) || CARRERAS[1]).id;
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);

  if (!isPremium(account)) {
    return (
      <Card className="card-pad center" style={{ padding: '48px 24px' }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Icon name="Lock" size={26} />
        </div>
        <Badge tone="gold">Función Premium</Badge>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 14 }}>Comparador de carreras</h2>
        <p className="dim mt-8" style={{ maxWidth: 460, margin: '8px auto 0' }}>
          Compara dos carreras lado a lado: descripción, habilidades, dónde se trabaja y más. Disponible en el plan Premium.
        </p>
        <Link to="/planes" className="btn btn-primary btn-lg mt-24" style={{ marginTop: 20 }}>
          <Icon name="Sparkles" size={18} /> Desbloquear Premium
        </Link>
      </Card>
    );
  }

  const ca = carrera(a), cb = carrera(b);
  const render = (val) => (Array.isArray(val) ? val.join(' · ') : val);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Comparar carreras</h1>
          <p className="page-sub">Elige dos carreras y compáralas lado a lado.</p>
        </div>
      </div>

      <div className="grid cols-2 mb-24">
        {[{ v: a, set: setA, dis: b, id: 'cmp-a' }, { v: b, set: setB, dis: a, id: 'cmp-b' }].map((sel, i) => (
          <div className="field" key={i} style={{ margin: 0 }}>
            <label className="label" htmlFor={sel.id}>Carrera {i === 0 ? 'A' : 'B'}</label>
            <select id={sel.id} name={sel.id} className="select" value={sel.v} onChange={(e) => sel.set(e.target.value)}>
              {CARRERAS.filter((c) => c.id !== sel.dis).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} — {area(c.area).nombre}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div className="grid cols-2" style={{ gap: 0 }}>
          {[ca, cb].map((c) => {
            const ar = area(c.area);
            return (
              <div key={c.id} style={{ ...areaVars(ar), padding: 20, borderBottom: '1px solid var(--border)' }}>
                <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
                <h3 style={{ fontWeight: 800, marginTop: 10 }}>{c.nombre}</h3>
              </div>
            );
          })}
        </div>

        {ROWS.map((row) => (
          <div className="grid cols-2 list-soft" style={{ gap: 0 }} key={row.k}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div className="tiny muted bold mb-8">{row.label.toUpperCase()}</div>
              <p className="small dim">{render(ca[row.k])}</p>
            </div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div className="tiny muted bold mb-8">{row.label.toUpperCase()}</div>
              <p className="small dim">{render(cb[row.k])}</p>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
