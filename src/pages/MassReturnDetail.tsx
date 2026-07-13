import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ChevronLeft,
  Building2,
  Layers,
  Clock,
  Package,
  Send,
  CheckCircle2,
  Images,
  History,
  Play,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, SectionTitle, StatusBadge, Avatar, Button, cn } from '../lib/ui'
import { findMassReturn, personById, subPendiente, type MassSub, type TimelineEvent } from '../data/mock'

const TIMELINE_DOT: Record<TimelineEvent['kind'], string> = {
  create: 'bg-brand-600',
  attach: 'bg-sky-500',
  comment: 'bg-amber-500',
  status: 'bg-emerald-500',
  transfer: 'bg-violet-500',
  receive: 'bg-teal-500',
}

function totals(subs: MassSub[]) {
  const solicitado = subs.reduce((a, s) => a + s.solicitado, 0)
  const enviado = subs.reduce((a, s) => a + s.enviado, 0)
  const recibido = subs.reduce((a, s) => a + s.recibido, 0)
  return { solicitado, enviado, recibido, pct: Math.round((recibido / solicitado) * 100) }
}

export default function MassReturnDetail() {
  const { folio } = useParams()
  const navigate = useNavigate()
  const data = folio ? findMassReturn(folio) : undefined
  const [openSucursal, setOpenSucursal] = useState<string | null>(null)

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-slate-500">No se encontró la devolución masiva {folio}.</p>
        <Button className="mt-4" onClick={() => navigate('/masivas')}>Volver a masivas</Button>
      </div>
    )
  }

  const t = totals(data.subs)
  const detalle = openSucursal ? data.subs.find((s) => s.sucursal === openSucursal) : undefined

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <button onClick={() => navigate('/masivas')} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" /> Volver a masivas
      </button>

      <PageHeader
        title={data.folio}
        subtitle={`${data.producto} · ${data.linea} · ${data.marca} · ${data.proveedor}`}
      />

      {/* Resumen del lote */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Layers className="h-5 w-5" /></span>
          <div>
            <div className="font-mono text-sm font-semibold text-slate-900">{data.lote}</div>
            <div className="text-xs text-slate-500">Lote</div>
          </div>
        </Card>
        <Card>
          <div className="text-2xl font-semibold text-slate-900">{t.pct}%</div>
          <div className="text-xs text-slate-500">Cumplimiento</div>
        </Card>
        <Card>
          <div className="text-2xl font-semibold text-slate-900">{t.recibido}/{t.solicitado}</div>
          <div className="text-xs text-slate-500">Unidades recibidas</div>
        </Card>
        <Card>
          <div className="text-2xl font-semibold text-slate-900">{data.subs.length}</div>
          <div className="text-xs text-slate-500">Sucursales</div>
        </Card>
      </div>

      {/* Tabla de sucursales — navegable */}
      <Card padded={false}>
        <div className="px-5 py-4">
          <SectionTitle icon={<Building2 className="h-4 w-4" />}>Avance por sucursal</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-5 py-2.5">Sucursal</th>
                <th className="px-3 py-2.5 text-right">Solicitado</th>
                <th className="px-3 py-2.5 text-right">Enviado</th>
                <th className="px-3 py-2.5 text-right">Pendiente</th>
                <th className="px-3 py-2.5">Responsable</th>
                <th className="px-3 py-2.5">Fecha compromiso</th>
                <th className="px-3 py-2.5">Estatus</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {data.subs.map((s) => {
                const resp = personById(s.responsableId)
                return (
                  <tr
                    key={s.sucursal}
                    onClick={() => setOpenSucursal(s.sucursal)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenSucursal(s.sucursal) } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver detalle de ${s.sucursal}`}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 focus-visible:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">{s.sucursal}</td>
                    <td className="px-3 py-3 text-right text-slate-700">{s.solicitado}</td>
                    <td className="px-3 py-3 text-right text-slate-700">{s.enviado}</td>
                    <td className={cn('px-3 py-3 text-right font-medium', subPendiente(s) > 0 ? 'text-brand-600' : 'text-slate-500')}>{subPendiente(s)}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1.5 text-slate-600"><Avatar person={resp} size="sm" /> {resp.name}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{s.fechaCompromiso}</td>
                    <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-brand-600">Ver detalle →</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detalle navegable de la sucursal */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6" onClick={() => setOpenSucursal(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-pop sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{detalle.sucursal}</h3>
                <p className="text-sm text-slate-500">{data.folio} · {data.lote}</p>
              </div>
              <StatusBadge status={detalle.status} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Package className="h-3.5 w-3.5" /> Solicitado</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">{detalle.solicitado}</div>
              </div>
              <div className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Send className="h-3.5 w-3.5" /> Enviado</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">{detalle.enviado}</div>
              </div>
              <div className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Clock className="h-3.5 w-3.5" /> Pendiente</div>
                <div className={cn('mt-1 text-xl font-semibold', subPendiente(detalle) > 0 ? 'text-brand-600' : 'text-slate-900')}>{subPendiente(detalle)}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2 text-slate-600"><Avatar person={personById(detalle.responsableId)} size="sm" /> {personById(detalle.responsableId).name}</span>
              <span className="text-slate-500">Compromiso: <span className="font-medium text-slate-800">{detalle.fechaCompromiso}</span></span>
            </div>

            {/* Evidencias */}
            <div className="mt-5">
              <SectionTitle icon={<Images className="h-4 w-4" />}>Evidencias</SectionTitle>
              {detalle.evidencias.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {detalle.evidencias.map((e, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                      <img src={e.url} alt={e.label} className="h-full w-full object-cover" />
                      {e.kind === 'video' && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-900"><Play className="h-3.5 w-3.5 fill-current" /></span>
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-[10px] font-medium text-white">{e.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sin evidencias registradas todavía.</p>
              )}
            </div>

            {/* Historial */}
            <div className="mt-5">
              <SectionTitle icon={<History className="h-4 w-4" />}>Historial</SectionTitle>
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {detalle.historial.map((h, i) => (
                  <li key={i} className="relative">
                    <span className={cn('absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white', TIMELINE_DOT[h.kind])} />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-slate-500">{h.date}</span>
                      <span className="font-mono text-xs font-semibold text-slate-700">{h.time}</span>
                    </div>
                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">{h.actor}</span> {h.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenSucursal(null)}>Cerrar</Button>
              {detalle.status !== 'recibido' && (
                <Button variant="primary" icon={<CheckCircle2 className="h-4 w-4" />}>Registrar recepción</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
