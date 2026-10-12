const TOKEN_KEY = 'htc_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (t) => {
  if (t) {
    localStorage.setItem(TOKEN_KEY, t);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

  let res;

  try {
    res = await fetch(`${apiUrl}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      'No pudimos conectar con el servidor. Verifica que la API esté encendida.'
    );
  }

  let data = null;

  try {
    data = await res.json();
  } catch {
    // La respuesta no contiene JSON.
  }

  if (!res.ok) {
    const err = new Error(
      (data && data.error) || 'Ocurrió un error inesperado.'
    );

    err.status = res.status;
    err.data = data;

    throw err;
  }

  return data;
}

export const api = {
  catalog: () => request('/catalog'),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  verifyEmail: (token) =>
    request('/auth/verify', {
      method: 'POST',
      body: { token },
    }),

  resendVerification: (email) =>
    request('/auth/resend', {
      method: 'POST',
      body: { email },
    }),

  forgot: (email) =>
    request('/auth/forgot', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (token, password) =>
    request('/auth/reset', {
      method: 'POST',
      body: { token, password },
    }),

  me: () =>
    request('/account', {
      auth: true,
    }),

  updateAccount: (payload) =>
    request('/account', {
      method: 'PUT',
      body: payload,
      auth: true,
    }),

  changePassword: (payload) =>
    request('/account/change-password', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  submitTest: (payload) =>
    request('/account/test', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  toggleSaved: (careerId) =>
    request('/account/saved', {
      method: 'POST',
      body: { careerId },
      auth: true,
    }),

  saveSim: (simId, score) =>
    request('/account/sims', {
      method: 'POST',
      body: { simId, score },
      auth: true,
    }),

  submitMission: (payload) =>
    request('/account/mission', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  subscribe: (plan) =>
    request('/account/subscribe', {
      method: 'POST',
      body: { plan },
      auth: true,
    }),

  cancelPlan: () =>
    request('/account/cancel', {
      method: 'POST',
      auth: true,
    }),

  reviews: (careerId) =>
    request(`/reviews?career=${encodeURIComponent(careerId)}`, {
      auth: true,
    }),

  reviewSummary: () =>
    request('/reviews/summary'),

  saveReview: (payload) =>
    request('/reviews', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  deleteReview: (careerId) =>
    request(`/reviews/${encodeURIComponent(careerId)}`, {
      method: 'DELETE',
      auth: true,
    }),

  universityReviews: (uniId) =>
    request(`/universities/${encodeURIComponent(uniId)}/reviews`),

  universityReviewSummary: () =>
    request('/universities/reviews'),

  sendInstitution: (payload) =>
    request('/institutions', {
      method: 'POST',
      body: payload,
    }),

  track: (payload) =>
    request('/track', {
      method: 'POST',
      body: payload,
    }),
};