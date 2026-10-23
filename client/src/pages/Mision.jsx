import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { missionById, missionsDeCarrera, carrera, area, isPremium, isFreeMission, nivelMision, engineIcon } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { areaVars, Badge, Btn, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import CodeMission from '../components/missions/CodeMission.jsx';
import DecisionMission from '../components/missions/DecisionMission.jsx';
import WorksheetMission from '../components/missions/WorksheetMission.jsx';
import MatchMission from '../components/missions/MatchMission.jsx';
import AllocateMission from '../components/missions/AllocateMission.jsx';
import DragActivity from '../components/DragActivity.jsx';
import SolutionDemo from '../components/missions/SolutionDemo.jsx';

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

const TIERS = [
  { min: 90, label: 'Excelente', icon: 'Trophy', tone: 'gold' },
  { min: 75, label: 'Muy bien', icon: 'Award', tone: 'ok' },
  { min: 50, label: 'Bien', icon: 'ThumbsUp', tone: 'soft' },
  { min: 0, label: 'A seguir practicando', icon: 'Flame', tone: 'warn' },
];

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
    const timeMs = startRef.current ? Date.now() - startRef.current : 0;
    setResult({ score, total, detail, timeMs });
    setPhase('result');
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
    const tier = TIERS.find((t) => pct >= t.min) || TIERS[TIERS.length - 1];
    const xpEarned = Math.round((result.score / result.total) * (mission.xp || 0));
    const prevBest = account?.missions?.[mission.id]?.best || 0;
    const best = Math.max(result.score, prevBest);
    const attempts = account?.missions?.[mission.id]?.attempts;
    const msg = pct >= 80 ? '¡Excelente dominio de la actividad!' : pct >= 50 ? 'Buen trabajo. Revisa la retroalimentación y mejora.' : 'Terminaste la misión. Vuelve a intentarlo para subir tu puntaje.';
    return (
      <div className="mission-page mission-result-page" style={areaVars(ar)}>
        <Link to="/simulaciones" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Simulaciones</Link>

        <Card className="card-pad result-card">
          <div className="result-hero">
            <div className="result-ring"><Gauge value={pct} label="Acierto" /></div>
            <div className="result-main grow">
              <div className="row gap-8 wrap">
                <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
                <Badge tone="soft" icon="GraduationCap">{car?.nombre}</Badge>
                <Badge tone={tier.tone} icon={tier.icon}>{tier.label}</Badge>
              </div>
              <h2 className="result-title">{mission.titulo}</h2>
              <p className="dim result-msg">{msg}</p>
              <div className="result-stats">
                <span className="result-stat"><b>{result.score}<i>/{result.total}</i></b><em>aciertos</em></span>
                <span className="result-stat"><b>{pct}%</b><em>precisión</em></span>
                <span className="result-stat"><b>{fmtTime(result.timeMs)}</b><em>tiempo</em></span>
                <span className="result-stat accent"><b>+{xpEarned}</b><em>XP ganado</em></span>
              </div>
              {(best > 0 || attempts) && (
                <p className="result-sub dim small">
                  <Icon name="Trophy" size={14} /> Mejor marca: <b>{best}/{result.total}</b>
                  {attempts ? <> &nbsp;· {attempts} {attempts === 1 ? 'intento' : 'intentos'}</> : null}
                </p>
              )}
              {saving && <p className="dim small mt-8"><Icon name="Hourglass" size={14} /> Guardando tu progreso…</p>}
              {saveError && <div className="mission-note no mt-16"><Icon name="AlertTriangle" size={18} /><span className="small">{saveError}</span></div>}
            </div>
          </div>
        </Card>

        {/* Retroalimentación educativa */}
        <MissionFeedback engine={mission.engine} detail={result.detail} />

        <Card className="card-pad result-skills">
          <div className="row gap-8 mb-12"><Icon name="Brain" size={18} color="var(--area)" /><span className="bold small">Habilidades que practicaste</span></div>
          <div className="row gap-8 wrap">
            {mission.habilidades.map((h) => <span key={h} className="badge badge-soft">{h}</span>)}
          </div>
        </Card>

        <Card className="result-actions">
          <div className="result-actions-info">
            <Icon name={nextMission ? 'ArrowRight' : 'ListVideo'} size={18} />
            <span>{nextMission ? <>Siguiente reto: <b>{nextMission.titulo}</b></> : 'Ya completaste las misiones de esta carrera.'}</span>
          </div>
          <div className="row gap-12 wrap">
            <Btn variant="primary" icon="RotateCcw" onClick={restart}>Volver a intentarlo</Btn>
            {nextMission && (
              <Link to={`/simulaciones/mision/${nextMission.id}`} className="btn btn-soft">
                <Icon name="Play" size={16} /> Ir a la siguiente
              </Link>
            )}
            <Link to="/simulaciones" className="btn btn-outline">Ver todas</Link>
          </div>
        </Card>
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

      <Card className="card-pad mission-video-card">
        <div className="brief-head"><span className="brief-ico"><Icon name="Play" size={18} /></span><h3>Cómo se resuelve</h3></div>
        <p className="dim small mission-video-sub">Mira este recorrido corto antes de empezar: te explica, paso a paso, cómo resolver la misión.</p>
        <div className="mission-video-frame">
          {mission.video ? (
            <div className="video-frame">
              <iframe
                src={mission.video}
                title={`Cómo se resuelve: ${mission.titulo}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <SolutionDemo mission={mission} />
          )}
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

function ReviewItem({ ok, title, text, tag }) {
  return (
    <li className={`review-item ${ok ? 'ok' : 'no'}`}>
      <span className="review-ico">{ok ? <Icon name="CheckCircle2" size={16} /> : <Icon name="XCircle" size={16} />}</span>
      <div className="review-body">
        <span className="review-title">{title}</span>
        {text && <span className="review-text">{text}</span>}
      </div>
      {tag && <span className="review-tag">{tag}</span>}
    </li>
  );
}

function FeedbackCard({ icon, title, subtitle, badge, children }) {
  return (
    <Card className="card-pad result-feedback">
      <div className="review-head">
        <span className="review-head-ico"><Icon name={icon} size={18} /></span>
        <div className="grow">
          <h3 className="review-head-title">{title}</h3>
          {subtitle && <p className="dim small review-head-sub">{subtitle}</p>}
        </div>
        {badge && <span className={`badge badge-${badge.tone}`}>{badge.text}</span>}
      </div>
      {children}
    </Card>
  );
}

function scoreTone(ok, total) {
  return ok === total ? 'ok' : ok === 0 ? 'warn' : 'soft';
}

function MissionFeedback({ engine, detail }) {
  if (!detail) return null;

  if (engine === 'code') {
    const tests = detail.tests || [];
    const passed = tests.filter((t) => t.pass).length;
    return (
      <FeedbackCard icon="Terminal" title="Explicación de las pruebas" subtitle="Qué evaluó cada prueba y por qué."
        badge={{ tone: scoreTone(passed, tests.length), text: `${passed}/${tests.length}` }}>
        <ul className="review-list">
          {tests.map((r) => (
            <ReviewItem key={r.id} ok={r.pass} title={r.label}
              text={r.pass ? null : (r.error ? `Error: ${r.error}` : `Obtuviste ${fmt(r.got)}; se esperaba ${fmt(r.expect)}.`)} />
          ))}
        </ul>
        {detail.solution?.length > 0 && (
          <div className="review-section">
            <span className="review-section-label"><Icon name="Lightbulb" size={14} /> Lo que debías corregir</span>
            <ul className="mission-checklist mt-8">
              {detail.solution.map((n) => <li key={n}><Icon name="Check" size={15} /> <span>{n}</span></li>)}
            </ul>
          </div>
        )}
      </FeedbackCard>
    );
  }

  if (engine === 'decision') {
    const findings = detail.findings || [];
    const steps = detail.steps || [];
    const total = findings.length + steps.length;
    const ok = findings.filter((f) => f.ok).length + steps.filter((s) => s.ok).length;
    return (
      <FeedbackCard icon="ClipboardCheck" title="Retroalimentación del caso" subtitle="Revisa tus hallazgos y decisiones."
        badge={{ tone: scoreTone(ok, total), text: `${ok}/${total}` }}>
        <div className="review-section">
          <span className="review-section-label">Signos clave</span>
          <ul className="review-list">
            {findings.map((f) => <ReviewItem key={f.id} ok={f.ok} title={f.text} text={f.fb} />)}
          </ul>
        </div>
        <div className="review-section">
          <span className="review-section-label">Decisiones</span>
          <ul className="review-list">
            {steps.map((s) => <ReviewItem key={s.id} ok={s.ok} title={s.titulo} text={s.fb} />)}
          </ul>
        </div>
      </FeedbackCard>
    );
  }

  if (engine === 'worksheet') {
    const fields = detail.fields || [];
    const passed = fields.filter((f) => f.pass).length;
    return (
      <FeedbackCard icon="Calculator" title="Revisión de tus cálculos" subtitle="Compara tu resultado con lo esperado."
        badge={{ tone: scoreTone(passed, fields.length), text: `${passed}/${fields.length}` }}>
        <ul className="review-list">
          {fields.map((f) => {
            const u = f.unit ? ` ${f.unit}` : '';
            return (
              <ReviewItem key={f.id} ok={f.pass} title={f.label}
                text={f.pass ? f.fb : `Obtuviste ${fmt(f.got)}${u}; se esperaba ${fmt(f.expect)}${u}. ${f.fb || ''}`}
                tag={f.pass ? `${fmt(f.expect)}${u}` : null} />
            );
          })}
        </ul>
        {detail.notes?.length > 0 && (
          <div className="review-section">
            <span className="review-section-label"><Icon name="Lightbulb" size={14} /> El método</span>
            <ul className="mission-checklist mt-8">
              {detail.notes.map((n) => <li key={n}><Icon name="Check" size={15} /> <span>{n}</span></li>)}
            </ul>
          </div>
        )}
      </FeedbackCard>
    );
  }

  if (engine === 'match') {
    const pairs = detail.pairs || [];
    const ok = pairs.filter((p) => p.ok).length;
    return (
      <FeedbackCard icon="Puzzle" title="Retroalimentación del emparejamiento" subtitle="Qué va con qué y por qué."
        badge={{ tone: scoreTone(ok, pairs.length), text: `${ok}/${pairs.length}` }}>
        <ul className="review-list">
          {pairs.map((p) => (
            <ReviewItem key={p.id} ok={p.ok} title={p.left}
              text={`${p.ok ? 'Se empareja con' : 'No corresponde a'} «${p.right}». ${p.fb || ''}`} />
          ))}
        </ul>
      </FeedbackCard>
    );
  }

  if (engine === 'allocate') {
    const partidas = detail.partidas || [];
    const ok = partidas.filter((p) => p.ok).length;
    return (
      <FeedbackCard icon="Wallet" title="Revisión de tu reparto" subtitle="Compara tu asignación con el rango recomendado."
        badge={{ tone: scoreTone(ok, partidas.length), text: `${ok}/${partidas.length}` }}>
        <ul className="review-list">
          {partidas.map((p) => (
            <ReviewItem key={p.id} ok={p.ok} title={p.label}
              text={`Recomendado ${p.min}–${p.max}. ${p.fb || ''}`} tag={`${p.monto} asignado`} />
          ))}
        </ul>
        {detail.notes?.length > 0 && (
          <div className="review-section">
            <span className="review-section-label"><Icon name="Lightbulb" size={14} /> Cómo repartir</span>
            <ul className="mission-checklist mt-8">
              {detail.notes.map((n) => <li key={n}><Icon name="Check" size={15} /> <span>{n}</span></li>)}
            </ul>
          </div>
        )}
      </FeedbackCard>
    );
  }

  if (engine === 'drag') {
    const items = detail.items || [];
    const slots = detail.slots || [];
    if (!items.length) return null;
    return (
      <FeedbackCard icon="Hand" title="Revisión de tu clasificación" subtitle="Así se agrupa cada elemento y por qué."
        badge={{ tone: detail.mistakes ? 'soft' : 'ok', text: detail.mistakes ? `${detail.mistakes} errores` : 'Sin errores' }}>
        {slots.map((s) => {
          const list = items.filter((it) => it.correct === s.id);
          if (!list.length) return null;
          return (
            <div key={s.id} className="review-section">
              <span className="review-section-label"><Icon name={s.icon} size={14} /> {s.label}</span>
              <ul className="review-list">
                {list.map((it) => <ReviewItem key={it.id} ok title={it.label} text={it.pista} />)}
              </ul>
            </div>
          );
        })}
      </FeedbackCard>
    );
  }

  return null;
}

function fmtTime(ms) {
  if (!ms) return '—';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m}m ${r}s` : `${r}s`;
}

function fmt(v) {
  if (Array.isArray(v)) return `[${v.join(', ')}]`;
  if (v && typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
