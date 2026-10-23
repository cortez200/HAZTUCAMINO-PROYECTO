import { Link } from 'react-router-dom';
import { MISSIONS, CARRERAS, AREAS, area, isPremium, missionsDeCarrera, nivelMision, isFreeMission, engineIcon, engineLabel } from '../lib/data.js';
import { useAuth } from '../lib/store.jsx';
import { areaVars, Badge, Card, Progress } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

function MissionRow({ m, ar, account }) {
  const locked = !isFreeMission(m) && !isPremium(account);
  const mp = account?.missions?.[m.id];
  const total = m.objetivos || mp?.total || 1;
  const pct = mp ? Math.round((Math.min(mp.best, total) / total) * 100) : 0;
  const done = mp && mp.best >= total;

  const body = (
    <>
      <span className="mission-row-ico"><Icon name={locked ? 'Lock' : engineIcon(m.engine)} size={20} /></span>
      <span className="grow">
        <span className="row gap-8 wrap">
          <b className="mission-row-title">{m.titulo}</b>
          <Badge tone="soft" icon={engineIcon(m.engine)}>{engineLabel(m.engine)}</Badge>
          <Badge tone={isFreeMission(m) ? 'ok' : 'gold'} icon={isFreeMission(m) ? 'Unlock' : 'Lock'}>{isFreeMission(m) ? 'Gratis' : 'Premium'}</Badge>
        </span>
        <span className="dim small mission-row-sub">{nivelMision(m.nivel)} · {m.habilidades.slice(0, 3).join(' · ')}</span>
        {!locked && account && (
          <span className="mission-row-prog">
            <Progress value={pct} area />
            <em>{done ? 'Completada' : mp ? `${mp.best}/${total} · ${pct}%` : 'Sin empezar'}</em>
          </span>
        )}
      </span>
    </>
  );

  if (locked) {
    return (
      <Link to="/planes" className="mission-row is-locked" style={areaVars(ar)} aria-label={`Desbloquear ${m.titulo} con Premium`}>
        {body}
        <span className="mission-row-cta"><Icon name="Lock" size={16} /> Desbloquear</span>
      </Link>
    );
  }

  return (
    <Link to={`/simulaciones/mision/${m.id}`} className={`mission-row ${done ? 'is-done' : ''}`} style={areaVars(ar)}>
      {body}
      <span className="mission-row-cta">
        <Icon name={mp ? 'RotateCcw' : 'Play'} size={16} /> {mp ? (done ? 'Repetir' : 'Continuar') : 'Jugar'}
      </span>
    </Link>
  );
}

