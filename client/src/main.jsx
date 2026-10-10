import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { api } from './lib/api.js';
import { hydrateCatalog } from './lib/data.js';

function Boot({ title, message }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24,
      fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center', color: '#0f172a'
    }}>
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>{title}</h1>
        <p style={{ color: '#64748b', lineHeight: 1.5, margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}

async function boot() {
  const root = createRoot(document.getElementById('root'));
  try {
    const catalog = await api.catalog();
    hydrateCatalog(catalog);
  } catch (err) {
    root.render(
      <Boot
        title="No pudimos cargar el catálogo"
        message={err.message || 'Verifica que la API esté encendida e intenta de nuevo.'}
      />
    );
    return;
  }
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
