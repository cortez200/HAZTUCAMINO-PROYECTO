import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BECAS, tiposBeca, perfilesBeca, getBecasRecomendadas,
  estadoPostulacion, becasPorUniversidad, esBecaGratis, FREE_BECAS
} from '../lib/becas.js';
import { universidad, isPremium } from '../lib/data.js';
import { useAuth } from '../lib/store.jsx';
import { Card, Badge } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import UniLogo from '../components/UniLogo.jsx';

const PASOS = [
  {
    icon: 'ClipboardCheck',
    title: 'Revisa los requisitos',
    text: 'Confirma tu nacionalidad, nivel de estudios, edad, rendimiento y condición socioeconómica antes de postular.'
  },
  {
    icon: 'FileText',
    title: 'Prepara tus documentos',
    text: 'Ten a mano tu DNI, certificados de estudios, constancias y declaraciones juradas que pida la convocatoria.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Postula solo en el portal oficial',
    text: 'Ingresa desde pronabec.gob.pe o gob.pe. PRONABEC no cobra por postular ni atiende postulaciones por WhatsApp.'
  }
];

const FAQS = [
  {
    q: '¿Postular a una beca cuesta dinero?',
    a: 'No. El proceso de postulación de PRONABEC es gratuito. Desconfía de personas o academias que ofrecen “asegurar” una beca o piden pagos por trámites.'
  },
  {
    q: '¿Puedo postular a más de una beca?',
    a: 'Depende de las bases y del nivel de estudios. Normalmente no se puede recibir dos becas del Estado para el mismo nivel. Revisa los impedimentos de cada convocatoria.'
  },
  {
    q: '¿Dónde se publican los resultados?',
    a: 'Solo en el portal oficial de PRONABEC o en gob.pe/pronabec. No confíes en resultados enviados por redes sociales, WhatsApp o terceros.'
  },
  {
    q: '¿Las fechas y vacantes son fijas?',
    a: 'No. Cada convocatoria tiene su propio cronograma y número de vacantes. Verifica siempre la convocatoria vigente antes de preparar tu postulación.'
  }
];

function BecaCard({ b, bloqueada = false }) {
  const cubre = b.cobertura.slice(0, 3).join(' · ');
  const extra = b.cobertura.length - 3;
  const estado = estadoPostulacion(b);
  const totalUnis = (b.universidades || []).length;

  return (
    <Card className={`card-pad beca-tile${b.destacada ? ' is-featured' : ''}`} style={bloqueada ? { position: 'relative', overflow: 'hidden' } : undefined}>
      {bloqueada && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 18, background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(4px)' }}>
          <div>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
              <Icon name="Lock" size={22} />
            </span>
            <Badge tone="primary" icon="Sparkles">Contenido Premium</Badge>
            <p className="small bold" style={{ margin: '10px 0 0', maxWidth: 240 }}>
              Desbloquea esta y las {BECAS.length} becas con su detalle completo.
            </p>
            <Link to="/planes" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              Ver planes <Icon name="ArrowRight" size={15} />
            </Link>
          </div>
        </div>
      )}
      <div className="beca-tile-top">
        <div className="row gap-6 wrap">
          <Badge tone="area">{b.tipo}</Badge>
          <Badge tone={estado.tone} icon={estado.icon}>{estado.label}</Badge>
          {b.destacada && <Badge tone="ok" icon="Star">Destacada</Badge>}
        </div>
        <span className="beca-publico">{b.publico}</span>
      </div>

      <h2 className="beca-title">{b.nombre}</h2>
      <p className="beca-desc">{b.dirigidoA}</p>

      <div className="beca-cubre">
        <span className="beca-label">Cubre</span>
        <span>{cubre}{extra > 0 ? ` · +${extra} más` : ''}</span>
      </div>

      <div className="beca-unis">
        <Icon name="Building2" size={14} />
        <span>
          {totalUnis
            ? `${totalUnis} universidades de referencia`
            : (b.universidadesNota ? 'Instituciones según bases oficiales' : 'Consulta la lista oficial')}
        </span>
        <span className="becas-dot" />
        <Icon name="FolderKanban" size={14} />
        <span>{b.modulos?.length || 0} módulos</span>
      </div>

      <div className="beca-foot">
        <span className="beca-vigencia">
          <Icon name="CalendarClock" size={14} />
          {b.vigencia}
        </span>
        <div className="beca-links">
          <Link to={`/becas/${b.id}`} className="btn btn-primary btn-sm">
            Ver detalles <Icon name="ArrowRight" size={15} />
          </Link>
          <a
            href={b.linkOficial}
            target="_blank"
            rel="noopener noreferrer"
            className="beca-oficial"
            title={`Abrir sitio oficial de ${b.nombre}`}
          >
            Sitio oficial <Icon name="ExternalLink" size={14} />
          </a>
        </div>
      </div>
    </Card>
  );
}

