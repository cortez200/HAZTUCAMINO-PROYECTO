import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AREAS, CARRERAS } from '../lib/data.js';
import { useAuth } from '../lib/store.jsx';
import { areaVars } from '../components/ui.jsx';
import CareerCard from '../components/CareerCard.jsx';
import { EmptyState } from '../components/ui.jsx';

export default function Carreras() {
  const { account, toggleSaved } = useAuth();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState('');
  const filterArea = params.get('a') || 'all';

  const results = useMemo(() => {
    const t = term.trim().toLowerCase();
    return CARRERAS.filter((c) => {
      const okArea = filterArea === 'all' || c.area === filterArea;
      const okTerm = !t || c.nombre.toLowerCase().includes(t) || c.descripcion.toLowerCase().includes(t);
      return okArea && okTerm;
    });
  }, [term, filterArea]);

  const savedSet = account?.saved || [];
  const setArea = (id) => setParams(id === 'all' ? {} : { a: id });

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Carreras</h1>
          <p className="page-sub">Explora las 32 carreras disponibles en Perú.</p>
        </div>
      </div>

      <div className="card card-pad mb-24" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="row gap-8">
          <span className="row gap-8 grow card" style={{ padding: '2px 12px', background: 'var(--surface-2)', border: 0 }}>
            <input
              className="input"
              id="buscar-carrera"
              name="buscar"
              style={{ border: 0, background: 'transparent', padding: '9px 0' }}
              placeholder="Busca una carrera (ej. Medicina, Derecho…)"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              aria-label="Buscar carrera"
            />
          </span>
        </div>
        <div className="row wrap gap-8">
          <button className={`chip ${filterArea === 'all' ? 'on' : ''}`} onClick={() => setArea('all')}>Todas</button>
          {AREAS.map((a) => (
            <button
              key={a.id}
              className={`chip chip-area ${filterArea === a.id ? 'on' : ''}`}
              style={areaVars(a)}
              onClick={() => setArea(a.id)}
            >
              {a.nombre}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState icon="Search" title="Sin resultados" text="Prueba con otro término o quita el filtro de área." />
      ) : (
        <>
          <p className="muted small bold mb-16">{results.length} carrera{results.length !== 1 ? 's' : ''}</p>
          <div className="grid cols-4">
            {results.map((c) => (
              <CareerCard key={c.id} career={c} saved={savedSet.includes(c.id)} onSave={toggleSaved} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
