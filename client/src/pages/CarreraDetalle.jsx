import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { carrera, area, CARRERAS, universidad } from '../lib/data.js';
import { areaScores } from '../lib/scoring.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { api } from '../lib/api.js';
import { areaVars, Badge, Btn, Card, Progress } from '../components/ui.jsx';
import CareerCard from '../components/CareerCard.jsx';
import GoogleReviews from '../components/GoogleReviews.jsx';
import UniLogo from '../components/UniLogo.jsx';
import { Stars } from '../components/Stars.jsx';
import Icon from '../components/Icon.jsx';
import Img from '../components/Img.jsx';

function Section({ icon, title, items }) {
  return (
    <Card className="card-pad">
      <div className="row gap-8 mb-16">
        <Icon name={icon} size={18} color="var(--primary)" /> <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }} className="dim small">
        {items.map((it) => <li key={it}>{it}</li>)}
      </ul>
    </Card>
  );
}

export default function CarreraDetalle() {
  const { id } = useParams();
  const c = carrera(id);
  const { account, toggleSaved } = useAuth();
  const toast = useToast();
  const [revSel, setRevSel] = useState(c ? c.universidades[0].id : null);
  const [uniSummary, setUniSummary] = useState({});
  const revRef = useRef(null);

  const verOpiniones = (id) => {
    setRevSel(id);
    revRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    api.universityReviewSummary().then((r) => setUniSummary(r.summaries || {})).catch(() => {});
  }, []);

  useEffect(() => {
    setRevSel(c ? c.universidades[0].id : null);
  }, [c]);

  if (!c) {
    return (
      <Card className="card-pad center">
        <h2 style={{ fontWeight: 800 }}>Carrera no encontrada</h2>
        <Link to="/carreras" className="btn btn-primary mt-24" style={{ marginTop: 16 }}>Volver a carreras</Link>
      </Card>
    );
  }

  const ar = area(c.area);
  const saved = (account?.saved || []).includes(c.id);
  const score = account?.done ? areaScores(account.answers).find((s) => s.id === c.area) : null;
  const related = CARRERAS.filter((x) => x.area === c.area && x.id !== c.id);
  const vid = (c.video || '').split('/').pop();

  const hayPublica = c.universidades.some((o) => o.tipo === 'Pública');
  const minMensual = c.universidades.length ? Math.min(...c.universidades.map((o) => o.min)) : null;
  const maxMensual = c.universidades.length ? Math.max(...c.universidades.map((o) => o.max)) : null;

  const revUni = universidad(revSel) || universidad(c.universidades[0].id);

  const onSave = () => {
    toggleSaved(c.id);
    toast(saved ? 'Quitada de guardadas' : 'Guardada en tus favoritas', saved ? 'Bookmark' : 'BookmarkCheck');
  };

  return (
    <div style={areaVars(ar)}>
      <Link to="/carreras" className="crumb mb-16"><Icon name="ArrowLeft" size={15} /> Carreras</Link>

      <div className="hero-img" style={{ height: 280 }}>
        <Img src={c.img} alt={c.nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} icon={ar.icon} />
        <div className="overlay" />
        <div className="inner" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
          <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 800, marginTop: 10 }}>{c.nombre}</h1>
          <p style={{ opacity: .92, marginTop: 8, maxWidth: 640 }}>{c.descripcion}</p>
        </div>
      </div>

      <div className="row wrap gap-12 mt-16">
        <Btn variant={saved ? 'soft' : 'primary'} icon={saved ? 'BookmarkCheck' : 'Bookmark'} onClick={onSave}>
          {saved ? 'Guardada' : 'Guardar carrera'}
        </Btn>
        <Link to={`/comparar?c=${c.id}`} className="btn btn-outline"><Icon name="SlidersHorizontal" size={16} /> Comparar</Link>
        <a href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noreferrer" className="btn btn-outline"><Icon name="Youtube" size={17} /> Ver video</a>
      </div>

      {/* Datos rápidos */}
      <div className="grid cols-4 mt-16">
        <Card className="card-pad">
          <div className="tiny muted bold">DURACIÓN</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.15rem' }}><Icon name="CalendarClock" size={18} color="var(--primary)" /> {c.duracion} ciclos</div>
          <div className="tiny dim mt-8">≈ {Math.round(c.duracion / 2)} años</div>
        </Card>
        <Card className="card-pad">
          <div className="tiny muted bold">MODALIDAD</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.15rem' }}><Icon name="MonitorPlay" size={18} color="var(--primary)" /> Presencial</div>
          <div className="tiny dim mt-8">También semipresencial</div>
        </Card>
        <Card className="card-pad">
          <div className="tiny muted bold">MENSUALIDAD</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.15rem' }}>
            <Icon name="Wallet" size={18} color="var(--primary)" />
            {minMensual ? `Desde S/ ${minMensual.toLocaleString()}` : 'Según universidad'}
          </div>
          <div className="tiny dim mt-8">{maxMensual ? `Hasta S/ ${maxMensual.toLocaleString()} /mes según universidad` : 'Consulta con cada universidad'}</div>
        </Card>
        <Card className="card-pad">
          <div className="tiny muted bold">UNIVERSIDADES</div>
          <div className="row gap-6 bold mt-8" style={{ fontSize: '1.15rem' }}><Icon name="Building2" size={18} color="var(--primary)" /> {c.universidades.length} opciones</div>
          <div className="tiny dim mt-8">{hayPublica ? 'Públicas y privadas' : 'Privadas'}</div>
        </Card>
      </div>

      {vid && (
        <section className="mt-32">
          <h2 className="section-title mb-16" style={{ fontSize: '1.5rem' }}>Video: un día como {c.nombre}</h2>
          <Card style={{ overflow: 'hidden' }}>
            <div className="video-frame">
              <iframe
                src={`https://www.youtube.com/embed/${vid}?rel=0`}
                title={`Video: ${c.nombre}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
        </section>
      )}

      {score && (
        <Card className="card-pad mt-16" style={{ background: 'var(--area-soft)', border: 0 }}>
          <div className="row between">
            <span className="bold row gap-8"><Icon name="Target" size={18} /> Tu afinidad con {ar.nombre}</span>
            <span className="bold" style={{ color: 'var(--area-dark)' }}>{score.pct}%</span>
          </div>
          <Progress value={score.pct} area style={{ marginTop: 10 }} />
        </Card>
      )}

      {/* ---------------- Dónde estudiarías ---------------- */}
      <section className="mt-32">
        <div className="row between wrap gap-12 mb-16">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Dónde estudiarías</h2>
            <p className="section-sub" style={{ fontSize: '.95rem' }}>Universidades que ofrecen {c.nombre} y su mensualidad estimada.</p>
          </div>
        </div>
        <div className="grid cols-2">
          {c.universidades.map((o) => {
            const u = universidad(o.id);
            return (
              <Card key={o.id} className="card-pad">
                <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
                  <UniLogo uni={u} size={46} />
                  <div className="grow">
                    <div className="row between gap-8">
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{u.nombre}</h3>
                      <Badge tone={u.tipo === 'Pública' ? 'ok' : 'soft'}>{u.tipo}</Badge>
                    </div>
                    {uniSummary[o.id]?.rating != null && (
                      <div className="row gap-6 mt-8" style={{ alignItems: 'center' }}>
                        <Stars value={uniSummary[o.id].rating} size={13} />
                        <span className="small bold">{Number(uniSummary[o.id].rating).toFixed(1)}</span>
                        <span className="tiny dim">
                          {uniSummary[o.id].editorial
                            ? '· resumen de opiniones'
                            : `· ${Number(uniSummary[o.id].total || 0).toLocaleString()} opiniones en Google`}
                        </span>
                      </div>
                    )}
                    <div className="row gap-12 wrap small dim mt-8">
                      <span className="row gap-4"><Icon name="MapPin" size={14} /> {u.ciudad}</span>
                      <span className="row gap-4"><Icon name="CalendarClock" size={14} /> {o.duracion} ciclos</span>
                    </div>
                    <div className="row between gap-8 mt-12 wrap">
                      <span className="bold" style={{ color: 'var(--primary-700)' }}>
                        S/ {o.min.toLocaleString()} – {o.max.toLocaleString()} /mes
                      </span>
                      <div className="row gap-8">
                        <a href={u.web} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Web <Icon name="ExternalLink" size={13} /></a>
                        <button className={`btn btn-sm ${revSel === o.id ? 'btn-soft' : 'btn-outline'}`} onClick={() => verOpiniones(o.id)}>
                          Opiniones
                        </button>
                        <Link to={`/carreras/${c.id}/malla/${o.id}`} className="btn btn-sm btn-outline">
                          Ver malla <Icon name="ArrowRight" size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---------------- Opiniones (Google Maps) ---------------- */}
      <section className="mt-32" ref={revRef} style={{ scrollMarginTop: 80 }}>
        <div className="row between wrap gap-12 mb-16">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Opiniones de las universidades</h2>
            <p className="section-sub" style={{ fontSize: '.95rem' }}>Calificación y comentarios de estudiantes sobre cada universidad.</p>
          </div>
          <div className="row wrap gap-8">
            {c.universidades.map((o) => (
              <button key={o.id} className={`chip chip-uni ${revSel === o.id ? 'on' : ''}`} onClick={() => setRevSel(o.id)}>
                <UniLogo uni={universidad(o.id)} size={20} />
                {universidad(o.id).corto}
              </button>
            ))}
          </div>
        </div>
        {revUni && <GoogleReviews key={revUni.id} uni={revUni} />}
      </section>

      {/* ---------------- Información ---------------- */}
      <section className="mt-32">
        <h2 className="section-title mb-16" style={{ fontSize: '1.5rem' }}>Más sobre {c.nombre}</h2>
        <div className="grid cols-2">
          <Section icon="Sparkles" title="Habilidades clave" items={c.habilidades} />
          <Section icon="MapPin" title="Dónde trabaja" items={c.lugares} />
          <Section icon="GraduationCap" title="Cursos que llevarás" items={c.cursos} />
          <Section icon="TrendingUp" title="Puedes emprender en" items={c.emprender} />
          <Section icon="Star" title="Especializaciones" items={c.especializaciones} />
        </div>
      </section>

      <h3 className="mt-32 mb-16 section-title" style={{ fontSize: '1.3rem' }}>Otras carreras de {ar.nombre}</h3>
      <div className="grid cols-3">
        {related.map((r) => <CareerCard key={r.id} career={r} saved={(account?.saved || []).includes(r.id)} onSave={toggleSaved} />)}
      </div>
    </div>
  );
}
