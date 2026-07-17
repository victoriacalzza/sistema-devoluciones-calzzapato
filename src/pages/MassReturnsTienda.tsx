import { useNavigate } from 'react-router-dom'
import { Layers, ArrowRight } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, BackLink, cn } from '../lib/ui'
import {
  solicitudesMasivasTienda,
  solicitudMasivaActiva,
  massTiendaNextAction,
  MASS_TIENDA_STATUS,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'

export default function MassReturnsTienda() {
  const navigate = useNavigate()
  const { role, user } = useRole()

  // Solo Tienda atiende solicitudes masivas asignadas a su sucursal.
  if (role !== 'tienda') {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Esta vista es exclusiva del rol Tienda.</p>
      </div>
    )
  }

  const sucursal = user.role.includes('·') ? user.role.split('·')[1].trim() : ''
  const solicitudes = solicitudesMasivasTienda(sucursal)
  const activas = solicitudes.filter((s) => solicitudMasivaActiva(s.status))

  return (
    <div className="mx-auto max-w-[960px] px-4 py-6 lg:px-8">
      <BackLink to="/" label="Volver al inicio" />
      <PageHeader
        title="Devoluciones masivas pendientes"
        subtitle={`Solicitudes de Compras que requieren retirar mercancía de ${sucursal || 'tu sucursal'}`}
      />

      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <Layers className="h-4 w-4 text-slate-400" />
        <span>
          <span className="font-semibold text-slate-900">{activas.length}</span> solicitud(es) activa(s)
          {solicitudes.length > activas.length && <span className="text-slate-400"> · {solicitudes.length - activas.length} concluida(s)</span>}
        </span>
      </div>

      <Card padded={false}>
        <div className="divide-y divide-slate-50">
          {solicitudes.map(({ mass, sub, status }) => {
            const st = MASS_TIENDA_STATUS[status]
            return (
              <button
                key={mass.folio}
                onClick={() => navigate(`/masivas-tienda/${mass.folio}`)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">{mass.folio}</span>
                    <span className="text-xs text-slate-500">Lote {mass.lote}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{mass.marca}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-600">{mass.producto}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                    <span className="font-mono">{mass.sku}</span>
                    <span>·</span>
                    <span>Solicitado: <span className="font-semibold text-slate-700">{sub.solicitado} uds.</span></span>
                    <span>·</span>
                    <span>Solicitud: {mass.creada}</span>
                    <span>·</span>
                    <span>Comprador: {mass.responsable}</span>
                    <span>·</span>
                    <span>Límite: {sub.fechaCompromiso}</span>
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', st.bg, st.text)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />{st.label}
                  </span>
                  <div className="mt-1 text-[11px] text-slate-500">{massTiendaNextAction(status)}</div>
                </div>
                <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
              </button>
            )
          })}
          {solicitudes.length === 0 && (
            <div className="px-5 py-16 text-center text-sm text-slate-500">
              No hay devoluciones masivas asignadas a {sucursal || 'tu sucursal'}.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
