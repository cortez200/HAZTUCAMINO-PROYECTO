const TOKEN_KEY = 'htc_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('No pudimos conectar con el servidor. Verifica que la API esté encendida.');
  }
  let data = null;
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Ocurrió un error inesperado.');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  catalog: () => request('/catalog'),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  verifyEmail: (token) => request('/auth/verify', { method: 'POST', body: { token } }),
  resendVerification: (email) => request('/auth/resend', { method: 'POST', body: { email } }),
  forgot: (email) => request('/auth/forgot', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => request('/auth/reset', { method: 'POST', body: { token, password } }),
  me: () => request('/account', { auth: true }),
  updateAccount: (payload) => request('/account', { method: 'PUT', body: payload, auth: true }),
  changePassword: (payload) => request('/account/change-password', { method: 'POST', body: payload, auth: true }),
  submitTest: (payload) => request('/account/test', { method: 'POST', body: payload, auth: true }),
  toggleSaved: (careerId) => request('/account/saved', { method: 'POST', body: { careerId }, auth: true }),
  saveSim: (simId, score) => request('/account/sims', { method: 'POST', body: { simId, score }, auth: true }),
  subscribe: (plan) => request('/account/subscribe', { method: 'POST', body: { plan }, auth: true }),
  cancelPlan: () => request('/account/cancel', { method: 'POST', auth: true }),
  sendInstitution: (payload) => request('/institutions', { method: 'POST', body: payload })
};
