import { Link } from 'react-router-dom';
import { CARRERAS } from '../lib/data.js';
import { useAuth } from '../lib/store.jsx';
import CareerCard from '../components/CareerCard.jsx';
import { EmptyState } from '../components/ui.jsx';

export default function Guardadas() {
  const { account, toggleSaved } = useAuth();
  const savedSet = account?.saved || [];
  const list = CARRERAS.filter((c) => savedSet.includes(c.id));

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Carreras guardadas</h1>
          <p className="page-sub">{list.length} carrera{list.length !== 1 ? 's' : ''} en tus favoritas.</p>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="Star"
          title="Aún no guardas carreras"
          text="Toca el marcador en cualquier carrera para guardarla y encontrarla aquí."
          action={<Link to="/carreras" className="btn btn-primary">Explorar carreras</Link>}
        />
      ) : (
        <div className="grid cols-4">
          {list.map((c) => <CareerCard key={c.id} career={c} saved onSave={toggleSaved} />)}
        </div>
      )}
    </>
  );
}
