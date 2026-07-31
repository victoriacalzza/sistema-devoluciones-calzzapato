import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShieldCheck, Save, RotateCcw, CheckCircle2, Lock } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, SectionTitle, Button, BackLink, Switch, cn } from '../lib/ui'

// ---------------------------------------------------------------------------
// Matriz de permisos por rol — agrupada por módulos, editable con switches.
// El subrol Administrador administra todos los permisos del sistema.
// ---------------------------------------------------------------------------

const PERM_MODULES: { module: string; perms: string[] }[] = [
  { module: 'Devoluciones', perms: ['Crear', 'Consultar', 'Autorizar', 'Rechazar', 'Solicitar información', 'Responder información', 'Cerrar expediente', 'Dar seguimiento'] },
  { module: 'Devoluciones masivas', perms: ['Crear', 'Atender solicitud (sucursal)', 'Dar seguimiento'] },
  { module: 'Incidencias de redistribución', perms: ['Registrar', 'Consultar', 'Responder información'] },
  { module: 'Reportes', perms: ['Ver', 'Exportar (Excel / PDF)'] },
  { module: 'Catálogos', perms: ['Ver', 'Crear / editar'] },
  { module: 'Configuración maestra', perms: ['Administrar'] },
]

const ROLE_LABEL: Record<string, string> = {
  tienda: 'Tienda',
  ecommerce: 'Ecommerce',
  compras: 'Compras',
  admin: 'Compras · Administrador',
}

const ROLE_DESC: Record<string, string> = {
  tienda: 'Sucursal · registra y da seguimiento a devoluciones (portal operativo).',
  ecommerce: 'Almacén Ecommerce · registra incidencias y consulta expedientes Ecommerce.',
  compras: 'Corporativo · revisa, autoriza/rechaza, gestiona masivas y da seguimiento.',
  admin: 'Subrol de Compras · administra todos los permisos y catálogos del sistema.',
}

// Permisos habilitados por defecto (module::perm). Administrador = todos.
const DEFAULTS: Record<string, string[]> = {
  tienda: [
    'Devoluciones::Crear', 'Devoluciones::Consultar', 'Devoluciones::Responder información', 'Devoluciones::Dar seguimiento',
    'Devoluciones masivas::Atender solicitud (sucursal)', 'Devoluciones masivas::Dar seguimiento',
  ],
  ecommerce: [
    'Devoluciones::Consultar',
    'Incidencias de redistribución::Registrar', 'Incidencias de redistribución::Consultar', 'Incidencias de redistribución::Responder información',
    'Reportes::Ver', 'Reportes::Exportar (Excel / PDF)',
    'Catálogos::Ver',
  ],
  compras: [
    'Devoluciones::Consultar', 'Devoluciones::Autorizar', 'Devoluciones::Rechazar', 'Devoluciones::Solicitar información', 'Devoluciones::Cerrar expediente', 'Devoluciones::Dar seguimiento',
    'Devoluciones masivas::Crear', 'Devoluciones masivas::Dar seguimiento',
    'Reportes::Ver', 'Reportes::Exportar (Excel / PDF)',
    'Catálogos::Ver', 'Catálogos::Crear / editar',
  ],
}

function allKeys(): string[] {
  return PERM_MODULES.flatMap((m) => m.perms.map((p) => `${m.module}::${p}`))
}

function initialSet(role: string): Set<string> {
  if (role === 'admin') return new Set(allKeys())
  return new Set(DEFAULTS[role] ?? [])
}

export default function RolePermissions() {
  const { role = '' } = useParams()
  const isAdmin = role === 'admin'
  const label = ROLE_LABEL[role] ?? role

  const [checked, setChecked] = useState<Set<string>>(() => initialSet(role))
  const [saved, setSaved] = useState(false)
  const total = useMemo(() => allKeys().length, [])

  if (!ROLE_LABEL[role]) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Rol no reconocido.</p>
        <BackLink to="/configuracion" label="Volver a Configuración" />
      </div>
    )
  }

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setSaved(false)
  }

  function reset() { setChecked(initialSet(role)); setSaved(false) }
  function save() { setSaved(true) }

  const activos = checked.size

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 lg:px-8">
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader
        title={`Permisos · ${label}`}
        subtitle={ROLE_DESC[role]}
        actions={
          <>
            <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>Restablecer</Button>
            <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={save}>Guardar cambios</Button>
          </>
        }
      />

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Permisos de {label} guardados correctamente.
        </div>
      )}

      <Card className="mb-5 flex items-center gap-3 border-slate-300 bg-slate-50">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white"><ShieldCheck className="h-5 w-5" /></span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">{activos} de {total} permisos habilitados</div>
          <div className="text-xs text-slate-500">
            {isAdmin
              ? 'El subrol Administrador tiene acceso a todos los permisos del sistema.'
              : 'Activa o desactiva cada permiso por módulo y guarda los cambios.'}
          </div>
        </div>
        {isAdmin && <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"><Lock className="h-3.5 w-3.5" /> Control total</span>}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {PERM_MODULES.map((m) => (
          <Card key={m.module}>
            <SectionTitle>{m.module}</SectionTitle>
            <ul className="divide-y divide-slate-50">
              {m.perms.map((p) => {
                const key = `${m.module}::${p}`
                const on = checked.has(key)
                return (
                  <li key={p} className="flex items-center justify-between gap-3 py-2.5">
                    <span className={cn('text-sm', on ? 'text-slate-800' : 'text-slate-500')}>{p}</span>
                    <Switch on={on} onToggle={() => toggle(key)} />
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
