import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ADMISSION_AREAS,
  ADMISSION_QUESTIONS,
  REAL_EXAMS,
  ADMISSION_COPY
} from '../lib/admission.js';
import { Badge, Btn, Card, Progress } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const ALL = 'todas';

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Examenes() {
  const [tab, setTab] = useState('practica');
  const [filter, setFilter] = useState(ALL);
  const [examFilter, setExamFilter] = useState(ALL);
  const [mode, setMode] = useState('practica');
  const [order, setOrder] = useState(() => ADMISSION_QUESTIONS.map((q) => q.id));
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const byId = useMemo(() => new Map(ADMISSION_QUESTIONS.map((q) => [q.id, q])), []);
  const filtered = useMemo(
    () => (filter === ALL ? ADMISSION_QUESTIONS : ADMISSION_QUESTIONS.filter((q) => q.area === filter)),
    [filter]
  );
  const exams = useMemo(
    () => (examFilter === ALL ? REAL_EXAMS : REAL_EXAMS.filter((e) => e.uni === examFilter)),
    [examFilter]
  );

  useEffect(() => {
    setMode('practica');
    setOrder(filtered.map((q) => q.id));
    setIdx(0);
    setChoice(null);
    setChecked(false);
    setAnswers({});
    setDone(false);
  }, [filtered]);

  useEffect(() => {
    if (mode !== 'examen' || done) return;
    if (seconds <= 0) { setDone(true); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, seconds, done]);

  const current = byId.get(order[idx]);
  const score = order.reduce((n, id) => n + (answers[id] === byId.get(id)?.answer ? 1 : 0), 0);
  const total = order.length || 1;
  const pct = Math.round((score / total) * 100);
  const answeredCount = Object.keys(answers).length;

  const restart = () => {
    setMode('practica');
    setOrder(shuffle(filtered).map((q) => q.id));
    setIdx(0);
    setChoice(null);
    setChecked(false);
    setAnswers({});
    setDone(false);
  };

  const startExam = () => {
    const pool = filtered.length >= 10 ? filtered : ADMISSION_QUESTIONS;
    setMode('examen');
    setOrder(shuffle(pool).slice(0, 10).map((q) => q.id));
    setIdx(0);
    setChoice(null);
    setChecked(false);
    setAnswers({});
    setDone(false);
    setSeconds(600);
  };

  const check = () => {
    if (choice == null) return;
    setChecked(true);
    setAnswers((a) => ({ ...a, [current.id]: choice }));
  };

  const next = () => {
    if (choice != null) setAnswers((a) => ({ ...a, [current.id]: choice }));
    if (idx + 1 >= order.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setChoice(null);
    setChecked(false);
  };

  const goBack = () => {
    if (idx === 0) return;
    setIdx((i) => i - 1);
    setChoice(answers[order[idx - 1]] ?? null);
    setChecked(false);
  };

  const optionClass = (i) => {
    if (mode === 'practica' && checked && current) {
      if (i === current.answer) return 'exam-option correct';
      if (i === choice) return 'exam-option wrong';
      return 'exam-option';
    }
    if (done && current) {
      if (i === current.answer) return 'exam-option correct';
      if (i === answers[current.id]) return 'exam-option wrong';
    }
    return `exam-option ${choice === i ? 'on' : ''}`;
  };

  return (
    <div>
      <section className="exam-hero">
        <div>
          <span className="exam-source"><Icon name="BadgeCheck" size={14} color="var(--accent)" /> Preparación de admisión · {ADMISSION_COPY.updatedAt}</span>
          <h1 style={{ marginTop: 16 }}>Banco de preguntas y exámenes reales</h1>
          <p style={{ marginTop: 14, maxWidth: 600, lineHeight: 1.65 }}>
            Entrena por curso, revisa la explicación de cada respuesta y contrasta tu nivel con
            solucionarios oficiales de las universidades más competitivas del Perú.
          </p>
          <div className="row gap-12 wrap mt-24">
            <Btn variant="primary" size="lg" icon="Play" onClick={() => { setTab('practica'); restart(); }}>
              Practicar ahora
            </Btn>
            <Btn variant="outline" size="lg" icon="FileText" onClick={() => setTab('evidencias')} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.42)', color: '#fff' }}>
              Ver exámenes reales
            </Btn>
          </div>
        </div>
        <div className="stat-band" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="stat"><div className="k">{ADMISSION_QUESTIONS.length}</div><div className="l">preguntas explicadas</div></div>
          <div className="stat"><div className="k">{REAL_EXAMS.length}</div><div className="l">fuentes oficiales</div></div>
          <div className="stat"><div className="k">6</div><div className="l">cursos</div></div>
          <div className="stat"><div className="k">10 min</div><div className="l">practica</div></div>
        </div>
      </section>

      <div className="row between wrap gap-16 mt-24">
        <div className="exam-tabs">
          <button className={`exam-tab ${tab === 'practica' ? 'on' : ''}`} onClick={() => setTab('practica')}>Banco de preguntas</button>
          <button className={`exam-tab ${tab === 'evidencias' ? 'on' : ''}`} onClick={() => setTab('evidencias')}>Exámenes reales</button>
        </div>
        <span className="tiny muted row gap-6"><Icon name="ShieldCheck" size={15} /> Enlaces a fuentes oficiales</span>
      </div>

      {tab === 'practica' ? (
        <section className="mt-16">
          <div className="row between wrap gap-12 mb-16">
            <div className="row wrap gap-8">
              <button className={`chip ${filter === ALL ? 'on' : ''}`} onClick={() => setFilter(ALL)}>Todas</button>
              {ADMISSION_AREAS.map((a) => (
                <button key={a.id} className={`chip ${filter === a.id ? 'on' : ''}`} onClick={() => setFilter(a.id)}>{a.label}</button>
              ))}
            </div>
            <div className="row gap-8">
              {mode === 'examen' && !done && (
                <span className="badge badge-warn row gap-6"><Icon name="Timer" size={14} /> {fmt(seconds)}</span>
              )}
              <Btn variant="outline" size="sm" icon="Shuffle" onClick={startExam}>Practica de 10 preguntas</Btn>
            </div>
          </div>

          {done ? (
            <Card className="card-pad">
              <div className="row between wrap gap-16">
                <div>
                  <div className="tiny muted bold">{mode === 'examen' ? 'RESULTADO DEL EXAMEN' : 'RESULTADO DE LA PRÁCTICA'}</div>
                  <div style={{ fontSize: '2.3rem', fontWeight: 800, marginTop: 4 }}>{score} / {order.length}</div>
                  <div className="small dim">{pct}% de respuestas correctas · {answeredCount} respondidas</div>
                </div>
                <div className="row gap-8 wrap">
                  <Btn variant="outline" icon="RotateCcw" onClick={restart}>Repetir</Btn>
                  <Btn variant="primary" icon="Play" onClick={startExam}>Nueva practica</Btn>
                </div>
              </div>
              <Progress value={pct} style={{ marginTop: 18 }} />
              <div className="divider" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Revisión rápida</h3>
              <div className="stack gap-8 mt-12">
                {order.map((id, i) => {
                  const q = byId.get(id);
                  const ok = answers[id] === q.answer;
                  return (
                    <div key={id} className="row between gap-12 wrap" style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 12 }}>
                      <span className="small dim" style={{ flex: 1, minWidth: 220 }}>{i + 1}. {q.q}</span>
                      <span className={`badge ${ok ? 'badge-ok' : 'badge-warn'}`}>{ok ? 'Correcta' : 'Incorrecta'}</span>
                    </div>
                  );
                })}
              </div>
              <p className="tiny muted mt-16">{ADMISSION_COPY.disclaimer}</p>
            </Card>
          ) : current ? (
            <Card className="card-pad">
              <div className="row between wrap gap-8 mb-16">
                <div className="row gap-8 wrap">
                  <Badge tone="primary" icon="BookOpen">{ADMISSION_AREAS.find((a) => a.id === current.area)?.label}</Badge>
                  <Badge tone="soft">Estilo {current.uni}</Badge>
                  <Badge tone="soft">{current.nivel}</Badge>
                </div>
                <span className="small muted bold">{mode === 'examen' ? `Pregunta ${idx + 1} de ${order.length}` : `${idx + 1} / ${order.length}`}</span>
              </div>

              <div className="exam-progress mb-16">
                {order.map((id, i) => {
                  const cls = answers[id] === byId.get(id)?.answer ? 'ok' : answers[id] != null ? 'bad' : '';
                  return <span key={id} className={`exam-dot ${cls} ${i === idx ? 'now' : ''}`} />;
                })}
              </div>

              <h2 className="exam-q">{current.q}</h2>
              <div className="stack gap-8 mt-24">
                {current.options.map((op, i) => (
                  <button
                    key={op}
                    className={optionClass(i)}
                    onClick={() => { if (!checked && !done) setChoice(i); }}
                    disabled={(mode === 'practica' && checked) || done}
                  >
                    <span className="letter">{LETTERS[i]}</span>
                    <span>{op}</span>
                  </button>
                ))}
              </div>

              {(checked || done) && (
                <div className="card card-pad mt-16" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
                  <div className="row gap-8 bold"><Icon name="Lightbulb" size={18} color="var(--primary)" /> Respuesta correcta: {LETTERS[current.answer]}</div>
                  <p className="small dim mt-8">{current.why}</p>
                </div>
              )}

              <div className="row between gap-8 mt-24 wrap">
                <Btn variant="ghost" icon="ArrowLeft" onClick={goBack} disabled={idx === 0}>Anterior</Btn>
                <div className="row gap-8 wrap">
                  {mode === 'practica' && !checked && (
                    <Btn variant="primary" icon="CheckCircle2" onClick={check} disabled={choice == null}>Comprobar</Btn>
                  )}
                  <Btn
                    variant={mode === 'examen' || checked ? 'primary' : 'outline'}
                    iconRight="ArrowRight"
                    onClick={next}
                    disabled={choice == null}
                  >
                    {idx + 1 >= order.length ? (mode === 'examen' ? 'Finalizar' : 'Ver resultado') : 'Siguiente'}
                  </Btn>
                </div>
              </div>
            </Card>
          ) : null}
        </section>
      ) : (
        <section className="mt-16">
          <div className="row between wrap gap-12 mb-16">
            <div>
              <h2 className="section-title" style={{ fontSize: '1.45rem' }}>Exámenes y fuentes oficiales</h2>
              <p className="section-sub" style={{ fontSize: '.95rem' }}>Abre el documento original en la web de cada universidad.</p>
            </div>
            <div className="row wrap gap-8">
              <button className={`chip ${examFilter === ALL ? 'on' : ''}`} onClick={() => setExamFilter(ALL)}>Todas</button>
              {['UNI', 'UNMSM', 'PUCP'].map((u) => (
                <button key={u} className={`chip ${examFilter === u ? 'on' : ''}`} onClick={() => setExamFilter(u)}>{u}</button>
              ))}
            </div>
          </div>

          <div className="exam-evidence">
            {exams.map((e) => (
              <div className="exam-evidence-card" key={e.id}>
                <div className="row between gap-8">
                  <Badge tone="primary">{e.uni}</Badge>
                  <span className="tiny muted bold">{e.year}</span>
                </div>
                <div className="bold" style={{ lineHeight: 1.35 }}>{e.title}</div>
                <div className="tiny dim">{e.note}</div>
                <a href={e.url} target="_blank" rel="noreferrer" className="row gap-4 mt-8">
                  Ver documento oficial <Icon name="ExternalLink" size={13} />
                </a>
              </div>
            ))}
          </div>

          <Card className="card-pad mt-24" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
            <div className="row gap-8 bold"><Icon name="Info" size={18} color="var(--primary)" /> Cómo usar esta evidencia</div>
            <p className="small dim mt-8">
              Elige un examen real, resuélvelo con cronómetro y luego compara tus respuestas con el solucionario.
              Las preguntas de práctica de esta página están calibradas con ese formato, pero no son una copia textual
              de los exámenes oficiales. {ADMISSION_COPY.disclaimer}
            </p>
          </Card>
        </section>
      )}

      <section className="section-navy mt-32">
        <div className="row between wrap gap-16">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.45rem' }}>Conecta tu práctica con tu vocación</h2>
            <p className="section-sub" style={{ marginTop: 6 }}>Si aún no sabes qué carrera elegir, empieza por el test vocacional.</p>
          </div>
          <div className="row gap-10 wrap">
            <Link to="/test" className="btn" style={{ background: 'var(--accent)', color: 'var(--navy)' }}>Hacer el test</Link>
            <Link to="/carreras" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,.4)', color: '#fff', background: 'transparent' }}>Ver carreras</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
