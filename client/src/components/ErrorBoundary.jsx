import React from 'react';

/* Evita que un error de render deje la pantalla en blanco. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[haz-tu-camino] Error de interfaz:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center', color: '#0f172a' }}>
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Algo salió mal</h1>
            <p style={{ color: '#64748b', lineHeight: 1.5, margin: '0 0 20px' }}>
              Ocurrió un error inesperado. Recarga la página para continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#4f46e5', color: '#fff', border: 0, borderRadius: 10, padding: '10px 18px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
