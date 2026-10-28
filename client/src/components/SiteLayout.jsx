import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../lib/store.jsx';
import Icon from './Icon.jsx';

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/carreras', label: 'Carreras' },
  { to: '/test', label: 'Test vocacional' },
  { to: '/examenes', label: 'Exámenes' },
  { to: '/becas', label: 'Becas' },
  { to: '/planes', label: 'Planes' }
];

function AccountMenu() {
  const { account, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!account) {
    return (
      <div className="row gap-8">
        <Link to="/login" className="btn btn-ghost btn-sm nav-login">Entrar</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Empezar gratis</Link>
      </div>
    );
  }

  const initial = (account.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="menu-wrap" ref={ref}>
      <button type="button" className="account-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <span className="avatar" style={{ width: 32, height: 32, fontSize: '.82rem' }}>{initial}</span>
        <span className="bold small truncate account-name">{account.name?.split(' ')[0]}</span>
        <Icon name="ChevronDown" size={15} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-user">
            <div className="bold small truncate">{account.name}</div>
            <div className="tiny muted truncate">{account.email}</div>
          </div>
          <Link to="/cuenta" className="menu-item" onClick={() => setOpen(false)}><Icon name="User" size={16} /> Mi cuenta</Link>
          <Link to="/resultados" className="menu-item" onClick={() => setOpen(false)}><Icon name="BarChart3" size={16} /> Mis resultados</Link>
          <Link to="/guardadas" className="menu-item" onClick={() => setOpen(false)}><Icon name="Star" size={16} /> Guardadas</Link>
          <button type="button" className="menu-item danger" onClick={() => { setOpen(false); logout(); nav('/'); toast('Sesión cerrada', 'LogOut'); }}>
            <Icon name="LogOut" size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function SiteLayout({ children }) {
  const [mobile, setMobile] = useState(false);
  const { account } = useAuth();
  const loc = useLocation();

  useEffect(() => { setMobile(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobile]);

  return (
    <div className="site">
      <header className="site-header">
        <div className="container site-nav">
          <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'var(--text)', padding: 0 }}>
            <span className="logo"><Icon name="Compass" size={19} color="#fff" /></span>
            <span>HAZ TU CAMINO</span>
          </Link>

          <nav className="site-links">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `site-link ${isActive ? 'active' : ''}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-actions">
            <AccountMenu />
            <button type="button" className="btn btn-ghost btn-icon burger" aria-label="Abrir menú" aria-expanded={mobile} onClick={() => setMobile((m) => !m)}>
              <Icon name={mobile ? 'X' : 'Menu'} size={22} />
            </button>
          </div>
        </div>

        {mobile && (
          <div className="mobile-menu">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `site-link ${isActive ? 'active' : ''}`}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/instituciones" className="site-link">Para colegios</Link>
            <div className="divider" />
            {account ? (
              <>
                <Link to="/cuenta" className="site-link">Mi cuenta</Link>
                <Link to="/guardadas" className="site-link">Guardadas</Link>
                <Link to="/resultados" className="site-link">Mis resultados</Link>
              </>
            ) : (
              <div className="row gap-12" style={{ padding: '8px 0' }}>
                <Link to="/login" className="btn btn-outline grow">Entrar</Link>
                <Link to="/register" className="btn btn-primary grow">Empezar gratis</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="site-main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand" style={{ textDecoration: 'none', color: '#fff', padding: 0 }}>
              <span className="logo"><Icon name="Compass" size={18} color="#fff" /></span>
              <span>HAZ TU CAMINO</span>
            </Link>
            <p className="muted small mt-8" style={{ maxWidth: 280 }}>
              Orientación vocacional para estudiantes de Perú. Descubre tu camino con información y práctica.
            </p>
          </div>
          <div>
            <h2 className="foot-title">Explora</h2>
            <Link to="/carreras" className="foot-link">Carreras</Link>
            <Link to="/test" className="foot-link">Test vocacional</Link>
            <Link to="/examenes" className="foot-link">Banco de preguntas</Link>
            <Link to="/becas" className="foot-link">Becas</Link>
            <Link to="/planes" className="foot-link">Planes</Link>
          </div>
          <div>
            <h2 className="foot-title">Institución</h2>
            <Link to="/instituciones" className="foot-link">Para colegios</Link>
            <Link to="/instituciones" className="foot-link">Solicitar información</Link>
            {account ? (
              <>
                <Link to="/cuenta" className="foot-link">Mi cuenta</Link>
                <Link to="/resultados" className="foot-link">Mis resultados</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="foot-link">Iniciar sesión</Link>
                <Link to="/register" className="foot-link">Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
        <div className="container footer-bottom">
          <span className="muted small">Hecho en Perú · 2026</span>
          <span className="muted small">Orientación vocacional para el Perú</span>
        </div>
      </footer>
    </div>
  );
}







