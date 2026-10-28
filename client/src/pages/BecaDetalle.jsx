import { Link, useParams } from 'react-router-dom';
import { BECAS, getBecaById, estadoPostulacion, etapasDePostulacion } from '../lib/becas.js';
import { universidad } from '../lib/data.js';
import { Card, Badge } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import UniLogo from '../components/UniLogo.jsx';

export default function BecaDetalle() {
  const { id } = useParams();
  const b = getBecaById(id);

  if (!b) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1 className="page-title">Beca no encontrada</h1>
            <p className="page-sub">La beca solicitada no existe en este listado.</p>
          </div>
        </div>
        <Card className="card-pad">
          <Link to="/becas" className="btn btn-soft">Volver a Becas</Link>
        </Card>
      </>
    );
  }

  const mismas = BECAS.filter((x) => x.tipo === b.tipo && x.id !== b.id);
  const relacionadas = (mismas.length ? mismas : BECAS.filter((x) => x.id !== b.id)).slice(0, 3);
  const estado = estadoPostulacion(b);
  const etapas = etapasDePostulacion(b.postulacion);
  const unis = (b.universidades || []).map((id) => universidad(id)).filter(Boolean);

  return (
    <>
      <div className="beca-detail-crumb">
        <Link to="/becas" className="crumb">
          <Icon name="ArrowLeft" size={15} /> Volver a becas
        </Link>
      </div>

      <div className="beca-detail-head">
        <div className="row gap-8 wrap">
          <Badge tone="soft" icon="Landmark">{b.entidad}</Badge>
          <Badge tone="area">{b.tipo}</Badge>
          <Badge tone={estado.tone} icon={estado.icon}>{estado.label}</Badge>
          {b.destacada && <Badge tone="ok" icon="Star">Destacada</Badge>}
        </div>
        <h1 className="beca-detail-title">{b.nombre}</h1>
        <p className="beca-detail-sub">{b.dirigidoA}</p>
        <div className="beca-detail-meta">
          <span><Icon name="Users" size={15} /> Dirigida a: {b.publico}</span>
          <span className="becas-dot" />
          <span><Icon name="BadgeCheck" size={15} color="var(--ok)" /> Información oficial de PRONABEC</span>
        </div>
      </div>

      <div className="beca-detail-layout">
        <main className="beca-detail-main">
          <Card className="beca-section">
            <div className="beca-section-head">
              <div className="beca-section-ico"><Icon name="CalendarClock" size={20} /></div>
              <div>
                <h2>Estado de la postulación</h2>
                <p>En qué etapa va la convocatoria de esta beca.</p>
              </div>
              <Badge tone={estado.tone} icon={estado.icon}>{estado.label}</Badge>
            </div>
            <ol className="beca-estados">
              {etapas.map((e) => (
                <li key={e.t} className={`is-${e.estado}`}>
                  <span className="beca-estado-dot">
                    <Icon name={e.estado === 'done' ? 'Check' : e.estado === 'current' ? 'Clock' : 'CalendarClock'} size={13} />
                  </span>
                  <span className="beca-estado-txt">
                    <b>{e.t}</b>
                    <small>{e.fecha}</small>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="beca-section">
            <div className="beca-section-head">
              <div className="beca-section-ico"><Icon name="ClipboardCheck" size={20} /></div>
              <div>
                <h2>Requisitos</h2>
                <p>Verifica que cumples con todos antes de postular.</p>
              </div>
            </div>
            <ul className="beca-requisitos">
              {b.requisitos.map((r, i) => (
                <li key={i}>
                  <span className="beca-req-ico"><Icon name="Check" size={13} /></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="beca-section">
            <div className="beca-section-head">
              <div className="beca-section-ico"><Icon name="Building2" size={20} /></div>
              <div>
                <h2>Universidades donde la encuentras</h2>
                <p>Instituciones de referencia donde puedes usar esta beca.</p>
              </div>
            </div>
            {unis.length ? (
              <div className="beca-uni-grid">
                {unis.map((u) => (
                  <div key={u.id} className="beca-uni-item">
                    <UniLogo uni={u} size={38} />
                    <span>
                      <b>{u.corto || u.nombre}</b>
                      <small>{u.ciudad} · {u.tipo}</small>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dim small" style={{ margin: 0 }}>{b.universidadesNota || 'Consulta la lista oficial de instituciones elegibles en el portal de PRONABEC.'}</p>
            )}
            <p className="tiny muted mt-12">
              Lista de referencia: la lista oficial de instituciones elegibles se publica en las bases de cada convocatoria.
            </p>
          </Card>

          <Card className="beca-section">
            <div className="beca-section-head">
              <div className="beca-section-ico"><Icon name="FolderKanban" size={20} /></div>
              <div>
                <h2>Módulos</h2>
                <p>Componentes que cubre la beca durante su proceso.</p>
              </div>
            </div>
            <div className="beca-modulos">
              {b.modulos.map((m) => (
                <span key={m} className="beca-modulo">
                  <Icon name="CheckCircle2" size={14} color="var(--ok)" />
                  {m}
                </span>
              ))}
            </div>
          </Card>

          <Card className="beca-section">
            <div className="beca-section-head">
              <div className="beca-section-ico"><Icon name="FileText" size={20} /></div>
              <div>
                <h2>¿Cómo postular?</h2>
                <p>Sigue estos pasos y postula solo por canales oficiales.</p>
              </div>
            </div>
            <ol className="beca-pasos">
              {b.comoPostular.map((r, i) => (
                <li key={i}>
                  <span className="beca-paso-num">{i + 1}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="beca-warning">
            <div className="row gap-12">
              <div className="beca-warning-ico"><Icon name="AlertTriangle" size={19} /></div>
              <div>
                <b>Importante</b>
                <p>
                  Los cronogramas, vacantes, modalidades y requisitos son oficiales y pueden actualizarse.
                  Postula únicamente desde el sitio oficial de PRONABEC o gob.pe.
                </p>
              </div>
            </div>
          </Card>
        </main>

        <aside className="beca-detail-side">
          <Card className="beca-summary">
            <h2 className="beca-summary-title">Resumen de la beca</h2>

            <div className="beca-summary-block">
              <span className="beca-summary-label">Cobertura</span>
              <ul className="beca-cobertura-list">
                {b.cobertura.map((c) => (
                  <li key={c}>
                    <span className="beca-check-mini"><Icon name="Check" size={12} /></span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="beca-summary-block">
              <span className="beca-summary-label">Vigencia</span>
              <div className="beca-summary-vig">
                <Icon name="CalendarClock" size={16} />
                <span>{b.vigencia}</span>
              </div>
              {b.nota && <p className="tiny muted">{b.nota}</p>}
            </div>

            <div className="beca-summary-block">
              <span className="beca-summary-label">Entidad</span>
              <div className="beca-summary-entity">{b.entidad}</div>
              <p className="tiny muted">{b.publico}</p>
            </div>

            <a
              href={b.linkOficial}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary beca-summary-cta"
            >
              Postular en sitio oficial <Icon name="ExternalLink" size={16} />
            </a>
            {b.linkGobPe && (
              <a
                href={b.linkGobPe}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-soft beca-summary-gob"
              >
                Ver en gob.pe <Icon name="ExternalLink" size={16} />
              </a>
            )}
            <p className="beca-summary-note">La postulación es gratuita. No pagues a terceros.</p>
          </Card>
        </aside>
      </div>

      <section className="beca-related">
        <div className="row between wrap gap-10 mb-20">
          <div>
            <h2 className="section-title" style={{ margin: 0, fontSize: '1.3rem' }}>
              Otras becas que podrían interesarte
            </h2>
            <p className="dim small" style={{ margin: '6px 0 0' }}>Opciones con requisitos o beneficios similares.</p>
          </div>
          <Link to="/becas" className="small bold" style={{ color: 'var(--primary)' }}>
            Ver todas <Icon name="ArrowRight" size={14} />
          </Link>
        </div>

        <div className="beca-related-grid">
          {relacionadas.map((r) => (
            <Card key={r.id} className="beca-related-card">
              <div className="row gap-6 wrap">
                <Badge tone="area">{r.tipo}</Badge>
                {r.destacada && <Badge tone="ok" icon="Star">Destacada</Badge>}
              </div>
              <h3><Link to={`/becas/${r.id}`}>{r.nombre}</Link></h3>
              <p className="dim small" style={{ margin: 0 }}>{r.publico}</p>
              <div className="beca-related-foot">
                <Link to={`/becas/${r.id}`} className="beca-oficial">
                  Ver detalles <Icon name="ArrowRight" size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
