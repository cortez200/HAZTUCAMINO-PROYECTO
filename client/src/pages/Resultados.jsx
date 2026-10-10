import { Link } from 'react-router-dom';
import { CARRERAS, AREAS, area, simDeArea } from '../lib/data.js';
import { areaScores, topCareers } from '../lib/scoring.js';
import { useAuth } from '../lib/store.jsx';
import { areaVars, Badge, Btn, Card, EmptyState } from '../components/ui.jsx';
import CareerCard from '../components/CareerCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Resultados() {
  const { account, toggleSaved } = useAuth();
  if (!account?.done) {
    return (
      <EmptyState
        icon="ClipboardList"
        title="Aún no tienes resultados"
        text="Haz el test vocacional para ver tus áreas de afinidad y las carreras recomendadas."
        action={<Link to="/test" className="btn btn-primary">Hacer el test</Link>}
      />
    );
  }

  const scores = areaScores(account.answers || {});
  const top3 = scores.slice(0, 3);
  const unknown = (account.unknown || []).map(area).filter(Boolean);
  const savedSet = account.saved || [];
  const careersByIds = top3.flatMap((a) => CARRERAS.filter((c) => c.area === a.id));
  const recomendada = topCareers(account.answers || {}, 1)[0];
  const recAr = recomendada ? area(recomendada.area) : null;
  const recSim = recomendada ? simDeArea(recomendada.area) : null;
  const recPrivadas = recomendada ? recomendada.universidades.filter((o) => o.tipo === 'Privada') : [];
  const recDesde = recPrivadas.length ? Math.min(...recPrivadas.map((o) => o.min)) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Tus resultados</h1>
          <p className="page-sub">Así se ve tu perfil vocacional hoy.</p>
        </div>
        <div className="row gap-8">
          <Link to="/test" className="btn btn-outline" ><Icon name="RotateCcw" size={16} /> Repetir test</Link>
          <Link to="/carreras" className="btn btn-primary">Ver carreras</Link>
        </div>
      </div>

      {/* Carrera recomendada */}
      {recomendada && (
        <Card className="card-pad mb-24" style={{ ...areaVars(recAr), borderColor: 'var(--area)', overflow: 'hidden' }}>
          <div className="row between wrap gap-16">
            <div className="grow" style={{ minWidth: 260 }}>
              <Badge tone="area" icon="Sparkles">Tu carrera recomendada</Badge>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.4vw, 2rem)', fontWeight: 800, marginTop: 12 }}>{recomendada.nombre}</h2>
              <p className="dim mt-8" style={{ maxWidth: 620 }}>{recomendada.descripcion}</p>
              <div className="row gap-16 wrap mt-16 small bold">
                <span className="row gap-6"><Icon name="Building2" size={16} color="var(--area)" /> {recomendada.universidades.length} universidades</span>
                <span className="row gap-6"><Icon name="Wallet" size={16} color="var(--area)" /> {recDesde ? `Desde S/ ${recDesde.toLocaleString()}/mes` : 'Pensión baja (pública)'}</span>
                <span className="row gap-6"><Icon name="CalendarClock" size={16} color="var(--area)" /> {recomendada.duracion} ciclos</span>
              </div>
              <div className="row gap-12 wrap mt-24">
                <Link to={`/carreras/${recomendada.id}`} className="btn btn-primary"><Icon name="Info" size={16} /> Ver información completa</Link>
                {recSim && <Link to={`/simulaciones/${recSim.id}`} className="btn btn-outline"><Icon name="Gamepad2" size={16} /> Ir a la simulación</Link>}
              </div>
            </div>
            <span style={{ width: 76, height: 76, borderRadius: 20, background: 'var(--area-soft)', color: 'var(--area)', display: 'grid', placeItems: 'center', flex: 'none' }}>
              <Icon name={recAr.icon} size={38} />
            </span>
          </div>
        </Card>
      )}

      {/* Afinidad por área */}
      <Card className="card-pad">
        <h2 style={{ fontWeight: 800, marginBottom: 18 }}>Afinidad por área</h2>
        <div className="affinity">
          {scores.map((s) => (
            <div className="line" key={s.id} style={areaVars(s)}>
              <span className="row gap-8 small bold truncate">
                <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--area-soft)', color: 'var(--area)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name={s.icon} size={15} />
                </span>
                <span className="truncate">{s.nombre}</span>
              </span>
              <span className="track"><span className="fill" style={{ width: `${s.pct}%` }} /></span>
              <span className="bold small" style={{ textAlign: 'right' }}>{s.pct}%</span>
            </div>
          ))}
        </div>
        {unknown.length > 0 && (
          <div className="card card-pad mt-24" style={{ background: 'var(--warn-soft)', border: 0 }}>
            <div className="row gap-8 bold" style={{ color: 'var(--warn)' }}>
              <Icon name="HelpCircle" size={18} /> Áreas por descubrir
            </div>
            <p className="small mt-8" style={{ color: '#92400e' }}>
              Marcaste dudas en: {unknown.map((u) => u.nombre).join(', ')}. Explora esas áreas con calma y vuelve a intentarlo cuando quieras.
            </p>
          </div>
        )}
      </Card>

      {/* Top 3 */}
      <h2 className="mt-32 mb-16" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tu Top 3 vocacional</h2>
      <div className="grid cols-3">
        {top3.map((a, i) => (
          <Card key={a.id} className="card-pad" style={areaVars(a)}>
            <div className="row between">
              <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--area-soft)', color: 'var(--area)', display: 'grid', placeItems: 'center' }}>
                <Icon name={a.icon} size={22} />
              </span>
              <Badge tone="area">#{i + 1}</Badge>
            </div>
            <h3 style={{ fontWeight: 800, marginTop: 14 }}>{a.nombre}</h3>
            <p className="dim small mt-8">{a.frase}</p>
            <div className="row between mt-16">
              <div className="progress progress-area grow" style={{ marginRight: 12 }}><span style={{ width: `${a.pct}%` }} /></div>
              <span className="bold small">{a.pct}%</span>
            </div>
            <div className="list-soft mt-16">
              {CARRERAS.filter((c) => c.area === a.id).map((c) => (
                <Link key={c.id} to={`/carreras/${c.id}`} className="row between gap-8" style={{ padding: '9px 0', textDecoration: 'none', color: 'inherit' }}>
                  <span className="small bold truncate">{c.nombre}</span>
                  <Icon name="ChevronRight" size={16} color="#94a3b8" />
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Carreras recomendadas */}
      <div className="row between wrap gap-16 mt-32 mb-16">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Carreras compatibles contigo</h2>
        <Link to="/carreras" className="row gap-4 small bold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Ver todas <Icon name="ArrowRight" size={15} /></Link>
      </div>
      <div className="grid cols-4">
        {careersByIds.map((c) => (
          <CareerCard key={c.id} career={c} saved={savedSet.includes(c.id)} onSave={toggleSaved} />
        ))}
      </div>
      <div className="row gap-12 mt-24">
        <Link to="/simulaciones" className="btn btn-outline"><Icon name="Gamepad2" size={17} /> Probar simulaciones</Link>
        <Link to="/comparar" className="btn btn-soft"><Icon name="SlidersHorizontal" size={17} /> Comparar carreras</Link>
      </div>
    </>
  );
}
