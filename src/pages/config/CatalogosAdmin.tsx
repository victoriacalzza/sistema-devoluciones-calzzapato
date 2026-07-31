import { useMemo, useState } from 'react'
import {
  Boxes, Layers, GitBranch, Tag, Truck, Grid3x3, Store, Warehouse, FileText, CheckCircle2,
  Pencil, Copy, Trash2, Upload, Download, History, Ban, ShieldAlert, ChevronDown, ChevronRight,
} from 'lucide-react'
import { PageHeader } from '../../components/AppLayout'
import { Card, BackLink, Button, Switch, cn } from '../../lib/ui'
import {
  CreateButton, Drawer, ConfirmDialog, IconAction, SearchBar, AdminField, adminInputCls, useToast, EmptyState,
} from '../../lib/adminUi'
import { MARCAS, PROVEEDORES, ALMACENES, SUCURSALES, MOTIVOS, RESOLUCIONES_CLIENTE, RESOLUCIONES_DESTINO } from '../../data/mock'
import { useRole } from '../../lib/RoleContext'

// --------------------------------------------------------------------------
// Catálogos maestros — módulo OPERATIVO compartido (Compras + Administrador).
// Compras: consultar, crear, editar, activar/desactivar, importar, exportar.
// Administrador: además eliminar, restaurar, ver historial, resolver conflictos.
// Cada catálogo es una entidad independiente (NO incluye Compradores).
// --------------------------------------------------------------------------

type FieldType = 'text' | 'select' | 'multi'
interface FieldDef { id: string; label: string; type: FieldType; options?: string[]; placeholder?: string; req?: boolean; primary?: boolean }
type Row = Record<string, string | string[] | boolean> & { id: string; activo: boolean }

interface SectionDef {
  key: string
  label: string
  icon: typeof Boxes
  article: 'Nueva' | 'Nuevo'
  singular: string
  desc: string
  columns: { id: string; label: string }[]
  fields: FieldDef[]
  seed: Row[]
}

const CATEGORIAS = ['Calzado', 'Textil', 'Accesorios']
const LINEAS = ['Calzado Deportivo', 'Calzado Confort', 'Calzado Casual', 'Accesorios', 'Textil']
const PLAZAS = ['Culiacán', 'Guadalajara', 'Mazatlán', 'Los Mochis', 'Hermosillo', 'Guasave']
const LINEAS_MERCANCIA = ['Calzado', 'Textil', 'Accesorios']

