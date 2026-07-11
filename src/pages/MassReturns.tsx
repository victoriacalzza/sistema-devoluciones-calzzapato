import { Layers, Plus, Building2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/AppLayout'
import { Card, StatusBadge, Button, cn } from '../lib/ui'
import { MASS_RETURNS, subPendiente, type MassSub } from '../data/mock'

function pct(subs: MassSub[]) {
  const sol = subs.reduce((a, s) => a + s.solicitado, 0)
  const rec = subs.reduce((a, s) => a + s.recibido, 0)
  return { sol, rec, pct: Math.round((rec / sol) * 100) }
}

export default function MassReturns() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Devoluciones masivas"
        subtitle="Retiros de lote solicitados por Compras · avance de cumplimiento por sucursal"
        actions={<Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/nueva')}>Nueva masiva</Button>}
      />

      <div className="space-y-5">
        {MASS_RETURNS.map((m) => {
          const p = pct(m.subs)
          return (
            <Card key={m.folio} padded={false}>
              <button
                onClick={() => navigate(`/masivas/${m.folio}`)}
                className="flex w-full flex-col gap-4 border-b border-slate-100 p-5 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Layers className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">{m.folio}</span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">{m.lote}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{m.producto}</p>
                    <p className="text-xs text-slate-500">{m.linea} · {m.marca} · {m.proveedor} · Creada {m.creada}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="sm:text-right">
                    <div className="text-2xl font-semibold text-slate-900">{p.pct}%</div>
                    <div className="text-xs text-slate-500">{p.rec} de {p.sol} unidades recibidas</div>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />
                </div>
              </button>

              {/* progress bar */}
              <div className="px-5 pt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={cn('h-full rounded-full', p.pct === 100 ? 'bg-emerald-500' : 'bg-brand-600')} style={{ width: `${p.pct}%` }} />
                </div>
              </div>

              {/* sub-expedientes */}
              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {m.subs.map((s) => {
                  const subPct = Math.round((s.recibido / s.solicitado) * 100)
                  return (
                    <button
                      key={s.sucursal}
                      onClick={() => navigate(`/masivas/${m.folio}`)}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-left hover:border-brand-200 hover:bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-800">{s.sucursal}</span>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{s.recibido}/{s.solicitado} uds. · {subPendiente(s)} pend.</span>
                        <span className="font-medium text-slate-700">{subPct}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className={cn('h-full rounded-full', subPct === 100 ? 'bg-emerald-500' : 'bg-brand-500')} style={{ width: `${subPct}%` }} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
