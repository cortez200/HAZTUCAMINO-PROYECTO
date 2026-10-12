import { useCallback, useRef, useState } from 'react';
import { Card } from '../ui.jsx';
import Icon from '../Icon.jsx';
import { runCode } from '../../lib/codeRunner.js';

/* Motor de CÓDIGO — editor, detección de errores y pruebas automáticas.
   El código del estudiante se ejecuta SOLO en el navegador (Web Worker aislado),
   nunca en el servidor. Las pruebas vienen definidas como datos (args → expect). */

export default function CodeMission({ code, onComplete }) {
  const [source, setSource] = useState(code.starter);
  const [results, setResults] = useState(null); // null = aún sin ejecutar
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const submitted = useRef(false);
  const taRef = useRef(null);

  const passed = results ? results.filter((r) => r.pass).length : 0;
  const total = code.tests.length;
  const allPass = results != null && passed === total;

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    const out = await runCode({ code: source, fnName: code.fnName, tests: code.tests });
    setResults(out.results || []);
    setError(out.error || null);
    setRuns((r) => r + 1);
    setRunning(false);
  }, [source, code.fnName, code.tests]);

  const finish = useCallback((auto = false) => {
    if (submitted.current) return;
    submitted.current = true;
    const score = results ? results.filter((r) => r.pass).length : 0;
    onComplete?.({
      score,
      total,
      detail: { tests: results || [], error, runs, solution: code.notes || [] }
    });
  }, [results, total, error, runs, code.notes, onComplete]);

  /* Al pasar todas las pruebas, enviar automáticamente (con una pausa para ver la retro). */
  if (allPass && !submitted.current) {
    setTimeout(() => finish(true), 900);
  }

  /* Tab → dos espacios (comodidad de editor). */
  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = source.slice(0, start) + '  ' + source.slice(end);
      setSource(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  };

  return (
    <div className="mission-engine code">
      <div className="grid code-grid" style={{ alignItems: 'start' }}>
        <Card className="code-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="code-bar">
            <span className="code-dots"><i /><i /><i /></span>
            <span className="code-file"><Icon name="Code" size={15} /> app.js</span>
            <span className="code-lang">{code.lang}</span>
          </div>
          <textarea
            ref={taRef}
            className="code-editor"
            value={source}
            spellCheck={false}
            onChange={(e) => setSource(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Editor de código"
          />
        </Card>

        <div className="stack gap-16">
          <Card className="card-pad">
            <div className="row gap-8 mb-8">
              <Icon name="Target" size={18} color="var(--area)" />
              <span className="bold small">Tu tarea</span>
            </div>
            <p className="dim small">{code.brief}</p>
            <div className="row gap-8 mt-16 wrap">
              <button type="button" className="btn btn-primary" onClick={run} disabled={running}>
                <Icon name={running ? 'Hourglass' : 'Play'} size={16} /> {running ? 'Ejecutando…' : 'Ejecutar pruebas'}
              </button>
              <button type="button" className="btn btn-soft btn-sm" onClick={() => setSource(code.starter)}>
                <Icon name="RotateCcw" size={15} /> Restaurar
              </button>
            </div>
          </Card>

          {error && (
            <div className="mission-note no">
              <Icon name="AlertTriangle" size={18} />
              <span className="small">{error}</span>
            </div>
          )}

          {results && !error && (
            <Card className="card-pad">
              <div className="row between mb-8">
                <span className="bold small">Pruebas automáticas</span>
                <span className={`badge ${allPass ? 'badge-ok' : 'badge-soft'}`}>
                  {passed}/{total} {allPass ? 'superadas' : 'correctas'}
                </span>
              </div>
              <ul className="test-list">
                {results.map((r) => (
                  <li key={r.id} className={`test-row ${r.pass ? 'ok' : 'no'}`}>
                    <span className="test-mark">{r.pass ? <Icon name="CheckCircle2" size={16} /> : <Icon name="XCircle" size={16} />}</span>
                    <span className="grow">
                      <span className="test-label">{r.label}</span>
                      {!r.pass && (
                        <span className="test-detail">
                          {r.error ? `Error: ${r.error}` : `Obtuviste ${format(r.got)} · se esperaba ${format(r.expect)}`}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {runs >= 1 && !allPass && (
                <div className="row gap-12 mt-16 wrap">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowHint((s) => !s)}>
                    <Icon name="Lightbulb" size={15} /> {showHint ? 'Ocultar pista' : 'Ver pista'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowSolution((s) => !s)}>
                    <Icon name="Eye" size={15} /> {showSolution ? 'Ocultar solución' : 'Ver solución'}
                  </button>
                </div>
              )}
            </Card>
          )}

          {showHint && <div className="mission-note soft"><Icon name="Lightbulb" size={18} /><span className="small">{code.hint}</span></div>}

          {showSolution && (
            <Card className="card-pad">
              <span className="bold small">Solución de referencia</span>
              <pre className="code-block"><code>{code.solution}</code></pre>
            </Card>
          )}

          {results && !allPass && (
            <button type="button" className="btn btn-soft" style={{ width: '100%' }} onClick={() => finish(false)}>
              <Icon name="ArrowRight" size={16} /> Enviar resultado actual ({passed}/{total})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function format(v) {
  if (Array.isArray(v)) return `[${v.join(', ')}]`;
  if (v && typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
