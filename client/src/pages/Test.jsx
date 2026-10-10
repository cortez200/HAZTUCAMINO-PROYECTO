import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PREGUNTAS, OPCIONES, area, isPremium, freeTestLimit } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { areaVars, Badge, Btn, Card, Progress } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

export default function Test() {
  const { account, submitTest } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
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
    const pts = optId === 'unknown' ? 0 : OPCIONES.find((o) => o.id === optId).pts;
    const nextAnswers = { ...answers, [q.id]: pts };
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
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 800, margin: '18px auto 0', maxWidth: 620 }}>
            {q.t}
          </h2>
        </div>

        <div className="grid cols-3" style={{ maxWidth: 720, margin: '0 auto' }}>
          {OPCIONES.map((o) => (
            <button
              key={o.id}
              className="card card-pad center"
              onClick={() => answer(o.id)}
              disabled={busy}
              style={{ cursor: 'pointer', borderColor: 'var(--border-strong)', gap: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 14px' }}
            >
              <span style={{ width: 50, height: 50, borderRadius: 14, display: 'grid', placeItems: 'center', background: o.tone === 'ok' ? 'var(--ok-soft)' : o.tone === 'mid' ? 'var(--warn-soft)' : 'var(--danger-soft)', color: o.tone === 'ok' ? 'var(--ok)' : o.tone === 'mid' ? 'var(--warn)' : 'var(--danger)' }}>
                <Icon name={o.icon} size={24} />
              </span>
              <span className="bold">{o.label}</span>
            </button>
          ))}
        </div>

        <div className="center mt-24">
          <button className="btn btn-ghost btn-sm" onClick={() => answer('unknown')} disabled={busy}>
            <Icon name="HelpCircle" size={16} /> Aún no lo sé / no aplica
          </button>
        </div>

        <hr className="divider" />
        <div className="row between">
          <Btn variant="outline" icon="ArrowLeft" disabled={index === 0 || busy} onClick={() => setIndex(index - 1)}>Atrás</Btn>
          <span className="muted small bold">{Object.keys(answers).length} respondidas</span>
        </div>
      </Card>
    </div>
  );
}
