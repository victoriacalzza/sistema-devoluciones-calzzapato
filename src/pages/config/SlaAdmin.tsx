import { useState } from 'react'
import { Timer, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/AppLayout'
import { Card, BackLink, Button } from '../../lib/ui'
import { CreateButton, Modal, ConfirmDialog, IconAction, AdminField, adminInputCls, useToast, EmptyState } from '../../lib/adminUi'

interface Sla { id: string; etapa: string; area: string; horas: number }

const SEED: Sla[] = [
  { id: 's1', etapa: 'Recepción / registro', area: 'Tienda', horas: 4 },
  { id: 's2', etapa: 'En revisión', area: 'Compras', horas: 24 },
  { id: 's3', etapa: 'Esperando información', area: 'Tienda', horas: 48 },
  { id: 's4', etapa: 'En tránsito → recibido', area: 'Almacén destino', horas: 72 },
  { id: 's5', etapa: 'Cierre', area: 'Compras', horas: 12 },
]

const AREAS = ['Tienda', 'Compras', 'Almacén destino', 'Ecommerce']

export default function SlaAdmin() {
  const [items, setItems] = useState<Sla[]>(SEED)
  const [editing, setEditing] = useState<Sla | null>(null)
  const [toDelete, setToDelete] = useState<Sla | null>(null)
  const toast = useToast()

  function openNew() { setEditing({ id: `s${Date.now()}`, etapa: '', area: 'Compras', horas: 24 }) }
  function save(s: Sla) {
    setItems((prev) => (prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s]))
    setEditing(null)
    toast.show('SLA guardado correctamente.')
  }
  function remove(s: Sla) { setItems((prev) => prev.filter((x) => x.id !== s.id)); setToDelete(null); toast.show('Etapa de SLA eliminada.') }

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader title="SLA" subtitle="Tiempos máximos por etapa del proceso" actions={<CreateButton label="Nuevo SLA" onClick={openNew} />} />

      {items.length === 0 ? (
        <Card><EmptyState icon={<Timer className="h-6 w-6" />} title="Sin etapas de SLA" hint="Agrega la primera etapa con “Nuevo SLA”." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <Card key={s.id} className="transition-all duration-150 hover:border-brand-200 hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Timer className="h-5 w-5" /></span>
                <div className="flex items-center gap-1">
                  <IconAction icon={<Pencil className="h-4 w-4" />} label="Editar SLA" onClick={() => setEditing(s)} />
                  <IconAction icon={<Trash2 className="h-4 w-4" />} label="Eliminar SLA" danger onClick={() => setToDelete(s)} />
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{s.etapa}</h3>
              <div className="text-xs text-slate-500">Área: {s.area}</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{s.horas} <span className="text-sm font-normal text-slate-500">horas</span></div>
              <div className="mt-0.5 text-xs text-slate-400">Tiempo máximo</div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        title={editing && items.some((x) => x.id === editing.id) ? 'Editar SLA' : 'Nuevo SLA'}
        onClose={() => setEditing(null)}
        footer={editing && (
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button variant="primary" disabled={!editing.etapa.trim()} onClick={() => save(editing)}>Guardar</Button>
          </>
        )}
      >
        {editing && (
          <div className="space-y-3">
            <AdminField label="Etapa" req><input className={adminInputCls} value={editing.etapa} onChange={(e) => setEditing({ ...editing, etapa: e.target.value })} placeholder="ej. Recepción" /></AdminField>
            <div className="grid grid-cols-2 gap-3">
              <AdminField label="Área responsable"><select className={adminInputCls} value={editing.area} onChange={(e) => setEditing({ ...editing, area: e.target.value })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></AdminField>
              <AdminField label="Tiempo máximo (horas)"><input type="number" min={1} className={adminInputCls} value={editing.horas} onChange={(e) => setEditing({ ...editing, horas: Number(e.target.value) })} /></AdminField>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar etapa de SLA"
        message={`¿Eliminar la etapa "${toDelete?.etapa}"? Esta acción no se puede deshacer.`}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
      {toast.node}
    </>
  )
}
