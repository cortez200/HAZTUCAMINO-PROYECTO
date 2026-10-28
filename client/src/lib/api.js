import { getToken } from './token.js';

const BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

async function request(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body;
  const auth = options.auth || false;
  const headers = options.headers || {};
  const h = Object.assign({ 'Content-Type': 'application/json' }, headers);
  if (auth) {
    const token = getToken();
    if (token) h.Authorization = 'Bearer ' + token;
  }
  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (e) { data = {}; }
  if (!res.ok) {
    const err = new Error(data.error || data.message || ('Error ' + res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  catalog: () => request('/catalog'),
  track: (payload) => request('/track', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  resend: (payload) => request('/auth/resend', { method: 'POST', body: payload }),
  verify: (token) => request('/auth/verify', { method: 'POST', body: { token } }),
  forgot: (email) => request('/auth/forgot', { method: 'POST', body: { email } }),
  reset: (token, password) => request('/auth/reset', { method: 'POST', body: { token, password } }),
  me: () => request('/account', { auth: true }),
  updateMe: (payload) => request('/account', { method: 'PUT', body: payload, auth: true }),
  submitTest: (payload) => request('/account/test', { method: 'POST', body: payload, auth: true }),
  toggleSaved: (careerId) => request('/account/saved', { method: 'POST', body: { careerId }, auth: true }),
  changePassword: (current, next) => request('/account/change-password', { method: 'POST', body: { current, next }, auth: true }),
  subscribe: (plan) => request('/account/subscribe', { method: 'POST', body: { plan }, auth: true }),
  cancelPlan: () => request('/account/cancel', { method: 'POST', auth: true }),
  reviews: (careerId) => request('/reviews?career=' + encodeURIComponent(careerId), { auth: true }),
  reviewSummary: () => request('/reviews/summary'),
  saveReview: (payload) => request('/reviews', { method: 'POST', body: payload, auth: true }),
  deleteReview: (careerId) => request('/reviews/' + encodeURIComponent(careerId), { method: 'DELETE', auth: true }),
  universityReviews: (uniId) => request('/universities/' + encodeURIComponent(uniId) + '/reviews'),
  universityReviewSummary: () => request('/universities/reviews'),
  sendInstitution: (payload) => request('/institutions', { method: 'POST', body: payload })
};

// Aliases de compatibilidad con llamadas antiguas del cliente.
api.verifyEmail = api.verify;
api.resendVerification = (email) => api.resend({ email });
api.resetPassword = api.reset;
api.updateAccount = api.updateMe;