export default function Becas() {
  const { account } = useAuth();
  const premium = isPremium(account);
  const [tipo, setTipo] = useState('Todos');
  const [q, setQ] = useState('');
  const [perfil, setPerfil] = useState('todas');
  const [uniSel, setUniSel] = useState('todas');

  const recomendadas = useMemo(() => getBecasRecomendadas(perfil), [perfil]);
  const porUni = useMemo(() => becasPorUniversidad(), []);
  const uniIds = useMemo(
    () => [...porUni.keys()].sort((a, b) => (universidad(a)?.nombre || '').localeCompare(universidad(b)?.nombre || '')),
    [porUni]
  );
  const becasDeUni = useMemo(() => (uniSel === 'todas' ? [] : (porUni.get(uniSel) || [])), [uniSel, porUni]);

  const list = useMemo(() => {
    const base = perfil === 'todas' ? BECAS : recomendadas;
    const needle = q.trim().toLowerCase();
    return base.filter((b) => {
      const matchTipo = tipo === 'Todos' || b.tipo === tipo;
      const matchQ = !needle
        || b.nombre.toLowerCase().includes(needle)
        || b.dirigidoA.toLowerCase().includes(needle)
        || b.publico.toLowerCase().includes(needle)
        || b.cobertura.some((c) => c.toLowerCase().includes(needle));
      return matchTipo && matchQ;
    });
  }, [tipo, q, perfil, recomendadas]);

  const tiposDisponibles = new Set(BECAS.map((b) => b.tipo)).size;
  const hayFiltros = tipo !== 'Todos' || q || perfil !== 'todas';

  const limpiar = () => {
    setTipo('Todos');
    setQ('');
    setPerfil('todas');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <Badge tone="soft" icon="BadgeCheck">Datos oficiales de PRONABEC</Badge>
          <h1 className="page-title mt-10">Becas y financiamiento</h1>
          <p className="page-sub">
            Opciones reales para estudiar en Perú o el extranjero. Revisa requisitos, cobertura y postula siempre desde el sitio oficial.
          </p>
          <div className="becas-meta">
            <span><b>{BECAS.length}</b> becas y créditos</span>
            <span className="becas-dot" />
            <span><b>{tiposDisponibles}</b> modalidades</span>
            <span className="becas-dot" />
            <span className="row gap-4"><Icon name="BadgeCheck" size={14} color="var(--ok)" /> Enlaces oficiales verificados</span>
          </div>
        </div>
        <a
          href="https://www.pronabec.gob.pe/concursos-becas-creditos/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Ver convocatorias vigentes <Icon name="ExternalLink" size={16} />
        </a>
      </div>

      <Card className="card-pad becas-finder">
        <div className="becas-finder-row">
          <div className="row gap-12">
            <div className="becas-finder-ico"><Icon name="Compass" size={22} /></div>
            <div>
              <b className="becas-finder-title">Encuentra tu beca</b>
              <p className="dim small" style={{ margin: '4px 0 0' }}>
                Elige tu situación y te mostramos las opciones compatibles.
              </p>
            </div>
          </div>
          <select
            className="input becas-select"
            id="beca-perfil"
            name="perfil"
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
            aria-label="Recomendar becas según mi situación"
          >
            {perfilesBeca.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        {perfil !== 'todas' && (
          <div className="becas-chips">
            <span className="small bold">Recomendadas para ti:</span>
            {recomendadas.map((b) => (
              <Link key={b.id} to={`/becas/${b.id}`} className="badge badge-area beca-chip">
                {b.nombre}
              </Link>
            ))}
          </div>
        )}

        <div className="becas-divider" />

        <div className="row gap-12 wrap becas-filters">
          <div className="row gap-8">
            <Icon name="SlidersHorizontal" size={16} />
            <span className="small bold">Filtrar</span>
          </div>
          <select
            className="input becas-select-type"
            id="beca-tipo"
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Filtrar por tipo"
          >
            {tiposBeca.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            className="input grow"
            id="beca-buscar"
            name="buscar"
            placeholder="Buscar por nombre, requisito o beneficio..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {hayFiltros && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={limpiar}>
              <Icon name="X" size={15} /> Limpiar
            </button>
          )}
        </div>
      </Card>

      <div className="row between wrap gap-10 mt-32 mb-16">
        <h2 className="section-title" style={{ margin: 0, fontSize: '1.3rem' }}>
          {perfil === 'todas' ? 'Todas las opciones' : 'Recomendadas para ti'}
        </h2>
        <div className="row gap-8 wrap" style={{ alignItems: 'center' }}>
          <span className="small muted">
            {list.length} resultado{list.length === 1 ? '' : 's'}
            {!premium && ` · ves ${FREE_BECAS.length} de ${BECAS.length} becas`}
          </span>
          {!premium && (
            <Link to="/planes" className="small bold row gap-4" style={{ color: 'var(--primary)' }}>
              <Icon name="Sparkles" size={14} /> Desbloquea las {BECAS.length} con Premium
            </Link>
          )}
        </div>
      </div>

      <div className="becas-grid">
        {list.map((b) => (
          <BecaCard key={b.id} b={b} bloqueada={!premium && !esBecaGratis(b.id)} />
        ))}
      </div>

      {list.length === 0 && (
        <Card className="card-pad center mt-24">
          <p className="dim">No hay becas que coincidan con los filtros.</p>
          <button type="button" className="btn btn-soft mt-12" onClick={limpiar}>Ver todas las becas</button>
        </Card>
      )}

      <section className="mt-48">
        <div className="row between wrap gap-10 mb-20">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Becas por universidad</h2>
            <p className="dim small" style={{ margin: '6px 0 0' }}>
              Elige una universidad y mira qué becas puedes usar ahí, con su estado de postulación y sus módulos.
            </p>
          </div>
          {uniSel !== 'todas' && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUniSel('todas')}>
              <Icon name="X" size={15} /> Ver todas las universidades
            </button>
          )}
        </div>

        {uniSel === 'todas' ? (
          <div className="becas-uni-grid">
            {uniIds.map((id) => {
              const u = universidad(id);
              const n = porUni.get(id).length;
              if (!u) return null;
              return (
                <button key={id} type="button" className="becas-uni-card" onClick={() => setUniSel(id)}>
                  <UniLogo uni={u} size={42} />
                  <span className="becas-uni-info">
                    <b>{u.corto || u.nombre}</b>
                    <small>{u.ciudad} · {n} beca{n === 1 ? '' : 's'}</small>
                  </span>
                  <Icon name="ChevronRight" size={17} />
                </button>
              );
            })}
          </div>
        ) : (
          <Card className="card-pad">
            <div className="row between wrap gap-12 mb-16">
              <div className="row gap-12">
                <UniLogo uni={universidad(uniSel)} size={46} />
                <div>
                  <b style={{ fontSize: '1.05rem' }}>{universidad(uniSel)?.nombre}</b>
                  <p className="dim small" style={{ margin: '3px 0 0' }}>
                    {becasDeUni.length} beca{becasDeUni.length === 1 ? '' : 's'} disponible{becasDeUni.length === 1 ? '' : 's'} en esta universidad
                  </p>
                </div>
              </div>
            </div>
            <div className="becas-uni-list">
              {becasDeUni.map((b) => {
                const estado = estadoPostulacion(b);
                return (
                  <Link key={b.id} to={`/becas/${b.id}`} className="becas-uni-row">
                    <span className="becas-uni-row-main">
                      <b>{b.nombre}</b>
                      <small>
                        {b.tipo} · {b.requisitos.length} requisitos · {b.modulos?.length || 0} módulos
                      </small>
                    </span>
                    <Badge tone={estado.tone} icon={estado.icon}>{estado.label}</Badge>
                    <Icon name="ArrowRight" size={16} />
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      <section style={{ marginTop: 48 }}>
        <div className="row between wrap gap-10 mb-20">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Cómo postular sin caer en estafas</h2>
            <p className="dim small" style={{ margin: '6px 0 0' }}>Tres pasos simples antes de enviar tu postulación.</p>
          </div>
        </div>
        <div className="becas-guide-grid">
          {PASOS.map((p, i) => (
            <Card key={p.title} className="card-pad beca-guide-card">
              <div className="beca-guide-ico"><Icon name={p.icon} size={20} /></div>
              <span className="beca-guide-num">Paso {i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="card-pad mt-32">
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Preguntas frecuentes</h2>
        <div className="faq-list mt-16">
          {FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <span>{f.q}</span>
                <Icon name="ChevronDown" size={16} />
              </summary>
              <p className="dim small">{f.a}</p>
            </details>
          ))}
        </div>
      </Card>

      <Card className="card-pad mt-24">
        <div className="row gap-10">
          <Icon name="Info" size={18} />
          <div className="grow">
            <b>Información verificada</b>
            <p className="dim small" style={{ margin: '6px 0 0' }}>
              Esta sección reúne becas y créditos reales de PRONABEC. Los plazos, vacantes y requisitos cambian por
              convocatoria; confirma siempre en el sitio oficial antes de postular. Última revisión: 2026.
            </p>
            <a
              href="https://www.pronabec.gob.pe/concursos-becas-creditos/"
              target="_blank"
              rel="noopener noreferrer"
              className="small bold"
              style={{ display: 'inline-block', marginTop: 8, color: 'var(--primary)' }}
            >
              Ir al portal oficial de concursos <Icon name="ExternalLink" size={14} />
            </a>
          </div>
        </div>
      </Card>
    </>
  );
}
