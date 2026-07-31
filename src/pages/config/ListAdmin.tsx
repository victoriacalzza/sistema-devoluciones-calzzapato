import { useState } from 'react'
import { Pencil, Trash2, FileText } from 'lucide-react'
import { PageHeader } from '../../components/AppLayout'
import { Card, BackLink, Button, Switch, cn } from '../../lib/ui'
import { CreateButton, Modal, ConfirmDialog, IconAction, AdminField, adminInputCls, useToast, EmptyState } from '../../lib/adminUi'

export interface ListItem { id: string; nombre: string; tipo: string; activo: boolean }

/**
 * Lista editable genérica (Motivos, Resoluciones). Tarjetas tipo lista con
 * Editar/Eliminar; botón de creación arriba a la derecha; modal de alta/edición.
 */
export default function ListAdmin({
  title, subtitle, createLabel, tipos, seed, emptyHint,
}: {
  title: string
  subtitle: string
  createLabel: string
  tipos: string[]
  seed: ListItem[]
  emptyHint: string
}) {
  const [items, setItems] = useState<ListItem[]>(seed)
  const [editing, setEditing] = useState<ListItem | null>(null)
  const [toDelete, setToDelete] = useState<ListItem | null>(null)
  const toast = useToast()

  function openNew() { setEditing({ id: `i${Date.now()}`, nombre: '', tipo: tipos[0], activo: true }) }
  function save(it: ListItem) {
    setItems((prev) => (prev.some((x) => x.id === it.id) ? prev.map((x) => (x.id === it.id ? it : x)) : [...prev, it]))
    setEditing(null)
    toast.show('Guardado correctamente.')
  }
  function remove(it: ListItem) { setItems((prev) => prev.filter((x) => x.id !== it.id)); setToDelete(null); toast.show('Elemento eliminado.') }

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader title={title} subtitle={subtitle} actions={<CreateButton label={createLabel} onClick={openNew} />} />

      {items.length === 0 ? (
        <Card><EmptyState icon={<FileText className="h-6 w-6" />} title="Sin elementos" hint={emptyHint} /></Card>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card key={it.id} padded={false} className="flex items-center gap-3 px-4 py-3 transition-all duration-150 hover:border-brand-200">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-slate-900">{it.nombre}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{it.tipo}</span>
                  {!it.activo && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">Inactivo</span>}
                </div>
              </div>
              <span className={cn('text-xs font-medium', it.activo ? 'text-emerald-600' : 'text-slate-400')}>{it.activo ? 'Activo' : 'Inactivo'}</span>
              <IconAction icon={<Pencil className="h-4 w-4" />} label="Editar" onClick={() => setEditing(it)} />
              <IconAction icon={<Trash2 className="h-4 w-4" />} label="Eliminar" danger onClick={() => setToDelete(it)} />
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        title={editing && items.some((x) => x.id === editing.id) ? 'Editar' : createLabel}
        onClose={() => setEditing(null)}
        footer={editing && (
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button variant="primary" disabled={!editing.nombre.trim()} onClick={() => save(editing)}>Guardar</Button>
          </>
        )}
      >
        {editing && (
          <div className="space-y-3">
            <AdminField label="Nombre" req><input className={adminInputCls} value={editing.nombre} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} placeholder="ej. Costura abierta" /></AdminField>
            <AdminField label="Tipo"><select className={adminInputCls} value={editing.tipo} onChange={(e) => setEditing({ ...editing, tipo: e.target.value })}>{tipos.map((t) => <option key={t}>{t}</option>)}</select></AdminField>
            <label className="flex items-center justify-between gap-3 pt-1">
              <span className="text-sm text-slate-700">Activo</span>
              <Switch on={editing.activo} onToggle={() => setEditing({ ...editing, activo: !editing.activo })} />
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar elemento"
        message={`¿Eliminar "${toDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
      {toast.node}
    </>
  )
}
