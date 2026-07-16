import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Plus, TriangleAlert } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Avatar, PriorityBadge, Button, Pill, BackLink, cn } from '../lib/ui'
import { ExportMenu } from '../components/ExportMenu'
import {
  INCIDENCIAS,
  INCIDENCIA_STATUS,
  personById,
  type IncidenciaStatus,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'

type EstadoFilter = 'todos' | 'mi-accion' | 'pendientes' | 'esperando' | 'abiertas' | 'cerradas'

const FILTERS: { key: EstadoFilter; label: string }[] = [
  { key: 'todos', label: 'Todas' },
  { key: 'mi-accion', label: 'Requieren mi acción' },
  { key: 'pendientes', label: 'Pendientes de resolución' },
  { key: 'esperando', label: 'En revisión de Compras' },
  { key: 'abiertas', label: 'Abiertas' },
  { key: 'cerradas', label: 'Cerradas' },
]

function matchEstado(status: IncidenciaStatus, f: EstadoFilter): boolean {
  switch (f) {
    case 'mi-accion': return status === 'esperando'
    case 'pendientes': return status === 'abierta' || status === 'revision'
    case 'esperando': return status === 'revision'
    case 'abiertas': return status !== 'cerrada' && status !== 'resuelta'
    case 'cerradas': return status === 'cerrada' || status === 'resuelta'
    default: return true
  }
}

function isEstado(v: string | null): v is EstadoFilter {
  return !!v && FILTERS.some((f) => f.key === v)
}

export default function Incidencias() {
  const navigate = useNavigate()
  const { role } = useRole()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<EstadoFilter>(() => {
    const e = searchParams.get('estado')
    return isEstado(e) ? e : 'todos'
  })

  useEffect(() => {
    const e = searchParams.get('estado')
    if (isEstado(e)) setEstado(e)
  }, [searchParams])

  const rows = useMemo(() => {
    return INCIDENCIAS.filter((i) => {
      if (!matchEstado(i.status, estado)) return false
      if (q) {
        const hay = `${i.folio} ${i.sku} ${i.producto} ${i.lote} ${i.sucursalOrigen} ${i.relacionado} ${i.motivo}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [q, estado])

  const exportRows = rows.map((i) => ({
    folio: i.folio,
    relacionado: i.relacionado,
    sku: i.sku,
    producto: i.producto,
    lote: i.lote,
    sucursalOrigen: i.sucursalOrigen,
    gerenteOrigen: i.gerenteOrigen,
    motivo: i.motivo,
    estatus: INCIDENCIA_STATUS[i.status].label,
    responsable: personById(i.responsableId).name,
    resolucion: i.resolucion ?? '—',
    creada: i.creada,
  }))

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <BackLink to="/" label="Volver al inicio" />
      <PageHeader
        title="Incidencias Ecommerce"
        subtitle={`${rows.length} incidencias · mercancía recibida en el almacén Ecommerce`}
        actions={
          <>
            <ExportMenu
              filename="incidencias-ecommerce"
              title="Reporte de incidencias Ecommerce"
              columns={[
                { header: 'Folio', key: 'folio' },
                { header: 'Relacionado', key: 'relacionado' },
                { header: 'SKU', key: 'sku' },
                { header: 'Producto', key: 'producto' },
                { header: 'Lote', key: 'lote' },
                { header: 'Sucursal origen', key: 'sucursalOrigen' },
                { header: 'Gerente origen', key: 'gerenteOrigen' },
                { header: 'Motivo', key: 'motivo' },
                { header: 'Estatus', key: 'estatus' },
                { header: 'Responsable', key: 'responsable' },
                { header: 'Resolución', key: 'resolucion' },
                { header: 'Creada', key: 'creada' },
              ]}
              rows={exportRows}
            />
            {role === 'ecommerce' && (
              <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/incidencias/nueva')}>
                Registrar incidencia
              </Button>
            )}
          </>
        }
      />

      <Card className="mb-4" padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar folio, SKU, producto, lote, sucursal…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2.5">
          {FILTERS.map((f) => (
            <Pill key={f.key} active={estado === f.key} onClick={() => setEstado(f.key)}>{f.label}</Pill>
          ))}
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="w-44 px-4 py-3">Folio</th>
              <th className="px-4 py-3">Producto</th>
              <th className="hidden w-36 px-4 py-3 lg:table-cell">Sucursal origen</th>
              <th className="hidden w-40 px-4 py-3 xl:table-cell">Motivo</th>
              <th className="w-48 px-4 py-3">Estatus</th>
              <th className="hidden w-24 px-4 py-3 md:table-cell">Prioridad</th>
              <th className="w-44 px-4 py-3">Responsable</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const resp = personById(i.responsableId)
              const st = INCIDENCIA_STATUS[i.status]
              return (
                <tr
                  key={i.folio}
                  onClick={() => navigate(`/incidencias/${i.folio}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/incidencias/${i.folio}`) } }}
                  tabIndex={0}
                  role="link"
                  aria-label={`Abrir incidencia ${i.folio}`}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 focus-visible:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-semibold text-slate-900">{i.folio}</div>
                    <div className="truncate font-mono text-[11px] text-slate-500">Rel. {i.relacionado}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={i.image} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0">
                        <div className="truncate text-slate-700">{i.producto}</div>
                        <div className="truncate font-mono text-[11px] text-slate-500">{i.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell"><span className="block truncate text-slate-600">{i.sucursalOrigen}</span></td>
                  <td className="hidden px-4 py-3 xl:table-cell"><span className="block truncate text-slate-600">{i.motivo}</span></td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', st.bg, st.text)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />{st.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell"><PriorityBadge priority={i.priority} /></td>
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
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <TriangleAlert className="h-7 w-7" />
            </span>
            <p className="text-sm text-slate-500">No hay incidencias que coincidan con los filtros.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
