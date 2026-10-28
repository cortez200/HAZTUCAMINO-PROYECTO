import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { carrera, area, universidad } from '../lib/data.js';
import { buildMalla } from '../lib/mallas.js';
import { areaVars, Badge, Btn, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import Img from '../components/Img.jsx';
import UniLogo from '../components/UniLogo.jsx';

export default function Malla() {
  const { id, uniId } = useParams();
  const c = carrera(id);
  const ar = c ? area(c.area) : null;
  const oferta = c?.universidades.find((o) => o.id === uniId) || c?.universidades[0];
  const u = oferta ? universidad(oferta.id) : null;
  const malla = useMemo(() => (c && oferta ? buildMalla(c, oferta) : []), [c, oferta]);

  if (!c || !oferta || !u) {
    return (
      <Card className="card-pad center">
        <h2 style={{ fontWeight: 800 }}>Malla no encontrada</h2>
        <Link to="/carreras" className="btn btn-primary" style={{ marginTop: 16 }}>Volver a carreras</Link>
      </Card>
    );
  }

  return (
    <div style={areaVars(ar)}>
      <Link to={`/carreras/${c.id}`} className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> {c.nombre}</Link>

      <div className="hero-img" style={{ height: 230 }}>
        <Img src={c.img} alt={`${c.nombre} en ${u.nombre}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} icon={ar.icon} />
        <div className="overlay" />
        <div className="inner" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
          <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
          <h1 style={{ fontSize: 'clamp(1.55rem, 4vw, 2.2rem)', fontWeight: 800, marginTop: 10 }}>Malla de {c.nombre}</h1>
          <p style={{ opacity: .94, marginTop: 7 }}>{u.nombre} · {u.ciudad}</p>
        </div>
      </div>

      <div className="row between wrap gap-12 mt-16">
        <div className="row gap-12">
          <UniLogo uni={u} size={48} />
          <div>
            <div className="bold">{u.nombre}</div>
            <div className="small muted">{u.tipo} · {oferta.duracion} ciclos · {u.ciudad}</div>
          </div>
        </div>
        <div className="row gap-8 wrap">
          <Btn variant="outline" size="sm" icon="ArrowLeft" onClick={() => window.history.back()}>Volver</Btn>
          <Btn variant="outline" size="sm" icon="FileText" onClick={() => window.print()}>Imprimir malla</Btn>
          <a href={u.web} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
            Web oficial <Icon name="ExternalLink" size={14} />
          </a>
        </div>
      </div>

      <div className="grid cols-4 mt-16">
        <Card className="card-pad">
          <div className="tiny muted bold">DURACIÓN</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.1rem' }}><Icon name="CalendarClock" size={18} color="var(--primary)" /> {oferta.duracion} ciclos</div>
        </Card>
        <Card className="card-pad">
          <div className="tiny muted bold">TIPO</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.1rem' }}><Icon name="Building2" size={18} color="var(--primary)" /> {u.tipo}</div>
        </Card>
        <Card className="card-pad">
          <div className="tiny muted bold">MENSUALIDAD</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.1rem' }}>
            <Icon name="Wallet" size={18} color="var(--primary)" /> S/ {oferta.min.toLocaleString()} – {oferta.max.toLocaleString()}
          </div>
        </Card>
        <Card className="card-pad">
          <div className="tiny muted bold">SEDE</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.1rem' }}><Icon name="MapPin" size={18} color="var(--primary)" /> {u.ciudad}</div>
        </Card>
      </div>

      <section className="mt-32">
        <div className="row between wrap gap-12 mb-16">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Cambiar de universidad</h2>
            <p className="section-sub" style={{ fontSize: '.95rem' }}>Cada universidad tiene su propia secuencia de cursos.</p>
          </div>
          <div className="row wrap gap-8">
            {c.universidades.map((o) => (
              <Link key={o.id} to={`/carreras/${c.id}/malla/${o.id}`} className={`chip ${o.id === oferta.id ? 'on' : ''}`}>
                {universidad(o.id)?.corto || o.id}
              </Link>
            ))}
          </div>
        </div>

        <div className="malla">
          {malla.map((cic) => (
            <div key={cic.ciclo} className="malla-ciclo">
              <div className="malla-ciclo-head">Ciclo {cic.ciclo}</div>
              <ul>
                {cic.cursos.map((curso, i) => <li key={i}>{curso}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="tiny muted mt-16">Malla referencial de ejemplo. La malla oficial puede variar por universidad y año.</p>
      </section>

      <section className="section-navy mt-32">
        <div className="row between wrap gap-16">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.45rem' }}>¿Ya te imaginas estudiando aquí?</h2>
            <p className="section-sub" style={{ marginTop: 6 }}>Vive un caso real de {c.nombre} antes de decidir.</p>
          </div>
          <div className="row gap-10 wrap">
            <Link to={`/carreras/${c.id}`} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,.4)', color: '#fff', background: 'transparent' }}>
              Ver la carrera
            </Link>
            <Link to="/becas" className="btn" style={{ background: 'var(--accent)', color: 'var(--navy)' }}>
              Ver becas <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
