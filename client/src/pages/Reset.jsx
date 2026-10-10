import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/store.jsx';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '30px 20px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link to="/login" className="row gap-8 mb-16" style={{ textDecoration: 'none', color: 'var(--text-2)', fontWeight: 600 }}>
          <Icon name="ArrowLeft" size={18} /> Volver a ingresar
        </Link>
        <div className="card card-pad">
          {done ? (
            <div className="center">
              <div className="row center" style={{ justifyContent: 'center', marginBottom: 10 }}><Icon name="CheckCircle2" size={40} color="var(--primary)" /></div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>¡Listo!</h1>
              <p className="dim mt-8 mb-16">Tu contraseña se actualizó correctamente.</p>
              <Btn variant="primary" onClick={() => nav('/login')} icon="ArrowRight">Ingresar ahora</Btn>
            </div>
          ) : invalidToken ? (
            <div className="center">
              <div className="row center" style={{ justifyContent: 'center', marginBottom: 10 }}><Icon name="AlertTriangle" size={40} color="#dc2626" /></div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Enlace no válido</h1>
              <p className="dim mt-8 mb-16">Falta el código de recuperación. Solicita un enlace nuevo.</p>
              <Btn variant="soft" onClick={() => nav('/recuperar')} icon="Mail">Solicitar enlace</Btn>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="row center gap-8 mb-8"><Icon name="Lock" size={26} color="var(--primary)" /></div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center' }}>Nueva contraseña</h1>
              <p className="dim center mt-8 mb-24">Escribe tu nueva contraseña para tu cuenta.</p>
              <div className="field">
                <label className="label" htmlFor="password">Contraseña</label>
                <input id="password" type="password" className="input" placeholder="Mínimo 6 caracteres" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="confirm">Repite la contraseña</label>
                <input id="confirm" type="password" className="input" placeholder="Repite la contraseña" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              {error && <div className="err mb-16">{error}</div>}
              <Btn variant="primary" type="submit" className="btn-block btn-lg" disabled={busy} icon={busy ? 'Clock' : 'Check'}>
                {busy ? 'Guardando…' : 'Cambiar contraseña'}
              </Btn>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