const SECTIONS: SectionDef[] = [
  {
    key: 'agrupaciones', label: 'Agrupaciones', icon: GitBranch, article: 'Nueva', singular: 'agrupación',
    desc: 'Administra todas las agrupaciones comerciales registradas.',
    columns: [{ id: 'nombre', label: 'Nombre' }, { id: 'descripcion', label: 'Descripción' }],
    fields: [
      { id: 'nombre', label: 'Nombre de la agrupación', type: 'text', req: true, primary: true, placeholder: 'ej. Deportivo' },
      { id: 'descripcion', label: 'Descripción', type: 'text', placeholder: 'ej. Calzado y accesorios deportivos' },
    ],
    seed: [
      { id: 'a1', activo: true, nombre: 'Deportivo', descripcion: 'Running, basketball y training' },
      { id: 'a2', activo: true, nombre: 'Confort', descripcion: 'Calzado de confort dama y caballero' },
      { id: 'a3', activo: true, nombre: 'Casual / Lifestyle', descripcion: 'Uso diario y moda urbana' },
      { id: 'a4', activo: true, nombre: 'Accesorios', descripcion: 'Bolsos, carteras y complementos' },
    ],
  },
  {
    key: 'lineas', label: 'Líneas', icon: Layers, article: 'Nueva', singular: 'línea',
    desc: 'Administra todas las líneas de mercancía.',
    columns: [{ id: 'nombre', label: 'Nombre' }, { id: 'categoria', label: 'Categoría' }],
    fields: [
      { id: 'nombre', label: 'Nombre de la línea', type: 'text', req: true, primary: true, placeholder: 'ej. Calzado Deportivo' },
      { id: 'categoria', label: 'Categoría', type: 'select', options: CATEGORIAS },
    ],
    seed: LINEAS.map((n, i) => ({ id: `l${i}`, activo: true, nombre: n, categoria: n.includes('Textil') ? 'Textil' : n.includes('Accesorios') ? 'Accesorios' : 'Calzado' })),
  },
  {
    key: 'marcas', label: 'Marcas', icon: Tag, article: 'Nueva', singular: 'marca',
    desc: 'Administra todas las marcas registradas.',
    columns: [{ id: 'nombre', label: 'Marca' }, { id: 'proveedor', label: 'Proveedor' }],
    fields: [
      { id: 'nombre', label: 'Nombre de la marca', type: 'text', req: true, primary: true, placeholder: 'ej. Nike' },
      { id: 'proveedor', label: 'Proveedor', type: 'select', options: PROVEEDORES },
    ],
    seed: MARCAS.map((n, i) => ({ id: `m${i}`, activo: true, nombre: n, proveedor: PROVEEDORES[i % PROVEEDORES.length] })),
  },
  {
    key: 'proveedores', label: 'Proveedores', icon: Truck, article: 'Nuevo', singular: 'proveedor',
    desc: 'Administra todos los proveedores registrados.',
    columns: [{ id: 'nombre', label: 'Proveedor' }, { id: 'contacto', label: 'Contacto' }, { id: 'telefono', label: 'Teléfono' }],
    fields: [
      { id: 'nombre', label: 'Razón social', type: 'text', req: true, primary: true, placeholder: 'ej. Nike México' },
      { id: 'contacto', label: 'Contacto', type: 'text', placeholder: 'Nombre del contacto' },
      { id: 'telefono', label: 'Teléfono', type: 'text', placeholder: '(667) 000 0000' },
    ],
    seed: PROVEEDORES.map((n, i) => ({ id: `p${i}`, activo: true, nombre: n, contacto: '—', telefono: '—' })),
  },
  {
    key: 'categorias', label: 'Categorías', icon: Grid3x3, article: 'Nueva', singular: 'categoría',
    desc: 'Administra las categorías de producto.',
    columns: [{ id: 'nombre', label: 'Categoría' }],
    fields: [{ id: 'nombre', label: 'Nombre de la categoría', type: 'text', req: true, primary: true, placeholder: 'ej. Calzado' }],
    seed: CATEGORIAS.map((n, i) => ({ id: `c${i}`, activo: true, nombre: n })),
  },
  {
    key: 'sucursales', label: 'Sucursales', icon: Store, article: 'Nueva', singular: 'sucursal',
    desc: 'Administra las sucursales de la red.',
    columns: [{ id: 'nombre', label: 'Sucursal' }, { id: 'plaza', label: 'Plaza' }],
    fields: [
      { id: 'nombre', label: 'Nombre de la sucursal', type: 'text', req: true, primary: true, placeholder: 'ej. Culiacán Centro' },
      { id: 'plaza', label: 'Plaza', type: 'select', options: PLAZAS },
    ],
    seed: SUCURSALES.map((n, i) => ({ id: `s${i}`, activo: true, nombre: n, plaza: PLAZAS.find((z) => n.startsWith(z)) ?? PLAZAS[0] })),
  },
  {
    key: 'almacenes', label: 'Almacenes destino', icon: Warehouse, article: 'Nuevo', singular: 'almacén',
    desc: 'Administra los almacenes destino por línea de mercancía.',
    columns: [{ id: 'codigo', label: 'Código' }, { id: 'nombre', label: 'Almacén' }, { id: 'lineas', label: 'Líneas de mercancía' }],
    fields: [
      { id: 'codigo', label: 'Código', type: 'text', req: true, primary: true, placeholder: 'ej. 25' },
      { id: 'nombre', label: 'Nombre del almacén', type: 'text', req: true, placeholder: 'ej. Devolución de fábrica' },
      { id: 'lineas', label: 'Líneas de mercancía', type: 'multi', options: LINEAS_MERCANCIA },
    ],
    seed: ALMACENES.map((a, i) => ({ id: `w${i}`, activo: true, codigo: a.codigo, nombre: a.nombre, lineas: a.lineas as string[] })),
  },
  {
    key: 'motivos_dev', label: 'Motivos de devolución', icon: FileText, article: 'Nuevo', singular: 'motivo',
    desc: 'Administra los motivos de devolución.',
    columns: [{ id: 'nombre', label: 'Motivo' }],
    fields: [{ id: 'nombre', label: 'Nombre del motivo', type: 'text', req: true, primary: true, placeholder: 'ej. Costura abierta' }],
    seed: MOTIVOS.map((n, i) => ({ id: `md${i}`, activo: true, nombre: n })),
  },
  {
    key: 'motivos_rech', label: 'Motivos de rechazo', icon: FileText, article: 'Nuevo', singular: 'motivo de rechazo',
    desc: 'Administra los motivos de rechazo de Compras.',
    columns: [{ id: 'nombre', label: 'Motivo de rechazo' }],
    fields: [{ id: 'nombre', label: 'Nombre del motivo', type: 'text', req: true, primary: true, placeholder: 'ej. Fuera de política' }],
    seed: ['Fuera de política de devolución', 'Daño por mal uso', 'Producto sin defecto detectado', 'Fuera de tiempo', 'Evidencia insuficiente', 'Expediente duplicado'].map((n, i) => ({ id: `mr${i}`, activo: true, nombre: n })),
  },
  {
    key: 'resoluciones', label: 'Resoluciones', icon: CheckCircle2, article: 'Nueva', singular: 'resolución',
    desc: 'Administra las resoluciones de cliente y disposición del producto.',
    columns: [{ id: 'nombre', label: 'Resolución' }, { id: 'tipo', label: 'Tipo' }],
    fields: [
      { id: 'nombre', label: 'Nombre de la resolución', type: 'text', req: true, primary: true, placeholder: 'ej. Cambio físico' },
      { id: 'tipo', label: 'Tipo', type: 'select', options: ['Cliente', 'Disposición'] },
    ],
    seed: [
      ...RESOLUCIONES_CLIENTE.map((r, i) => ({ id: `rc${i}`, activo: true, nombre: r.label, tipo: 'Cliente' })),
      ...RESOLUCIONES_DESTINO.map((r, i) => ({ id: `rd${i}`, activo: true, nombre: r.label, tipo: 'Disposición' })),
    ],
  },
]

