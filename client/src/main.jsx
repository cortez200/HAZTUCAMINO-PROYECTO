import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './styles.css';

import { api } from './lib/api.js';
import { hydrateCatalog } from './lib/data.js';

function Boot({ title, message }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24,
      fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center', color: 'var(--text)'
    }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 800, color: 'var(--navy)', marginBottom: 14, letterSpacing: '-.02em' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--teal) 55%, var(--violet))', display: 'grid', placeItems: 'center', color: '#fff' }}>◆</span>
          HAZ TU CAMINO
        </div>
        <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>{title}</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}

async function boot() {
  const root = createRoot(document.getElementById('root'));
  let catalog = null;
  let apiError = null;
  try {
    catalog = await api.catalog();
  } catch (err) {
    apiError = err;
    /* Respaldo: si no hay API detrás (preview, hosting estático, GitHub Pages),
       se usa el catálogo local para que la web igual cargue. */
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}catalog.json`);
      if (res.ok) catalog = await res.json();
    } catch { /* sin respaldo disponible */ }
  }
  if (!catalog) {
    root.render(
      <Boot
        title="No pudimos cargar el catálogo"
        message={(apiError && apiError.message) || 'Verifica que la API esté encendida e intenta de nuevo.'}
      />
    );
    return;
  }
  if (apiError) {
    console.info('[haz-tu-camino] API no disponible; se usa el catálogo local (modo sin conexión).');
  }
  hydrateCatalog(catalog);

  trackVisit();

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

function trackVisit() {
  try {
    let visitor = localStorage.getItem('htc_visitor');
    if (!visitor) {
      visitor = (window.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2));
      localStorage.setItem('htc_visitor', visitor);
    }
    api.track({
      visitor,
      path: window.location.hash || '/',
      ref: document.referrer || '',
    }).catch(() => {});
  } catch {
    // La analítica nunca debe romper la app.
  }
}

boot();
