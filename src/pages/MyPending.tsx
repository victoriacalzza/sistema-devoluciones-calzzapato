import { useNavigate } from 'react-router-dom'
import { Clock, ArrowRight, Inbox } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, StatusBadge, PriorityBadge, Avatar, Button, KpiCard, cn } from '../lib/ui'
import { RETURNS, personById, RETURN_TYPES } from '../data/mock'
import { useRole } from '../lib/RoleContext'
import { requiresActionFrom, ownershipFor } from '../lib/permissions'

export default function MyPending() {
  const navigate = useNavigate()
  const { user, role } = useRole()

  // Casos que requieren la acción del área del rol actual (§2 "requiere mi acción").
  const requiere = RETURNS.filter((r) => requiresActionFrom(role, r))
  const urgentes = requiere.filter((r) => r.priority === 'urgente' || r.outOfSla)
  const creadasPorMi = RETURNS.filter((r) => r.creadorId === user.id)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Mis pendientes"
        subtitle={`Bandeja de trabajo de ${user.name} · ${user.role}`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Mis pendientes" value={requiere.length} icon={<Inbox className="h-4 w-4" />} />
        <KpiCard label="Urgentes / fuera de SLA" value={urgentes.length} accent="danger" icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Creadas por mí" value={creadasPorMi.length} />
        <KpiCard label="Resueltos hoy" value={2} accent="success" />
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Requieren tu acción</h3>
            <p className="text-xs text-slate-400">Ordenado por SLA restante · área {user.role}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/devoluciones')}>Ver bandeja completa</Button>
        </div>
        <div className="divide-y divide-slate-50 border-t border-slate-100">
          {requiere.map((r) => {
            const resp = personById(r.responsableId)
            const own = ownershipFor(r.status)
            return (
              <button
                key={r.folio}
                onClick={() => navigate(`/devoluciones/${r.folio}`)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50"
              >
                <img src={r.product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">{r.folio}</span>
                    <span className="text-xs text-slate-400">{RETURN_TYPES[r.tipo].short}</span>
                    {r.outOfSla && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">Fuera de SLA</span>}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    <span className="font-medium text-slate-600">{own.nextAction}</span> · {r.sucursal}
                  </p>
                </div>
                <div className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                  <Clock className="h-3.5 w-3.5" />
                  <span className={cn(r.outOfSla && 'font-medium text-brand-600')}>{r.slaDue}</span>
                </div>
                <PriorityBadge priority={r.priority} />
                <StatusBadge status={r.status} />
                <Avatar person={resp} size="sm" />
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>
            )
          })}
          {requiere.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              No tienes casos esperando tu acción como <span className="font-medium text-slate-600">{user.role}</span>. 🎉
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
