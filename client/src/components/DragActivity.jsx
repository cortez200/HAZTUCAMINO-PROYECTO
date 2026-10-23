import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

/* Motor de simulación por arrastrar y soltar (mouse y táctil).
   - modo 'ordenar': cada zona admite un objeto.
   - modo 'clasificar': cada zona admite varios.
   También funciona con clic: toca un objeto y luego una zona. */
export default function DragActivity({ activity, area, onComplete }) {
  const { items, slots, modo, instruccion } = activity;
  const [placed, setPlaced] = useState({});        // itemId -> slotId
  const [selected, setSelected] = useState(null);  // itemId por clic
  const [drag, setDrag] = useState(null);          // { itemId, x, y, dx, dy }
  const [hover, setHover] = useState(null);        // slotId bajo el puntero
  const [feedback, setFeedback] = useState(null);  // { itemId, ok, msg }
  const [mistakes, setMistakes] = useState(0);
  const completed = useRef(false);
  const feedbackTimer = useRef(null);

  const tray = items.filter((i) => placed[i.id] == null);
  const slotItems = (slotId) => items.filter((i) => placed[i.id] === slotId);
  const placedCount = items.length - tray.length;

  const flash = useCallback((fb) => {
    setFeedback(fb);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1500);
  }, []);

  const tryPlace = useCallback((itemId, slotId) => {
    if (itemId == null || slotId == null) return;
    if (placed[itemId] != null) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (modo === 'ordenar' && slotItems(slotId).length > 0) {
      flash({ itemId, ok: false, msg: 'Esa zona ya está ocupada.' });
      return;
    }
    if (item.correct === slotId) {
      setPlaced((p) => ({ ...p, [itemId]: slotId }));
      setSelected(null);
      flash({ itemId, ok: true, msg: item.pista });
    } else {
      setMistakes((m) => m + 1);
      flash({ itemId, ok: false, msg: 'No es la zona correcta. ¡Inténtalo otra vez!' });
    }
  }, [placed, items, modo, flash]);

  /* Arrastre con puntero (mouse + táctil). */
  useEffect(() => {
    if (!drag) return undefined;
    const move = (e) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest('[data-slot]');
      setHover(slotEl ? slotEl.getAttribute('data-slot') : null);
    };
    const up = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest('[data-slot]');
      if (slotEl) tryPlace(drag.itemId, slotEl.getAttribute('data-slot'));
      setDrag(null);
      setHover(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [drag, tryPlace]);

  /* ¿Terminó? Es cuando todos los objetos están bien colocados. */
  useEffect(() => {
    if (completed.current) return;
    if (placedCount === items.length) {
      completed.current = true;
      const score = Math.max(0, items.length - mistakes);
      const detail = {
        mistakes,
        items: items.map((it) => ({ id: it.id, label: it.label, correct: it.correct, pista: it.pista })),
        slots: slots.map((s) => ({ id: s.id, label: s.label, icon: s.icon })),
      };
      const t = setTimeout(() => onComplete?.({ score, total: items.length, detail }), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [placedCount, items.length, mistakes, onComplete]);

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  const startDrag = (e, itemId) => {
    if (placed[itemId] != null || e.button === 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({ itemId, x: e.clientX, y: e.clientY, dx: e.clientX - rect.left, dy: e.clientY - rect.top });
    setSelected(itemId);
  };

  const dragItem = drag ? items.find((i) => i.id === drag.itemId) : null;

  return (
    <div className={`activity ${modo}`}>
      <div className="activity-head">
        <span className="activity-ico"><Icon name={area.icon} size={20} /></span>
        <p className="grow small bold">{instruccion}</p>
        <span className="activity-count">{placedCount}<span>/{items.length}</span></span>
      </div>

      {/* Zonas */}
      <div className={`slot-grid slots-${slots.length}`}>
        {slots.map((s) => {
          const list = slotItems(s.id);
          const isHover = hover === s.id;
          const isSelectTarget = selected && placed[selected] == null;
          return (
            <button
              key={s.id}
              data-slot={s.id}
              type="button"
              onClick={() => selected && tryPlace(selected, s.id)}
              className={`slot ${isHover ? 'hover' : ''} ${list.length ? 'filled' : ''} ${isSelectTarget ? 'target' : ''}`}
            >
              <span className="slot-head">
                <Icon name={s.icon} size={15} />
                {s.label}
                {modo === 'clasificar' && <span className="slot-n">{list.length}</span>}
              </span>
              <span className="slot-body">
                {list.length === 0 && <span className="slot-empty">Suelta aquí</span>}
                {list.map((it) => (
                  <span key={it.id} className="chip-placed">
                    <Icon name={it.icon} size={15} /> {it.label}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bandeja */}
      <div className="tray">
        <div className="tray-title">
          <Icon name="Hand" size={15} /> Arrastra estos objetos
        </div>
        <div className="tray-items">
          {tray.length === 0 && <span className="dim small">¡Todo colocado!</span>}
          {tray.map((it) => {
            const isDragging = drag?.itemId === it.id;
            const fb = feedback?.itemId === it.id && !feedback.ok;
            return (
              <button
                key={it.id}
                type="button"
                onPointerDown={(e) => startDrag(e, it.id)}
                onClick={() => setSelected((sel) => (sel === it.id ? null : it.id))}
                className={`drag-chip ${selected === it.id ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${fb ? 'wrong' : ''}`}
                aria-pressed={selected === it.id}
              >
                <span className="drag-ico"><Icon name={it.icon} size={17} /></span>
                <span className="drag-txt">{it.label}</span>
                <Icon name="Hand" size={15} className="drag-grip" />
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className={`activity-fb ${feedback.ok ? 'ok' : 'no'}`}>
          <Icon name={feedback.ok ? 'CheckCircle2' : 'XCircle'} size={18} />
          <span className="small bold">{feedback.msg}</span>
        </div>
      )}

      <div className="activity-foot">
        <span className="small dim"><Icon name="XCircle" size={14} /> Errores: <b>{mistakes}</b></span>
        <span className="small dim">Toca un objeto y luego una zona, o arrástralo.</span>
      </div>

      {/* Fantasma del arrastre */}
      {dragItem && drag && (
        <span className="drag-ghost" style={{ left: drag.x - drag.dx, top: drag.y - drag.dy }}>
          <span className="drag-ico"><Icon name={dragItem.icon} size={17} /></span>
          <span className="drag-txt">{dragItem.label}</span>
        </span>
      )}
    </div>
  );
}
