import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NIVELES, area, isPremium, planLabel } from '../lib/data.js';
import { useAuth, useToast } from '../lib/store.jsx';
import { api } from '../lib/api.js';
import { areaVars, Badge, Btn, Card, Progress } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

export default function Perfil() {
  const { account, setAccount, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [name, setName] = useState(account?.name || '');
  const [nivel, setNivel] = useState(account?.nivel || 'secundaria');
  const [pwd, setPwd] = useState({ current: '', next: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const others = Object.keys(account?.answers || {}).length;
  const initial = (account?.name || '?').charAt(0).toUpperCase();

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { account: acc } = await api.updateAccount({ name, nivel });
      setAccount(acc);
      toast('Perfil actualizado', 'CheckCircle2');
    } catch (e) { toast(e.message, 'Info'); }
    finally { setSavingProfile(false); }
  };

  const savePwd = async () => {
    setSavingPwd(true);
    try {
      await api.changePassword(pwd);
      setPwd({ current: '', next: '' });
      toast('Contraseña actualizada', 'ShieldCheck');
    } catch (e) { toast(e.message, 'Info'); }
    finally { setSavingPwd(false); }
  };

  const doLogout = () => { if (confirm('¿Quieres cerrar sesión?')) { logout(); nav('/'); } };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Mi perfil</h1>
          <p className="page-sub">Gestiona tus datos y tu plan.</p>
        </div>
        <Badge tone={isPremium(account) ? 'primary' : 'soft'} icon={isPremium(account) ? 'ShieldCheck' : undefined}>
          {planLabel(account?.plan)}
        </Badge>
      </div>

      <div className="grid cols-2">
        {/* Identidad */}
        <Card className="card-pad">
          <div className="row gap-16 mb-24">
            <span className="avatar" style={{ width: 56, height: 56, fontSize: '1.3rem' }}>{initial}</span>
            <div>
              <h3 style={{ fontWeight: 800 }}>{account?.name}</h3>
              <p className="muted small">{account?.email}</p>
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="p-name">Nombre</label>
            <input id="p-name" name="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <span className="label" id="p-nivel">¿En qué etapa estás?</span>
            <div className="seg" role="group" aria-labelledby="p-nivel">
              {NIVELES.map((n) => (
                <button type="button" key={n.id} className={nivel === n.id ? 'on' : ''} onClick={() => setNivel(n.id)}>{n.label}</button>
              ))}
            </div>
          </div>
          <Btn variant="primary" onClick={saveProfile} disabled={savingProfile}>Guardar cambios</Btn>
        </Card>

        {/* Contraseña */}
        <Card className="card-pad">
          <div className="row gap-8 bold mb-16"><Icon name="ShieldCheck" size={18} color="var(--primary)" /> Cambiar contraseña</div>
          <div className="field">
            <label className="label" htmlFor="p-cur">Contraseña actual</label>
            <input id="p-cur" name="current" type="password" className="input" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="p-new">Nueva contraseña</label>
            <input id="p-new" name="next" type="password" className="input" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          </div>
          <Btn variant="outline" onClick={savePwd} disabled={savingPwd || !pwd.current || !pwd.next}>Actualizar contraseña</Btn>
        </Card>
      </div>

      {/* Progreso + historial */}
      <div className="grid cols-2 mt-16">
        <Card className="card-pad">
          <div className="row gap-8 bold mb-16"><Icon name="BarChart3" size={18} color="var(--primary)" /> Tu actividad</div>
          <div className="grid cols-2" style={{ gap: 12 }}>
            <div><div className="bold" style={{ fontSize: '1.3rem' }}>{others}/32</div><div className="muted small">Preguntas respondidas</div></div>
            <div><div className="bold" style={{ fontSize: '1.3rem' }}>{Object.keys(account?.sims || {}).length}/8</div><div className="muted small">Simulaciones</div></div>
          </div>
          <Progress value={(others / 32) * 100} style={{ marginTop: 16 }} />
        </Card>

        <Card className="card-pad">
          <div className="row between mb-16">
            <span className="row gap-8 bold"><Icon name="ClipboardList" size={18} color="var(--primary)" /> Historial de tests</span>
            <Link to="/planes" className="small bold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Plan</Link>
          </div>
          {(account?.history || []).length === 0 ? (
            <p className="muted small">Todavía no has completado el test.</p>
          ) : (
            <div className="list-soft">
              {account.history.slice(0, 5).map((h, i) => (
                <div key={i} className="py-8" style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="muted small bold" style={{ width: 90 }}>{h.date}</span>
                  <div className="row gap-6 wrap">
                    {h.top.map((t) => {
                      const a = area(t.id);
                      return <Badge key={t.id} tone="area">{a?.nombre} · {t.pct}%</Badge>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="card-pad mt-16" style={{ ...areaVars({ color: 'var(--danger)', soft: 'var(--danger-soft)' }) }}>
        <div className="row between wrap gap-12">
          <div>
            <h4 style={{ fontWeight: 700 }}>Cerrar sesión</h4>
            <p className="muted small">Salir de tu cuenta en este dispositivo.</p>
          </div>
          <button className="btn btn-danger" onClick={doLogout}><Icon name="LogOut" size={17} /> Cerrar sesión</button>
        </div>
      </Card>
    </>
  );
}
