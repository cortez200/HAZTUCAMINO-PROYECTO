import { useCallback, useMemo, useRef, useState } from 'react';
import { Card } from '../ui.jsx';
import Icon from '../Icon.jsx';

function norm(v) {
  return String(v == null ? '' : v)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function num(v) {
  if (typeof v === 'number') return v;
  const raw = String(v == null ? '' : v).trim().replace(',', '.');
  if (raw === '') return NaN;
  return Number(raw);
}

export default function WorksheetMission({ worksheet, onComplete }) {
  const { fields, datos, brief, hint, notes } = worksheet;
  const [values, setValues] = useState({});
  const [results, setResults] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const submitted = useRef(false);

  const total = fields.length;
  const passed = results ? results.filter((r) => r.pass).length : 0;
  const allPass = results != null && passed === total;

  const review = useCallback(() => {
    const out = fields.map((f) => {
      const raw = values[f.id];
      if (f.type === 'text') {
        const accept = [f.expect, ...(f.accept || [])].map(norm);
        const got = norm(raw);
        return { id: f.id, label: f.label, pass: got !== '' && accept.includes(got), got: String(raw ?? ''), expect: f.expect, fb: f.fb };
      }
      const got = num(raw);
      const ok = Number.isFinite(got) && Math.abs(got - f.expect) <= (f.tol || 0);
      return { id: f.id, label: f.label, pass: ok, got, expect: f.expect, unit: f.unit, fb: f.fb };
    });
    setResults(out);
    setAttempts((a) => a + 1);
  }, [fields, values]);

  const finish = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    const score = results ? results.filter((r) => r.pass).length : 0;
    onComplete?.({
      score,
      total,
      detail: { fields: results || [], attempts, notes: notes || [] }
    });
  }, [results, total, attempts, notes, onComplete]);

  if (allPass && !submitted.current) {
    setTimeout(() => finish(), 900);
  }

  return (
    <div className="mission-engine worksheet">
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card className="card-pad mission-dossier">
          <div className="row gap-8 mb-8">
            <Icon name="ClipboardList" size={18} color="var(--area)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Datos del caso</h3>
          </div>
          {brief && <p className="dim small" style={{ marginTop: 0 }}>{brief}</p>}
          {datos && datos.length > 0 && (
            <dl className="dossier-list" style={{ marginTop: 12 }}>
              {datos.map((d) => (
                <div key={d.label} className="dossier-row">
                  <dt>{d.label}</dt>
                  <dd>
                    {d.valor != null && <span>{d.valor}</span>}
                    {d.items && (
                      <ul className="dossier-items">
                        {d.items.map((it) => <li key={it}>{it}</li>)}
                      </ul>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        <div className="stack gap-16">
          <Card className="card-pad">
            <div className="row gap-8 mb-8">
              <Icon name="Calculator" size={18} color="var(--area)" />
              <span className="bold small">Completa la hoja de trabajo</span>
            </div>
            <div className="wsheet-list">
              {fields.map((f, i) => {
                const r = results && results.find((x) => x.id === f.id);
                const cls = r ? (r.pass ? 'ok' : 'no') : '';
                return (
                  <div key={f.id} className={`wsheet-row ${cls}`}>
                    <label className="wsheet-label" htmlFor={`ws-${f.id}`}>
                      <b>{i + 1}.</b> {f.label}
                      {f.unit && <em className="wsheet-unit">({f.unit})</em>}
                    </label>
                    <div className="wsheet-input">
                      <input
                        id={`ws-${f.id}`}
                        type={f.type === 'text' ? 'text' : 'text'}
                        inputMode={f.type === 'text' ? 'text' : 'decimal'}
                        value={values[f.id] ?? ''}
                        placeholder={f.type === 'text' ? 'Escribe la respuesta' : 'Escribe el resultado'}
                        onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                      />
                      {r && (r.pass ? <Icon name="CheckCircle2" size={17} color="var(--ok)" /> : <Icon name="XCircle" size={17} color="var(--danger)" />)}
                    </div>
                    {r && !r.pass && <span className="wsheet-fb">{r.fb || 'Revisa el cálculo.'}</span>}
                    {r && r.pass && r.fb && <span className="wsheet-fb ok">{r.fb}</span>}
                  </div>
                );
              })}
            </div>
            <div className="row gap-8 mt-16 wrap">
              <button type="button" className="btn btn-primary" onClick={review}>
                <Icon name="ClipboardCheck" size={16} /> Revisar hoja
              </button>
              <button type="button" className="btn btn-soft btn-sm" onClick={() => { setValues({}); setResults(null); }}>
                <Icon name="RotateCcw" size={15} /> Limpiar
              </button>
              {results && (
                <span className={`badge ${allPass ? 'badge-ok' : 'badge-soft'}`}>{passed}/{total} correctas</span>
              )}
            </div>
          </Card>

          {attempts >= 1 && !allPass && (
            <Card className="card-pad">
              <div className="row gap-12 wrap">
                {hint && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowHint((s) => !s)}>
                    <Icon name="Lightbulb" size={15} /> {showHint ? 'Ocultar pista' : 'Ver pista'}
                  </button>
                )}
                {notes && notes.length > 0 && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowSolution((s) => !s)}>
                    <Icon name="Eye" size={15} /> {showSolution ? 'Ocultar explicación' : 'Ver explicación'}
                  </button>
                )}
              </div>
              {showHint && hint && <div className="mission-note soft mt-16"><Icon name="Lightbulb" size={18} /><span className="small">{hint}</span></div>}
              {showSolution && notes && notes.length > 0 && (
                <ul className="mission-checklist mt-16">
                  {notes.map((n) => <li key={n}><Icon name="Lightbulb" size={15} /> <span>{n}</span></li>)}
                </ul>
              )}
            </Card>
          )}

          {results && !allPass && (
            <button type="button" className="btn btn-soft" style={{ width: '100%' }} onClick={finish}>
              <Icon name="ArrowRight" size={16} /> Enviar resultado actual ({passed}/{total})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
