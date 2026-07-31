import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Settings2, Save } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, SectionTitle, Button, BackLink, Switch } from '../lib/ui'
import { adminInputCls, useToast } from '../lib/adminUi'
import UsersAdmin from './UsersAdmin'
import RolesAdmin from './config/RolesAdmin'
import PermisosMatrix from './config/PermisosMatrix'
import SlaAdmin from './config/SlaAdmin'
import CatalogosAdmin from './config/CatalogosAdmin'
import CompradoresAdmin from './config/CompradoresAdmin'
import HistorialAdmin from './config/HistorialAdmin'

const VALID = ['usuarios', 'roles', 'permisos', 'sla', 'compradores', 'catalogos', 'parametros', 'historial']

export default function AdminModule() {
  const { key = '' } = useParams()

  if (!VALID.includes(key)) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Módulo no reconocido.</p>
        <BackLink to="/configuracion" label="Volver a Configuración" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-8">
      {key === 'usuarios' && <UsersAdmin />}
      {key === 'roles' && <RolesAdmin />}
      {key === 'permisos' && <PermisosMatrix />}
      {key === 'sla' && <SlaAdmin />}
      {key === 'compradores' && <CompradoresAdmin />}
      {key === 'catalogos' && <CatalogosAdmin backTo="/configuracion" />}
      {key === 'historial' && <HistorialAdmin />}
      {key === 'parametros' && <Parametros />}
    </div>
  )
}

// ------------------------------ Parámetros ---------------------------------

function Parametros() {
  const toast = useToast()
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Asignación automática de comprador': true,
    'Notificar solicitudes de información': true,
    'Alertas de SLA': true,
    'Resumen diario por correo': false,
    'Exportación de reportes (Excel / PDF)': true,
  })
  const [slaTotal, setSlaTotal] = useState('5')

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader
        title="Parámetros"
        subtitle="Comportamiento general del sistema"
        actions={<Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => toast.show('Parámetros guardados correctamente.')}>Guardar cambios</Button>}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={<Settings2 className="h-4 w-4" />}>Parámetros generales</SectionTitle>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">SLA total objetivo (días hábiles)</span>
            <input className={adminInputCls} type="number" min={1} value={slaTotal} onChange={(e) => setSlaTotal(e.target.value)} />
          </label>
          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Color corporativo</span>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md border border-slate-200" style={{ background: '#D32F2F' }} />
              <span className="font-mono text-sm text-slate-600">#D32F2F</span>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle>Notificaciones y automatizaciones</SectionTitle>
          <ul className="divide-y divide-slate-50">
            {Object.entries(toggles).map(([label, on]) => (
              <li key={label} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm text-slate-700">{label}</span>
                <Switch on={on} onToggle={() => setToggles((t) => ({ ...t, [label]: !t[label] }))} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {toast.node}
    </>
  )
}
