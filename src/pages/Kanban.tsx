import { useNavigate } from 'react-router-dom'
import { Card, PriorityBadge, Avatar, cn } from '../lib/ui'
import { STATUSES, KANBAN_ORDER, personById, type ReturnCase } from '../data/mock'

export default function Kanban({ rows }: { rows: ReturnCase[] }) {
  const navigate = useNavigate()
  return (
    <div className="-mx-1 overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3 px-1">
        {KANBAN_ORDER.map((key) => {
          const meta = STATUSES[key]
          const items = rows.filter((r) => r.status === key)
          return (
            <div key={key} className="flex w-72 shrink-0 flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
                  <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{items.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 rounded-xl bg-slate-100/60 p-2">
                {items.map((r) => {
                  const resp = personById(r.responsableId)
                  return (
                    <Card
                      key={r.folio}
                      padded={false}
                      className="cursor-pointer p-3 transition-shadow hover:shadow-card-hover"
                    >
                      <button className="w-full text-left" onClick={() => navigate(`/devoluciones/${r.folio}`)}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-semibold text-slate-900">{r.folio}</span>
                          <PriorityBadge priority={r.priority} />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <img src={r.product.image} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                          <p className="line-clamp-2 text-xs text-slate-600">{r.product.descripcion}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="truncate text-[11px] text-slate-500">{r.sucursal}</span>
                          <Avatar person={resp} size="sm" />
                        </div>
                      </button>
                    </Card>
                  )
                })}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-500">
                    Sin casos
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
