import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { NIVELES } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { api } from '../lib/api.js';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Auth({ mode }) {
  const register = mode === 'register';
  const { login, register: signup, resendVerification } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const verificationToken = register ? searchParams.get('token') : null;
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [nivel, setNivel] = useState('secundaria');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [confirmation, setConfirmation] = useState(verificationToken ? 'working' : null);
  const [confirmationError, setConfirmationError] = useState('');
  const handledVerification = useRef(null);

  useEffect(() => {
    if (!verificationToken || handledVerification.current === verificationToken) return;
    handledVerification.current = verificationToken;
    api.verifyEmail(verificationToken)
      .then((result) => {
        setPending({ email: result.email });
        setConfirmation('success');
        toast('Correo confirmado. Ya puedes iniciar sesión.', 'CheckCircle2');
      })
      .catch((err) => {
        setConfirmation('error');
        setConfirmationError(err.message);
      })
      .finally(() => {
        const next = new URLSearchParams(searchParams);
        next.delete('token');
        setSearchParams(next, { replace: true });
      });
  }, [verificationToken, searchParams, setSearchParams, toast]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (register && form.name.trim().length < 2) errs.name = 'Escribe tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Correo no válido.';
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      if (register) {
        const res = await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password, nivel });
        if (res?.token) {
          toast('Cuenta creada. ¡Bienvenido!', 'CheckCircle2');
          const from = location.state?.from;
          nav(typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/', { replace: true });
        } else {
          setPending({ email: form.email.trim(), previewUrl: res?.previewUrl || null });
          toast('Cuenta creada. Revisa tu correo para confirmarla.', 'Mail');
        }
      } else {
        await login({ email: form.email.trim(), password: form.password });
        toast('¡Hola de nuevo!', 'CheckCircle2');
        const from = location.state?.from;
        nav(typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/', { replace: true });
      }
    } catch (err) {
      if (err.data?.needsVerification || err.data?.verificationEmailFailed) {
        setPending({
          email: err.data.email || form.email.trim(),
          sendError: err.data?.verificationEmailFailed ? err.message : null
        });
        toast(err.data?.verificationEmailFailed ? err.message : 'Confirma tu correo para ingresar.', 'Mail');
      } else {
        setErrors({ form: err.message });
        toast(err.message, 'Info');
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      const result = await resendVerification(pending.email);
      if (result?.alreadyVerified) {
        setPending(null);
        toast('Tu correo ya esta confirmado. Inicia sesion.', 'CheckCircle2');
        return;
      }
      setPending((p) => ({ ...p, previewUrl: result?.previewUrl || null, sendError: null }));
      toast('Correo reenviado. Revisa tu bandeja (y el spam).', 'Mail');
    } catch (err) {
      setPending((p) => ({ ...p, sendError: err.message }));
      toast(err.message, 'Info');
    } finally {
      setBusy(false);
    }
  };

  const copy = register
    ? {
        headline: 'Empieza a decidir con datos, no con dudas.',
        text: 'Crea tu cuenta gratis y desbloquea test, carreras y simulaciones en minutos.',
        points: ['Test vocacional en 5 minutos', '32 carreras con datos reales', 'Simulaciones por área con puntaje']
      }
    : {
        headline: 'Tu decisión merece datos, no solo intuición.',
        text: 'Miles de estudiantes usan test, carreras y simulaciones para elegir mejor.',
        points: ['Continúa tu test donde lo dejaste', 'Guarda y compara tus carreras', 'Resultados y simulaciones a un clic']
      };

  return (
    <AuthLayout headline={copy.headline} text={copy.text} points={copy.points}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {pending || confirmation ? (
            <div className="card card-pad center">
              <div style={{ width: 58, height: 58, borderRadius: 16, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <Icon name="Mail" size={28} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {confirmation === 'working' ? 'Confirmando tu correo' : confirmation === 'success' ? 'Correo confirmado' : 'Confirma tu registro'}
              </h1>
              <p className="dim mt-8 mb-24">
                {confirmation === 'working'
                  ? 'Espera un momento mientras confirmamos tu dirección.'
                  : confirmation === 'success'
                    ? <>La dirección <b>{pending?.email}</b> está confirmada. Ya puedes iniciar sesión.</>
                    : confirmation === 'error'
                      ? confirmationError || 'No pudimos confirmar el enlace.'
                      : <>Confirma el correo <b>{pending?.email}</b> antes de ingresar. Revisa también la carpeta de spam.</>}
              </p>
              {pending?.sendError && <p className="err mb-16" role="alert">{pending.sendError}</p>}
              {pending?.previewUrl && <p className="small mb-16"><a href={pending.previewUrl} target="_blank" rel="noreferrer">Abrir correo de prueba</a></p>}
              {confirmation === 'working' && <Btn variant="soft" type="button" className="btn-block btn-lg" disabled icon="Clock">Verificando…</Btn>}
              {confirmation !== 'working' && confirmation !== 'success' && pending?.email && (
                <Btn variant="primary" type="button" className="btn-block btn-lg" onClick={resend} disabled={busy} icon={busy ? 'Clock' : 'Mail'}>
                  {busy ? 'Reenviando…' : 'Reenviar correo'}
                </Btn>
              )}
              <p className="center small mt-24" style={{ color: 'var(--text-2)' }}>
                {confirmation === 'success' ? 'Continúa para ingresar: ' : '¿Ya confirmaste tu correo? '}
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Ingresa</Link>
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>{register ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1>
              <p className="dim mt-8 mb-24">{register ? 'Empieza tu recorrido vocacional.' : 'Ingresa para continuar tu recorrido.'}</p>

              <form onSubmit={submit} noValidate>
                {register && (
                  <div className="field">
                    <label className="label" htmlFor="name">Nombre</label>
                    <input id="name" className="input" placeholder="Cómo te llamas" autoComplete="name" value={form.name} onChange={set('name')} />
                    {errors.name && <span className="err">{errors.name}</span>}
                  </div>
                )}
                <div className="field">
                  <label className="label" htmlFor="email">Correo</label>
                  <input id="email" type="email" className="input" placeholder="tu@correo.com" autoComplete="email" value={form.email} onChange={set('email')} />
                  {errors.email && <span className="err">{errors.email}</span>}
                </div>
                <div className="field">
                  <label className="label" htmlFor="password">Contraseña</label>
                  <input id="password" type="password" className="input" placeholder="Mínimo 6 caracteres" autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} />
                  {errors.password && <span className="err">{errors.password}</span>}
                </div>
                {register && (
                  <div className="field">
                    <span className="label">¿En qué etapa estás?</span>
                    <div className="seg">
                      {NIVELES.map((n) => (
                        <button type="button" key={n.id} className={nivel === n.id ? 'on' : ''} onClick={() => setNivel(n.id)}>{n.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                {!register && (
                  <div className="row between mb-16">
                    <span className="small" style={{ color: 'var(--text-2)' }} />
                    <Link to="/recuperar" className="small" style={{ color: 'var(--primary)', fontWeight: 700 }}>¿Olvidaste tu contraseña?</Link>
                  </div>
                )}
                {errors.form && <div className="err mb-16">{errors.form}</div>}

                <Btn variant="primary" type="submit" className="btn-block btn-lg" disabled={busy} icon={busy ? 'Clock' : undefined}>
                  {busy ? 'Procesando…' : register ? 'Crear cuenta' : 'Ingresar'}
                </Btn>
              </form>

              <p className="center small mt-24" style={{ color: 'var(--text-2)' }}>
                {register ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
                <Link to={register ? '/login' : '/register'} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {register ? 'Ingresa' : 'Regístrate'}
                </Link>
              </p>
            </>
          )}
      </div>
    </AuthLayout>
  );
}