export default function CatalogosAdmin({ backTo }: { backTo?: string }) {
  const [sectionKey, setSectionKey] = useState('agrupaciones')
  const section = SECTIONS.find((s) => s.key === sectionKey)!
  const { user } = useRole()
  const isAdmin = !!user.admin // Compras · Administrador
  const canEdit = user.roleKey === 'compras' // Compras y Administrador

  return (
    <>
      {backTo && <BackLink to={backTo} label="Volver a Configuración" />}
      <PageHeader title="Catálogos maestros" subtitle="Módulo operativo compartido · cada catálogo es una entidad independiente" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <Card padded={false} className="h-fit overflow-hidden">
          <nav className="p-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const active = s.key === sectionKey
              return (
                <button
                  key={s.key}
                  onClick={() => setSectionKey(s.key)}
                  className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all duration-150', active ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50')}
                >
                  <Icon className={cn('h-4 w-4', active ? 'text-brand-600' : 'text-slate-400')} />
                  {s.label}
                </button>
              )
            })}
          </nav>
        </Card>

        <CatalogTable key={section.key} section={section} canEdit={canEdit} isAdmin={isAdmin} />
      </div>
    </>
  )
}

// ------------------------------- Tabla -------------------------------------

function CatalogTable({ section, canEdit, isAdmin }: { section: SectionDef; canEdit: boolean; isAdmin: boolean }) {
  const [rows, setRows] = useState<Row[]>(() => section.seed)
  const [q, setQ] = useState('')
  const [drawer, setDrawer] = useState<{ mode: 'create' | 'edit'; row: Row } | null>(null)
  const [toDelete, setToDelete] = useState<Row | null>(null)
  const [advOpen, setAdvOpen] = useState(false)
  const toast = useToast()

  function openDrawer(d: { mode: 'create' | 'edit'; row: Row }) { setAdvOpen(false); setDrawer(d) }

  const createLabel = `${section.article} ${section.singular}`

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter((r) => section.columns.some((c) => fmt(r[c.id]).toLowerCase().includes(t)))
  }, [rows, q, section])

  function emptyRow(): Row {
    const r = { id: `n${Date.now()}`, activo: true } as Row
    section.fields.forEach((f) => { r[f.id] = f.type === 'multi' ? [] : (f.type === 'select' ? (f.options?.[0] ?? '') : '') })
    return r
  }
  function openCreate() { openDrawer({ mode: 'create', row: emptyRow() }) }

  function save(r: Row) {
    setRows((prev) => (prev.some((x) => x.id === r.id) ? prev.map((x) => (x.id === r.id ? r : x)) : [...prev, r]))
    setDrawer(null)
    toast.show(`${cap(section.singular)} guardada correctamente.`)
  }
  function duplicate(r: Row) {
    const primary = section.fields.find((f) => f.primary)?.id ?? 'nombre'
    setRows((prev) => [...prev, { ...r, id: `n${Date.now()}`, [primary]: `${fmt(r[primary])} (copia)` }])
    toast.show(`${cap(section.singular)} duplicada.`)
  }
  function toggleActivo(r: Row) { setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, activo: !x.activo } : x))); toast.show(`${cap(section.singular)} ${r.activo ? 'desactivada' : 'activada'}.`) }
  function remove(r: Row) { setRows((prev) => prev.filter((x) => x.id !== r.id)); setToDelete(null); toast.show(`${cap(section.singular)} eliminada.`) }

  const getPrimary = (r: Row) => fmt(r[(section.fields.find((f) => f.primary) ?? section.fields[0]).id])

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{section.label}</h2>
          <p className="text-sm text-slate-500">{section.desc}</p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Upload className="h-4 w-4" />} onClick={() => toast.show(`Importando ${section.label.toLowerCase()}…`)}>Importar</Button>
            <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => toast.show(`Exportando ${section.label.toLowerCase()}…`)}>Exportar</Button>
            <CreateButton label={createLabel} onClick={openCreate} />
          </div>
        )}
      </div>

      <div className="mb-3"><SearchBar value={q} onChange={setQ} placeholder={`Buscar en ${section.label.toLowerCase()}…`} /></div>

      <Card padded={false} className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Boxes className="h-6 w-6" />} title={`Sin ${section.label.toLowerCase()}`} hint={`Crea el primer registro con “${createLabel}”.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  {section.columns.map((c) => <th key={c.id} className="px-4 py-2.5">{c.label}</th>)}
                  <th className="px-4 py-2.5">Estado</th>
                  {canEdit && <th className="px-4 py-2.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={cn('border-b border-slate-50 last:border-0 hover:bg-slate-50/60', !r.activo && 'opacity-55')}>
                    {section.columns.map((c, ci) => (
                      <td key={c.id} className={cn('px-4 py-3', ci === 0 ? 'font-medium text-slate-800' : 'text-slate-500')}>{fmt(r[c.id]) || '—'}</td>
                    ))}
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', r.activo ? 'text-emerald-600' : 'text-slate-400')}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', r.activo ? 'bg-emerald-500' : 'bg-slate-300')} />{r.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <IconAction icon={<Pencil className="h-4 w-4" />} label="Editar" onClick={() => openDrawer({ mode: 'edit', row: { ...r } })} />
                          <IconAction icon={<Ban className={cn('h-4 w-4', !r.activo && 'text-emerald-600')} />} label={r.activo ? 'Desactivar' : 'Activar'} onClick={() => toggleActivo(r)} />
                          {isAdmin && <IconAction icon={<Trash2 className="h-4 w-4" />} label="Eliminar" danger onClick={() => setToDelete(r)} />}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer
        open={!!drawer}
        title={drawer?.mode === 'edit' ? `Editar ${section.singular}` : createLabel}
        onClose={() => setDrawer(null)}
        footer={drawer && (
          <>
            <Button variant="ghost" onClick={() => setDrawer(null)}>Cancelar</Button>
            <Button variant="primary" disabled={!isValid(section, drawer.row)} onClick={() => save(drawer.row)}>Guardar</Button>
          </>
        )}
      >
        {drawer && (
          <div className="grid grid-cols-1 gap-3">
            {section.fields.map((f) => (
              <AdminField key={f.id} label={f.label} req={f.req}>
                {f.type === 'text' && (
                  <input className={adminInputCls} placeholder={f.placeholder} value={fmt(drawer.row[f.id])} onChange={(e) => setDrawer({ ...drawer, row: { ...drawer.row, [f.id]: e.target.value } })} />
                )}
                {f.type === 'select' && (
                  <select className={adminInputCls} value={fmt(drawer.row[f.id])} onChange={(e) => setDrawer({ ...drawer, row: { ...drawer.row, [f.id]: e.target.value } })}>
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                )}
                {f.type === 'multi' && (
                  <div className="flex flex-wrap gap-1.5">
                    {f.options?.map((o) => {
                      const arr = (drawer.row[f.id] as string[]) ?? []
                      const on = arr.includes(o)
                      return (
                        <button key={o} onClick={() => setDrawer({ ...drawer, row: { ...drawer.row, [f.id]: on ? arr.filter((x) => x !== o) : [...arr, o] } })} className={cn('rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150', on ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>{o}</button>
                      )
                    })}
                  </div>
                )}
              </AdminField>
            ))}

            {/* Estado */}
            <label className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="text-sm font-medium text-slate-700">Estado {drawer.row.activo ? '· Activo' : '· Inactivo'}</span>
              <Switch on={drawer.row.activo} onToggle={() => setDrawer({ ...drawer, row: { ...drawer.row, activo: !drawer.row.activo } })} />
            </label>

            {/* Notas */}
            <AdminField label="Notas">
              <textarea rows={2} className={adminInputCls} placeholder="Notas internas (opcional)…" value={fmt(drawer.row.notas)} onChange={(e) => setDrawer({ ...drawer, row: { ...drawer.row, notas: e.target.value } })} />
            </AdminField>

            {/* Sección avanzada (acciones poco frecuentes) */}
            <div className="border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setAdvOpen((v) => !v)} className="flex w-full items-center gap-1.5 text-sm font-medium text-slate-700">
                {advOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                Avanzado
              </button>
              {advOpen && (
                <div className="mt-3 space-y-4">
                  {/* Historial de cambios */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400"><History className="h-3.5 w-3.5" /> Historial de cambios</div>
                    <ul className="space-y-2">
                      {[
                        { a: 'Editó el registro', d: 'Hoy · 10:12 · Jorge Villa' },
                        { a: 'Creó el registro', d: '11 jul 2026 · 09:00 · Fernanda López' },
                      ].map((h, i) => (
                        <li key={i} className="flex gap-2 text-xs">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                          <div><div className="text-slate-700">{h.a}</div><div className="text-[11px] text-slate-400">{h.d}</div></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Dependencias */}
                  <div>
                    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Dependencias</div>
                    <p className="text-xs text-slate-500">Este registro está relacionado con otros catálogos; no se puede eliminar si tiene expedientes o relaciones activas.</p>
                  </div>
                  {/* Conflictos relacionados */}
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400"><ShieldAlert className="h-3.5 w-3.5" /> Conflictos relacionados</div>
                    <p className="text-xs text-emerald-600">Sin conflictos de relaciones detectados.</p>
                  </div>
                  {/* Duplicar (solo Administrador) */}
                  {isAdmin && drawer.mode === 'edit' && (
                    <Button size="sm" variant="secondary" icon={<Copy className="h-4 w-4" />} onClick={() => { duplicate(drawer.row); setDrawer(null) }}>Duplicar registro</Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Eliminar ${section.singular}`}
        message={`¿Eliminar "${toDelete ? getPrimary(toDelete) : ''}"? Esta acción no se puede deshacer.`}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />

      {toast.node}
    </div>
  )
}

function fmt(v: string | string[] | boolean | undefined): string {
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'boolean') return v ? 'Sí' : 'No'
  return v ?? ''
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
function isValid(section: SectionDef, row: Row): boolean {
  return section.fields.filter((f) => f.req).every((f) => fmt(row[f.id]).trim().length > 0)
}
