import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PREGUNTAS, OPCIONES, area, isPremium, freeTestLimit } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { areaVars, Badge, Btn, Card, Progress } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

const TONO = {
  ok: { bg: 'var(--ok-soft)', fg: 'var(--ok)' },
  mid: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
  no: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  dim: { bg: 'var(--primary-soft)', fg: 'var(--primary)' }
};

export default function Test() {
  const { account, submitTest } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [phase, setPhase] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [unknown, setUnknown] = useState([]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const q = PREGUNTAS[index];
  const ar = area(q.area);
  const progress = (index / PREGUNTAS.length) * 100;

  const premium = isPremium(account);
  const attempts = account?.history?.length || 0;
  const limit = freeTestLimit();
  const blocked = !premium && attempts >= limit;

  const finish = async (finalAnswers, finalUnknown) => {
    setBusy(true);
    try {
      await submitTest({ answers: finalAnswers, unknown: finalUnknown });
      toast('Test completado. Mira tus resultados.', 'BarChart3');
      nav('/resultados');
    } catch (err) {
      toast(err.message, 'Info');
    } finally {
      setBusy(false);
    }
  };

  const answer = (optId) => {
    const opt = OPCIONES.find((o) => o.id === optId);
    if (!opt || busy) return;
    const nextAnswers = { ...answers, [q.id]: opt.pts };
    let nextUnknown = unknown;
    if (optId === 'unknown') {
      nextUnknown = unknown.includes(q.area) ? unknown : [...unknown, q.area];
    } else {
      nextUnknown = unknown.filter((a) => a !== q.area);
    }
    setAnswers(nextAnswers);
    setUnknown(nextUnknown);
    if (index + 1 >= PREGUNTAS.length) finish(nextAnswers, nextUnknown);
    else setIndex(index + 1);
  };

  const back = () => { if (index > 0 && !busy) setIndex(index - 1); };

  /* Atajos de teclado: A/B/C/D responden, flecha izquierda retrocede,
     Enter empieza el test desde la portada. */
  useEffect(() => {
    const onKey = (e) => {
      if (busy) return;
      if (phase === 'intro') {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPhase('test'); }
        return;
      }
      const k = (e.key || '').toLowerCase();
      const opt = OPCIONES.find((o) => (o.letra || '').toLowerCase() === k);
      if (opt) { e.preventDefault(); answer(opt.id); }
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (blocked) {
    return (
      <Card className="card-pad center" style={{ padding: '48px 24px' }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Icon name="Lock" size={26} />
        </div>
        <Badge tone="gold" icon="Sparkles">Función Premium</Badge>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 14 }}>Ya usaste tus {limit} tests gratis</h2>
        <p className="dim mt-8" style={{ maxWidth: 460, margin: '8px auto 0' }}>
          Ya viste tus áreas y tu carrera recomendada. Activa Premium para hacer tests ilimitados y comparar tus resultados.
        </p>
        <div className="row gap-12 mt-24" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/planes" className="btn btn-primary btn-lg"><Icon name="Sparkles" size={18} /> Comprar Premium</Link>
          <Link to="/resultados" className="btn btn-outline">Ver mis resultados</Link>
        </div>
      </Card>
    );
  }

  if (phase === 'intro') {
    return (
      <div style={areaVars(ar)}>
        <div className="page-head">
          <div>
            <h1 className="page-title">Test vocacional</h1>
            <p className="page-sub">Responde con sinceridad: no hay respuestas correctas.</p>
          </div>
          <Badge tone="soft" icon="Clock">≈ 10 minutos</Badge>
        </div>

        <Card style={{ maxWidth: 720, margin: '0 auto', padding: 0, overflow: 'hidden', position: 'relative', boxShadow: '0 24px 60px -34px rgba(47,79,209,.45)' }}>
          <div style={{ height: 6, background: 'linear-gradient(90deg, var(--primary), var(--teal) 55%, var(--violet))' }} />
          <div style={{ padding: '30px 34px 28px', position: 'relative' }}>
            <span aria-hidden style={{ position: 'absolute', top: -70, right: -70, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,.16), transparent 70%)', pointerEvents: 'none' }} />
            <span aria-hidden style={{ position: 'absolute', bottom: -80, left: -80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,148,133,.14), transparent 70%)', pointerEvents: 'none' }} />

            <div className="center" style={{ position: 'relative' }}>
              <span style={{ width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg, var(--primary), var(--violet))', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 12px', boxShadow: '0 12px 26px -12px rgba(47,79,209,.75)' }}>
                <Icon name="Compass" size={26} />
              </span>
              <Badge tone="soft" icon="Sparkles">Haz Tu Camino · Test vocacional</Badge>

              <h2 style={{ fontSize: 'clamp(1.35rem, 3.2vw, 1.8rem)', fontWeight: 800, margin: '14px auto 0', maxWidth: 560, lineHeight: 1.28, letterSpacing: '-.01em' }}>
                Tu futuro no se descubre esperando, sino atreviéndote a dar el primer paso.{' '}
                <span style={{ color: 'var(--primary)' }}>¡Hoy comienza tu camino!</span>
              </h2>
            </div>

            <div className="grid cols-3 mt-24" style={{ position: 'relative' }}>
              {[
                { icon: 'User', t: 'Sé tú mismo', d: 'No respondas lo que otros esperan de ti.', bg: 'var(--primary-soft)', fg: 'var(--primary)' },
                { icon: 'ChevronRight', t: 'Ve paso a paso', d: 'Concéntrate en la que tienes delante.', bg: 'var(--teal-soft)', fg: 'var(--teal)' },
                { icon: 'Zap', t: 'No te rindas', d: 'Cada respuesta te acerca a conocerte.', bg: 'var(--warn-soft)', fg: 'var(--warn)' }
              ].map((b) => (
                <div key={b.t} className="card card-pad" style={{ textAlign: 'left', padding: 16, borderColor: 'var(--border-strong)' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: b.bg, color: b.fg, display: 'grid', placeItems: 'center', marginBottom: 9 }}>
                    <Icon name={b.icon} size={17} />
                  </span>
                  <span className="bold" style={{ display: 'block', fontSize: '.95rem', lineHeight: 1.3 }}>{b.t}</span>
                  <span className="dim small" style={{ display: 'block', marginTop: 5, lineHeight: 1.45 }}>{b.d}</span>
                </div>
              ))}
            </div>

            <p className="bold center mt-24" style={{ fontSize: '1rem', lineHeight: 1.5, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
              <Icon name="PenTool" size={16} style={{ verticalAlign: '-3px', marginRight: 6, color: 'var(--violet)' }} />
              Tu historia la escribes tú: respira, confía en ti y empieza.
            </p>

            <div className="center mt-24" style={{ position: 'relative' }}>
              <button
                className="btn btn-lg"
                onClick={() => setPhase('test')}
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--violet))', color: '#fff', border: 'none', padding: '14px 28px', boxShadow: '0 16px 30px -14px rgba(47,79,209,.8)' }}
              >
                ¡Quiero descubrir mi camino! <Icon name="ArrowRight" size={18} />
              </button>
              <p className="dim small" style={{ margin: '14px auto 0', lineHeight: 1.6 }}>
                Puedes volver atrás y revisar tus respuestas · Responde con <strong>A</strong> · <strong>B</strong> · <strong>C</strong> · <strong>D</strong> o elige en pantalla.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={areaVars(ar)}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Test vocacional</h1>
          <p className="page-sub">Responde con sinceridad: no hay respuestas correctas.</p>
        </div>
        {!premium ? (
          <Badge tone="soft" icon="Info">Intento {Math.min(attempts + 1, limit)} de {limit} gratis</Badge>
        ) : account?.done ? (
          <Badge tone="soft" icon="Info">Ya lo hiciste · lo estás repitiendo</Badge>
        ) : null}
      </div>

      <Card className="card-pad">
        <div className="row between small bold dim">
          <span>Pregunta {index + 1} de {PREGUNTAS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} area style={{ margin: '10px 0 24px' }} />

        <div className="center" style={{ padding: '10px 0 26px' }}>
          <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
          <h2 style={{ fontSize: 'clamp(1.2rem, 2.6vw, 1.6rem)', fontWeight: 800, margin: '18px auto 0', maxWidth: 680, lineHeight: 1.35 }}>
            {q.t}
          </h2>
        </div>

        <div className="grid cols-4" style={{ maxWidth: 860, margin: '0 auto' }}>
          {OPCIONES.map((o) => {
            const tono = TONO[o.tone] || TONO.dim;
            return (
              <button
                key={o.id}
                className="card card-pad center"
                onClick={() => answer(o.id)}
                disabled={busy}
                title={`Tecla ${o.letra}`}
                style={{ cursor: 'pointer', borderColor: 'var(--border-strong)', gap: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', position: 'relative' }}
              >
                <span
                  className="bold small"
                  style={{ position: 'absolute', top: 10, left: 10, width: 24, height: 24, borderRadius: 7, display: 'grid', placeItems: 'center', background: 'var(--surface-2, rgba(0,0,0,.05))', color: 'var(--muted)' }}
                >
                  {o.letra}
                </span>
                <span style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: tono.bg, color: tono.fg }}>
                  <Icon name={o.icon} size={23} />
                </span>
                <span className="bold" style={{ fontSize: '.92rem', lineHeight: 1.3 }}>{o.label}</span>
              </button>
            );
          })}
        </div>

        <hr className="divider" />
        <div className="row between">
          <Btn variant="outline" icon="ArrowLeft" disabled={index === 0 || busy} onClick={back}>Atrás</Btn>
          <span className="muted small bold">{Object.keys(answers).length} respondidas</span>
        </div>
      </Card>
    </div>
  );
}
