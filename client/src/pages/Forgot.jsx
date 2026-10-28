import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/store.jsx';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Forgot() {
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!valid(email)) { setError('Escribe un correo válido.'); return; }
    setBusy(true);
    try {
      const r = await api.forgot(email.trim());
      setSent({ email: email.trim(), previewUrl: r.previewUrl || null });
      toast('Enviamos un enlace de recuperación.', 'Mail');
    } catch (err) {
      setError(err.message);
      toast(err.message, 'Info');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await api.forgot(sent.email);
      toast('Enlace reenviado. Revisa tu correo (y el spam).', 'Mail');
    } catch (err) {
      toast(err.message, 'Info');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      headline="¿Perdiste tu contraseña? No pierdes tu camino."
      text="Recupera el acceso en segundos y continua con tu test vocacional, carreras y becas donde lo dejaste."
      points={[
        'Enlace seguro que caduca en 30 minutos',
        'Sin necesidad de recordar tu contraseña anterior',
        'Tu progreso y resultados quedan intactos'
      ]}
    >
      <div className="row between mb-16">
        <Link to="/login" className="row gap-8 small" style={{ textDecoration: 'none', color: 'var(--text-2)', fontWeight: 600 }}>
          <Icon name="ArrowLeft" size={16} /> Volver a ingresar
        </Link>
        <span className="small dim">¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Regístrate</Link></span>
      </div>

      <div className="card card-pad" style={{ padding: 28, boxShadow: 'var(--shadow)' }}>
        {sent ? (
          <div className="center">
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Icon name="Mail" size={28} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Revisa tu correo</h1>
            <p className="dim mt-8">
              Si <b style={{ color: 'var(--text)' }}>{sent.email}</b> está registrado, recibirás un enlace para
              restablecer tu contraseña. Caduca en 30 minutos.
            </p>
            {sent.previewUrl && (
              <div className="card card-pad mt-16" style={{ background: 'var(--primary-soft)', border: 0, textAlign: 'left' }}>
                <span className="small bold row gap-6" style={{ color: 'var(--primary-700)' }}><Icon name="Sparkles" size={15} /> Vista previa: míralo aquí</span>
                <div className="mt-8"><a href={sent.previewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, wordBreak: 'break-all' }}>Abrir correo de prueba →</a></div>
              </div>
            )}
            <div className="card card-pad mt-16" style={{ background: 'var(--surface-2)', border: 0, textAlign: 'left' }}>
              <span className="small bold row gap-6" style={{ color: 'var(--text-2)' }}><Icon name="Lightbulb" size={15} /> ¿No llegó?</span>
              <p className="small dim mt-8">Revisa la carpeta de spam o promociones. También puedes reenviarlo ahora.</p>
            </div>
            <div className="mt-24 row gap-8" style={{ justifyContent: 'center' }}>
              <Btn variant="soft" onClick={resend} disabled={busy} icon={busy ? 'Clock' : 'RotateCcw'}>{busy ? 'Reenviando…' : 'Reenviar enlace'}</Btn>
              <Btn variant="primary" onClick={() => nav('/login')} icon="ArrowRight">Ingresar</Btn>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <span className="badge badge-primary mb-16"><Icon name="Lock" size={13} /> Recuperar acceso</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Recupera tu contraseña</h1>
            <p className="dim mt-8 mb-24">Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.</p>

            <div className="field">
              <label className="label" htmlFor="email">Correo</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'grid' }}><Icon name="Mail" size={17} /></span>
                <input id="email" type="email" className="input" style={{ paddingLeft: 38 }} placeholder="tu@correo.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
            </div>

            {error && <div className="err row gap-6 mb-16"><Icon name="AlertTriangle" size={14} /> {error}</div>}

            <Btn variant="primary" type="submit" className="btn-block btn-lg" disabled={busy} icon={busy ? 'Clock' : 'Mail'}>
              {busy ? 'Enviando…' : 'Enviar enlace'}
            </Btn>

            <p className="center small dim mt-24">
              ¿Recordaste tu contraseña? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Inicia sesión</Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
