import { useCallback, useMemo, useRef, useState } from 'react';
import { Card } from '../ui.jsx';
import Icon from '../Icon.jsx';

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export default function MatchMission({ match, onComplete }) {
  const { pairs, brief, leftLabel, rightLabel, hint, notes } = match;
  const rights = useMemo(() => {
    const list = pairs.map((p) => ({ id: p.id, right: p.right }));
    return list.slice().sort((a, b) => hash(a.id) - hash(b.id));
  }, [pairs]);

  const [selected, setSelected] = useState(null);
  const [links, setLinks] = useState({});
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const submitted = useRef(false);

  const total = pairs.length;
  const correctCount = checked ? pairs.filter((p) => links[p.id] === p.id).length : 0;
  const allCorrect = checked && correctCount === total;
  const linkedCount = Object.keys(links).length;

  const assign = (rightId) => {
    if (checked || selected == null) return;
    setLinks((l) => {
      const next = {};
      for (const [k, v] of Object.entries(l)) if (v !== rightId && k !== selected) next[k] = v;
      next[selected] = rightId;
      return next;
    });
    setSelected(null);
  };

  const finish = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    onComplete?.({
      score: pairs.filter((p) => links[p.id] === p.id).length,
      total,
      detail: {
        pairs: pairs.map((p) => ({ id: p.id, left: p.left, right: p.right, ok: links[p.id] === p.id, chosen: links[p.id] || null, fb: p.fb })),
        notes: notes || []
      }
    });
  }, [pairs, links, total, notes, onComplete]);

  if (allCorrect && !submitted.current) {
    setTimeout(() => finish(), 900);
  }

  const rightLabelFor = (id) => pairs.find((p) => p.id === id)?.right;
  const leftLabelFor = (id) => pairs.find((p) => p.id === id)?.left;

  return (
    <div className="mission-engine match">
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card className="card-pad">
          <div className="row gap-8 mb-8">
            <Icon name="FileText" size={18} color="var(--area)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>El caso</h3>
          </div>
          <p className="dim small" style={{ marginTop: 0 }}>{brief}</p>
          {hint && (
            <div className="mission-note soft mt-16"><Icon name="Info" size={18} /><span className="small">{hint}</span></div>
          )}
        </Card>

        <Card className="card-pad">
          <div className="row between mb-8">
            <span className="bold small">Empareja cada elemento</span>
            <span className={`badge ${allCorrect ? 'badge-ok' : 'badge-soft'}`}>{linkedCount}/{total} enlazados</span>
          </div>
          <div className="match-grid">
            <div className="match-col">
              <span className="match-head">{leftLabel}</span>
              {pairs.map((p) => {
                const linked = links[p.id];
                const ok = checked && linked === p.id;
                const bad = checked && linked !== p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`match-item ${selected === p.id ? 'sel' : ''} ${linked ? 'linked' : ''} ${ok ? 'ok' : ''} ${bad ? 'no' : ''}`}
                    onClick={() => { if (!checked) setSelected((s) => (s === p.id ? null : p.id)); }}
                    disabled={checked}
                  >
                    <span className="match-txt">{p.left}</span>
                    <span className="match-link">
                      {linked ? <><Icon name="ArrowRight" size={12} /> {rightLabelFor(linked)}</> : <em>sin enlazar</em>}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="match-col">
              <span className="match-head">{rightLabel}</span>
              {rights.map((r) => {
                const owner = Object.keys(links).find((k) => links[k] === r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`match-item right ${owner ? 'linked' : ''} ${selected ? 'target' : ''}`}
                    onClick={() => assign(r.id)}
                    disabled={checked}
                  >
                    <span className="match-txt">{r.right}</span>
                    {owner && <span className="match-owner">{leftLabelFor(owner)}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="activity-foot" style={{ marginTop: 16 }}>
            <span className="small dim">Toca un elemento de la izquierda y luego su pareja de la derecha.</span>
          </div>

          {!checked ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => setChecked(true)}
              disabled={linkedCount === 0}
            >
              <Icon name="ClipboardCheck" size={18} /> Revisar emparejamiento
            </button>
          ) : !allCorrect ? (
            <div className="row gap-12 mt-16 wrap">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setChecked(false); setLinks({}); setSelected(null); }}>
                <Icon name="RotateCcw" size={15} /> Reintentar
              </button>
              <button type="button" className="btn btn-soft" onClick={finish}>
                <Icon name="ArrowRight" size={16} /> Enviar resultado ({correctCount}/{total})
              </button>
            </div>
          ) : (
            <p className="dim small mt-8"><Icon name="CheckCircle2" size={14} color="var(--ok)" /> ¡Todo correcto!</p>
          )}

          {checked && (
            <ul className="feedback-list mt-16">
              {pairs.map((p) => (
                <li key={p.id} className={links[p.id] === p.id ? 'ok' : 'no'}>
                  <Icon name={links[p.id] === p.id ? 'CheckCircle2' : 'XCircle'} size={16} />
                  <span><b>{p.left}.</b> {p.fb}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
