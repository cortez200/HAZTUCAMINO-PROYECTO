import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SIMS, CARRERAS, area, isPremium } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { areaVars, Badge, Btn, Card, Progress } from '../components/ui.jsx';
import CareerCard from '../components/CareerCard.jsx';
import Icon from '../components/Icon.jsx';
import SimScene from '../components/SimScene.jsx';
import DragActivity from '../components/DragActivity.jsx';
import { actividadDe } from '../lib/activity.js';

/* Medidor circular animado. */
function Gauge({ value, label }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="gauge">
      <svg viewBox="0 0 100 100" className="gauge-svg" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--area)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 50 50)" />
      </svg>
      <div className="gauge-val">
        <b>{value}%</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Simulacion() {
  const { id } = useParams();
  const sim = SIMS.find((s) => s.id === id);
  const { account, saveSim, toggleSaved } = useAuth();
  const toast = useToast();

  const [stage, setStage] = useState('video');
  const [result, setResult] = useState(null); // { score, total, mistakes }
  const [runKey, setRunKey] = useState(0);

  const ar = sim ? area(sim.area) : null;
  const locked = sim ? !isPremium(account) : false;
  const activity = sim ? actividadDe(sim.area) : null;

  const restart = useCallback((toStage = 'video') => {
    setResult(null);
    setRunKey((k) => k + 1);
    setStage(toStage);
  }, []);

  const onComplete = useCallback(async ({ score, total, mistakes }) => {
    setResult({ score, total, mistakes });
    setStage('done');
    if (account && sim) { try { await saveSim(sim.id, score); } catch { /* ignore */ } }
    toast(`Simulación completada: ${score}/${total}`, 'Gamepad2');
  }, [account, sim, saveSim, toast]);

  if (!sim) {
    return (
      <Card className="card-pad center">
        <h2 style={{ fontWeight: 800 }}>Simulación no encontrada</h2>
        <Link to="/simulaciones" className="btn btn-primary" style={{ marginTop: 16 }}>Volver</Link>
      </Card>
    );
  }

  if (locked) {
    return (
      <Card className="card-pad center" style={{ padding: '48px 24px' }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Icon name="Lock" size={26} />
        </div>
        <Badge tone="gold">Simulación Premium</Badge>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 14 }}>{sim.titulo}</h2>
        <p className="dim mt-8" style={{ maxWidth: 440, margin: '8px auto 0' }}>Las simulaciones son parte del plan Premium. Actívalo para desbloquear las 8.</p>
        <Link to="/planes" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}><Icon name="Sparkles" size={18} /> Desbloquear Premium</Link>
      </Card>
    );
  }

  const Stepper = ({ active }) => (
    <div className="steps">
      {['Mira', 'Entiende', 'Resuelve'].map((s, i) => (
        <span key={s} className={`step ${i < active ? 'done' : ''} ${i === active ? 'on' : ''}`}>
          <i>{i < active ? <Icon name="Check" size={12} /> : i + 1}</i> {s}
        </span>
      ))}
    </div>
  );

  /* ---------------- RESULTADO ---------------- */
  if (stage === 'done' && result) {
    const pct = Math.round((result.score / result.total) * 100);
    const related = CARRERAS.filter((c) => c.area === sim.area);
    const stars = Math.max(1, Math.round(pct / 20));
    const msg = pct >= 80 ? '¡Excelente! Tomaste buenas decisiones bajo presión.' : pct >= 50 ? 'Buen trabajo. Con práctica lo harás aún mejor.' : 'Terminaste el reto. ¡Inténtalo otra vez y mejora!';
    return (
      <div style={areaVars(ar)}>
        <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>
        <Card className="card-pad result-card">
          <div className="result-hero">
            <Gauge value={pct} label="Acierto" />
            <div className="grow">
              <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 10 }}>Completaste: {activity?.titulo || sim.titulo}</h2>
              <p className="dim mt-8">{msg}</p>
              <div className="stars" role="img" aria-label={`${stars} de 5`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="Star" size={20} color={i < stars ? 'var(--area)' : 'var(--border-strong)'} />
                ))}
              </div>
              <div className="row gap-24 wrap mt-24">
                <span className="hud-stat"><b style={{ color: 'var(--ok)' }}>{result.score}</b><em>correctas</em></span>
                <span className="hud-stat"><b style={{ color: 'var(--danger)' }}>{result.mistakes}</b><em>errores</em></span>
                <span className="hud-stat"><b>{result.total}</b><em>objetos</em></span>
              </div>
            </div>
          </div>
        </Card>
        <div className="row gap-12 mt-16 wrap">
          <Btn variant="primary" icon="RotateCcw" onClick={() => restart('sim')}>Repetir el reto</Btn>
          <Btn variant="outline" icon="Play" onClick={() => restart('video')}>Ver el video de nuevo</Btn>
          <Link to="/simulaciones" className="btn btn-outline">Ver todas</Link>
        </div>
        <h3 className="mt-32 mb-16" style={{ fontSize: '1.15rem', fontWeight: 800 }}>Carreras de {ar.nombre}</h3>
        <div className="grid cols-4">
          {related.map((c) => <CareerCard key={c.id} career={c} saved={(account?.saved || []).includes(c.id)} onSave={toggleSaved} />)}
        </div>
      </div>
    );
  }

  /* ---------------- VIDEO ---------------- */
  if (stage === 'video') {
    return (
      <div style={areaVars(ar)}>
        <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>
        <div className="page-head">
          <div>
            <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
            <h1 className="page-title" style={{ marginTop: 8 }}>{sim.titulo}</h1>
          </div>
          <Stepper active={0} />
        </div>
        <div className="grid cols-2" style={{ alignItems: 'start' }}>
          <Card style={{ overflow: 'hidden', padding: 0 }}>
            <div className="video-frame">
              <iframe src={sim.video} title={`Video: ${sim.titulo}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen loading="lazy" />
            </div>
          </Card>
          <div className="stack gap-16">
            <Card className="card-pad">
              <div className="row gap-8 mb-8"><Icon name="Lightbulb" size={18} color="var(--primary)" /> <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{sim.caso.titulo}</h2></div>
              <p className="dim small">{sim.caso.contexto}</p>
            </Card>
            <Card className="card-pad">
              <div className="row gap-8 mb-8"><Icon name="Target" size={18} color="var(--primary)" /> <span className="bold small">Tu objetivo</span></div>
              <p className="dim small">{sim.caso.objetivo}</p>
            </Card>
            <Btn variant="primary" size="lg" iconRight="ArrowRight" onClick={() => setStage('caso')}>Comenzar el reto</Btn>
            <a href={`https://www.youtube.com/watch?v=${sim.video.split('/').pop()}`} target="_blank" rel="noreferrer" className="crumb" style={{ justifyContent: 'center' }}>
              <Icon name="Youtube" size={15} /> Ver en YouTube
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- CASO ---------------- */
  if (stage === 'caso') {
    return (
      <div style={areaVars(ar)}>
        <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>
        <div className="page-head">
          <div>
            <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
            <h1 className="page-title" style={{ marginTop: 8 }}>{activity?.titulo || sim.caso.titulo}</h1>
          </div>
          <Stepper active={1} />
        </div>
        <div className="grid cols-2" style={{ alignItems: 'start' }}>
          <SimScene area={ar} state="idle" />
          <Card className="card-pad">
            <div className="row gap-16" style={{ alignItems: 'flex-start' }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--area-soft)', color: 'var(--area)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Icon name="FileText" size={24} />
              </span>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Contexto</h2>
                <p className="dim mt-8">{sim.caso.contexto}</p>
              </div>
            </div>
            <hr className="divider" />
            <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Icon name="Target" size={20} />
              </span>
              <div>
                <b>Tu misión</b>
                <p className="dim small mt-8">{activity?.instruccion}</p>
              </div>
            </div>
            <div className="row gap-12 mt-24 wrap">
              <Btn variant="primary" size="lg" icon="Play" onClick={() => setStage('sim')}>Empezar a resolver</Btn>
              <Btn variant="outline" icon="ArrowLeft" onClick={() => setStage('video')}>Volver al video</Btn>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------------- SIMULACIÓN (arrastrar y soltar) ---------------- */
  return (
    <div style={areaVars(ar)}>
      <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>
      <div className="page-head">
        <div>
          <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
          <h1 className="page-title" style={{ marginTop: 8 }}>{activity?.titulo}</h1>
        </div>
        <Stepper active={2} />
      </div>
      <Card className="card-pad">
        {activity
          ? <DragActivity key={runKey} activity={activity} area={ar} onComplete={onComplete} />
          : <p className="dim">Esta simulación aún no tiene actividad.</p>}
      </Card>
    </div>
  );
}
