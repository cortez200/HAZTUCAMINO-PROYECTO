import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NIVELES } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { Btn } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import Img from '../components/Img.jsx';

const SIDE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=70';

export default function Auth({ mode }) {
  const register = mode === 'register';
  const { login, register: signup } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [nivel, setNivel] = useState('secundaria');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

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
        await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password, nivel });
        toast('¡Cuenta creada! Te enviamos un correo de confirmación.', 'Mail');
        nav('/');
      } else {
        await login({ email: form.email.trim(), password: form.password });
        toast('¡Hola de nuevo!', 'CheckCircle2');
        nav('/');
      }
    } catch (err) {
      setErrors({ form: err.message });
      toast(err.message, 'Info');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-grid">
      {/* panel lateral */}
      <div className="auth-side" style={{ position: 'relative', background: 'var(--text)' }}>
        <Img src={SIDE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .55 }} icon="GraduationCap" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(79,70,229,.85), rgba(15,23,42,.85))' }} />
        <div style={{ position: 'absolute', inset: 0, padding: 44, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Link to="/" className="row gap-8" style={{ color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
            <Icon name="Compass" size={22} color="#fff" /> Haz Tu Camino
          </Link>
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, maxWidth: 380 }}>Tu decisión merece datos, no solo intuición.</h2>
            <p style={{ opacity: .9, marginTop: 12, maxWidth: 400 }}>
              Miles de estudiantes usan test, carreras y simulaciones para elegir mejor.
            </p>
          </div>
        </div>
      </div>

      {/* formulario */}
      <main style={{ display: 'grid', placeItems: 'center', padding: '30px 20px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
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
        </div>
      </main>

      <style>{`@media (max-width: 900px){ .auth-grid{ grid-template-columns:1fr !important; } .auth-side{ display:none !important; } }`}</style>
    </div>
  );
}
