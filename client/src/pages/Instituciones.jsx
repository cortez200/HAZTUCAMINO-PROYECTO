import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/store.jsx';
import { Badge, Btn, Card } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';

const TIPOS = ['Colegio', 'Instituto', 'Universidad', 'ONG', 'Otro'];
const REGIONES = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Piura', 'Lambayeque', 'Junín', 'Puno', 'Otros'];

export default function Instituciones() {
  const toast = useToast();
  const [form, setForm] = useState({ center: '', region: 'Lima', tipo: 'Colegio', contacto: '', mensaje: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.center.trim().length < 3) errs.center = 'Indica el nombre del colegio o institución.';
    if (form.contacto.trim().length < 5) errs.contacto = 'Deja un correo o teléfono de contacto.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await api.sendInstitution(form);
      setSent({ emailSent: Boolean(res?.emailSent) });
      toast('Solicitud registrada', 'CheckCircle2');
    } catch (err) {
      toast(err.message, 'Info');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 64px' }}>
        <div className="center mb-24">
          <Badge tone="primary" icon="School">Para colegios e institutos</Badge>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: 14 }}>Solicita información</h1>
          <p className="dim mt-8">Cuéntanos sobre tu institución y te contactaremos para coordinar una sesión.</p>
        </div>

        {sent ? (
          <Card className="card-pad center" style={{ padding: '48px 24px' }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, background: 'var(--ok-soft)', color: 'var(--ok)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Icon name="CheckCircle2" size={28} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>¡Solicitud registrada!</h2>
            <p className="dim mt-8">
              Gracias, {form.center}. {sent.emailSent
                ? 'Te enviamos un correo de confirmación y te contactaremos muy pronto.'
                : 'Te contactaremos muy pronto.'}
            </p>
            <Link to="/" className="btn btn-primary mt-24" style={{ marginTop: 20 }}>Volver al inicio</Link>
          </Card>
        ) : (
          <Card className="card-pad">
            <form onSubmit={submit} noValidate>
              <div className="field">
                <label className="label" htmlFor="center">Nombre de la institución</label>
                <input id="center" className="input" placeholder="Ej. Colegio San Martín" value={form.center} onChange={set('center')} />
                {errors.center && <span className="err">{errors.center}</span>}
              </div>
              <div className="grid cols-2" style={{ gap: 14 }}>
                <div className="field">
                  <label className="label" htmlFor="tipo">Tipo</label>
                  <select id="tipo" className="select" value={form.tipo} onChange={set('tipo')}>
                    {TIPOS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label" htmlFor="region">Región</label>
                  <select id="region" className="select" value={form.region} onChange={set('region')}>
                    {REGIONES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="contacto">Correo o teléfono de contacto</label>
                <input id="contacto" className="input" placeholder="Ej. contacto@colegio.edu.pe" value={form.contacto} onChange={set('contacto')} />
                {errors.contacto && <span className="err">{errors.contacto}</span>}
              </div>
              <div className="field">
                <label className="label" htmlFor="mensaje">Mensaje (opcional)</label>
                <textarea id="mensaje" className="textarea" placeholder="Cuéntanos cuántos estudiantes participarían, grados, etc." value={form.mensaje} onChange={set('mensaje')} />
              </div>
              <Btn variant="primary" className="btn-block btn-lg" type="submit" disabled={busy} icon="Mail">
                {busy ? 'Enviando…' : 'Enviar solicitud'}
              </Btn>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}
