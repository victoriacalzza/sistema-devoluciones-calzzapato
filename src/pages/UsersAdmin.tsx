import { useMemo, useState } from 'react'
import {
  Pencil, KeyRound, Ban, Trash2, Check, ShieldCheck, RefreshCw, Users, Store,
  RefreshCcw, FileSpreadsheet, ChevronDown, ChevronRight, History,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Button, Switch, BackLink, cn } from '../lib/ui'
import { CreateButton, SearchBar, FilterSelect, Modal, ConfirmDialog, Drawer, IconAction, useToast, EmptyState, AdminField, adminInputCls } from '../lib/adminUi'
import { PEOPLE, RETURNS, SUCURSALES, MARCAS } from '../data/mock'

// ---------------------------------------------------------------------------
// Administración de usuarios (Compras · Administrador).
// - Usuarios operativos (Compras / Ecommerce / Administrador): alta manual.
// - Colaboradores de Tienda: solo por sincronización / importación masiva.
// Tablas con 3 acciones (Editar · Activar/Desactivar · Eliminar); el resto
// (contraseña, rol, historial, permisos) vive dentro del Drawer de edición.
// ---------------------------------------------------------------------------

type Rol = 'tienda' | 'ecommerce' | 'compras' | 'admin'

const ROL_LABEL: Record<Rol, string> = {
  tienda: 'Tienda',
  ecommerce: 'Ecommerce',
  compras: 'Compras',
  admin: 'Compras · Administrador',
}
const ROL_BADGE: Record<Rol, string> = {
  tienda: 'bg-rose-50 text-rose-700',
  ecommerce: 'bg-fuchsia-50 text-fuchsia-700',
  compras: 'bg-emerald-50 text-emerald-700',
  admin: 'bg-slate-800 text-white',
}

// Roles que pueden crearse manualmente (Tienda queda fuera: se sincroniza).
const ROLES_MANUALES: Rol[] = ['compras', 'admin', 'ecommerce']

const PLAZAS = ['Culiacán', 'Guadalajara', 'Mazatlán', 'Los Mochis', 'Hermosillo', 'Guasave']
const PUESTOS = ['Cajero(a)', 'Vendedor(a)', 'Gerente de sucursal', 'Auxiliar']
const AREAS_ECOMMERCE = ['Marketplace', 'Recepción', 'Inspección', 'Atención a cliente']
const LINEAS = ['Calzado Deportivo', 'Calzado Confort', 'Calzado Casual', 'Accesorios', 'Textil']
const SUBLINEAS = ['Running', 'Basketball', 'Walking', 'Lifestyle', 'Bolsos', 'Confort dama']

const PERM_MODULES: { module: string; perms: string[] }[] = [
  { module: 'Devoluciones', perms: ['Crear', 'Autorizar', 'Rechazar', 'Cerrar'] },
  { module: 'Masivas', perms: ['Crear', 'Atender'] },
  { module: 'Reportes', perms: ['Ver', 'Exportar'] },
  { module: 'Catálogos', perms: ['Editar'] },
]

interface User {
  id: string
  nombre: string
  apellidos: string
  email: string
  usuario: string
  telefono: string
  rol: Rol
  activo: boolean
  ultimoAcceso: string
  color: string
  initials: string
  plaza?: string
  sucursal?: string
  puesto?: string
  numeroEmpleado?: string
  area?: string
  comprador?: string
  marcas?: string[]
  lineas?: string[]
  sublineas?: string[]
  permisos: Record<string, boolean>
}

const ACCESOS = ['hace 5 min', 'hace 2 h', 'ayer', 'hace 3 días', 'hace 1 semana', 'Nunca']

