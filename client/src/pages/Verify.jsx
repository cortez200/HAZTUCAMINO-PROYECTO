import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/store.jsx';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

export default function Verify() {
  const toast = useToast();
  const nav = useNavigate();
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
        await api.verifyEmail(token);
        setState('ok');
        toast('¡Correo confirmado! Ya puedes ingresar.', 'CheckCircle2');
      } catch (err) {
        setState('error');
        setMessage(err.message);
      }
    })();
  }, [token, toast]);

  const view = {
    working: { icon: 'RotateCcw', color: 'var(--primary)', title: 'Confirmando tu correo…', text: 'Un momento, estamos verificando tu enlace.' },
    ok: { icon: 'CheckCircle2', color: 'var(--primary)', title: '¡Correo confirmado!', text: 'Tu cuenta está activa. Ya puedes iniciar sesión.' },
    error: { icon: 'AlertTriangle', color: '#dc2626', title: 'No pudimos confirmar', text: message || 'El enlace no es válido o ya caducó.' },
    invalid: { icon: 'AlertTriangle', color: '#dc2626', title: 'Enlace no válido', text: 'Falta el código de confirmación. Revisa el enlace del correo.' }
  }[state];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '30px 20px', background: 'var(--bg)' }}>
      <div className="card card-pad center" style={{ maxWidth: 440 }}>
        <div className="row center" style={{ justifyContent: 'center', marginBottom: 10 }}>
          <Icon name={view.icon} size={40} color={view.color} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{view.title}</h1>
        <p className="dim mt-8 mb-16">{view.text}</p>
        {state === 'working'
          ? <Btn variant="soft" disabled icon="Clock">Verificando…</Btn>
          : <Btn variant="primary" onClick={() => nav('/login')} icon="ArrowRight">Ir a ingresar</Btn>}
      </div>
    </div>
  );
}
