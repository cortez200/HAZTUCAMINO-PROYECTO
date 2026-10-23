import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../Icon.jsx';

/* Reproductor de "cómo se resuelve": un recorrido animado y autocontenido que
   EXPLICA, paso a paso, cómo afrontar cada misión (el método y el razonamiento),
   generado a partir de los datos de cada reto. No muestra la respuesta final ni
   depende de videos externos, así que nunca queda un enlace roto. Se muestra
   cuando la misión no tiene un video (URL) configurado desde el panel. */

const SCENE_MS = 4600;

export default function SolutionDemo({ mission }) {
  const scenes = useMemo(() => buildScenes(mission), [mission]);
  const count = scenes.length;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [duration, setDuration] = useState(SCENE_MS);
  const bodyRef = useRef(null);

  const goTo = (i) => {
    setIndex(Math.max(0, Math.min(i, count - 1)));
    setCycle((c) => c + 1);
    setPlaying(true);
  };

  useEffect(() => {
    setIndex(0);
    setCycle((c) => c + 1);
    setPlaying(true);
  }, [mission?.id]);

  /* Da más tiempo a las escenas con más contenido para que se puedan leer. */
  useEffect(() => {
    const el = bodyRef.current;
    const overflow = el ? Math.max(0, el.scrollHeight - el.clientHeight) : 0;
    setDuration(Math.min(11000, SCENE_MS + overflow * 12));
  }, [index, mission?.id]);

  useEffect(() => {
    if (!playing || count <= 1) return undefined;
    const t = setTimeout(() => {
      if (index < count - 1) {
        setIndex(index + 1);
        setCycle((c) => c + 1);
      } else {
        setPlaying(false);
      }
    }, duration);
    return () => clearTimeout(t);
  }, [playing, index, count, duration]);

  if (!count) return null;
  const active = Math.min(index, count - 1);
  const scene = scenes[active];
  const atEnd = active >= count - 1;

  const onScreen = () => {
    if (!playing && atEnd) goTo(0);
    else setPlaying((p) => !p);
  };

  return (
    <div className="solution-demo">
      <div
        className="solution-demo-screen"
        onClick={onScreen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onScreen(); }
          if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
        }}
        aria-label={playing ? 'Pausar el recorrido' : 'Reproducir el recorrido'}
      >
        <div className="sd-stage" key={active}>
          <span className="sd-kicker">{scene.kicker}</span>
          <h4 className="sd-title">{scene.title}</h4>
          <div className="sd-body" ref={bodyRef}>{scene.body}</div>
        </div>
        <span className="sd-badge">{active + 1}/{count}</span>
        {!playing && <span className="sd-pause-hint"><Icon name="Play" size={22} /></span>}
      </div>

      <div className="sd-controls">
        <button type="button" className="sd-btn" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Anterior">
          <Icon name="ChevronLeft" size={16} />
        </button>
        <button type="button" className="sd-btn sd-btn-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar' : 'Reproducir'}>
          <Icon name={playing ? 'Pause' : 'Play'} size={18} />
        </button>
        <button type="button" className="sd-btn" onClick={() => goTo(active + 1)} disabled={atEnd} aria-label="Siguiente">
          <Icon name="ChevronRight" size={16} />
        </button>
        <button type="button" className="sd-btn" onClick={() => goTo(0)} aria-label="Repetir">
          <Icon name="RotateCcw" size={16} />
        </button>
        <div className="sd-progress">
          <span
            key={`${active}-${cycle}-${duration}`}
            className="sd-progress-fill"
            style={{ animationDuration: `${duration}ms`, animationPlayState: playing ? 'running' : 'paused' }}
          />
        </div>
        <span className="sd-count">Paso {active + 1} de {count}</span>
      </div>
    </div>
  );
}

/* ----------------------------- escenas ----------------------------- */

export function buildScenes(mission) {
  if (!mission) return [];
  const data = mission[mission.engine] || {};
  switch (mission.engine) {
    case 'decision': return decisionScenes(data, mission);
    case 'worksheet': return worksheetScenes(data, mission);
    case 'match': return matchScenes(data, mission);
    case 'allocate': return allocateScenes(data, mission);
    case 'drag': return dragScenes(data, mission);
    case 'code': return codeScenes(data, mission);
    default: return fallbackScenes(mission);
  }
}

