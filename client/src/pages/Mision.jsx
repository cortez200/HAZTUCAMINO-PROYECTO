import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { missionById, missionsDeCarrera, carrera, area, isPremium, isFreeMission, nivelMision, engineIcon, engineLabel } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { areaVars, Badge, Btn, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import CodeMission from '../components/missions/CodeMission.jsx';
import DecisionMission from '../components/missions/DecisionMission.jsx';
import WorksheetMission from '../components/missions/WorksheetMission.jsx';
import MatchMission from '../components/missions/MatchMission.jsx';
import AllocateMission from '../components/missions/AllocateMission.jsx';
import DragActivity from '../components/DragActivity.jsx';

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
      <div className="gauge-val"><b>{value}%</b><span>{label}</span></div>
    </div>
  );
}

const DIFF = { 1: 'Fácil', 2: 'Media', 3: 'Alta' };

export default function Mision() {
  const { id } = useParams();
  const mission = missionById(id);
  const { account, submitMission } = useAuth();
  const toast = useToast();

  const [phase, setPhase] = useState('brief'); // brief | play | result
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const startRef = useRef(0);

  const premium = isPremium(account);
  const locked = mission ? (!isFreeMission(mission) && !premium) : false;
  const ar = mission ? area(mission.area) : null;
  const car = mission ? carrera(mission.careerId) : null;
  const related = mission ? missionsDeCarrera(mission.careerId) : [];
  const nextMission = mission ? related[related.findIndex((m) => m.id === mission.id) + 1] : null;

  const start = () => { startRef.current = Date.now(); setPhase('play'); };

  useEffect(() => {
    setPhase('brief');
    setResult(null);
    setSaveError(null);
    setRunKey((k) => k + 1);
  }, [id]);

  const restart = () => {
    setResult(null);
    setSaveError(null);
    setRunKey((k) => k + 1);
    setPhase('brief');
  };

  const onComplete = useCallback(async ({ score, total, detail }) => {
    setResult({ score, total, detail });
    setPhase('result');
    const timeMs = startRef.current ? Date.now() - startRef.current : 0;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await submitMission({ missionId: mission.id, score, total, timeMs });
      setResult((r) => ({ ...r, server: res.result }));
      toast('Misión completada', 'CheckCircle2');
    } catch (err) {
      setSaveError(err.message || 'No pudimos guardar tu resultado.');
    } finally {
      setSaving(false);
    }
  }, [mission, submitMission, toast]);

  const pct = useMemo(() => (result ? Math.round((result.score / result.total) * 100) : 0), [result]);

  if (!mission) {
    return (
      <Card className="card-pad center">
        <h2 style={{ fontWeight: 800 }}>Misión no encontrada</h2>
        <Link to="/simulaciones" className="btn btn-primary" style={{ marginTop: 16 }}>Volver a Simulaciones</Link>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="card-pad center" style={{ padding: '48px 24px' }}>
        <div className="mission-lock-icon"><Icon name="Lock" size={26} /></div>
        <Badge tone="soft" icon="User">Necesitas una cuenta</Badge>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 14 }}>{mission.titulo}</h2>
        <p className="dim mt-8" style={{ maxWidth: 440, margin: '8px auto 0' }}>
          Crea una cuenta gratis para practicar esta misión y guardar tu avance.
        </p>
        <div className="row gap-12 center mt-24">
          <Link to="/register" state={{ from: `/simulaciones/mision/${mission.id}` }} className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
          <Link to="/login" state={{ from: `/simulaciones/mision/${mission.id}` }} className="btn btn-outline">Ya tengo cuenta</Link>
        </div>
      </Card>
    );
  }

  if (locked) {
    return (
      <Card className="card-pad center" style={{ padding: '48px 24px' }}>
        <div className="mission-lock-icon"><Icon name="Lock" size={26} /></div>
        <Badge tone="gold">Misión Premium</Badge>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 14 }}>{mission.titulo}</h2>
        <p className="dim mt-8" style={{ maxWidth: 440, margin: '8px auto 0' }}>
          Esta es una misión avanzada. Activa Premium para desbloquear todos los simuladores y desafíos.
        </p>
        <Link to="/planes" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}><Icon name="Sparkles" size={18} /> Desbloquear Premium</Link>
      </Card>
    );
  }

  /* ---------------- RESULTADO ---------------- */
  if (phase === 'result' && result) {
    const msg = pct >= 80 ? '¡Excelente dominio de la actividad!' : pct >= 50 ? 'Buen trabajo. Revisa la retroalimentación y mejora.' : 'Terminaste la misión. Vuelve a intentarlo para subir tu puntaje.';
    return (
      <div className="mission-page mission-result-page" style={areaVars(ar)}>
        <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>
        <Card className="card-pad result-card">
          <div className="result-hero">
            <Gauge value={pct} label="Acierto" />
            <div className="grow">
              <div className="row gap-8 wrap">
                <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
                <Badge tone="soft" icon="GraduationCap">{car?.nombre}</Badge>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 10 }}>{mission.titulo}</h2>
              <p className="dim mt-8">{msg}</p>
              <div className="row gap-24 wrap mt-24">
                <span className="hud-stat"><b style={{ color: 'var(--ok)' }}>{result.score}</b><em>aciertos</em></span>
                <span className="hud-stat"><b>{result.total}</b><em>en total</em></span>
                <span className="hud-stat"><b>{pct}%</b><em>de logro</em></span>
              </div>
              {saveError && <div className="mission-note no mt-16"><Icon name="AlertTriangle" size={18} /><span className="small">{saveError}</span></div>}
              {saving && <p className="dim small mt-8"><Icon name="Hourglass" size={14} /> Guardando tu progreso…</p>}
            </div>
          </div>
        </Card>

        {/* Retroalimentación educativa */}
        <MissionFeedback engine={mission.engine} detail={result.detail} />

        <Card className="card-pad mt-16">
          <div className="row gap-8 mb-8"><Icon name="Brain" size={18} color="var(--area)" /><span className="bold small">Habilidades que practicaste</span></div>
          <div className="row gap-8 wrap">
            {mission.habilidades.map((h) => <span key={h} className="badge badge-soft">{h}</span>)}
          </div>
        </Card>

        <div className="row gap-12 mt-16 wrap">
          <Btn variant="primary" icon="RotateCcw" onClick={restart}>Volver a intentarlo</Btn>
          {nextMission && (
            <Link to={`/simulaciones/mision/${nextMission.id}`} className="btn btn-soft">
              <Icon name="ArrowRight" size={16} /> Siguiente misión
            </Link>
          )}
          <Link to="/simulaciones" className="btn btn-outline">Ver todas las simulaciones</Link>
        </div>
      </div>
    );
  }

  /* ---------------- JUEGO ---------------- */
  if (phase === 'play') {
    return (
      <div className="mission-page mission-play-page" style={areaVars(ar)}>
        <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>
        <div className="mission-play-head">
          <div className="mission-play-title">
            <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
            <h1>{mission.titulo}</h1>
          </div>
          <span className="badge badge-soft mission-play-level"><Icon name="Timer" size={14} /> Nivel {nivelMision(mission.nivel)}</span>
        </div>
        {mission.engine === 'code' && <CodeMission key={runKey} code={mission.code} onComplete={onComplete} />}
        {mission.engine === 'decision' && <DecisionMission key={runKey} decision={mission.decision} onComplete={onComplete} />}
        {mission.engine === 'worksheet' && <WorksheetMission key={runKey} worksheet={mission.worksheet} onComplete={onComplete} />}
        {mission.engine === 'match' && <MatchMission key={runKey} match={mission.match} onComplete={onComplete} />}
        {mission.engine === 'allocate' && <AllocateMission key={runKey} allocate={mission.allocate} onComplete={onComplete} />}
        {mission.engine === 'drag' && (
          <Card className="card-pad">
            <DragActivity key={runKey} activity={mission.drag} area={ar} onComplete={onComplete} />
          </Card>
        )}
      </div>
    );
  }

  /* ---------------- BRIEFING ---------------- */
  return (
    <div className="mission-page mission-brief-page" style={areaVars(ar)}>
      <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>

      <Card className="mission-hero">
        <div className="row gap-16" style={{ alignItems: 'flex-start' }}>
          <span className="mission-ico"><Icon name={engineIcon(mission.engine)} size={26} /></span>
          <div className="grow">
            <div className="row gap-8 wrap">
              <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
              <Badge tone="soft" icon="GraduationCap">{car?.nombre}</Badge>
              <Badge tone={isFreeMission(mission) ? 'ok' : 'gold'} icon={isFreeMission(mission) ? 'Unlock' : 'Lock'}>
                {isFreeMission(mission) ? 'Gratis' : 'Premium'}
              </Badge>
            </div>
            <h1 className="mission-hero-title">{mission.titulo}</h1>
            <p className="mission-hero-sub">{mission.subtitulo}</p>
          </div>
        </div>

        <div className="mission-meta">
          <span className="meta-pill"><Icon name="BarChart3" size={16} /><b>{nivelMision(mission.nivel)}</b><em>nivel</em></span>
          <span className="meta-pill"><Icon name="Flame" size={16} /><b>{DIFF[mission.dificultad] || 'Media'}</b><em>exigencia</em></span>
          <span className="meta-pill"><Icon name="Clock" size={16} /><b>~{mission.estimadoMin} min</b><em>duración</em></span>
          <span className="meta-pill"><Icon name="Zap" size={16} /><b>{mission.xp} XP</b><em>recompensa</em></span>
        </div>
      </Card>

      <div className="grid cols-2 mission-brief-grid">
        <Card className="card-pad brief-card">
          <div className="brief-head"><span className="brief-ico"><Icon name="Briefcase" size={18} /></span><h3>Tu rol</h3></div>
          <p className="dim">{mission.rol}</p>
          <hr className="divider" />
          <div className="brief-head"><span className="brief-ico"><Icon name="FileText" size={18} /></span><h3>El contexto</h3></div>
          <p className="dim">{mission.contexto}</p>
          <div className="row gap-8 wrap mt-16">
            {mission.habilidades.map((h) => <span key={h} className="badge badge-soft">{h}</span>)}
          </div>
        </Card>

        <div className="stack gap-16">
          <Card className="card-pad brief-card">
            <div className="brief-head"><span className="brief-ico"><Icon name="Target" size={18} /></span><h3>Tu objetivo</h3></div>
            <p className="dim">{mission.objetivo}</p>
          </Card>
          <Card className="card-pad brief-card">
            <div className="brief-head"><span className="brief-ico"><Icon name="ClipboardCheck" size={18} /></span><h3>Qué practicarás</h3></div>
            <ul className="mission-checklist">
              {mission.entregables.map((e) => (
                <li key={e}><Icon name="Check" size={15} /> <span>{e}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="mission-startbar">
        <p className="dim small grow" style={{ margin: 0 }}>
          <Icon name="Info" size={14} /> Simulación educativa. En el trabajo real, las decisiones las define el equipo profesional.
        </p>
        <button type="button" className="btn btn-primary btn-lg" onClick={start}>
          <Icon name="Play" size={18} /> Empezar la misión
        </button>
      </Card>
    </div>
  );
}

function MissionFeedback({ engine, detail }) {
  if (!detail) return null;
  if (engine === 'code') {
    const tests = detail.tests || [];
    return (
      <Card className="card-pad mt-16">
        <div className="row gap-8 mb-8"><Icon name="Terminal" size={18} color="var(--area)" /><span className="bold small">Explicación de las pruebas</span></div>
        <ul className="test-list">
          {tests.map((r) => (
            <li key={r.id} className={`test-row ${r.pass ? 'ok' : 'no'}`}>
              <span className="test-mark">{r.pass ? <Icon name="CheckCircle2" size={16} /> : <Icon name="XCircle" size={16} />}</span>
              <span className="grow">
                <span className="test-label">{r.label}</span>
                {!r.pass && <span className="test-detail">{r.error ? `Error: ${r.error}` : `Obtuviste ${fmt(r.got)} · se esperaba ${fmt(r.expect)}`}</span>}
              </span>
            </li>
          ))}
        </ul>
        {detail.solution?.length > 0 && (
          <>
            <hr className="divider" />
            <span className="bold small">Lo que debías corregir</span>
            <ul className="mission-checklist mt-8">
              {detail.solution.map((n) => <li key={n}><Icon name="Lightbulb" size={15} /> <span>{n}</span></li>)}
            </ul>
          </>
        )}
      </Card>
    );
  }
  if (engine === 'decision') {
    const findings = detail.findings || [];
    const steps = detail.steps || [];
    return (
      <Card className="card-pad mt-16">
        <div className="row gap-8 mb-8"><Icon name="ClipboardCheck" size={18} color="var(--area)" /><span className="bold small">Retroalimentación del caso</span></div>
        <p className="muted small">Signos clave</p>
        <ul className="feedback-list">
          {findings.map((f) => (
            <li key={f.id} className={f.ok ? 'ok' : 'no'}>
              <Icon name={f.ok ? 'CheckCircle2' : 'XCircle'} size={16} />
              <span><b>{f.text}.</b> {f.fb}</span>
            </li>
          ))}
        </ul>
        <hr className="divider" />
        <p className="muted small">Decisiones</p>
        <ul className="feedback-list">
          {steps.map((s) => (
            <li key={s.id} className={s.ok ? 'ok' : 'no'}>
              <Icon name={s.ok ? 'CheckCircle2' : 'XCircle'} size={16} />
              <span><b>{s.titulo}:</b> {s.fb}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  if (engine === 'worksheet') {
    const fields = detail.fields || [];
    return (
      <Card className="card-pad mt-16">
        <div className="row gap-8 mb-8"><Icon name="Calculator" size={18} color="var(--area)" /><span className="bold small">Revisión de tus cálculos</span></div>
        <ul className="feedback-list">
          {fields.map((f) => (
            <li key={f.id} className={f.pass ? 'ok' : 'no'}>
              <Icon name={f.pass ? 'CheckCircle2' : 'XCircle'} size={16} />
              <span><b>{f.label}:</b> {f.pass ? `correcto (${fmt(f.expect)}${f.unit ? ' ' + f.unit : ''}).` : `obtuviste ${fmt(f.got)}${f.unit ? ' ' + f.unit : ''}; se esperaba ${fmt(f.expect)}.`} {f.fb}</span>
            </li>
          ))}
        </ul>
        {detail.notes?.length > 0 && (
          <>
            <hr className="divider" />
            <span className="bold small">Cómo se resuelve</span>
            <ul className="mission-checklist mt-8">
              {detail.notes.map((n) => <li key={n}><Icon name="Lightbulb" size={15} /> <span>{n}</span></li>)}
            </ul>
          </>
        )}
      </Card>
    );
  }
  if (engine === 'match') {
    const pairs = detail.pairs || [];
    return (
      <Card className="card-pad mt-16">
        <div className="row gap-8 mb-8"><Icon name="Puzzle" size={18} color="var(--area)" /><span className="bold small">Retroalimentación del emparejamiento</span></div>
        <ul className="feedback-list">
          {pairs.map((p) => (
            <li key={p.id} className={p.ok ? 'ok' : 'no'}>
              <Icon name={p.ok ? 'CheckCircle2' : 'XCircle'} size={16} />
              <span><b>{p.left}</b> {p.ok ? '→' : 'no corresponde a'} <b>{p.right}</b>. {p.fb}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  if (engine === 'allocate') {
    const partidas = detail.partidas || [];
    return (
      <Card className="card-pad mt-16">
        <div className="row gap-8 mb-8"><Icon name="Wallet" size={18} color="var(--area)" /><span className="bold small">Revisión de tu reparto</span></div>
        <ul className="feedback-list">
          {partidas.map((p) => (
            <li key={p.id} className={p.ok ? 'ok' : 'no'}>
              <Icon name={p.ok ? 'CheckCircle2' : 'XCircle'} size={16} />
              <span><b>{p.label}</b> ({p.monto} asignado · recomendado {p.min}–{p.max}). {p.fb}</span>
            </li>
          ))}
        </ul>
        {detail.notes?.length > 0 && (
          <>
            <hr className="divider" />
            <ul className="mission-checklist mt-8">
              {detail.notes.map((n) => <li key={n}><Icon name="Lightbulb" size={15} /> <span>{n}</span></li>)}
            </ul>
          </>
        )}
      </Card>
    );
  }
  return null;
}

function fmt(v) {
  if (Array.isArray(v)) return `[${v.join(', ')}]`;
  if (v && typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
