import { useMemo, useState } from 'react';
import { Card } from '../ui.jsx';
import Icon from '../Icon.jsx';

/* Motor de DECISIÓN — casos con información, alternativas y consecuencias.
   Fase 1: el estudiante marca los hallazgos clave.
   Fase 2: resuelve decisiones clínicas/críticas una a una, con retroalimentación. */

function Dossier({ dossier }) {
  return (
    <Card className="card-pad mission-dossier">
      <div className="row gap-8 mb-8">
        <Icon name="FileText" size={18} color="var(--area)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{dossier.titulo}</h3>
      </div>
      <dl className="dossier-list">
        {dossier.secciones.map((s) => (
          <div key={s.label} className="dossier-row">
            <dt>{s.label}</dt>
            <dd>
              {s.valor && <span>{s.valor}</span>}
              {s.items && (
                <ul className="dossier-items">
                  {s.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default function DecisionMission({ decision, onComplete }) {
  const [phase, setPhase] = useState('findings'); // findings | steps
  const [checked, setChecked] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [correctSteps, setCorrectSteps] = useState(0);
  const [stepLog, setStepLog] = useState([]);

  const keyFindings = useMemo(() => decision.findings.filter((f) => f.key), [decision.findings]);

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const findingsResult = useMemo(() => {
    const selected = decision.findings.filter((f) => checked[f.id]);
    const hits = selected.filter((f) => f.key).length;
    const misses = selected.filter((f) => !f.key).length;
    const total = keyFindings.length;
    const score = Math.max(0, hits - misses);
    return {
      hits,
      misses,
      total,
      score,
      detail: decision.findings.map((f) => ({
        id: f.id,
        text: f.text,
        key: f.key,
        selected: !!checked[f.id],
        ok: !!checked[f.id] === f.key,
        fb: f.fb
      }))
    };
  }, [checked, decision.findings, keyFindings.length]);

  const step = decision.steps[stepIndex];
  const isLast = stepIndex === decision.steps.length - 1;

  const pick = (opt) => {
    if (chosen) return;
    setChosen(opt);
    if (opt.ok) setCorrectSteps((n) => n + 1);
    setStepLog((log) => [
      ...log,
      { id: step.id, titulo: step.titulo, question: step.question, elegida: opt.t, ok: opt.ok, fb: opt.fb }
    ]);
  };

  const next = () => {
    if (isLast) {
      const total = keyFindings.length + decision.steps.length;
      const score = findingsResult.score + correctSteps;
      onComplete?.({
        score,
        total,
        detail: { findings: findingsResult.detail, steps: stepLog }
      });
      return;
    }
    setStepIndex((i) => i + 1);
    setChosen(null);
  };

  /* ---------------- Fase 1: signos clave ---------------- */
  if (phase === 'findings') {
    return (
      <div className="mission-engine decision">
        <div className="grid cols-2" style={{ alignItems: 'start' }}>
          <Dossier dossier={decision.dossier} />
          <Card className="card-pad">
            <BadgeStep n={1} total={2} label="Identifica los signos clave" />
            <p className="dim small mt-8">{decision.findingsInstruccion}</p>
            <div className="finding-list mt-16">
              {decision.findings.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`finding ${checked[f.id] ? 'on' : ''}`}
                  onClick={() => toggle(f.id)}
                  aria-pressed={!!checked[f.id]}
                >
                  <span className="finding-box">
                    {checked[f.id] && <Icon name="Check" size={13} />}
                  </span>
                  <span className="finding-txt">{f.text}</span>
                </button>
              ))}
            </div>
            <div className="activity-foot" style={{ marginTop: 16 }}>
              <span className="small dim">{findingsResult.hits} de {findingsResult.total} signos clave marcados</span>
            </div>
            <button type="button" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }} onClick={() => setPhase('steps')}>
              Confirmar y decidir <Icon name="ArrowRight" size={18} />
            </button>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------------- Fase 2: decisiones ---------------- */
  return (
    <div className="mission-engine decision">
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Dossier dossier={decision.dossier} />
        <Card className="card-pad">
          <BadgeStep n={2} total={2} label={`Decisión ${stepIndex + 1} de ${decision.steps.length}`} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 10 }}>{step.titulo}</h3>
          <p className="dim small mt-8">{step.question}</p>
          <div className="option-list mt-16">
            {step.opciones.map((opt) => {
              const isChosen = chosen && chosen.t === opt.t;
              const reveal = !!chosen;
              const cls = reveal && opt.ok ? 'correct' : isChosen && !opt.ok ? 'wrong' : isChosen ? 'chosen' : '';
              return (
                <button
                  key={opt.t}
                  type="button"
                  className={`option ${cls}`}
                  onClick={() => pick(opt)}
                  disabled={reveal}
                >
                  <span className="option-mark">
                    {reveal && opt.ok ? <Icon name="CheckCircle2" size={18} />
                      : isChosen ? <Icon name="XCircle" size={18} />
                        : <span className="option-dot" />}
                  </span>
                  <span className="option-txt">{opt.t}</span>
                </button>
              );
            })}
          </div>
          {chosen && (
            <div className={`mission-note ${chosen.ok ? 'ok' : 'no'}`}>
              <Icon name={chosen.ok ? 'CheckCircle2' : 'AlertTriangle'} size={18} />
              <span className="small">{chosen.fb}</span>
            </div>
          )}
          {chosen && (
            <button type="button" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }} onClick={next}>
              {isLast ? 'Ver resultados' : 'Siguiente decisión'} <Icon name="ArrowRight" size={18} />
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}

function BadgeStep({ n, total, label }) {
  return (
    <div className="row between gap-8">
      <span className="badge badge-area">{label}</span>
      <span className="step-dots">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`sdot ${i < n ? 'on' : ''}`} />
        ))}
      </span>
    </div>
  );
}
