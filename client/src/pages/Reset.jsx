import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/store.jsx';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

const STRENGTH = [
  { label: 'Muy débil', color: '#dc2626', width: 20 },
  { label: 'Débil', color: '#dc2626', width: 35 },
  { label: 'Aceptable', color: '#d97706', width: 60 },
  { label: 'Buena', color: '#0891b2', width: 80 },
  { label: 'Segura', color: '#059669', width: 100 }
];

function score(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function PasswordField({ id, label, value, onChange, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'grid' }}><Icon name="Lock" size={17} /></span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="input"
          style={{ paddingLeft: 38, paddingRight: 44 }}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 8, display: 'grid', borderRadius: 8 }}
        >
          <Icon name={show ? 'EyeOff' : 'Eye'} size={18} />
        </button>
      </div>
    </div>
  );
}

export default function Reset() {
  const toast = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const s = score(password);
  const meter = STRENGTH[s];
  const matches = confirm.length > 0 && confirm === password;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      toast('Contraseña actualizada. Ya puedes ingresar.', 'CheckCircle2');
    } catch (err) {
      setError(err.message);
      toast(err.message, 'Info');
    } finally {
      setBusy(false);
    }
  };

  const invalidToken = !token;

  return (
    <AuthLayout
      headline="Crea una nueva contraseña segura."
      text="Elige una contraseña que solo tú conozcas. Con ella podrás volver a tu cuenta en segundos."
      points={[
        'Mínimo 6 caracteres',
        'Mezcla mayúsculas, números y símbolos',
        'No la reutilices en otros sitios'
      ]}
    >
      <div className="row between mb-16">
        <Link to="/login" className="row gap-8 small" style={{ textDecoration: 'none', color: 'var(--text-2)', fontWeight: 600 }}>
          <Icon name="ArrowLeft" size={16} /> Volver a ingresar
        </Link>
      </div>

      <div className="card card-pad" style={{ padding: 28, boxShadow: 'var(--shadow)' }}>
        {done ? (
          <div className="center">
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--ok-soft)', color: 'var(--ok)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Icon name="CheckCircle2" size={30} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>¡Contraseña actualizada!</h1>
            <p className="dim mt-8 mb-24">Tu cuenta ya está lista. Ingresa con tu nueva contraseña.</p>
            <Btn variant="primary" className="btn-block btn-lg" onClick={() => nav('/login')} icon="ArrowRight">Ingresar ahora</Btn>
          </div>
        ) : invalidToken ? (
          <div className="center">
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--danger-soft)', color: 'var(--danger)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Icon name="AlertTriangle" size={28} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Enlace no válido</h1>
            <p className="dim mt-8 mb-24">Falta el código de recuperación o el enlace expiró. Solicita uno nuevo.</p>
            <Btn variant="primary" className="btn-block btn-lg" onClick={() => nav('/recuperar')} icon="Mail">Solicitar nuevo enlace</Btn>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <span className="badge badge-primary mb-16"><Icon name="KeyRound" size={13} /> Nueva contraseña</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Elige tu nueva contraseña</h1>
            <p className="dim mt-8 mb-24">Escribe y confirma tu nueva contraseña para tu cuenta.</p>

            <PasswordField id="password" label="Contraseña" value={password} onChange={setPassword} autoFocus />

            {password && (
              <div style={{ margin: '-6px 0 14px' }}>
                <div className="progress" style={{ background: 'var(--surface-2)' }}>
                  <span style={{ width: `${meter.width}%`, background: meter.color }} />
                </div>
                <div className="row between mt-8">
                  <span className="tiny" style={{ color: meter.color, fontWeight: 700 }}>{meter.label}</span>
                  <span className="tiny dim">{password.length} caracteres</span>
                </div>
              </div>
            )}

            <PasswordField id="confirm" label="Repite la contraseña" value={confirm} onChange={setConfirm} />

            {confirm.length > 0 && (
              <div className="row gap-6 mb-16 tiny" style={{ color: matches ? 'var(--ok)' : 'var(--danger)', fontWeight: 700 }}>
                <Icon name={matches ? 'CheckCircle2' : 'XCircle'} size={14} />
                {matches ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </div>
            )}

            {error && <div className="err row gap-6 mb-16"><Icon name="AlertTriangle" size={14} /> {error}</div>}

            <Btn variant="primary" type="submit" className="btn-block btn-lg" disabled={busy} icon={busy ? 'Clock' : 'ShieldCheck'}>
              {busy ? 'Guardando…' : 'Cambiar contraseña'}
            </Btn>
          </form>
        )}
      </div>

      <p className="center small dim mt-16">
        <Icon name="ShieldCheck" size={14} style={{ verticalAlign: '-2px' }} /> Por tu seguridad, el enlace caduca en 30 minutos.
      </p>
    </AuthLayout>
  );
}
