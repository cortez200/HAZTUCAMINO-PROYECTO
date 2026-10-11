import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { carrera, area, CARRERAS, universidad, simDeArea } from '../lib/data.js';
import { buildMalla } from '../lib/mallas.js';
import { areaScores } from '../lib/scoring.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { areaVars, Badge, Btn, Card, Progress } from '../components/ui.jsx';
import CareerCard from '../components/CareerCard.jsx';
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
  const [uniSel, setUniSel] = useState(c ? c.universidades[0].id : null);

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
  const sim = simDeArea(c.area);
  const vid = (c.video || '').split('/').pop();

  const privadas = c.universidades.filter((o) => o.tipo === 'Privada');
  const hayPublica = c.universidades.some((o) => o.tipo === 'Pública');
  const minMensual = privadas.length ? Math.min(...privadas.map((o) => o.min)) : null;
  const maxMensual = privadas.length ? Math.max(...privadas.map((o) => o.max)) : null;

  const sel = c.universidades.find((o) => o.id === uniSel) || c.universidades[0];
  const selUni = universidad(sel.id);
  const malla = buildMalla(c, sel);

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
        {sim && (
          <Link to={`/simulaciones/${sim.id}`} className="btn btn-primary"><Icon name="Gamepad2" size={16} /> Simular la carrera</Link>
        )}
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
            {minMensual ? `S/ ${minMensual.toLocaleString()}+` : 'Según universidad'}
          </div>
          <div className="tiny dim mt-8">{minMensual ? `hasta S/ ${maxMensual.toLocaleString()} /mes en privadas` : 'En públicas, pensión baja'}</div>
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

      {/* ---------------- Dónde estudiarla ---------------- */}
      <section className="mt-32">
        <div className="row between wrap gap-12 mb-16">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Dónde estudiarla</h2>
            <p className="section-sub" style={{ fontSize: '.95rem' }}>Universidades que ofrecen {c.nombre} y su mensualidad estimada.</p>
          </div>
        </div>
        <div className="grid cols-2">
          {c.universidades.map((o) => {
            const u = universidad(o.id);
            return (
              <Card key={o.id} className="card-pad">
                <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
                  <span className="uni-logo" style={{ background: u.color }}>{u.corto.slice(0, 3)}</span>
                  <div className="grow">
                    <div className="row between gap-8">
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{u.nombre}</h3>
                      <Badge tone={u.tipo === 'Pública' ? 'ok' : 'soft'}>{u.tipo}</Badge>
                    </div>
                    <div className="row gap-12 wrap small dim mt-8">
                      <span className="row gap-4"><Icon name="MapPin" size={14} /> {u.ciudad}</span>
                      <span className="row gap-4"><Icon name="CalendarClock" size={14} /> {o.duracion} ciclos</span>
                    </div>
                    <div className="row between gap-8 mt-12 wrap">
                      <span className="bold" style={{ color: 'var(--primary-700)' }}>
                        {o.tipo === 'Pública' ? 'Pensión baja (pública)' : `S/ ${o.min.toLocaleString()} – ${o.max.toLocaleString()} /mes`}
                      </span>
                      <div className="row gap-8">
                        <a href={u.web} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Web <Icon name="ExternalLink" size={13} /></a>
                        <button className={`btn btn-sm ${uniSel === o.id ? 'btn-soft' : 'btn-outline'}`} onClick={() => setUniSel(o.id)}>
                          Ver malla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---------------- Malla curricular ---------------- */}
      <section className="mt-32">
        <div className="row between wrap gap-12 mb-16">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Malla curricular</h2>
            <p className="section-sub" style={{ fontSize: '.95rem' }}>Cursos por ciclo en {selUni.nombre}.</p>
          </div>
          <div className="row wrap gap-8">
            {c.universidades.map((o) => (
              <button key={o.id} className={`chip ${uniSel === o.id ? 'on' : ''}`} onClick={() => setUniSel(o.id)}>
                {universidad(o.id).corto}
              </button>
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

      {/* ---------------- Información ---------------- */}
      <section className="mt-32">
        <h2 className="section-title mb-16" style={{ fontSize: '1.5rem' }}>Más sobre {c.nombre}</h2>
        <div className="grid cols-2">
          <Section icon="Sparkles" title="Habilidades clave" items={c.habilidades} />
          <Section icon="MapPin" title="Dónde trabaja" items={c.lugares} />
          <Section icon="GraduationCap" title="Cursos que llevarás" items={c.cursos} />
          <Section icon="TrendingUp" title="Puedes emprender en" items={c.emprender} />
          <Section icon="Star" title="Especializaciones" items={c.especializaciones} />
          {sim && (
            <Card className="card-pad">
              <div className="row gap-8 mb-16">
                <Icon name="Gamepad2" size={18} color="var(--primary)" /> <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Vívelo en una simulación</h2>
              </div>
              <p className="dim small mb-16">Mira un video de la profesión y resuelve un caso real de {ar.nombre} paso a paso.</p>
              <Link to={`/simulaciones/${sim.id}`} className="btn btn-primary"><Icon name="Play" size={16} /> Ir a la simulación</Link>
            </Card>
          )}
        </div>
      </section>

      <h3 className="mt-32 mb-16 section-title" style={{ fontSize: '1.3rem' }}>Otras carreras de {ar.nombre}</h3>
      <div className="grid cols-3">
        {related.map((r) => <CareerCard key={r.id} career={r} saved={(account?.saved || []).includes(r.id)} onSave={toggleSaved} />)}
      </div>
    </div>
  );
}
