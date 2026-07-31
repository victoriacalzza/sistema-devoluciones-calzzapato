import { useState } from 'react'
import { Save } from 'lucide-react'
import { PageHeader } from '../../components/AppLayout'
import { Card, BackLink, Button, Pill, cn } from '../../lib/ui'
import { useToast } from '../../lib/adminUi'

const MODULOS = ['Devoluciones', 'Devoluciones masivas', 'Incidencias', 'Reportes', 'Catálogos', 'Configuración']
const ACCIONES = ['Ver', 'Crear', 'Editar', 'Eliminar', 'Autorizar', 'Exportar'] as const

const ROLES = [
  { key: 'tienda', label: 'Tienda' },
  { key: 'ecommerce', label: 'Ecommerce' },
  { key: 'compras', label: 'Compras' },
  { key: 'admin', label: 'Administrador' },
]

// Permisos por defecto (module::accion) por rol. Administrador = todo.
const DEFAULTS: Record<string, string[]> = {
  tienda: ['Devoluciones::Ver', 'Devoluciones::Crear', 'Devoluciones masivas::Ver', 'Incidencias::Ver'],
  ecommerce: ['Devoluciones::Ver', 'Incidencias::Ver', 'Incidencias::Crear', 'Reportes::Ver', 'Reportes::Exportar', 'Catálogos::Ver'],
  compras: ['Devoluciones::Ver', 'Devoluciones::Editar', 'Devoluciones::Autorizar', 'Devoluciones masivas::Ver', 'Devoluciones masivas::Crear', 'Reportes::Ver', 'Reportes::Exportar', 'Catálogos::Ver', 'Catálogos::Editar'],
}

function allKeys() { return MODULOS.flatMap((m) => ACCIONES.map((a) => `${m}::${a}`)) }
function initFor(role: string): Set<string> { return role === 'admin' ? new Set(allKeys()) : new Set(DEFAULTS[role] ?? []) }

export default function PermisosMatrix() {
  const [role, setRole] = useState('compras')
  const [checked, setChecked] = useState<Set<string>>(() => initFor('compras'))
  const toast = useToast()

  function pickRole(r: string) { setRole(r); setChecked(initFor(r)) }
  function toggle(key: string) {
    setChecked((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader title="Permisos" subtitle="Matriz de permisos por módulo y acción" />

      <div className="mb-4 flex flex-wrap gap-2">
        {ROLES.map((r) => <Pill key={r.key} active={role === r.key} onClick={() => pickRole(r.key)}>{r.label}</Pill>)}
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
                <th className="px-4 py-3 text-left">Módulo</th>
                {ACCIONES.map((a) => <th key={a} className="px-3 py-3 text-center">{a}</th>)}
              </tr>
            </thead>
            <tbody>
              {MODULOS.map((m) => (
                <tr key={m} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{m}</td>
                  {ACCIONES.map((a) => {
                    const key = `${m}::${a}`
                    const on = checked.has(key)
                    return (
                      <td key={a} className="px-3 py-3 text-center">
                        <button
                          role="checkbox"
                          aria-checked={on}
                          aria-label={`${a} ${m}`}
                          onClick={() => toggle(key)}
                          className={cn(
                            'inline-flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150',
                            on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white hover:border-brand-300',
                          )}
                        >
                          {on && <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-3 text-xs text-slate-500">{checked.size} permiso(s) habilitados para {ROLES.find((r) => r.key === role)?.label}.</p>

      {/* Botón flotante Guardar cambios */}
      <div className="pointer-events-none sticky bottom-6 mt-6 flex justify-end">
        <div className="pointer-events-auto">
          <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => toast.show('Permisos guardados correctamente.')}>Guardar cambios</Button>
        </div>
      </div>
      {toast.node}
    </>
  )
}
