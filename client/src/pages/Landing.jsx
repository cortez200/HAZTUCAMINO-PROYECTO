import { Link } from 'react-router-dom';
import { AREAS, CARRERAS } from '../lib/data.js';
import CareerCard from '../components/CareerCard.jsx';
import Icon from '../components/Icon.jsx';
import Img from '../components/Img.jsx';
import { areaVars, Badge, Btn } from '../components/ui.jsx';
import { useAuth } from '../lib/store.jsx';

const HERO = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=70';
const SCHOOL = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=70';

const STEPS = [
  { icon: 'ClipboardList', t: 'Haz el test', d: '32 preguntas cortas de "me gusta / no me gusta". Toma 5 minutos.' },
  { icon: 'GraduationCap', t: 'Descubre tu carrera', d: 'Te recomendamos carreras con universidades, mensualidades y malla curricular real.' },
  { icon: 'Gamepad2', t: 'Vívelo antes de decidir', d: 'Videos y simulaciones por área con puntaje, antes de elegir.' }
];

export default function Landing() {
  const { account } = useAuth();
  const featured = CARRERAS.slice(0, 8);

  return (
    <>
      {account && (
        <div className="card card-pad row between wrap gap-16 mb-24" style={{ borderColor: 'var(--primary)', background: 'var(--primary-soft)' }}>
          <div className="row gap-12">
            <span className="avatar" style={{ width: 40, height: 40 }}>{(account.name || '?').charAt(0).toUpperCase()}</span>
            <div>
              <div className="bold">¡Hola de nuevo, {account.name?.split(' ')[0]}!</div>
              <div className="small" style={{ color: 'var(--primary-700)' }}>
                {account.done ? 'Revisa tus resultados y sigue explorando carreras.' : 'Aún no haces el test vocacional. ¡Empieza ahora!'}
              </div>
            </div>
          </div>
          <Link to={account.done ? '/resultados' : '/test'} className="btn btn-primary">
            <Icon name={account.done ? 'BarChart3' : 'ClipboardList'} size={17} />
            {account.done ? 'Ver mis resultados' : 'Hacer el test'}
          </Link>
        </div>
      )}

      {/* ---------------- Hero ---------------- */}
      <section className="hero-grid" style={{ padding: '24px 0 40px' }}>
        <div>
          <Badge tone="primary" icon="Sparkles">Orientación vocacional en Perú</Badge>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.1rem)', fontWeight: 800, marginTop: 16 }}>
            Descubre qué carrera va contigo
          </h1>
          <p className="dim" style={{ fontSize: '1.12rem', marginTop: 14, maxWidth: 520 }}>
            Un test corto, información real de 32 carreras —universidades, mensualidades y mallas— y simulaciones para que elijas tu futuro con claridad.
          </p>
          <div className="row gap-12 wrap mt-24">
            <Link to={account ? '/test' : '/register'} className="btn btn-primary btn-lg">
              <Icon name="Compass" size={19} /> Empezar gratis
            </Link>
            <Link to="/carreras" className="btn btn-outline btn-lg">Ver carreras</Link>
          </div>
          <div className="row gap-24 wrap mt-24">
            {[['32', 'carreras'], ['19', 'universidades'], ['5 min', 'de test']].map(([k, l]) => (
              <div key={l}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{k}</div>
                <div className="muted small bold">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          <Img src={HERO} alt="Estudiantes explorando su vocación" style={{ width: '100%', height: 420, objectFit: 'cover' }} icon="GraduationCap" priority />
        </div>
      </section>

      {/* ---------------- Cómo funciona ---------------- */}
      <section className="section">
        <div className="center section-head">
          <h2 className="section-title">Cómo funciona</h2>
          <p className="section-sub">Tres pasos sencillos para aterrizar tu decisión.</p>
        </div>
        <div className="grid cols-3">
          {STEPS.map((s, i) => (
            <div className="card card-pad" key={s.t}>
              <div className="row between">
                <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                  <Icon name={s.icon} size={22} />
                </span>
                <span className="badge badge-soft">Paso {i + 1}</span>
              </div>
              <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginTop: 16 }}>{s.t}</h3>
              <p className="dim small mt-8">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Áreas ---------------- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Explora por áreas</h2>
          <p className="section-sub">8 campos profesionales, cada uno con 4 carreras reales.</p>
        </div>
        <div className="grid cols-4">
          {AREAS.map((a) => {
            const count = CARRERAS.filter((c) => c.area === a.id).length;
            return (
              <Link key={a.id} to={`/carreras?a=${a.id}`} className="card card-pad" style={{ ...areaVars(a), textDecoration: 'none', color: 'inherit' }}>
                <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--area-soft)', color: 'var(--area)', display: 'grid', placeItems: 'center' }}>
                  <Icon name={a.icon} size={22} />
                </span>
                <h3 style={{ fontWeight: 700, marginTop: 14 }}>{a.nombre}</h3>
                <p className="muted small mt-8">{count} carreras</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------- Carreras destacadas ---------------- */}
      <section className="section">
        <div className="row between wrap gap-16 section-head">
          <div>
            <h2 className="section-title">Carreras destacadas</h2>
            <p className="section-sub">Conoce qué hace cada profesional y dónde estudiarla.</p>
          </div>
          <Link to="/carreras" className="btn btn-outline">Ver las 32 <Icon name="ArrowRight" size={16} /></Link>
        </div>
        <div className="grid cols-4">
          {featured.map((c) => <CareerCard key={c.id} career={c} />)}
        </div>
      </section>

      {/* ---------------- Para colegios ---------------- */}
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="panel school-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="stack gap-16">
            <Badge tone="primary" icon="School">Para colegios e institutos</Badge>
            <h2 className="section-title">Lleva la orientación vocacional a tu institución</h2>
            <p className="dim">
              Coordínala para tus estudiantes. Resultados por aula y guía para tutores.
            </p>
            <div>
              <Link to="/instituciones" className="btn btn-primary btn-lg">Solicitar información <Icon name="ArrowRight" size={18} /></Link>
            </div>
          </div>
          <Img src={SCHOOL} alt="Aula escolar" style={{ width: '100%', height: '100%', minHeight: 280, objectFit: 'cover' }} icon="School" />
        </div>
      </section>
    </>
  );
}
