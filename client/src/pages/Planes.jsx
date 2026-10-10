import { useState } from 'react';
import { useAuth, useToast } from '../lib/store.jsx';
import { PLANS, planById } from '../lib/data.js';
import { Badge, Btn, Card, Modal } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

const PLAN_ICON = { free: 'Gift', premium: 'Sparkles', super: 'Trophy' };
const onlyDigits = (s) => (s || '').replace(/\D/g, '');
const fmtCard = (v) => onlyDigits(v).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExp = (v) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function Feature({ children, on }) {
  return (
    <li className="row gap-8 small" style={{ padding: '7px 0' }}>
      <Icon name={on ? 'CheckCircle2' : 'XCircle'} size={17} color={on ? 'var(--ok)' : 'var(--muted)'} />
      <span className={on ? '' : 'dim'}>{children}</span>
    </li>
  );
}

function formatUntil(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return null; }
}

const EMPTY_CARD = { number: '', name: '', exp: '', cvv: '' };

export default function Planes() {
  const { account, subscribe, cancelPlan } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(null);
  const [step, setStep] = useState('form');
  const [card, setCard] = useState(EMPTY_CARD);
  const [busy, setBusy] = useState(false);
  const current = account?.plan || 'free';
  const premium = current === 'premium' || current === 'super';
  const currentPlan = planById(current);
  const until = formatUntil(account?.planUntil);
  const setField = (k) => (e) => setCard((c) => ({ ...c, [k]: e.target.value }));

  const openPlan = (p) => {
    setCard(EMPTY_CARD);
    setStep(p.id === 'free' ? 'confirm' : 'form');
    setOpen(p);
  };

  const closeModal = () => { if (!busy) setOpen(null); };

  const confirmFree = async () => {
    setBusy(true);
    try {
      const r = await cancelPlan();
      setOpen(null);
      toast(r.notice, 'Info');
    } catch (e) { toast(e.message, 'Info'); }
    finally { setBusy(false); }
  };

  const pay = async () => {
    if (!open || open.id === 'free') return;
    if (onlyDigits(card.number).length < 16) return toast('Ingresa los 16 dígitos de tu tarjeta.', 'Info');
    if (!card.name.trim()) return toast('Ingresa el nombre del titular.', 'Info');
    if (onlyDigits(card.exp).length !== 4) return toast('Ingresa la fecha de vencimiento (MM/AA).', 'Info');
    if (onlyDigits(card.cvv).length < 3) return toast('Ingresa el CVV de tu tarjeta.', 'Info');
    setBusy(true);
    setStep('processing');
    try {
      await new Promise((r) => setTimeout(r, 1400));
      await subscribe(open.id);
      setStep('success');
    } catch (e) {
      toast(e.message, 'Info');
      setStep('form');
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Planes</h1>
          <p className="page-sub">Empieza gratis. Desbloquea todo cuando quieras.</p>
        </div>
        {premium && <Badge tone="primary" icon={PLAN_ICON[current]}>{currentPlan?.nombre}</Badge>}
      </div>

      <div className="grid cols-3">
        {PLANS.map((p) => {
          const isCurrent = p.id === current;
          const highlight = p.destacado;
          return (
            <Card
              key={p.id}
              className="card-pad"
              style={highlight ? { borderColor: 'var(--primary)', boxShadow: 'var(--shadow)' } : undefined}
            >
              <div className="row between">
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{p.nombre}</h3>
                {isCurrent ? <Badge tone="soft">Plan actual</Badge>
                  : highlight ? <Badge tone="gold" icon="Sparkles">Recomendado</Badge> : null}
              </div>
              <p className="muted small mt-8">{p.tagline}</p>
              <div className="row gap-8 mt-8" style={{ alignItems: 'baseline' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{p.moneda} {p.precio}</span>
                <span className="muted small">{p.periodo}</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '16px 0 20px', padding: 0 }}>
                {p.features.map((f) => <Feature key={f.t} on={f.on}>{f.t}</Feature>)}
              </ul>
              {isCurrent ? (
                <Btn variant="soft" className="btn-block" icon={PLAN_ICON[p.id]} disabled>Tu plan actual</Btn>
              ) : p.id === 'free' ? (
                <Btn variant="outline" className="btn-block" onClick={() => openPlan(p)} disabled={busy}>Volver al Básico</Btn>
              ) : (
                <Btn variant={highlight ? 'primary' : 'outline'} className="btn-block" icon={PLAN_ICON[p.id]} onClick={() => openPlan(p)}>
                  Activar {p.nombre}
                </Btn>
              )}
            </Card>
          );
        })}
      </div>

      {premium && (
        <Card className="card-pad mt-16 row between wrap gap-12" style={{ background: 'var(--surface-2)', border: 0 }}>
          <div>
            <div className="row gap-8 bold"><Icon name={PLAN_ICON[current]} size={18} color="var(--primary)" /> Estás en {currentPlan?.nombre}</div>
            {until && <p className="muted small mt-8">Válido hasta el {until}.</p>}
          </div>
          <Btn variant="outline" size="sm" onClick={() => openPlan(planById('free'))} disabled={busy}>Volver al plan Básico</Btn>
        </Card>
      )}

      <Modal open={!!open} onClose={closeModal}>
        {open && (
          <>
            <div className="row gap-12 mb-16">
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                <Icon name={PLAN_ICON[open.id]} size={22} />
              </span>
              <div>
                <h3 style={{ fontWeight: 800 }}>{open.id === 'free' ? 'Volver al plan Básico' : `Activar ${open.nombre}`}</h3>
                <p className="muted small">{open.moneda} {open.precio} {open.periodo}</p>
              </div>
            </div>

            {step === 'success' ? (
              <div className="center" style={{ padding: '10px 0 4px' }}>
                <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--ok-soft)', color: 'var(--ok)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                  <Icon name="CheckCircle2" size={36} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.35rem' }}>¡Compra exitosa!</h3>
                <p className="dim small mt-8">Tu plan <b>{open.nombre}</b> ya está activo. Ya puedes disfrutar de todas las funciones.</p>
                <Btn variant="primary" className="btn-block mt-24" iconRight="ArrowRight" onClick={() => setOpen(null)}>Empezar</Btn>
              </div>
            ) : step === 'processing' ? (
              <div className="center" style={{ padding: '26px 0' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                  <Icon name="ShieldCheck" size={28} />
                </div>
                <p className="dim small">Procesando tu pago de forma segura…</p>
              </div>
            ) : open.id === 'free' ? (
              <>
                <p className="dim small mb-16">Volverás al plan Básico y perderás el acceso a las funciones Premium.</p>
                <div className="row gap-8">
                  <Btn variant="outline" className="grow" onClick={closeModal} disabled={busy}>Cancelar</Btn>
                  <Btn variant="danger" className="grow" icon="Check" onClick={confirmFree} disabled={busy}>
                    {busy ? 'Procesando…' : 'Confirmar'}
                  </Btn>
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label className="label" htmlFor="card-number">Número de tarjeta</label>
                  <input
                    id="card-number"
                    className="input"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: fmtCard(e.target.value) }))}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="card-name">Nombre del titular</label>
                  <input
                    id="card-name"
                    className="input"
                    autoComplete="cc-name"
                    placeholder="Como aparece en la tarjeta"
                    value={card.name}
                    onChange={setField('name')}
                  />
                </div>
                <div className="grid cols-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label className="label" htmlFor="card-exp">Vencimiento</label>
                    <input
                      id="card-exp"
                      className="input"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      value={card.exp}
                      onChange={(e) => setCard((c) => ({ ...c, exp: fmtExp(e.target.value) }))}
                    />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="card-cvv">CVV</label>
                    <input
                      id="card-cvv"
                      className="input"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={card.cvv}
                      onChange={(e) => setCard((c) => ({ ...c, cvv: onlyDigits(e.target.value).slice(0, 4) }))}
                    />
                  </div>
                </div>
                <div className="row between mb-16">
                  <span className="muted small">Total a pagar</span>
                  <b>{open.moneda} {open.precio}</b>
                </div>
                <div className="row gap-8">
                  <Btn variant="outline" className="grow" onClick={closeModal} disabled={busy}>Cancelar</Btn>
                  <Btn variant="primary" className="grow" icon="Lock" onClick={pay} disabled={busy}>
                    Pagar {open.moneda} {open.precio}
                  </Btn>
                </div>
                <p className="row gap-6 tiny muted mt-12" style={{ justifyContent: 'center' }}>
                  <Icon name="ShieldCheck" size={14} /> Pago seguro · cifrado de extremo a extremo
                </p>
              </>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
