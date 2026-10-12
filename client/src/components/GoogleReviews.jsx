import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Card } from './ui.jsx';
import { Stars } from './Stars.jsx';
import Icon from './Icon.jsx';
import UniLogo from './UniLogo.jsx';

const GOOGLE_LOGO = 'https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png';

/* Reseñas reales de una universidad, obtenidas de Google Maps. */
export default function GoogleReviews({ uni }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setData(null);
    api.universityReviews(uni.id)
      .then((r) => { if (alive) setData(r); })
      .catch(() => { if (alive) setData({ enabled: true, rating: null, total: 0, reviews: [] }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [uni.id]);

  const reviews = data?.reviews || [];
  const hasScore = data?.rating != null;

  return (
    <Card className="card-pad g-reviews">
      <div className="g-head">
        <div className="g-head-uni">
          <UniLogo uni={uni} size={54} />
          <div className="g-head-meta">
            <h3 className="g-uni-name">{uni.nombre}</h3>
            <span className="g-uni-sub"><Icon name="MapPin" size={12} /> {uni.ciudad} · Google Maps</span>
          </div>
        </div>

        {hasScore && (
          <div className="g-score">
            <div className="g-score-big">
              <span className="g-score-num">{Number(data.rating).toFixed(1)}</span>
              <div className="g-score-col">
                <Stars value={data.rating} size={16} />
                <span className="g-score-count">{Number(data.total || 0).toLocaleString()} opiniones</span>
              </div>
            </div>
            {data.mapsUrl && (
              <a className="btn btn-outline btn-sm" href={data.mapsUrl} target="_blank" rel="noreferrer">
                Ver en Google Maps <Icon name="ExternalLink" size={12} />
              </a>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="g-loading"><span className="g-spinner" /> Cargando opiniones de Google Maps…</div>
      ) : reviews.length === 0 ? (
        <div className="review-empty">
          <Icon name="MessageCircle" size={20} />
          <div>
            <strong>Sin comentarios disponibles</strong>
            <div className="tiny dim">
              {data?.mapsUrl
                ? <a href={data.mapsUrl} target="_blank" rel="noreferrer">Ver en Google Maps <Icon name="ExternalLink" size={11} /></a>
                : 'Esta universidad aún no tiene reseñas públicas.'}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="g-list-head">
            <Icon name="MessageCircle" size={14} /> Lo que dicen los estudiantes
            <span className="g-count">{reviews.length}</span>
          </div>
          <div className="g-review-grid">
            {reviews.map((r, i) => (
              <article className="g-review" key={i}>
                <div className="g-review-head">
                  {r.photo
                    ? <img className="g-avatar" src={r.photo} alt={r.author} referrerPolicy="no-referrer" />
                    : <span className="g-avatar-fallback">{(r.author || 'G').slice(0, 1).toUpperCase()}</span>}
                  <div className="g-review-who">
                    {r.authorUrl
                      ? <a className="g-author" href={r.authorUrl} target="_blank" rel="noreferrer">{r.author}</a>
                      : <span className="g-author">{r.author}</span>}
                    <span className="g-date">{r.time}</span>
                  </div>
                  <span className="g-review-stars"><Stars value={r.rating || 0} size={12} /></span>
                </div>
                <p className="g-review-text">{r.text}</p>
              </article>
            ))}
          </div>
        </>
      )}

      {data?.mapsUrl && (
        <div className="g-foot">
          <span className="tiny dim row gap-6">
            <Icon name="MapPin" size={13} />
            Opiniones publicadas por usuarios en Google Maps
          </span>
          <a href={data.mapsUrl} target="_blank" rel="noreferrer" className="g-powered" aria-label="Powered by Google">
            <img src={GOOGLE_LOGO} alt="Powered by Google" height={16} />
          </a>
        </div>
      )}
    </Card>
  );
}
