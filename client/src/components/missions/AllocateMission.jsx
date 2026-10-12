import { useCallback, useMemo, useRef, useState } from 'react';
import { Card, Progress } from '../ui.jsx';
import Icon from '../Icon.jsx';

export default function AllocateMission({ allocate, onComplete }) {
  const { partidas, brief, recurso, total, step = 1, hint, notes } = allocate;
  const [alloc, setAlloc] = useState(() => Object.fromEntries(partidas.map((p) => [p.id, 0])));
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const submitted = useRef(false);

  const spent = useMemo(() => partidas.reduce((s, p) => s + (Number(alloc[p.id]) || 0), 0), [partidas, alloc]);
  const remaining = total - spent;
  const total_p = partidas.length;
  const inRange = (p) => alloc[p.id] >= p.min && alloc[p.id] <= p.max;
  const correctCount = checked ? partidas.filter(inRange).length : 0;
  const allCorrect = checked && correctCount === total_p;
  const full = remaining === 0;

  const change = (id, delta) => {
    if (checked) return;
    setAlloc((a) => {
      const next = Math.max(0, (Number(a[id]) || 0) + delta);
      const others = partidas.reduce((s, p) => (p.id === id ? s : s + (Number(a[p.id]) || 0)), 0);
      const capped = Math.min(next, total - others);
      return { ...a, [id]: capped };
    });
  };

  const finish = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    onComplete?.({
      score: partidas.filter((p) => alloc[p.id] >= p.min && alloc[p.id] <= p.max).length,
      total: total_p,
      detail: {
        partidas: partidas.map((p) => ({ id: p.id, label: p.label, monto: alloc[p.id], min: p.min, max: p.max, ok: alloc[p.id] >= p.min && alloc[p.id] <= p.max, fb: p.fb })),
        spent, budget: total, notes: notes || []
      }
    });
  }, [partidas, alloc, total_p, spent, total, notes, onComplete]);

  if (allCorrect && !submitted.current) {
    setTimeout(() => finish(), 900);
  }

  return (
    <div className="mission-engine allocate">
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card className="card-pad mission-dossier">
          <div className="row gap-8 mb-8">
            <Icon name="Wallet" size={18} color="var(--area)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{recurso}</h3>
          </div>
          <p className="dim small" style={{ marginTop: 0 }}>{brief}</p>
          {hint && (
            <div className="mission-note soft mt-16"><Icon name="Info" size={18} /><span className="small">{hint}</span></div>
          )}
          <hr className="divider" />
          <div className="alloc-summary">
            <span className="hud-stat"><b>{total}</b><em>{recurso}</em></span>
            <span className="hud-stat"><b style={{ color: full ? 'var(--ok)' : 'var(--primary)' }}>{remaining}</b><em>por asignar</em></span>
          </div>
          <Progress value={Math.round((spent / total) * 100)} area style={{ marginTop: 12 }} />
        </Card>

        <Card className="card-pad">
          <div className="row between mb-8">
            <span className="bold small">Reparte el recurso</span>
            <span className={`badge ${full ? 'badge-ok' : 'badge-soft'}`}>{checkeLabel(full, spent, total)}</span>
          </div>
          <div className="alloc-list">
            {partidas.map((p) => {
              const v = alloc[p.id];
              const r = checked ? inRange(p) : null;
              const cls = r === null ? '' : r ? 'ok' : 'no';
              return (
                <div key={p.id} className={`alloc-row ${cls}`}>
                  <div className="alloc-head">
                    <b>{p.label}</b>
                    {p.detalle && <span className="dim small">{p.detalle}</span>}
                  </div>
                  <div className="alloc-controls">
                    <button type="button" className="alloc-btn" onClick={() => change(p.id, -step)} disabled={checked || v <= 0} aria-label="Quitar">
                      <Icon name="ChevronLeft" size={16} />
                    </button>
                    <span className="alloc-val">{v}</span>
                    <button type="button" className="alloc-btn" onClick={() => change(p.id, step)} disabled={checked || remaining < step} aria-label="Añadir">
                      <Icon name="ChevronRight" size={16} />
                    </button>
                  </div>
                  {checked && <span className={`alloc-fb ${r ? 'ok' : 'no'}`}>{r ? p.fb : `Fuera del rango recomendado (${p.min}–${p.max}). ${p.fb}`}</span>}
                </div>
              );
            })}
          </div>

          <div className="row gap-8 mt-16 wrap">
            {!checked ? (
              <>
                <button type="button" className="btn btn-primary" onClick={() => setChecked(true)} disabled={!full}>
                  <Icon name="ClipboardCheck" size={16} /> Revisar reparto
                </button>
                <button type="button" className="btn btn-soft btn-sm" onClick={() => { setAlloc(Object.fromEntries(partidas.map((p) => [p.id, 0]))); }}>
                  <Icon name="RotateCcw" size={15} /> Limpiar
                </button>
                {!full && <span className="small dim">Asigna todo el recurso para revisar.</span>}
              </>
            ) : !allCorrect ? (
              <>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setChecked(false)}>
                  <Icon name="RotateCcw" size={15} /> Ajustar
                </button>
                <button type="button" className="btn btn-soft" onClick={finish}>
                  <Icon name="ArrowRight" size={16} /> Enviar resultado ({correctCount}/{total_p})
                </button>
              </>
            ) : (
              <span className="small" style={{ color: 'var(--ok)' }}><Icon name="CheckCircle2" size={14} /> ¡Reparto correcto!</span>
            )}
          </div>

          {notes && notes.length > 0 && checked && !allCorrect && (
            <button type="button" className="btn btn-outline btn-sm mt-16" onClick={() => setShowHint((s) => !s)}>
              <Icon name="Lightbulb" size={15} /> {showHint ? 'Ocultar explicación' : 'Ver explicación'}
            </button>
          )}
          {showHint && notes && notes.length > 0 && (
            <ul className="mission-checklist mt-16">
              {notes.map((n) => <li key={n}><Icon name="Lightbulb" size={15} /> <span>{n}</span></li>)}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function checkeLabel(full, spent, total) {
  if (full) return 'Reparto completo';
  return `${spent}/${total} asignado`;
}