// Colaboradores de Tienda adicionales (provienen de RH / sincronización).
const EXTRA_TIENDA: { nombre: string; apellidos: string; sucursal: string; puesto: string; num: string; activo: boolean; color: string }[] = [
  { nombre: 'Laura', apellidos: 'Medina', sucursal: 'Culiacán Forum', puesto: 'Cajero(a)', num: 'EMP-10231', activo: true, color: 'bg-sky-500' },
  { nombre: 'Diego', apellidos: 'Ontiveros', sucursal: 'Los Mochis Plaza', puesto: 'Vendedor(a)', num: 'EMP-10244', activo: true, color: 'bg-violet-500' },
  { nombre: 'Sofía', apellidos: 'Ramírez', sucursal: 'Mazatlán Marina', puesto: 'Gerente de sucursal', num: 'EMP-10250', activo: true, color: 'bg-amber-500' },
  { nombre: 'Hugo', apellidos: 'Barajas', sucursal: 'Hermosillo Sur', puesto: 'Auxiliar', num: 'EMP-10262', activo: false, color: 'bg-slate-500' },
]

function seedUsers(): User[] {
  const base = PEOPLE.map((p, i) => {
    const [nombre, ...rest] = p.name.split(' ')
    const apellidos = rest.join(' ')
    const rol: Rol = p.admin ? 'admin' : p.roleKey === 'tienda' ? 'tienda' : p.roleKey === 'ecommerce' ? 'ecommerce' : 'compras'
    const sucursal = p.role.includes('·') ? p.role.split('·')[1].trim() : undefined
    const plaza = sucursal ? PLAZAS.find((z) => sucursal.startsWith(z)) : undefined
    const clean = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return {
      id: p.id,
      nombre, apellidos,
      email: `${clean(nombre)}.${clean((apellidos || 'kelder').split(' ')[0])}@calzzapato.com`,
      usuario: clean(nombre[0] + (apellidos || '').replace(/\s/g, '')),
      telefono: '',
      rol,
      activo: true,
      ultimoAcceso: ACCESOS[i % ACCESOS.length],
      color: p.color,
      initials: p.initials,
      plaza,
      sucursal: rol === 'tienda' ? sucursal : undefined,
      puesto: rol === 'tienda' ? 'Gerente de sucursal' : undefined,
      numeroEmpleado: rol === 'tienda' ? `EMP-1020${i}` : undefined,
      area: rol === 'ecommerce' ? (p.role.split('·')[1]?.trim() ?? 'Marketplace') : undefined,
      comprador: rol === 'compras' ? p.linea : undefined,
      marcas: rol === 'compras' ? p.marcas ?? [] : undefined,
      lineas: rol === 'compras' && p.linea ? [p.linea] : undefined,
      sublineas: [],
      permisos: {},
    } as User
  })
  const extra = EXTRA_TIENDA.map((e, i) => ({
    id: `t${i}`, nombre: e.nombre, apellidos: e.apellidos,
    email: `${e.nombre.toLowerCase()}.${e.apellidos.toLowerCase()}@calzzapato.com`,
    usuario: `${e.nombre[0].toLowerCase()}${e.apellidos.toLowerCase()}`,
    telefono: '', rol: 'tienda' as Rol, activo: e.activo, ultimoAcceso: ACCESOS[i % ACCESOS.length],
    color: e.color, initials: (e.nombre[0] + e.apellidos[0]).toUpperCase(),
    plaza: PLAZAS.find((z) => e.sucursal.startsWith(z)), sucursal: e.sucursal, puesto: e.puesto, numeroEmpleado: e.num,
    sublineas: [], marcas: [], lineas: [], permisos: {},
  } as User))
  return [...base, ...extra]
}

function genPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `Kdr-${s}`
}
function hasExpedientes(id: string): boolean { return RETURNS.some((r) => r.responsableId === id || r.creadorId === id) }

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>(seedUsers)
  const [tab, setTab] = useState<'operativos' | 'tienda'>('operativos')
  const [drawer, setDrawer] = useState<{ mode: 'create' | 'edit'; user: User } | null>(null)
  const [toDelete, setToDelete] = useState<User | null>(null)
  const [copiedPerms, setCopiedPerms] = useState<{ from: string; perms: Record<string, boolean> } | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const toast = useToast()

  function notify(t: string) { toast.show(t) }
  function saveUser(u: User) {
    const initials = ((u.nombre[0] ?? '') + (u.apellidos[0] ?? '')).toUpperCase() || '··'
    const nu = { ...u, initials }
    const creating = drawer?.mode === 'create'
    setUsers((prev) => (prev.some((x) => x.id === nu.id) ? prev.map((x) => (x.id === nu.id ? nu : x)) : [...prev, nu]))
    setDrawer(null)
    notify(creating ? `Usuario ${u.nombre} ${u.apellidos} creado.` : `Usuario ${u.nombre} ${u.apellidos} actualizado.`)
  }
  function toggleActivo(u: User) { setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, activo: !x.activo } : x))); notify(`${u.nombre} ${u.apellidos} ${u.activo ? 'desactivado' : 'activado'}.`) }
  function eliminar(u: User) { setUsers((prev) => prev.filter((x) => x.id !== u.id)); notify(`Usuario ${u.nombre} ${u.apellidos} eliminado.`) }
  function sincronizar() { notify('Sincronización completada · 3 altas, 1 baja, 2 actualizaciones desde RH.') }
  function procesarImport() { setImportOpen(false); notify('Importación procesada · nuevos creados, existentes actualizados y ausentes desactivados.') }

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader title="Usuarios" subtitle="Usuarios operativos y colaboradores de Tienda" />

      {/* Segmento de grupo */}
      <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        <TabBtn active={tab === 'operativos'} onClick={() => setTab('operativos')} icon={<Users className="h-4 w-4" />}>Usuarios operativos</TabBtn>
        <TabBtn active={tab === 'tienda'} onClick={() => setTab('tienda')} icon={<Store className="h-4 w-4" />}>Colaboradores de Tienda</TabBtn>
      </div>

      {tab === 'operativos' ? (
        <OperativosView
          users={users}
          onCreate={() => setDrawer({ mode: 'create', user: emptyUser('compras') })}
          onEdit={(u) => setDrawer({ mode: 'edit', user: { ...u } })}
          onToggle={toggleActivo}
          onDelete={setToDelete}
        />
      ) : (
        <TiendaView
          users={users}
          onEdit={(u) => setDrawer({ mode: 'edit', user: { ...u } })}
          onToggle={toggleActivo}
          onSync={sincronizar}
          onImport={() => setImportOpen(true)}
        />
      )}

      {drawer && (
        <UserDrawer
          mode={drawer.mode}
          initial={drawer.user}
          copiedPerms={copiedPerms}
          onCancel={() => setDrawer(null)}
          onSave={saveUser}
          onResetPassword={() => notify(`Contraseña temporal de ${drawer.user.nombre} restablecida: ${genPassword()} (enviada por correo).`)}
          onDuplicatePerms={() => { setCopiedPerms({ from: `${drawer.user.nombre} ${drawer.user.apellidos}`, perms: { ...drawer.user.permisos } }); notify('Permisos copiados.') }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar usuario"
        message={`¿Eliminar a ${toDelete?.nombre} ${toDelete?.apellidos}? Esta acción no se puede deshacer.`}
        onConfirm={() => { if (toDelete) eliminar(toDelete); setToDelete(null) }}
        onCancel={() => setToDelete(null)}
      />

      {/* Importar plantilla Excel */}
      <Modal open={importOpen} title="Importar plantilla Excel" onClose={() => setImportOpen(false)} footer={<><Button variant="ghost" onClick={() => setImportOpen(false)}>Cancelar</Button><Button variant="primary" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={procesarImport}>Procesar importación</Button></>}>
        <p className="text-sm text-slate-600">La carga masiva <span className="font-medium text-slate-800">crea</span> nuevos colaboradores, <span className="font-medium text-slate-800">actualiza</span> los existentes y <span className="font-medium text-slate-800">desactiva</span> a quienes ya no aparecen en la fuente.</p>
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-600">
          <div className="mb-1 font-medium text-slate-700">Columnas esperadas</div>
          Nombre · Número de empleado · Correo · Sucursal · Puesto · Estado · Rol
        </div>
        <button className="mt-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 py-6 text-center hover:border-brand-300">
          <FileSpreadsheet className="h-7 w-7 text-slate-300" />
          <span className="text-sm font-medium text-slate-600">Selecciona el archivo .xlsx</span>
          <span className="text-xs text-slate-500">Plantilla de colaboradores de Tienda</span>
        </button>
      </Modal>

      {toast.node}
    </>
  )
}

function emptyUser(rol: Rol): User {
  return { id: `u${Date.now()}`, nombre: '', apellidos: '', email: '', usuario: '', telefono: '', rol, activo: true, ultimoAcceso: 'Nunca', color: 'bg-brand-500', initials: '··', sublineas: [], marcas: [], lineas: [], permisos: {} }
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150', active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
      {icon}{children}
    </button>
  )
}

