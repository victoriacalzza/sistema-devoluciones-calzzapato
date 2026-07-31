import { useMemo, useState } from 'react'
import { UserCog, Pencil, Ban, Shuffle, History, Star, Check } from 'lucide-react'
import { PageHeader } from '../../components/AppLayout'
import { Card, BackLink, Button, Switch, cn } from '../../lib/ui'
import {
  CreateButton, Drawer, Modal, IconAction, AdminField, adminInputCls, useToast, EmptyState,
} from '../../lib/adminUi'
import { PEOPLE, RETURNS, MARCAS, PROVEEDORES } from '../../data/mock'

// Compradores = usuario con rol Compras + sus asignaciones. No existen compradores
// aislados: siempre están ligados a un usuario del sistema con rol Compras.

const AGRUPACIONES = ['Deportivo', 'Confort', 'Casual / Lifestyle', 'Accesorios']
const LINEAS = ['Calzado Deportivo', 'Calzado Confort', 'Calzado Casual', 'Accesorios', 'Textil']

interface Comprador {
  id: string
  userId: string
  activo: boolean
  principal: boolean
  agrupaciones: string[]
  lineas: string[]
  marcas: string[]
  proveedores: string[]
}

// Usuarios con rol Compras (no administradores) elegibles como comprador.
const COMPRAS_USERS = PEOPLE.filter((p) => p.roleKey === 'compras' && !p.admin)

function seed(): Comprador[] {
  return COMPRAS_USERS.map((p, i) => ({
    id: `cb${i}`,
    userId: p.id,
    activo: true,
    principal: i === 0,
    agrupaciones: p.linea?.includes('Deportivo') ? ['Deportivo'] : p.linea?.includes('Confort') ? ['Confort'] : ['Accesorios'],
    lineas: p.linea ? [p.linea] : [],
    marcas: p.marcas ?? [],
    proveedores: p.proveedores ?? [],
  }))
}

function nombreDe(userId: string) { return PEOPLE.find((p) => p.id === userId)?.name ?? '—' }
function expedientesDe(userId: string) { return RETURNS.filter((r) => r.responsableId === userId).length }

