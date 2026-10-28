import { Link } from 'react-router-dom';
import { area } from '../lib/data.js';
import { areaVars, Badge } from './ui.jsx';
import Icon from './Icon.jsx';
import Img from './Img.jsx';

export default function CareerCard({ career, saved, onSave }) {
  const ar = area(career.area);
  return (
    <div className="media-card" style={areaVars(ar)}>
      <Link to={`/carreras/${career.id}`} style={{ position: 'relative', display: 'block' }}>
        <span className="thumb-wrap">
          <Img src={career.img} alt={career.nombre} className="thumb" icon={ar.icon} ratio="16 / 10" />
        </span>
        <span style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge tone="area" icon={ar.icon}>{ar.nombre}</Badge>
        </span>
      </Link>
      <div className="body">
        <div className="row between gap-8">
          <h3 style={{ fontSize: '1.02rem', fontWeight: 700 }} className="truncate">{career.nombre}</h3>
          {onSave && (
            <button
              className="btn btn-ghost btn-icon"
              aria-label={saved ? 'Quitar de guardadas' : 'Guardar carrera'}
              title={saved ? 'Quitar de guardadas' : 'Guardar'}
              onClick={() => onSave(career.id)}
              style={{ color: saved ? 'var(--primary)' : 'var(--muted)' }}
            >
              <Icon name={saved ? 'BookmarkCheck' : 'Bookmark'} size={19} />
            </button>
          )}
        </div>
        <p className="dim small" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {career.descripcion}
        </p>
        <Link to={`/carreras/${career.id}`} className="row gap-4 small bold" style={{ color: 'var(--primary)', textDecoration: 'none', marginTop: 'auto' }}>
          Ver carrera <Icon name="ArrowRight" size={15} />
        </Link>
      </div>
    </div>
  );
}
