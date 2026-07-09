import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Check,
  X,
  MessageSquarePlus,
  Truck,
  Printer,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Send,
  Info,
  Package,
  Images,
  MessagesSquare,
  History,
  ArrowRightLeft,
  Sparkles,
  UserCircle2,
  ClipboardCheck,
  Hand,
  Clock,
  Building2,
  ArrowRight,
  Lock,
} from 'lucide-react'
import { Card, SectionTitle, StatusBadge, PriorityBadge, Avatar, Button, cn } from '../lib/ui'
import {
  findReturn,
  personById,
  RETURN_TYPES,
  type Comment,
  type TimelineEvent,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'
import { allowedActions, ownershipFor, canSeeCost, type ActionKey } from '../lib/permissions'

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn('text-right text-sm font-medium text-slate-900', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}

const TIMELINE_DOT: Record<TimelineEvent['kind'], string> = {
  create: 'bg-brand-600',
  attach: 'bg-sky-500',
  comment: 'bg-amber-500',
  status: 'bg-emerald-500',
  transfer: 'bg-violet-500',
  receive: 'bg-teal-500',
}

type BarBtn = { label: string; icon: React.ReactNode; variant: 'ghost' | 'secondary' | 'danger' | 'success' | 'primary' }

// Metadatos de presentación de cada acción; "comentar" no vive en la barra.
const ACTION_META: Partial<Record<ActionKey, BarBtn>> = {
  imprimir: { label: 'Imprimir', icon: <Printer className="h-4 w-4" />, variant: 'ghost' },
  tomar: { label: 'Registrar y enviar a revisión', icon: <Hand className="h-4 w-4" />, variant: 'primary' },
  responder_info: { label: 'Responder información', icon: <MessageSquarePlus className="h-4 w-4" />, variant: 'primary' },
  solicitar_info: { label: 'Solicitar información', icon: <MessageSquarePlus className="h-4 w-4" />, variant: 'secondary' },
  generar_traslado: { label: 'Generar devolución a proveedor', icon: <Truck className="h-4 w-4" />, variant: 'secondary' },
  cerrar: { label: 'Cerrar expediente', icon: <Check className="h-4 w-4" />, variant: 'primary' },
  rechazar: { label: 'Rechazar', icon: <X className="h-4 w-4" />, variant: 'danger' },
  autorizar: { label: 'Autorizar', icon: <Check className="h-4 w-4" />, variant: 'success' },
}

// Orden de aparición en la barra (izq → der, la decisión primaria al final).
const ACTION_ORDER: ActionKey[] = [
  'imprimir',
  'tomar',
  'responder_info',
  'solicitar_info',
  'generar_traslado',
  'cerrar',
  'rechazar',
  'autorizar',
]

export default function ReturnDetail() {
  const { folio } = useParams()
  const navigate = useNavigate()
  const { user, role } = useRole()
  const data = folio ? findReturn(folio) : undefined
  const [comments, setComments] = useState<Comment[]>(data?.comments ?? [])
  const [draft, setDraft] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-slate-500">No se encontró el expediente {folio}.</p>
        <Button className="mt-4" onClick={() => navigate('/devoluciones')}>Volver a la bandeja</Button>
      </div>
    )
  }

  const resp = personById(data.responsableId)
  const creador = personById(data.creadorId)
  const own = ownershipFor(data.status)
  const actions = allowedActions(role, data.status, data.tipo)
  const showCost = canSeeCost(role)
  const canComment = actions.includes('comentar')
  const barActions = ACTION_ORDER.filter((a) => actions.includes(a) && ACTION_META[a])

  function send() {
    if (!draft.trim()) return
    setComments((c) => [
      ...c,
      { id: `c${c.length + 1}`, authorId: user.id, time: 'ahora', text: draft.trim() },
    ])
    setDraft('')
  }

  return (
    <div className="pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-4 lg:px-8">
          <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ChevronLeft className="h-4 w-4" /> Volver
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-semibold tracking-tight text-slate-900">{data.folio}</h1>
                <StatusBadge status={data.status} />
                <PriorityBadge priority={data.priority} />
                {data.outOfSla && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">Fuera de SLA</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>{RETURN_TYPES[data.tipo].label}</span>
                <span className="text-slate-300">·</span>
                <span>{data.sucursal}</span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5">
                  Responsable: <Avatar person={resp} size="sm" /> {resp.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-5 lg:col-span-2">
            {/* Product */}
            <Card>
              <SectionTitle icon={<Package className="h-4 w-4" />}>Producto</SectionTitle>
              <div className="flex flex-col gap-4 sm:flex-row">
                <img src={data.product.image} alt="" className="h-40 w-full rounded-xl object-cover sm:h-40 sm:w-40" />
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-slate-900">{data.product.descripcion}</h4>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-400">SKU</div>
                      <div className="font-mono text-sm text-slate-900">{data.product.sku}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Talla</div>
                      <div className="text-sm text-slate-900">{data.product.talla}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Color</div>
                      <div className="text-sm text-slate-900">{data.product.color}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Cantidad</div>
                      <div className="text-sm font-semibold text-slate-900">{data.product.cantidad}</div>
                    </div>
                    {showCost && (
                      <>
                        <div>
                          <div className="text-xs text-slate-400">Precio unitario</div>
                          <div className="text-sm text-slate-900">${data.product.precio.toLocaleString('es-MX')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Total</div>
                          <div className="text-sm font-semibold text-brand-600">
                            ${(data.product.precio * data.product.cantidad).toLocaleString('es-MX')}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Evidences */}
            <Card>
              <SectionTitle icon={<Images className="h-4 w-4" />} right={<span className="text-xs text-slate-400">{data.evidences.length} fotos · {data.documents.length} docs</span>}>
                Evidencias
              </SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {data.evidences.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setPreview(e.url)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img src={e.url} alt={e.label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-left text-[11px] font-medium text-white">
                      {e.label}
                    </span>
                  </button>
                ))}
                <button className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-300 hover:text-brand-500">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[11px] font-medium">Arrastra o sube</span>
                </button>
              </div>
              {data.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <FileText className="h-4 w-4 text-brand-500" />
                      <span className="flex-1 text-sm text-slate-700">{d.name}</span>
                      <span className="text-xs text-slate-400">{d.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Comments — internal chat */}
            <Card padded={false}>
              <div className="px-5 pt-5">
                <SectionTitle icon={<MessagesSquare className="h-4 w-4" />}>Comentarios internos</SectionTitle>
              </div>
              <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 pb-4">
                {comments.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-400">Aún no hay comentarios. Inicia la conversación del caso.</p>
                )}
                {comments.map((c) => {
                  const author = personById(c.authorId)
                  const mine = c.authorId === user.id
                  return (
                    <div key={c.id} className={cn('flex gap-3', mine && 'flex-row-reverse')}>
                      <Avatar person={author} />
                      <div className={cn('max-w-[80%]', mine && 'items-end text-right')}>
                        <div className={cn('flex items-center gap-2', mine && 'flex-row-reverse')}>
                          <span className="text-sm font-medium text-slate-900">{author.name}</span>
                          <span className="text-[11px] text-slate-400">{c.time}</span>
                        </div>
                        <div
                          className={cn(
                            'mt-1 rounded-2xl px-3.5 py-2.5 text-sm',
                            mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {renderMentions(c.text, mine)}
                          {c.attachment && (
                            <div className={cn('mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs', mine ? 'bg-white/15' : 'bg-white')}>
                              {c.attachment.kind === 'image' ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                              {c.attachment.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-slate-100 p-3">
                {canComment ? (
                  <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><Paperclip className="h-4 w-4" /></button>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                      rows={1}
                      placeholder="Escribe un comentario… usa @ para mencionar"
                      className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-sm placeholder:text-slate-400 focus:outline-none"
                    />
                    <Button size="sm" variant="primary" icon={<Send className="h-4 w-4" />} onClick={send}>Enviar</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs text-slate-400">
                    <Lock className="h-3.5 w-3.5" />
                    Tu rol no comenta en este expediente.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Ownership */}
            <Card>
              <SectionTitle icon={<ClipboardCheck className="h-4 w-4" />}>Ownership del expediente</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Responsable actual</span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Avatar person={resp} size="sm" /> {resp.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Área responsable</span>
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', own.areaColor)}>
                    <Building2 className="h-3 w-3" /> {own.area}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500"><ArrowRight className="h-3.5 w-3.5" /> Próxima acción</span>
                  <span className="text-right text-sm font-semibold text-slate-900">{own.nextAction}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-100 px-3 py-2">
                    <div className="text-[11px] text-slate-400">Fecha compromiso</div>
                    <div className="text-sm font-medium text-slate-900">{data.status === 'cerrado' || data.status === 'rechazado' ? '—' : '08 jul · 14:00'}</div>
                  </div>
                  <div className={cn('rounded-lg border px-3 py-2', data.outOfSla ? 'border-brand-100 bg-brand-50/50' : 'border-slate-100')}>
                    <div className="text-[11px] text-slate-400">SLA restante</div>
                    <div className={cn('flex items-center gap-1 text-sm font-semibold', data.outOfSla ? 'text-brand-600' : 'text-slate-900')}>
                      <Clock className="h-3.5 w-3.5" /> {data.slaDue}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI insight */}
            <Card className="border-brand-100 bg-brand-50/40">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Inteligencia del sistema</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    El lote <span className="font-mono font-medium">{data.lote}</span> presenta una incidencia superior al promedio.
                    Se detectaron <span className="font-medium text-brand-700">3 casos similares</span> este mes.
                    Recomendación a Compras: revisar calidad con el proveedor.
                  </p>
                  <Link to="/reportes" className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline">Ver casos similares →</Link>
                </div>
              </div>
            </Card>

            {/* General info */}
            <Card>
              <SectionTitle icon={<Info className="h-4 w-4" />}>Información general</SectionTitle>
              <div className="divide-y divide-slate-50">
                <InfoRow label="Cliente" value={data.cliente} />
                {data.clienteEmail && <InfoRow label="Correo" value={data.clienteEmail} />}
                <InfoRow label="Factura" value={data.factura} mono />
                <InfoRow label="Fecha de compra" value={data.fechaCompra} />
                <InfoRow label="Sucursal" value={data.sucursal} />
                <InfoRow label="Marca" value={data.marca} />
                <InfoRow label="Proveedor" value={data.proveedor} />
                <InfoRow label="Categoría" value={data.categoria} />
                <InfoRow label="Lote" value={data.lote} mono />
                <InfoRow label="Motivo" value={data.motivo} />
                <InfoRow label="SLA" value={<span className={cn(data.outOfSla ? 'text-brand-600' : 'text-slate-900')}>{data.slaDue}</span>} />
              </div>
            </Card>

            {/* Transfer */}
            {data.transfer && (
              <Card>
                <SectionTitle icon={<ArrowRightLeft className="h-4 w-4" />}>Información del traslado</SectionTitle>
                <div className="divide-y divide-slate-50">
                  <InfoRow label="Número" value={data.transfer.numero} mono />
                  <InfoRow label="Origen" value={data.transfer.origen} />
                  <InfoRow label="Destino" value={data.transfer.destino} />
                  <InfoRow label="Estatus" value={data.transfer.estatus} />
                  <InfoRow label="Fecha" value={data.transfer.fecha} />
                  <InfoRow label="Responsable" value={data.transfer.responsable} />
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <SectionTitle icon={<History className="h-4 w-4" />}>Historial</SectionTitle>
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {data.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span className={cn('absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white', TIMELINE_DOT[t.kind])} />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-slate-400">{t.date}</span>
                      <span className="font-mono text-xs font-semibold text-slate-700">{t.time}</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{t.actor}</span> {t.text}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                <UserCircle2 className="h-4 w-4" />
                Creado por {creador.name} · {creador.role}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed action bar — solo acciones relevantes al rol × estado × tipo */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:pl-64">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            Expediente <span className="font-mono font-medium text-slate-900">{data.folio}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">Tu rol: {user.role}</span>
          </span>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            {barActions.length === 0 ? (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                Sin acciones para tu rol en este estado
              </span>
            ) : (
              barActions.map((a) => {
                const m = ACTION_META[a]!
                return (
                  <Button key={a} variant={m.variant} icon={m.icon}>
                    {m.label}
                  </Button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-6" onClick={() => setPreview(null)}>
          <img src={preview} alt="" className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-pop" />
        </div>
      )}
    </div>
  )
}

function renderMentions(text: string, mine: boolean) {
  const parts = text.split(/(@[\wÁÉÍÓÚáéíóúñ]+(?:\s[\wÁÉÍÓÚáéíóúñ]+)?)/g)
  return parts.map((p, i) =>
    p.startsWith('@') ? (
      <span key={i} className={cn('font-semibold', mine ? 'text-white underline' : 'text-brand-600')}>{p}</span>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}