export default function CompradoresAdmin() {
  const [items, setItems] = useState<Comprador[]>(seed)
  const [drawer, setDrawer] = useState<{ mode: 'create' | 'edit'; c: Comprador } | null>(null)
  const [reasignar, setReasignar] = useState<Comprador | null>(null)
  const [historial, setHistorial] = useState<Comprador | null>(null)
  const toast = useToast()

  // Usuarios Compras que aún no son comprador (para alta).
  const disponibles = useMemo(() => COMPRAS_USERS.filter((u) => !items.some((c) => c.userId === u.id)), [items])

  function openCreate() {
    setDrawer({ mode: 'create', c: { id: `cb${Date.now()}`, userId: disponibles[0]?.id ?? '', activo: true, principal: false, agrupaciones: [], lineas: [], marcas: [], proveedores: [] } })
  }
  function save(c: Comprador) {
    if (!c.userId) { toast.show('Selecciona el usuario de Compras asociado.'); return }
    setItems((prev) => {
      let next = prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c]
      if (c.principal) next = next.map((x) => (x.id === c.id ? x : { ...x, principal: false })) // un solo principal
      return next
    })
    setDrawer(null)
    toast.show(`Comprador ${nombreDe(c.userId)} guardado.`)
  }
  function toggle(c: Comprador) { setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, activo: !x.activo } : x))); toast.show(`${nombreDe(c.userId)} ${c.activo ? 'desactivado' : 'activado'}.`) }
  function doReasignar(destino: string) {
    if (!reasignar) return
    toast.show(`${expedientesDe(reasignar.userId)} expediente(s) reasignados a ${nombreDe(destino)}.`)
    setReasignar(null)
  }

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader title="Compradores y asignaciones" subtitle="Compradores ligados a usuarios de Compras y sus asignaciones" actions={<CreateButton label="Nuevo comprador" onClick={openCreate} />} />

      {items.length === 0 ? (
        <Card><EmptyState icon={<UserCog className="h-6 w-6" />} title="Sin compradores" hint="Agrega el primer comprador ligado a un usuario de Compras." /></Card>
      ) : (
        <Card padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5">Comprador</th>
                  <th className="px-4 py-2.5">Agrup. / Líneas / Marcas</th>
                  <th className="px-4 py-2.5 text-center">Expedientes</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className={cn('border-b border-slate-50 last:border-0 hover:bg-slate-50/60', !c.activo && 'opacity-60')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        {nombreDe(c.userId)}
                        {c.principal && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"><Star className="h-3 w-3" /> Principal</span>}
                      </div>
                      <div className="text-xs text-slate-400">Usuario de Compras</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {c.agrupaciones.join(', ') || '—'} · {c.lineas.length} línea(s) · {c.marcas.length} marca(s)
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-800">{expedientesDe(c.userId)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', c.activo ? 'text-emerald-600' : 'text-slate-400')}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', c.activo ? 'bg-emerald-500' : 'bg-slate-300')} />{c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconAction icon={<Pencil className="h-4 w-4" />} label="Editar comprador" onClick={() => setDrawer({ mode: 'edit', c: { ...c } })} />
                        <IconAction icon={<Shuffle className="h-4 w-4" />} label="Reasignar expedientes" onClick={() => setReasignar(c)} />
                        <IconAction icon={<Ban className={cn('h-4 w-4', !c.activo && 'text-emerald-600')} />} label={c.activo ? 'Desactivar' : 'Activar'} onClick={() => toggle(c)} />
                        <IconAction icon={<History className="h-4 w-4" />} label="Ver historial" onClick={() => setHistorial(c)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Alta / edición */}
      <Drawer
        open={!!drawer}
        title={drawer?.mode === 'edit' ? 'Editar comprador' : 'Nuevo comprador'}
        onClose={() => setDrawer(null)}
        footer={drawer && (
          <>
            <Button variant="ghost" onClick={() => setDrawer(null)}>Cancelar</Button>
            <Button variant="primary" disabled={!drawer.c.userId} onClick={() => save(drawer.c)}>Guardar</Button>
          </>
        )}
      >
        {drawer && (
          <div className="space-y-4">
            <AdminField label="Usuario de Compras asociado" req>
              {drawer.mode === 'edit' ? (
                <input className={cn(adminInputCls, 'bg-slate-50 text-slate-500')} readOnly value={nombreDe(drawer.c.userId)} />
              ) : (
                <select className={adminInputCls} value={drawer.c.userId} onChange={(e) => setDrawer({ ...drawer, c: { ...drawer.c, userId: e.target.value } })}>
                  {disponibles.length === 0 && <option value="">— No hay usuarios de Compras disponibles —</option>}
                  {disponibles.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}
                </select>
              )}
            </AdminField>
            <Chips label="Agrupaciones" options={AGRUPACIONES} selected={drawer.c.agrupaciones} onToggle={(v) => setDrawer({ ...drawer, c: { ...drawer.c, agrupaciones: tgl(drawer.c.agrupaciones, v) } })} />
            <Chips label="Líneas" options={LINEAS} selected={drawer.c.lineas} onToggle={(v) => setDrawer({ ...drawer, c: { ...drawer.c, lineas: tgl(drawer.c.lineas, v) } })} />
            <Chips label="Marcas" options={MARCAS} selected={drawer.c.marcas} onToggle={(v) => setDrawer({ ...drawer, c: { ...drawer.c, marcas: tgl(drawer.c.marcas, v) } })} />
            <Chips label="Proveedores" options={PROVEEDORES} selected={drawer.c.proveedores} onToggle={(v) => setDrawer({ ...drawer, c: { ...drawer.c, proveedores: tgl(drawer.c.proveedores, v) } })} />
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Comprador principal</span>
              <Switch on={drawer.c.principal} onToggle={() => setDrawer({ ...drawer, c: { ...drawer.c, principal: !drawer.c.principal } })} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Estado {drawer.c.activo ? '· Activo' : '· Inactivo'}</span>
              <Switch on={drawer.c.activo} onToggle={() => setDrawer({ ...drawer, c: { ...drawer.c, activo: !drawer.c.activo } })} />
            </label>
          </div>
        )}
      </Drawer>

      {/* Reasignar expedientes */}
      <Modal open={!!reasignar} title="Reasignar expedientes pendientes" onClose={() => setReasignar(null)} footer={<Button variant="ghost" onClick={() => setReasignar(null)}>Cerrar</Button>}>
        {reasignar && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              {nombreDe(reasignar.userId)} tiene <span className="font-semibold text-slate-800">{expedientesDe(reasignar.userId)}</span> expediente(s). Selecciona el comprador destino:
            </p>
            {items.filter((c) => c.id !== reasignar.id && c.activo).map((c) => (
              <button key={c.id} onClick={() => doReasignar(c.userId)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 text-left text-sm text-slate-700 transition-all duration-150 hover:border-brand-300 hover:bg-brand-50/40">
                {nombreDe(c.userId)} <Check className="h-4 w-4 text-brand-600 opacity-0" />
              </button>
            ))}
            {items.filter((c) => c.id !== reasignar.id && c.activo).length === 0 && <p className="text-xs text-slate-400">No hay otros compradores activos disponibles.</p>}
          </div>
        )}
      </Modal>

      {/* Historial de cambios */}
      <Modal open={!!historial} title="Historial de cambios" onClose={() => setHistorial(null)} footer={<Button variant="ghost" onClick={() => setHistorial(null)}>Cerrar</Button>}>
        {historial && (
          <ul className="space-y-3">
            {[
              { a: 'Asignó marca "Nike"', d: 'Hoy · 09:40' },
              { a: 'Definido como comprador principal', d: 'Ayer · 12:10' },
              { a: 'Alta del comprador', d: '10 jul 2026 · 08:00' },
            ].map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                <div><div className="text-sm text-slate-700">{h.a}</div><div className="text-[11px] text-slate-400">{h.d} · {nombreDe(historial.userId)}</div></div>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {toast.node}
    </>
  )
}

function tgl(arr: string[], v: string) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }

function Chips({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o)
          return (
            <button key={o} onClick={() => onToggle(o)} className={cn('rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150', on ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>{o}</button>
          )
        })}
      </div>
    </div>
  )
}
