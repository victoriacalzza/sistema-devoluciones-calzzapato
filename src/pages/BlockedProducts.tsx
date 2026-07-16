import { useNavigate } from 'react-router-dom'
import { Ban, Store, Info } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, BackLink } from '../lib/ui'
import { ExportMenu } from '../components/ExportMenu'
import { BLOQUEADOS_ECOMMERCE } from '../data/mock'

export default function BlockedProducts() {
  const navigate = useNavigate()
  const rows = BLOQUEADOS_ECOMMERCE

  const exportRows = rows.map((p) => ({
    sku: p.sku,
    producto: p.producto,
    sucursal: p.sucursal,
    folioOrigen: p.folioOrigen,
    motivo: p.motivo,
    fecha: p.fecha,
    estado: 'Bloqueado para Ecommerce · Disponible para venta física',
  }))

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <BackLink to="/" label="Volver al inicio" />
      <PageHeader
        title="Productos bloqueados para Ecommerce"
        subtitle="Devoluciones rechazadas cuyo producto permanece en la tienda"
        actions={
          <ExportMenu
            filename="productos-bloqueados-ecommerce"
            title="Productos bloqueados para Ecommerce"
            columns={[
              { header: 'SKU', key: 'sku' },
              { header: 'Producto', key: 'producto' },
              { header: 'Sucursal', key: 'sucursal' },
              { header: 'Folio origen', key: 'folioOrigen' },
              { header: 'Motivo', key: 'motivo' },
              { header: 'Fecha', key: 'fecha' },
              { header: 'Estado', key: 'estado' },
            ]}
            rows={exportRows}
          />
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <span>
          Cuando Compras rechaza una devolución y determina que el producto permanece en la tienda, el producto se
          <span className="font-medium text-rose-600"> bloquea para Ecommerce</span> pero sigue
          <span className="font-medium text-emerald-600"> disponible para venta física</span>.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <Card key={p.sku} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{p.producto}</div>
                <div className="font-mono text-xs text-slate-500">{p.sku}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                <Ban className="h-3 w-3" /> Bloqueado para Ecommerce
              </span>
              {p.ventaFisica && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <Store className="h-3 w-3" /> Disponible para venta física
                </span>
              )}
            </div>
            <div className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div><span className="text-slate-400">Sucursal:</span> <span className="text-slate-700">{p.sucursal}</span></div>
              <div><span className="text-slate-400">Motivo:</span> <span className="text-slate-700">{p.motivo}</span></div>
              <button
                onClick={() => navigate(`/devoluciones/${p.folioOrigen}`)}
                className="font-mono font-medium text-brand-600 hover:underline"
              >
                {p.folioOrigen}
              </button>
              <span className="text-slate-400"> · {p.fecha}</span>
            </div>
          </Card>
        ))}
      </div>

      {rows.length === 0 && (
        <Card className="py-16 text-center text-sm text-slate-500">No hay productos bloqueados para Ecommerce.</Card>
      )}
    </div>
  )
}
