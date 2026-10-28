import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import { getToken, setToken } from './token.js';
import Icon from '../components/Icon.jsx';

/* ---------------------------- Toasts ---------------------------- */
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, icon = 'CheckCircle2') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <Icon name={t.icon} size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------------------- Auth ---------------------------- */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const { account } = await api.me();
        if (alive) setAccount(account);
      } catch {
        setToken(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (payload) => {
    const { token, account } = await api.login(payload);
    setToken(token); setAccount(account); return account;
  }, []);
  const register = useCallback(async (payload) => {
    const r = await api.register(payload);
    if (r.token) { setToken(r.token); setAccount(r.account); }
    return r;
  }, []);
  const logout = useCallback(() => { setToken(null); setAccount(null); }, []);

  const verifySession = useCallback(async (token) => {
    const r = await api.verify(token);
    if (r.token) { setToken(r.token); setAccount(r.account); }
    return r;
  }, []);

  const toggleSaved = useCallback(async (careerId) => {
    const { account } = await api.toggleSaved(careerId);
    setAccount(account); return account;
  }, []);
  const submitTest = useCallback(async (payload) => {
    const { account } = await api.submitTest(payload);
    setAccount(account); return account;
  }, []);
  const subscribe = useCallback(async (plan) => {
    const r = await api.subscribe(plan);
    setAccount(r.account); return r;
  }, []);
  const cancelPlan = useCallback(async () => {
    const r = await api.cancelPlan();
    setAccount(r.account); return r;
  }, []);
  const resendVerification = useCallback((email) => api.resend({ email }), []);

  const value = {
    account, loading, login, register, logout, setAccount, verifySession,
    toggleSaved, submitTest, subscribe, cancelPlan, resendVerification
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
