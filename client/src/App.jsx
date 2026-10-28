import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, ToastProvider } from './lib/store.jsx';
import SiteLayout from './components/SiteLayout.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Forgot from './pages/Forgot.jsx';
import Reset from './pages/Reset.jsx';
import Verify from './pages/Verify.jsx';
import Test from './pages/Test.jsx';
import Resultados from './pages/Resultados.jsx';
import Carreras from './pages/Carreras.jsx';
import CarreraDetalle from './pages/CarreraDetalle.jsx';
import Malla from './pages/Malla.jsx';
import Examenes from './pages/Examenes.jsx';
import Comparar from './pages/Comparar.jsx';



import Videos from './pages/Videos.jsx';
import Guardadas from './pages/Guardadas.jsx';
import Perfil from './pages/Perfil.jsx';
import Planes from './pages/Planes.jsx';
import Instituciones from './pages/Instituciones.jsx';
import Becas from './pages/Becas.jsx';
import BecaDetalle from './pages/BecaDetalle.jsx';
import Icon from './components/Icon.jsx';

function Splash() {
  return (
    <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
      <Icon name="Compass" size={30} />
    </div>
  );
}

function RequireAuth({ children }) {
  const { account, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Splash />;
  if (!account) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

function PublicOnly({ children }) {
  const { account, loading } = useAuth();
  if (loading) return <Splash />;
  if (account) return <Navigate to="/" replace />;
  return children;
}

function Site() {
  return (
    <SiteLayout>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="carreras" element={<Carreras />} />
        <Route path="carreras/:id" element={<CarreraDetalle />} />
        <Route path="carreras/:id/malla/:uniId" element={<Malla />} />
        <Route path="examenes" element={<Examenes />} />
        <Route path="planes" element={<Planes />} />
        <Route path="videos" element={<Videos />} />
        <Route path="instituciones" element={<Instituciones />} />
        <Route path="becas" element={<Becas />} />
        <Route path="becas/:id" element={<BecaDetalle />} />

        <Route path="test" element={<RequireAuth><Test /></RequireAuth>} />
        <Route path="resultados" element={<RequireAuth><Resultados /></RequireAuth>} />
        <Route path="comparar" element={<RequireAuth><Comparar /></RequireAuth>} />
        <Route path="guardadas" element={<RequireAuth><Guardadas /></RequireAuth>} />
        <Route path="cuenta" element={<RequireAuth><Perfil /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<PublicOnly><Auth key="login" mode="login" /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Auth key="register" mode="register" /></PublicOnly>} />
            <Route path="/recuperar" element={<Forgot />} />
            <Route path="/restablecer" element={<Reset />} />
            <Route path="/verificar" element={<Verify />} />
            <Route path="/*" element={<Site />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}





