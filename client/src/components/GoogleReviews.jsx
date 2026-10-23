import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { UNI_REVIEWS } from '../lib/uniReviewsData.js';
import { Card } from './ui.jsx';
import { Stars } from './Stars.jsx';
import Icon from './Icon.jsx';
import UniLogo from './UniLogo.jsx';

const GOOGLE_LOGO = 'https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png';

/* Reseñas reales de una universidad, obtenidas de Google Maps. */
export default function GoogleReviews({ uni }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Respaldo local: garantiza que los comentarios se muestren aunque la API
     no esté disponible (backend antiguo, sin conexión, etc.). */
  const fallback = UNI_REVIEWS[uni.id] || null;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setData(null);
    api.universityReviews(uni.id)
      .then((r) => { if (alive) setData(r); })
      .catch(() => { if (alive) setData(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [uni.id]);

  /* Preferimos los datos frescos de la API; si no trae comentarios, usamos el respaldo. */
  const reviews = data?.reviews?.length ? data.reviews : (fallback?.reviews || []);
  const rating = data?.rating ?? fallback?.rating ?? null;
  const total = data?.total ?? fallback?.total ?? 0;
  const mapsUrl = data?.mapsUrl || fallback?.mapsUrl || null;
  const editorial = data ? Boolean(data.editorial) : Boolean(fallback?.editorial);
  const hasScore = rating != null;

  return (
    <Card className="card-pad g-reviews">
      <div className="g-head">
        <div className="g-head-uni">
          <UniLogo uni={uni} size={54} />
          <div className="g-head-meta">
            <h3 className="g-uni-name">{uni.nombre}</h3>
            <span className="g-uni-sub"><Icon name="MapPin" size={12} /> {uni.ciudad} · {editorial ? 'Resumen de opiniones' : 'Google Maps'}</span>
          </div>
        </div>

        {hasScore && (
          <div className="g-score">
            <div className="g-score-big">
              <span className="g-score-num">{Number(rating).toFixed(1)}</span>
              <div className="g-score-col">
                <Stars value={rating} size={16} />
                <span className="g-score-count">{editorial ? 'Resumen de estudiantes' : `${Number(total || 0).toLocaleString()} opiniones`}</span>
              </div>
            </div>
            {mapsUrl && (
              <a className="btn btn-outline btn-sm" href={mapsUrl} target="_blank" rel="noreferrer">
                {editorial ? 'Ver más opiniones' : 'Ver en Google Maps'} <Icon name="ExternalLink" size={12} />
              </a>
            )}
          </div>
        )}
      </div>

      {loading && reviews.length === 0 ? (
        <div className="g-loading"><span className="g-spinner" /> Cargando opiniones de Google Maps…</div>
      ) : reviews.length === 0 ? (
        <div className="review-empty">
          <Icon name="MessageCircle" size={20} />
          <div>
            <strong>Sin comentarios disponibles</strong>
            <div className="tiny dim">
              {mapsUrl
                ? <a href={mapsUrl} target="_blank" rel="noreferrer">Ver en Google Maps <Icon name="ExternalLink" size={11} /></a>
                : 'Esta universidad aún no tiene reseñas públicas.'}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="g-list-head">
            <Icon name="MessageCircle" size={14} /> {editorial ? 'Resumen de opiniones' : 'Lo que dicen los estudiantes'}
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

      {mapsUrl && (
        <div className="g-foot">
          <span className="tiny dim row gap-6">
            <Icon name="MapPin" size={13} />
            {editorial ? 'Resumen elaborado con opiniones públicas de estudiantes' : 'Opiniones publicadas por usuarios en Google Maps'}
          </span>
          {!editorial && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="g-powered" aria-label="Powered by Google">
              <img src={GOOGLE_LOGO} alt="Powered by Google" height={16} />
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