function SectionHead({ icon, title, sub, children }) {
  return (
    <div className="sim-h2">
      <span className="sim-h2-ico"><Icon name={icon} size={19} /></span>
      <div className="grow">
        <h2>{title}</h2>
        {sub && <p className="sim-h2-sub">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Simulaciones() {
  const { account } = useAuth();
  const carreras = CARRERAS
    .filter((c) => missionsDeCarrera(c.id).length > 0)
    .sort((a, b) => missionsDeCarrera(b.id).length - missionsDeCarrera(a.id).length);
  const enDesarrollo = CARRERAS.filter((c) => missionsDeCarrera(c.id).length === 0);

  const totalMisiones = MISSIONS.length;
  const completadas = account
    ? MISSIONS.filter((m) => {
        const mp = account.missions?.[m.id];
        return mp && mp.best >= (m.objetivos || mp.total || 1);
      }).length
    : 0;
  const xpGanado = account
    ? MISSIONS.reduce((acc, m) => {
        const mp = account.missions?.[m.id];
        if (!mp) return acc;
        const total = m.objetivos || mp.total || 1;
        return acc + Math.round((Math.min(mp.best, total) / total) * (m.xp || 0));
      }, 0)
    : 0;
  const areasExploradas = account
    ? new Set(MISSIONS.filter((m) => account.missions?.[m.id]).map((m) => m.area)).size
    : 0;
  const pctGlobal = totalMisiones ? Math.round((completadas / totalMisiones) * 100) : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Simulaciones</h1>
          <p className="page-sub">Practica profesiones reales con misiones interactivas: código, casos clínicos y retos de decisión.</p>
        </div>
      </div>

      {account ? (
        <div className="sim-hero">
          <div className="sim-hero-inner">
            <div className="sim-hero-main">
              <div className="row gap-8">
                <Icon name="TrendingUp" size={18} color="#bff8f2" />
                <span className="sim-hero-title">Tu progreso</span>
              </div>
              <p className="sim-hero-sub">
                {completadas === 0
                  ? 'Aún no has completado misiones. ¡Empieza con una misión gratuita!'
                  : `Has completado ${completadas} de ${totalMisiones} misiones. ¡Sigue así!`}
              </p>
              <div className="sim-hero-bar"><span style={{ width: `${pctGlobal}%` }} /></div>
              <span className="sim-hero-pct">{pctGlobal}% del recorrido</span>
            </div>
            <div className="sim-stats">
              <div className="sim-stat"><b>{completadas}<i>/{totalMisiones}</i></b><em>Misiones</em></div>
              <div className="sim-stat"><b>{xpGanado}</b><em>XP ganado</em></div>
              <div className="sim-stat"><b>{areasExploradas}<i>/{AREAS.length}</i></b><em>Áreas</em></div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="sim-cta">
          <span className="sim-cta-ico"><Icon name="User" size={22} /></span>
          <div className="grow">
            <h3>Crea una cuenta para guardar tu avance</h3>
            <p className="dim small mt-8" style={{ margin: 0 }}>Tu progreso, XP y misiones completadas se guardarán en tu perfil.</p>
          </div>
          <Link to="/register" className="btn btn-primary"><Icon name="Sparkles" size={18} /> Empezar gratis</Link>
        </Card>
      )}

      {/* Misiones por carrera */}
      <SectionHead
        icon="Gamepad2"
        title="Misiones por carrera"
        sub="Cada simulador te pone en el rol de un profesional. Hay misiones gratuitas y misiones Premium para practicar más."
      >
        <span className="badge badge-soft">{carreras.length} carreras</span>
      </SectionHead>

      {carreras.length === 0 && (
        <Card className="card-pad center"><p className="dim">Todavía no hay misiones disponibles.</p></Card>
      )}

      <div className="grid cols-2">
        {carreras.map((c) => {
          const ar = area(c.area);
          const list = missionsDeCarrera(c.id);
          const doneCount = list.filter((m) => account?.missions?.[m.id]?.best >= (m.objetivos || 1)).length;
          return (
            <Card key={c.id} className="card-pad career-missions" style={areaVars(ar)}>
              <div className="cm-head">
                <span className="mission-ico sm" style={{ background: 'var(--area-soft)', color: 'var(--area)' }}>
                  <Icon name={ar.icon} size={22} />
                </span>
                <div className="grow">
                  <Badge tone="area">{ar.nombre}</Badge>
                  <h3 className="cm-title">{c.nombre}</h3>
                </div>
                <Link to={`/carreras/${c.id}`} className="btn btn-soft btn-sm">Ver carrera</Link>
              </div>
              <div className="stack gap-8">
                {list.map((m) => <MissionRow key={m.id} m={m} ar={ar} account={account} />)}
              </div>
              <p className="cm-foot">
                <Icon name="CheckCircle2" size={14} /> <b>{doneCount}</b> de {list.length} completadas · {list.length} {list.length === 1 ? 'misión' : 'misiones'}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Carreras en desarrollo */}
      {enDesarrollo.length > 0 && (
        <>
          <SectionHead
            icon="Hourglass"
            title="Simuladores en desarrollo"
            sub="Estamos creando misiones para estas carreras. Mientras tanto, puedes explorar sus fichas y opciones de estudio."
          />
          <Card className="card-pad">
            <div className="row gap-8 wrap">
              {enDesarrollo.map((c) => (
                <Link key={c.id} to={`/carreras/${c.id}`} className="develop-chip">
                  <Icon name={area(c.area)?.icon} size={14} /> {c.nombre}
                  <em>Pronto</em>
                </Link>
              ))}
            </div>
          </Card>
        </>
      )}

    </>
  );
}
