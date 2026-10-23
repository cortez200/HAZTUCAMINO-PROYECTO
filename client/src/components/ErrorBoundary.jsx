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
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center', color: 'var(--text)' }}>
          <div style={{ maxWidth: 420 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 800, color: 'var(--navy)', marginBottom: 14, letterSpacing: '-.02em' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--teal) 55%, var(--violet))', display: 'grid', placeItems: 'center', color: '#fff' }}>◆</span>
              HAZ TU CAMINO
            </div>
            <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Algo salió mal</h1>
            <p style={{ color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Ocurrió un error inesperado. Recarga la página para continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--violet))', color: '#fff', border: 0, borderRadius: 10, padding: '10px 18px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
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
