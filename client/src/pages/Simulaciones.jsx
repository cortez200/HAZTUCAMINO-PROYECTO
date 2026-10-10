import { Link } from 'react-router-dom';
import { SIMS, area, isPremium } from '../lib/data.js';
import { useAuth } from '../lib/store.jsx';
import { areaVars, Badge, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { actividadDe } from '../lib/activity.js';

export default function Simulaciones() {
  const { account } = useAuth();
  const premium = isPremium(account);
  const sims = account?.sims || {};

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Simulaciones</h1>
          <p className="page-sub">Mira un video de la profesión y resuelve un reto real arrastrando objetos. Obtén tu puntaje de afinidad.</p>
        </div>
        {!premium && <Badge tone="gold" icon="Lock">Función Premium</Badge>}
      </div>

      {!premium && (
        <Card className="card-pad mb-24" style={{ borderColor: 'var(--primary)', overflow: 'hidden' }}>
          <div className="row between wrap gap-16">
            <div className="grow" style={{ minWidth: 260 }}>
              <Badge tone="gold" icon="Lock">No disponible en tu plan</Badge>
              <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 800, marginTop: 12 }}>
                Las simulaciones son parte de Premium
              </h2>
              <p className="dim mt-8" style={{ maxWidth: 560 }}>
                Practica profesiones reales con videos y retos interactivos. Activa Premium y desbloquea las 8 simulaciones.
              </p>
            </div>
            <Link to="/planes" className="btn btn-primary btn-lg" style={{ flex: 'none' }}>
              <Icon name="Sparkles" size={18} /> Comprar Premium
            </Link>
          </div>
        </Card>
      )}

      <div className="grid cols-2">
        {SIMS.map((s) => {
          const ar = area(s.area);
          const done = sims[s.id] != null;
          const locked = !premium;
          const total = actividadDe(s.area)?.items.length || 3;
          return (
            <div key={s.id} className="card card-pad" style={{ ...areaVars(ar), opacity: locked ? 0.85 : 1 }}>
              <div className="row gap-16">
                <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--area-soft)', color: 'var(--area)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name={ar.icon} size={24} />
                </span>
                <div className="grow">
                  <div className="row between gap-8">
                    <Badge tone="area">{ar.nombre}</Badge>
                    {locked ? <Badge tone="gold" icon="Lock">Premium</Badge> : done ? <Badge tone="ok" icon="CheckCircle2">{sims[s.id]}/{total}</Badge> : <Badge tone="soft">Disponible</Badge>}
                  </div>
                  <h3 style={{ fontWeight: 700, marginTop: 10, fontSize: '1.05rem' }}>{actividadDe(s.area)?.titulo || s.caso?.titulo || s.titulo}</h3>
                  <p className="muted small mt-8">{s.caso?.contexto || s.titulo}</p>
                </div>
              </div>
              <div className="row between mt-16">
                <span className="row gap-6 muted small"><Icon name="Hand" size={15} /> Video + reto interactivo</span>
                {locked ? (
                  <Link to="/planes" className="btn btn-soft btn-sm"><Icon name="Lock" size={15} /> Desbloquear</Link>
                ) : (
                  <Link to={`/simulaciones/${s.id}`} className="btn btn-primary btn-sm">
                    <Icon name="Play" size={15} /> {done ? 'Repetir' : 'Comenzar'}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