// ------------------------- Usuarios operativos -----------------------------

function OperativosView({ users, onCreate, onEdit, onToggle, onDelete }: {
  users: User[]; onCreate: () => void; onEdit: (u: User) => void; onToggle: (u: User) => void; onDelete: (u: User) => void
}) {
  const [q, setQ] = useState('')
  const [fRol, setFRol] = useState('')
  const [fEstado, setFEstado] = useState('')

  const operativos = users.filter((u) => u.rol !== 'tienda')
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return operativos.filter((u) =>
      (!t || `${u.nombre} ${u.apellidos}`.toLowerCase().includes(t) || u.email.toLowerCase().includes(t) || u.usuario.toLowerCase().includes(t)) &&
      (!fRol || u.rol === fRol) &&
      (!fEstado || (fEstado === 'activo' ? u.activo : !u.activo)),
    )
  }, [operativos, q, fRol, fEstado])

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Compras, Ecommerce y Administrador · alta manual.</p>
        <CreateButton label="Nuevo usuario" onClick={onCreate} />
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar por nombre, correo o usuario…" />
        <FilterSelect value={fRol} onChange={setFRol} allLabel="Todos los roles" options={ROLES_MANUALES.map((r) => ({ value: r, label: ROL_LABEL[r] }))} />
        <FilterSelect value={fEstado} onChange={setFEstado} allLabel="Todos los estados" options={[{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]} />
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2.5">Usuario</th>
                <th className="px-4 py-2.5">Rol</th>
                <th className="px-4 py-2.5">Asignación</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5">Último acceso</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <UserRow key={u.id} u={u} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} canDelete={!hasExpedientes(u.id)} asignacion={u.rol === 'ecommerce' ? `Ecommerce · ${u.area ?? '—'}` : u.rol === 'admin' ? 'Corporativo' : (u.comprador ?? 'Corporativo')} />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState icon={<Users className="h-6 w-6" />} title="Sin usuarios" hint="No hay usuarios operativos que coincidan con la búsqueda." />}
      </Card>
    </>
  )
}

// ------------------------- Colaboradores de Tienda -------------------------

