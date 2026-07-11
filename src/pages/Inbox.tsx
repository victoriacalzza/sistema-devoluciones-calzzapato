import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, LayoutGrid, Rows3, Download, Calendar } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, StatusBadge, PriorityBadge, Avatar, Button, Pill, cn } from '../lib/ui'
import {
  RETURNS,
  STATUSES,
  RETURN_TYPES,
  SUCURSALES,
  MARCAS,
  personById,
  type StatusKey,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'
import Kanban from './Kanban'

const STATUS_FILTERS: (StatusKey | 'todos')[] = ['todos', 'nuevo', 'revision', 'esperando', 'autorizado', 'rechazado', 'transito', 'recibido']

function isStatusFilter(v: string | null): v is StatusKey | 'todos' {
  return !!v && (STATUS_FILTERS as string[]).includes(v)
}

export default function Inbox() {
  const navigate = useNavigate()
  const { user, role } = useRole()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<'tabla' | 'kanban'>('tabla')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<StatusKey | 'todos'>(() => {
    const s = searchParams.get('status')
    return isStatusFilter(s) ? s : 'todos'
  })
  const [sucursal, setSucursal] = useState('')
  const [marca, setMarca] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  // Sincroniza el filtro de estatus cuando se llega con ?status= (desde el portal).
  useEffect(() => {
    const s = searchParams.get('status')
    if (isStatusFilter(s)) setStatus(s)
  }, [searchParams])

  // Alcance por rol: Ecommerce solo ve devoluciones del canal en línea; Tienda,
  // las de su sucursal o creadas por ella; Compras ve todo.
  const miSucursal = user.role.includes('·') ? user.role.split('·')[1].trim() : ''
  const scoped = useMemo(() => {
    if (role === 'ecommerce') return RETURNS.filter((r) => r.tipo === 'ecommerce')
    if (role === 'tienda') return RETURNS.filter((r) => r.sucursal === miSucursal || r.creadorId === user.id)
    return RETURNS
  }, [role, miSucursal, user.id])

  const rows = useMemo(() => {
    return scoped.filter((r) => {
      if (status !== 'todos' && r.status !== status) return false
      if (sucursal && r.sucursal !== sucursal) return false
      if (marca && r.marca !== marca) return false
      if (q) {
        const hay = `${r.folio} ${r.cliente} ${r.product.sku} ${r.product.descripcion} ${r.marca}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [scoped, q, status, sucursal, marca])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Devoluciones"
        subtitle={`${rows.length} expedientes · ${role === 'ecommerce' ? 'Canal Ecommerce' : role === 'tienda' ? miSucursal || 'Mi sucursal' : 'Bandeja general'}`}
        actions={
          <>
            <Button size="sm" variant="secondary" icon={<Download className="h-4 w-4" />}>Exportar</Button>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setView('tabla')}
                className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium', view === 'tabla' ? 'bg-slate-100 text-slate-900' : 'text-slate-500')}
              >
                <Rows3 className="h-4 w-4" /> Tabla
              </button>
              <button
                onClick={() => setView('kanban')}
                className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium', view === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-500')}
              >
                <LayoutGrid className="h-4 w-4" /> Kanban
              </button>
            </div>
          </>
        }
      />

      {/* Filter bar */}
      <Card className="mb-4" padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar folio, cliente, SKU, producto…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <select
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-600 focus:outline-none"
          >
            <option value="">Todas las sucursales</option>
            {SUCURSALES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-600 focus:outline-none"
          >
            <option value="">Todas las marcas</option>
            {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <Button size="sm" variant="secondary" icon={<Calendar className="h-4 w-4" />}>Rango de fechas</Button>
          <Button
            size="sm"
            variant={showFilters ? 'secondary' : 'ghost'}
            icon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters((v) => !v)}
          >
            Filtros
          </Button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2.5">
            {STATUS_FILTERS.map((s) => (
              <Pill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === 'todos' ? 'Todos' : STATUSES[s].label}
              </Pill>
            ))}
          </div>
        )}
      </Card>

      {view === 'kanban' ? (
        <Kanban rows={rows} />
      ) : (
        <Card padded={false} className="overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="w-44 px-4 py-3">Folio</th>
                <th className="px-4 py-3">Producto</th>
                <th className="hidden w-32 px-4 py-3 lg:table-cell">Sucursal</th>
                <th className="hidden w-36 px-4 py-3 xl:table-cell">Cliente</th>
                <th className="w-40 px-4 py-3">Estatus</th>
                <th className="hidden w-24 px-4 py-3 md:table-cell">Prioridad</th>
                <th className="w-44 px-4 py-3">Asignado a</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const resp = personById(r.responsableId)
                return (
                  <tr
                    key={r.folio}
                    onClick={() => navigate(`/devoluciones/${r.folio}`)}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-900">{r.folio}</span>
                        {r.outOfSla && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">SLA</span>}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">{RETURN_TYPES[r.tipo].short}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={r.product.image} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                        <div className="min-w-0">
                          <div className="truncate text-slate-700">{r.product.descripcion}</div>
                          <div className="truncate font-mono text-[11px] text-slate-400">{r.product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell"><span className="block truncate text-slate-600">{r.sucursal}</span></td>
                    <td className="hidden px-4 py-3 xl:table-cell"><span className="block truncate text-slate-600">{r.cliente}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="hidden px-4 py-3 md:table-cell"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Avatar person={resp} size="sm" />
                        <span className="truncate">{resp.name}</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">No hay devoluciones que coincidan con los filtros.</div>
          )}
        </Card>
      )}
    </div>
  )
}
