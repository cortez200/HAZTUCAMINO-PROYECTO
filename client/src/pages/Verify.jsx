import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useToast } from '../lib/store.jsx';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

export default function Verify() {
  const toast = useToast();
  const nav = useNavigate();
  const { verifySession } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState(token ? 'working' : 'invalid');
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        await verifySession(token);
        setState('ok');
        toast('¡Registro confirmado! Ingresando…', 'CheckCircle2');
        setTimeout(() => nav('/', { replace: true }), 1400);
      } catch (err) {
        setState('error');
        setMessage(err.message);
      }
    })();
  }, [token, toast, verifySession, nav]);

  const view = {
    working: { icon: 'RotateCcw', color: 'var(--primary)', title: 'Confirmando tu registro…', text: 'Un momento, estamos verificando tu enlace.' },
    ok: { icon: 'CheckCircle2', color: 'var(--primary)', title: '¡Registro confirmado!', text: 'Tu cuenta está activa. Ingresando a tu cuenta…' },
    error: { icon: 'AlertTriangle', color: 'var(--danger)', title: 'No pudimos confirmar', text: message || 'El enlace no es válido o ya caducó.' },
    invalid: { icon: 'AlertTriangle', color: 'var(--danger)', title: 'Enlace no válido', text: 'Falta el código de confirmación. Revisa el enlace del correo.' }
  }[state];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <header style={{ padding: '15px 22px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.9)' }}>
        <Link to="/" className="standalone-brand"><span className="logo"><Icon name="Compass" size={18} color="#fff" /></span> HAZ TU CAMINO</Link>
      </header>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '30px 20px' }}>
      <div className="card card-pad center" style={{ maxWidth: 440 }}>
        <div className="row center" style={{ justifyContent: 'center', marginBottom: 10 }}>
          <Icon name={view.icon} size={40} color={view.color} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{view.title}</h1>
        <p className="dim mt-8 mb-16">{view.text}</p>
        {state === 'working' && <Btn variant="soft" disabled icon="Clock">Verificando…</Btn>}
        {state === 'ok' && <Btn variant="primary" onClick={() => nav('/', { replace: true })} icon="ArrowRight">Entrar ahora</Btn>}
        {state === 'error' && <Btn variant="primary" onClick={() => nav('/login')} icon="ArrowRight">Ir a ingresar</Btn>}
        {state === 'invalid' && <Btn variant="primary" onClick={() => nav('/register')} icon="ArrowRight">Registrarme</Btn>}
      </div>
      </div>
    </div>
  );
}