function TiendaView({ users, onEdit, onToggle, onSync, onImport }: {
  users: User[]; onEdit: (u: User) => void; onToggle: (u: User) => void; onSync: () => void; onImport: () => void
}) {
  const [q, setQ] = useState('')
  const tienda = users.filter((u) => u.rol === 'tienda')
  const activos = tienda.filter((u) => u.activo).length
  const inactivos = tienda.length - activos
  const sucursales = new Set(tienda.map((u) => u.sucursal).filter(Boolean)).size

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return tienda.filter((u) => !t || `${u.nombre} ${u.apellidos}`.toLowerCase().includes(t) || (u.numeroEmpleado ?? '').toLowerCase().includes(t) || (u.sucursal ?? '').toLowerCase().includes(t))
  }, [tienda, q])

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Se administran solo por sincronización o carga masiva (RH). No se crean individualmente.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" icon={<RefreshCcw className="h-4 w-4" />} onClick={onSync}>Sincronizar colaboradores</Button>
          <Button variant="primary" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={onImport}>Importar plantilla Excel</Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Total colaboradores" value={tienda.length} />
        <Stat label="Última sincronización" value="Hoy · 08:00" small />
        <Stat label="Sucursales" value={sucursales} />
        <Stat label="Activos" value={activos} tone="emerald" />
        <Stat label="Inactivos" value={inactivos} tone="slate" />
      </div>

      <div className="mb-3"><SearchBar value={q} onChange={setQ} placeholder="Buscar por nombre, número de empleado o sucursal…" /></div>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2.5">Colaborador</th>
                <th className="px-4 py-2.5">Nº empleado</th>
                <th className="px-4 py-2.5">Sucursal</th>
                <th className="px-4 py-2.5">Puesto</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={cn('border-b border-slate-50 last:border-0 hover:bg-slate-50/60', !u.activo && 'opacity-60')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', u.color)}>{u.initials}</span>
                      <div className="min-w-0"><div className="truncate font-medium text-slate-900">{u.nombre} {u.apellidos}</div><div className="truncate text-xs text-slate-500">{u.email}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.numeroEmpleado ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{u.sucursal ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{u.puesto ?? '—'}</td>
                  <td className="px-4 py-3"><EstadoCell activo={u.activo} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconAction icon={<Pencil className="h-4 w-4" />} label="Editar colaborador" onClick={() => onEdit(u)} />
                      <IconAction icon={<Ban className={cn('h-4 w-4', !u.activo && 'text-emerald-600')} />} label={u.activo ? 'Desactivar' : 'Activar'} onClick={() => onToggle(u)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState icon={<Store className="h-6 w-6" />} title="Sin colaboradores" hint="Sincroniza o importa la plantilla de RH para poblar esta lista." />}
      </Card>
    </>
  )
}

