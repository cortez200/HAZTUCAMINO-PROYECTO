import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/store.jsx';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

export default function Forgot() {
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Correo no válido.'); return; }
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

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '30px 20px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link to="/login" className="row gap-8 mb-16" style={{ textDecoration: 'none', color: 'var(--text-2)', fontWeight: 600 }}>
          <Icon name="ArrowLeft" size={18} /> Volver a ingresar
        </Link>
        <div className="card card-pad">
          {sent ? (
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Revisa tu correo</h1>
              <p className="dim mt-8">
                Si <b style={{ color: 'var(--text)' }}>{sent.email}</b> está registrado, recibirás un enlace para
                restablecer tu contraseña. Caduca en 30 minutos.
              </p>
              {sent.previewUrl && (
                <div className="card card-pad mt-16" style={{ background: 'var(--primary-soft)', border: 0 }}>
                  <span className="small bold" style={{ color: 'var(--primary-700)' }}>Modo demo: míralo aquí</span>
                  <div className="mt-8"><a href={sent.previewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, wordBreak: 'break-all' }}>Abrir correo de prueba →</a></div>
                </div>
              )}
              <div className="mt-16"><Btn variant="soft" onClick={() => nav('/login')} icon="ArrowRight">Volver a ingresar</Btn></div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="row center gap-8 mb-8"><Icon name="Lock" size={26} color="var(--primary)" /></div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center' }}>Recupera tu contraseña</h1>
              <p className="dim center mt-8 mb-24">Escribe tu correo y te enviaremos un enlace para crear una nueva.</p>
              <div className="field">
                <label className="label" htmlFor="email">Correo</label>
                <input id="email" type="email" className="input" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {error && <div className="err mb-16">{error}</div>}
              <Btn variant="primary" type="submit" className="btn-block btn-lg" disabled={busy} icon={busy ? 'Clock' : 'Mail'}>
                {busy ? 'Enviando…' : 'Enviar enlace'}
              </Btn>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