/* DECISIÓN — enseña a leer el caso, reconocer los datos clave y razonar cada decisión. */
function decisionScenes(data, mission) {
  const scenes = [];
  const { dossier, findingsInstruccion, findings = [], steps = [] } = data;

  if (dossier?.secciones?.length) {
    scenes.push({
      kicker: 'Paso 1',
      title: 'Lee el caso con calma',
      body: (
        <>
          <ul className="sd-dossier">
            {dossier.secciones.slice(0, 4).map((s, i) => (
              <li key={i}>
                <b>{s.label}</b>
                <span>{s.valor || (s.items || []).join(' · ')}</span>
              </li>
            ))}
          </ul>
          <p className="sd-method"><Icon name="Info" size={15} /> {findingsInstruccion || 'Antes de decidir, ordena los datos y quédate con lo que explica el cuadro.'}</p>
        </>
      )
    });
  }

  const keyFindings = findings.filter((f) => f.key);
  if (keyFindings.length) {
    scenes.push({
      kicker: 'Paso 2',
      title: 'Reconoce los datos clave',
      body: (
        <>
          <p className="sd-hintline">Estos son los hallazgos a los que debes dar importancia y el porqué:</p>
          <ul className="sd-reasons">
            {keyFindings.map((f) => (
              <li key={f.id}><Icon name="Search" size={15} /><span><b>{f.text}.</b> {f.fb}</span></li>
            ))}
          </ul>
        </>
      )
    });
  }

  steps.forEach((st, i) => {
    const correct = (st.opciones || []).find((o) => o.ok);
    const wrongs = (st.opciones || []).filter((o) => !o.ok);
    scenes.push({
      kicker: `Paso ${i + 3}`,
      title: st.question || st.titulo,
      body: (
        <div className="sd-explain">
          <div className="sd-howto">
            <span className="sd-howto-label">Cómo decidir</span>
            <p>{correct?.fb}</p>
          </div>
          {wrongs.length > 0 && (
            <div className="sd-avoid">
              <span className="sd-howto-label">Errores frecuentes y por qué</span>
              <ul>
                {wrongs.map((o, j) => (
                  <li key={j}><Icon name="XCircle" size={14} /><span>{o.t} — {o.fb}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    });
  });

  return scenes.length ? scenes : fallbackScenes(mission);
}

/* CÁLCULOS — explica la fórmula y cómo sustituirla paso a paso. */
function worksheetScenes(data, mission) {
  const scenes = [];
  if (data.brief) {
    scenes.push({
      kicker: 'El método',
      title: 'Fórmulas y supuestos',
      body: (
        <>
          <p className="sd-text">{data.brief}</p>
          {data.hint && <p className="sd-method"><Icon name="Lightbulb" size={15} /> {data.hint}</p>}
        </>
      )
    });
  }
  (data.fields || []).forEach((f, i) => {
    scenes.push({
      kicker: `Paso ${i + 1}`,
      title: `Cómo calcular: ${f.label}`,
      body: (
        <div className="sd-explain">
          <div className="sd-howto">
            <span className="sd-howto-label">Plantea y sustituye</span>
            <p>{f.fb}</p>
          </div>
        </div>
      )
    });
  });
  return scenes.length ? scenes : fallbackScenes(mission);
}

/* EMPAREJAR — enseña a razonar cada asociación. */
function matchScenes(data, mission) {
  const scenes = [];
  const pairs = data.pairs || [];
  scenes.push({
    kicker: 'El método',
    title: 'Cómo emparejar',
    body: (
      <>
        {data.brief && <p className="sd-text">{data.brief}</p>}
        <p className="sd-method"><Icon name="Lightbulb" size={15} /> Para cada elemento del lado «{data.leftLabel || 'A'}» pregúntate qué hace o para qué sirve, y busca esa idea en «{data.rightLabel || 'B'}». Así descartas por significado, no por descarte.</p>
      </>
    )
  });
  if (pairs.length) {
    scenes.push({
      kicker: 'Paso a paso',
      title: 'Razona cada pareja',
      body: (
        <ul className="sd-reasons">
          {pairs.map((p) => (
            <li key={p.id}><Icon name="Puzzle" size={15} /><span><b>{p.left}:</b> {p.fb} <em className="sd-em">→ se empareja con «{p.right}».</em></span></li>
          ))}
        </ul>
      )
    });
  }
  return scenes;
}

/* REPARTO — explica el criterio de priorización, sin dar el reparto exacto. */
function allocateScenes(data, mission) {
  const scenes = [];
  const partidas = data.partidas || [];
  const total = data.total || partidas.reduce((s, p) => s + p.min, 0);

  scenes.push({
    kicker: `${data.recurso || 'Recurso'} · total ${total}`,
    title: 'Cómo repartir',
    body: (
      <>
        {data.brief && <p className="sd-text">{data.brief}</p>}
        {data.notes?.length
          ? <ul className="sd-method-list">{data.notes.map((n) => <li key={n}><Icon name="Lightbulb" size={14} /> <span>{n}</span></li>)}</ul>
          : <p className="sd-method"><Icon name="Lightbulb" size={15} /> Cubre primero el mínimo de lo esencial y reparte el resto sin pasarte del máximo.</p>}
      </>
    )
  });

  if (partidas.length) {
    scenes.push({
      kicker: 'Paso a paso',
      title: 'Decide partida por partida',
      body: (
        <ul className="sd-reasons">
          {partidas.map((p) => (
            <li key={p.id}><Icon name="Wallet" size={15} /><span><b>{p.label}</b> — elige entre el mínimo y el máximo recomendado: {p.fb}</span></li>
          ))}
        </ul>
      )
    });
  }
  return scenes;
}

/* CLASIFICAR — explica, con la pista de cada elemento, por qué va en cada grupo. */
function dragScenes(data, mission) {
  const scenes = [];
  const slots = data.slots || [];
  const items = data.items || [];

  scenes.push({
    kicker: 'El método',
    title: 'Cómo clasificar',
    body: <p className="sd-text">{data.instruccion || 'Lee cada elemento y pregúntate a qué categoría pertenece según su propósito.'}</p>
  });

  if (slots.length) {
    scenes.push({
      kicker: 'Paso a paso',
      title: 'Razona cada elemento',
      body: (
        <div className="sd-slots">
          {slots.map((s) => (
            <div key={s.id} className="sd-slot">
              <span className="sd-slot-head"><Icon name={s.icon} size={14} />{s.label}</span>
              <ul className="sd-pistas">
                {items.filter((it) => it.correct === s.id).map((it) => (
                  <li key={it.id}><b>{it.label}</b><span>{it.pista}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    });
  }
  return scenes;
}

/* CÓDIGO — explica qué lograr y cómo razonar la corrección; NO muestra la solución. */
function codeScenes(data, mission) {
  const scenes = [];

  scenes.push({
    kicker: 'Qué debes lograr',
    title: data.fnName ? `Objetivo: ${data.fnName}` : 'Objetivo',
    body: (
      <>
        <p className="sd-text">{mission.objetivo || data.brief || ''}</p>
        {data.hint && <p className="sd-method"><Icon name="Lightbulb" size={15} /> {data.hint}</p>}
      </>
    )
  });

  if (mission.entregables?.length) {
    scenes.push({
      kicker: 'Requisitos',
      title: 'Lo que debe cumplir',
      body: (
        <ul className="sd-checks">
          {mission.entregables.map((e) => <li key={e}><Icon name="CheckCircle2" size={15} /><span>{e}</span></li>)}
        </ul>
      )
    });
  }

  if (data.notes?.length) {
    scenes.push({
      kicker: 'Cómo pensarlo',
      title: 'Paso a paso para corregir',
      body: (
        <ul className="sd-reasons">
          {data.notes.map((n, i) => (
            <li key={i}><span className="sd-num">{i + 1}</span><span>{n}</span></li>
          ))}
        </ul>
      )
    });
  }

  const tests = data.tests || [];
  if (tests.length) {
    scenes.push({
      kicker: 'Cómo comprobar',
      title: 'Qué probarán las pruebas',
      body: (
        <ul className="sd-checks">
          {tests.map((t, i) => <li key={t.id || i}><Icon name="Target" size={15} /><span>{t.label || `Prueba ${i + 1}`}</span></li>)}
        </ul>
      )
    });
  }

  return scenes.length ? scenes : fallbackScenes(mission);
}

function fallbackScenes(mission) {
  return [{
    kicker: 'Cómo se resuelve',
    title: mission.titulo || 'La misión',
    body: <p className="sd-text">{mission.objetivo || mission.contexto || ''}</p>
  }];
}