function Stat({ label, value, tone, small }: { label: string; value: number | string; tone?: 'emerald' | 'slate'; small?: boolean }) {
  return (
    <Card className="py-3">
      <div className={cn(small ? 'text-base font-semibold' : 'text-2xl font-semibold', tone === 'emerald' ? 'text-emerald-600' : 'text-slate-900')}>{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
    </Card>
  )
}

function EstadoCell({ activo }: { activo: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', activo ? 'text-emerald-600' : 'text-slate-400')}>
      <span className={cn('h-1.5 w-1.5 rounded-full', activo ? 'bg-emerald-500' : 'bg-slate-300')} />{activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function UserRow({ u, onEdit, onToggle, onDelete, canDelete, asignacion }: {
  u: User; onEdit: (u: User) => void; onToggle: (u: User) => void; onDelete: (u: User) => void; canDelete: boolean; asignacion: string
}) {
  return (
    <tr className={cn('border-b border-slate-50 last:border-0 hover:bg-slate-50/60', !u.activo && 'opacity-60')}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', u.color)}>{u.initials}</span>
          <div className="min-w-0"><div className="truncate font-medium text-slate-900">{u.nombre} {u.apellidos}</div><div className="truncate text-xs text-slate-500">{u.email}</div></div>
        </div>
      </td>
      <td className="px-4 py-3"><span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', ROL_BADGE[u.rol])}>{ROL_LABEL[u.rol]}</span></td>
      <td className="px-4 py-3 text-slate-600">{asignacion}</td>
      <td className="px-4 py-3"><EstadoCell activo={u.activo} /></td>
      <td className="px-4 py-3 text-slate-500">{u.ultimoAcceso}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <IconAction icon={<Pencil className="h-4 w-4" />} label="Editar usuario" onClick={() => onEdit(u)} />
          <IconAction icon={<Ban className={cn('h-4 w-4', !u.activo && 'text-emerald-600')} />} label={u.activo ? 'Desactivar' : 'Activar'} onClick={() => onToggle(u)} />
          {canDelete && <IconAction icon={<Trash2 className="h-4 w-4" />} label="Eliminar" danger onClick={() => onDelete(u)} />}
        </div>
      </td>
    </tr>
  )
}

// ------------------------------- Drawer ------------------------------------

function UserDrawer({ mode, initial, copiedPerms, onCancel, onSave, onResetPassword, onDuplicatePerms }: {
  mode: 'create' | 'edit'
  initial: User
  copiedPerms: { from: string; perms: Record<string, boolean> } | null
  onCancel: () => void
  onSave: (u: User) => void
  onResetPassword: () => void
  onDuplicatePerms: () => void
}) {
  const [u, setU] = useState<User>(initial)
  const [tempPass] = useState(mode === 'create' ? genPassword() : '')
  const [forceChange, setForceChange] = useState(true)
  const [advOpen, setAdvOpen] = useState(false)
  const [error, setError] = useState('')

  const esTienda = u.rol === 'tienda' // colaborador de Tienda (edición, no alta)
  function set<K extends keyof User>(k: K, v: User[K]) { setU((prev) => ({ ...prev, [k]: v })) }
  function toggleArr(k: 'marcas' | 'lineas' | 'sublineas', val: string) {
    setU((prev) => { const cur = new Set(prev[k] ?? []); cur.has(val) ? cur.delete(val) : cur.add(val); return { ...prev, [k]: Array.from(cur) } })
  }
  function togglePerm(key: string) { setU((prev) => ({ ...prev, permisos: { ...prev.permisos, [key]: !prev.permisos[key] } })) }

  function submit() {
    if (!u.nombre.trim() || !u.apellidos.trim() || !u.email.trim()) { setError('Completa Nombre, Apellidos y Correo.'); return }
    onSave(u)
  }

  // En alta manual solo se permiten roles operativos.
  const rolesDisponibles = mode === 'create' ? ROLES_MANUALES : (esTienda ? (['tienda'] as Rol[]) : ROLES_MANUALES)

  return (
    <Drawer
      open
      title={mode === 'create' ? 'Nuevo usuario' : (esTienda ? 'Editar colaborador de Tienda' : 'Editar usuario')}
      onClose={onCancel}
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button variant="primary" icon={<Check className="h-4 w-4" />} onClick={submit}>Guardar cambios</Button></>}
    >
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AdminField label="Nombre(s)" req><input className={adminInputCls} value={u.nombre} onChange={(e) => set('nombre', e.target.value)} /></AdminField>
        <AdminField label="Apellidos" req><input className={adminInputCls} value={u.apellidos} onChange={(e) => set('apellidos', e.target.value)} /></AdminField>
        <AdminField label="Correo" req full><input className={adminInputCls} type="email" value={u.email} onChange={(e) => set('email', e.target.value)} /></AdminField>
        <AdminField label="Usuario"><input className={adminInputCls} value={u.usuario} onChange={(e) => set('usuario', e.target.value)} /></AdminField>
        {esTienda && <AdminField label="Número de empleado"><input className={adminInputCls} value={u.numeroEmpleado ?? ''} onChange={(e) => set('numeroEmpleado', e.target.value)} /></AdminField>}
      </div>

      {/* Rol */}
      <AdminField label="Rol">
        <select className={cn(adminInputCls, esTienda && 'bg-slate-50 text-slate-500')} disabled={esTienda} value={u.rol} onChange={(e) => set('rol', e.target.value as Rol)}>
          {rolesDisponibles.map((r) => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
        </select>
        {esTienda && <p className="mt-1 text-[11px] text-slate-400">El rol de los colaboradores de Tienda proviene de RH y no se edita aquí.</p>}
      </AdminField>

      {/* Asignaciones según rol */}
      {(u.rol === 'tienda') && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AdminField label="Plaza"><select className={adminInputCls} value={u.plaza ?? ''} onChange={(e) => set('plaza', e.target.value)}><option value="">Selecciona…</option>{PLAZAS.map((p) => <option key={p}>{p}</option>)}</select></AdminField>
          <AdminField label="Sucursal"><select className={adminInputCls} value={u.sucursal ?? ''} onChange={(e) => set('sucursal', e.target.value)}><option value="">Selecciona…</option>{SUCURSALES.map((s) => <option key={s}>{s}</option>)}</select></AdminField>
          <AdminField label="Puesto" full><select className={adminInputCls} value={u.puesto ?? ''} onChange={(e) => set('puesto', e.target.value)}><option value="">Selecciona…</option>{PUESTOS.map((p) => <option key={p}>{p}</option>)}</select></AdminField>
        </div>
      )}
      {u.rol === 'ecommerce' && (
        <AdminField label="Área"><select className={adminInputCls} value={u.area ?? ''} onChange={(e) => set('area', e.target.value)}><option value="">Selecciona…</option>{AREAS_ECOMMERCE.map((a) => <option key={a}>{a}</option>)}</select></AdminField>
      )}
      {u.rol === 'compras' && (
        <div className="space-y-3">
          <AdminField label="Comprador responsable"><input className={adminInputCls} placeholder="ej. Calzado Deportivo" value={u.comprador ?? ''} onChange={(e) => set('comprador', e.target.value)} /></AdminField>
          <Chips label="Marcas" options={MARCAS} selected={u.marcas ?? []} onToggle={(v) => toggleArr('marcas', v)} />
          <Chips label="Líneas" options={LINEAS} selected={u.lineas ?? []} onToggle={(v) => toggleArr('lineas', v)} />
          <Chips label="Sublíneas" options={SUBLINEAS} selected={u.sublineas ?? []} onToggle={(v) => toggleArr('sublineas', v)} />
        </div>
      )}
      {u.rol === 'admin' && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-700"><ShieldCheck className="h-4 w-4" /> Acceso total, sin restricciones adicionales.</div>
      )}

      {/* Estado */}
      <label className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-sm font-medium text-slate-700">Estado {u.activo ? '· Activo' : '· Inactivo'}</span>
        <Switch on={u.activo} onToggle={() => set('activo', !u.activo)} />
      </label>

      {/* Contraseña */}
      {mode === 'create' ? (
        <AdminField label="Contraseña temporal (generada)"><input className={cn(adminInputCls, 'font-mono')} readOnly value={tempPass} /></AdminField>
      ) : (
        <Button size="sm" variant="secondary" icon={<KeyRound className="h-4 w-4" />} onClick={onResetPassword}>Restablecer contraseña</Button>
      )}
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-700">Forzar cambio de contraseña al iniciar sesión</span>
        <Switch on={forceChange} onToggle={() => setForceChange((v) => !v)} />
      </label>

      {/* Sección avanzada: historial + permisos especiales */}
      {!esTienda && (
        <div className="border-t border-slate-100 pt-3">
          <button type="button" onClick={() => setAdvOpen((v) => !v)} className="flex w-full items-center gap-1.5 text-sm font-medium text-slate-700">
            {advOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />} Avanzado · historial y permisos especiales
          </button>
          {advOpen && (
            <div className="mt-3 space-y-4">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400"><History className="h-3.5 w-3.5" /> Historial</div>
                <ul className="space-y-2 text-xs">
                  {[{ a: 'Último acceso', d: u.ultimoAcceso }, { a: 'Rol asignado', d: ROL_LABEL[u.rol] }, { a: 'Alta del usuario', d: '10 jul 2026 · Jorge Villa' }].map((h, i) => (
                    <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /><div><div className="text-slate-700">{h.a}</div><div className="text-[11px] text-slate-400">{h.d}</div></div></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Permisos especiales</span>
                  <button className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline" onClick={onDuplicatePerms}><RefreshCw className="h-3 w-3" /> Copiar</button>
                </div>
                {copiedPerms && <button onClick={() => set('permisos', { ...copiedPerms.perms })} className="mb-2 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 hover:bg-brand-100">Pegar permisos de {copiedPerms.from}</button>}
                <div className="space-y-2">
                  {PERM_MODULES.map((m) => (
                    <div key={m.module}>
                      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{m.module}</div>
                      <div className="divide-y divide-slate-50 rounded-lg border border-slate-100">
                        {m.perms.map((p) => {
                          const key = `${m.module}::${p}`
                          return (
                            <div key={p} className="flex items-center justify-between gap-3 px-3 py-1.5">
                              <span className="text-sm text-slate-700">{p}</span>
                              <Switch on={!!u.permisos[key]} onToggle={() => togglePerm(key)} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}

function Chips({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o)
          return <button key={o} onClick={() => onToggle(o)} className={cn('rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150', on ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>{o}</button>
        })}
      </div>
    </div>
  )
}
