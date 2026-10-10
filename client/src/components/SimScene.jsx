import Icon from './Icon.jsx';
import { themeDe } from '../lib/sims.js';

/* Escena visual de la simulación. Es un "escenario" temático por área que
   reacciona a la decisión (idle / good / bad). */
export default function SimScene({ area, state = 'idle', step, total }) {
  const theme = themeDe(area.id);
  return (
    <div
      className={`scene scene-${area.id} state-${state}`}
      style={{ '--area': area.color, '--area-dark': area.dark, '--area-soft': area.soft }}
      role="img"
      aria-label={`Escenario de ${area.nombre}`}
    >
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-glow" aria-hidden="true" />
      <div className="scene-ring" aria-hidden="true" />
      <div className="scene-core">
        <Icon name={area.icon} size={46} color="#fff" />
      </div>
      <span className="scene-reactive" aria-hidden="true">
        <Icon name={state === 'bad' ? 'X' : 'Check'} size={18} color="#fff" />
      </span>

      <div className="scene-actors">
        {theme.actores.map((a, i) => (
          <span className={`actor actor-${i}`} key={a.label}>
            <span className="actor-ico"><Icon name={a.icon} size={15} /></span>
            <em>{a.label}</em>
          </span>
        ))}
      </div>

      {total ? (
        <span className="scene-step">
          <Icon name="Activity" size={13} /> Situación {step + 1} / {total}
        </span>
      ) : null}
    </div>
  );
}
