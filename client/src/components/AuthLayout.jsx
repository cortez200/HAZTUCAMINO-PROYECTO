import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import Img from './Img.jsx';

const SIDE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=70';

/* Marco de pantalla completa para recuperación de contraseña, con el mismo
   panel lateral que login/registro para mantener una experiencia consistente. */
export default function AuthLayout({ headline, text, points = [], children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-grid">
      <div className="auth-side" style={{ position: 'relative', background: 'var(--text)' }}>
        <Img src={SIDE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .55 }} icon="GraduationCap" />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(520px 420px at 18% 18%, rgba(16,148,133,.40), transparent 62%), radial-gradient(460px 400px at 88% 82%, rgba(245,158,11,.28), transparent 60%), linear-gradient(160deg, rgba(5,18,31,.93), rgba(11,36,80,.95) 58%, rgba(47,79,209,.88))' }} />
        <div style={{ position: 'absolute', inset: 0, padding: 44, color: '#fff', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Link to="/" className="row gap-8" style={{ color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
            <Icon name="Compass" size={22} color="#fff" /> HAZ TU CAMINO
          </Link>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.95rem', fontWeight: 800, maxWidth: 400, lineHeight: 1.2 }}>{headline}</h2>
            <p style={{ opacity: .9, marginTop: 14, maxWidth: 400, lineHeight: 1.6 }}>{text}</p>
            {points.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '26px 0 0', display: 'grid', gap: 13 }}>
                {points.map((p) => (
                  <li key={p} className="row gap-8" style={{ alignItems: 'flex-start', fontSize: '.95rem', opacity: .95 }}>
                    <Icon name="CheckCircle2" size={18} color="#7ff0e5" style={{ flex: 'none', marginTop: 2 }} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p style={{ opacity: .7, fontSize: '.82rem', maxWidth: 400 }}>Tu información está protegida y cifrada.</p>
        </div>
      </div>

      <main className="auth-main" style={{ display: 'grid', placeItems: 'center', padding: '30px 20px', background: 'transparent' }}>
        <div style={{ width: '100%', maxWidth: 430 }}>
          <Link to="/" className="standalone-brand auth-brand"><span className="logo"><Icon name="Compass" size={18} color="#fff" /></span> HAZ TU CAMINO</Link>
          {children}
        </div>
      </main>

      <style>{`@media (max-width: 900px){ .auth-grid{ grid-template-columns:1fr !important; } .auth-side{ display:none !important; } }`}</style>
    </div>
  );
}
