import { useNavigate } from 'react-router-dom'
import { Hourglass, Clock, Store, UserCircle2, ArrowRight, Info } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, StatusBadge, Avatar, BackLink, cn } from '../lib/ui'
import { ExportMenu } from '../components/ExportMenu'
import {
  devolucionesPendientesResolucion,
  personById,
  STATUSES,
  tiempoTranscurrido,
} from '../data/mock'

export default function PendingResolution() {
  const navigate = useNavigate()
  const rows = devolucionesPendientesResolucion()

  const exportRows = rows.map((r) => ({
    folio: r.folio,
    producto: r.product.descripcion,
    sku: r.product.sku,
    marca: r.marca,
    tiendaOrigen: r.sucursal,
    fechaCreacion: r.fechaCreacion,
    estado: STATUSES[r.status].label,
    comprador: personById(r.responsableId).name,
    tiempoTranscurrido: tiempoTranscurrido(r.fechaCreacion),
    slaRestante: r.slaDue,
  }))

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <BackLink to="/" label="Volver al inicio" />
      <PageHeader
        title="Pendientes de resolución Ecommerce"
        subtitle="Productos devueltos en tienda física pendientes de resolución por Compras que impactan inventario Ecommerce"
        actions={
          <ExportMenu
            filename="pendientes-resolucion-ecommerce"
            title="Pendientes de resolución Ecommerce"
            columns={[
              { header: 'Folio devolución', key: 'folio' },
              { header: 'Producto', key: 'producto' },
              { header: 'SKU', key: 'sku' },
              { header: 'Marca', key: 'marca' },
              { header: 'Tienda origen', key: 'tiendaOrigen' },
              { header: 'Fecha creación', key: 'fechaCreacion' },
              { header: 'Estado actual', key: 'estado' },
              { header: 'Comprador asignado', key: 'comprador' },
              { header: 'Tiempo transcurrido', key: 'tiempoTranscurrido' },
              { header: 'SLA restante', key: 'slaRestante' },
            ]}
            rows={exportRows}
          />
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <span>La resolución la define <span className="font-medium text-slate-700">Compras</span>. Mientras tanto, el producto impacta el inventario disponible para Ecommerce.</span>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const comprador = personById(r.responsableId)
          return (
            <Card key={r.folio} padded={false} className="overflow-hidden">
              <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                {/* Producto */}
                <button onClick={() => navigate(`/devoluciones/${r.folio}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <img src={r.product.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">{r.folio}</span>
                      {r.outOfSla && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">Fuera de SLA</span>}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-700">{r.product.descripcion}</p>
                    <p className="truncate font-mono text-[11px] text-slate-500">{r.product.sku} · {r.marca}</p>
                  </div>
                </button>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-3 lg:w-[42%]">
                  <Meta label="Tienda origen" value={r.sucursal} icon={<Store className="h-3.5 w-3.5" />} />
                  <Meta label="Fecha creación" value={r.fechaCreacion} />
                  <Meta label="Estado actual" value={<StatusBadge status={r.status} />} />
                  <Meta label="Tiempo transcurrido" value={tiempoTranscurrido(r.fechaCreacion)} icon={<Clock className="h-3.5 w-3.5" />} />
                  <Meta label="SLA restante" value={<span className={cn(r.outOfSla && 'font-semibold text-brand-600')}>{r.slaDue}</span>} />
                </div>

                {/* Responsable de Compras — muy visible */}
                <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 lg:w-64">
                  <Avatar person={comprador} size="lg" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-brand-700">
                      <UserCircle2 className="h-3.5 w-3.5" /> Responsable
                    </div>
                    <div className="truncate text-sm font-semibold text-slate-900">{comprador.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{comprador.role}</div>
                  </div>
                  <ArrowRight className="ml-auto hidden h-4 w-4 text-slate-300 lg:block" />
                </div>
              </div>
            </Card>
          )
        })}
        {rows.length === 0 && (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Hourglass className="h-7 w-7" /></span>
            <p className="text-sm text-slate-500">No hay devoluciones pendientes de resolución.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function Meta({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-400">{icon}{label}</div>
      <div className="mt-0.5 text-slate-700">{value}</div>
    </div>
  )
}
