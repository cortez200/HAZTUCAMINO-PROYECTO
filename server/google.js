// Cliente mínimo de Google Places para traer la calificación y las reseñas
// públicas reales (Google Maps) de cada universidad.
//
// Usa la Places API (Legacy); si esa no está habilitada en la key, intenta la
// Places API (New). Requiere la variable de entorno GOOGLE_MAPS_API_KEY.

const key = () => process.env.GOOGLE_MAPS_API_KEY || '';
export const hasGoogle = () => Boolean(key());

async function getJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* --------------------------- Places API (Legacy) --------------------------- */
async function legacyFindId(query) {
  const url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    + `?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&language=es&key=${key()}`;
  const j = await getJson(url);
  if (!j || (j.status !== 'OK' && j.status !== 'ZERO_RESULTS')) return null;
  return j.candidates?.[0]?.place_id || null;
}

async function legacyDetails(placeId) {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + `?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url`
    + `&language=es&reviews_sort=newest&key=${key()}`;
  const j = await getJson(url);
  return j && j.status === 'OK' ? j.result : null;
}

function normalizeLegacy(d, placeId) {
  return {
    rating: typeof d.rating === 'number' ? d.rating : null,
    total: d.user_ratings_total || 0,
    mapsUrl: d.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    reviews: (d.reviews || []).map((r) => ({
      author: r.author_name || 'Usuario de Google',
      photo: r.profile_photo_url || null,
      authorUrl: r.author_url || null,
      rating: r.rating || null,
      text: r.text || '',
      time: r.relative_time_description || ''
    }))
  };
}

/* ---------------------------- Places API (New) ----------------------------- */
async function newFindId(query) {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key(),
        'X-Goog-FieldMask': 'places.id,places.displayName'
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'es', maxResultCount: 1 })
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.places?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function newDetails(placeId) {
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=es`, {
      headers: {
        'X-Goog-Api-Key': key(),
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,googleMapsUri'
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function normalizeNew(d, placeId) {
  return {
    rating: typeof d.rating === 'number' ? d.rating : null,
    total: d.userRatingCount || 0,
    mapsUrl: d.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    reviews: (d.reviews || []).map((r) => ({
      author: r.authorAttribution?.displayName || 'Usuario de Google',
      photo: r.authorAttribution?.photoUri || null,
      authorUrl: r.authorAttribution?.uri || null,
      rating: r.rating || null,
      text: r.text?.text || r.originalText?.text || '',
      time: r.relativePublishTimeDescription || ''
    }))
  };
}

/* ------------------------------- API pública ------------------------------- */

/* Devuelve { rating, total, mapsUrl, reviews[] } para una universidad, o null
   si no hay key, no se encontró el lugar o la API respondió con error. */
export async function fetchUniversityReviews(u) {
  if (!hasGoogle()) return null;
  const query = [u.nombre, u.ciudad, 'Perú'].filter(Boolean).join(' ');

  const legacyId = await legacyFindId(query);
  if (legacyId) {
    const d = await legacyDetails(legacyId);
    if (d) return normalizeLegacy(d, legacyId);
  }

  const newId = await newFindId(query);
  if (newId) {
    const d = await newDetails(newId);
    if (d) return normalizeNew(d, newId);
  }

  return null;
}
