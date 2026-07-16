import { useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import {
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
  UserSquare2,
  Boxes,
  Gavel,
  Layers,
  Warehouse,
  Play,
  Video,
  Ban,
  Store,
} from 'lucide-react'
import { Card, SectionTitle, StatusBadge, PriorityBadge, Avatar, Button, BackLink, cn } from '../lib/ui'
import {
  findReturn,
  personById,
  compradorForMarca,
  existenciasFor,
  RESOLUTIONS,
  resolucionesFor,
  lineaMercancia,
  almacenesFor,
  VIDEO_SAMPLE,
  RETURN_TYPES,
  type Comment,
  type Evidence,
  type ResolucionOption,
  type StatusKey,
  type TimelineEvent,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'
import { allowedActions, ownershipFor, canSeeCost, type ActionKey } from '../lib/permissions'

// Motivos de rechazo (Compras debe elegir uno al rechazar).
const REJECT_REASONS = [
  'Fuera de política de devolución',
  'Daño por mal uso',
  'Producto sin defecto detectado',
  'Fuera de tiempo',
  'Evidencia insuficiente',
  'Expediente duplicado',
]

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn('text-right text-sm font-medium text-slate-900', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}

/** Par etiqueta/valor apilado y compacto — para rejillas de 2 columnas. */
function Meta({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={cn('truncate text-sm font-medium text-slate-900', mono && 'font-mono text-xs')}>{value}</div>
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
  const location = useLocation()
  const { user, role } = useRole()
  const data = folio ? findReturn(folio) : undefined
  // Autorización de supervisor recibida al generar el folio (regla de Tienda).
  const auth = (location.state as { auth?: { supervisor: string; sucursal: string; fecha: string; hora: string } } | null)?.auth
  const [comments, setComments] = useState<Comment[]>(data?.comments ?? [])
  const [draft, setDraft] = useState('')
  const [preview, setPreview] = useState<Evidence | null>(null)
  const [resolucion, setResolucion] = useState<string>(data?.resolucion ? RESOLUTIONS[data.resolucion] : '')
  const [almacen, setAlmacen] = useState<string>(data?.almacen ?? '')
  // Asistente de autorización: Resolución (paso 1) → Almacén destino (paso 2).
  const [authStep, setAuthStep] = useState<'res' | 'alm' | null>(null)
  const [wizRes, setWizRes] = useState<ResolucionOption | null>(null)
  const [wizAlmacen, setWizAlmacen] = useState('')
  // Estatus reactivo (prototipo): las acciones lo cambian y se refleja en la UI.
  const [status, setStatus] = useState<StatusKey>(data?.status ?? 'nuevo')
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const base = data?.timeline ?? []
    if (auth) {
      return [
        ...base,
        {
          date: auth.fecha,
          time: auth.hora,
          actor: auth.supervisor,
          text: `autorizó la generación del folio (Supervisor · ${auth.sucursal})`,
          kind: 'status',
        },
      ]
    }
    return base
  })
  const [banner, setBanner] = useState<{ kind: 'success' | 'danger' | 'info'; text: string } | null>(
    auth ? { kind: 'success', text: `Folio generado · Autorizado por ${auth.supervisor} (${auth.sucursal})` } : null,
  )
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

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
  const own = ownershipFor(status)
  const actions = allowedActions(role, status, data.tipo)
  const showCost = canSeeCost(role)
  const canComment = actions.includes('comentar')
  const barActions = ACTION_ORDER.filter((a) => actions.includes(a) && ACTION_META[a])
  const comprador = compradorForMarca(data.marca)
  const existencias = existenciasFor(data.lote)
  // Línea de mercancía del expediente → almacenes recomendados (compatibles) vs. otros.
  const linea = lineaMercancia(data.marca, data.categoria)
  const almacenesValidos = almacenesFor(linea)

  function logEvent(text: string, kind: TimelineEvent['kind']) {
    setEvents((e) => [...e, { date: 'Hoy', time: 'ahora', actor: user.name, text, kind }])
  }

  function transition(next: StatusKey, text: string, kind: 'success' | 'danger' | 'info', msg: string) {
    setStatus(next)
    logEvent(text, kind === 'success' ? 'status' : kind === 'danger' ? 'status' : 'comment')
    setBanner({ kind, text: msg })
  }

  function applyAction(a: ActionKey) {
    switch (a) {
      case 'autorizar':
        // Abre el asistente: primero resolución, luego almacén (no antes).
        setWizRes(null)
        setWizAlmacen('')
        setAuthStep('res')
        break
      case 'rechazar':
        setRejectReason('')
        setRejectOpen(true)
        break
      case 'solicitar_info':
        transition('esperando', 'solicitó más información', 'info', 'Se solicitó información a la sucursal')
        break
      case 'responder_info':
        transition('revision', 'respondió a la solicitud de información', 'info', 'Información enviada a Compras')
        break
      case 'tomar':
        transition('revision', 'registró y envió a revisión', 'info', 'Expediente enviado a revisión de Compras')
        break
      case 'generar_traslado':
        transition('transito', 'generó la devolución a proveedor', 'info', 'Devolución a proveedor generada')
        break
      case 'imprimir':
        setBanner({ kind: 'info', text: 'Enviando expediente a impresión…' })
        break
    }
  }

  // Paso 1 → 2 del asistente: elegir resolución habilita la lista de almacenes.
  function chooseResolucion(opt: ResolucionOption) {
    setWizRes(opt)
    setWizAlmacen('')
    setAuthStep('alm')
  }

  // Confirmación: requiere resolución y almacén; cliente cierra, el resto autoriza.
  function confirmAuth() {
    if (!data || !wizRes || !wizAlmacen) return
    setResolucion(wizRes.label)
    setAlmacen(wizAlmacen)
    setAuthStep(null)
    if (data.tipo === 'cliente') {
      transition('cerrado', `autorizó y resolvió — ${wizRes.label} · destino ${wizAlmacen}`, 'success', `Devolución autorizada y resuelta · ${wizRes.label} → ${wizAlmacen}`)
    } else {
      transition('autorizado', `autorizó la devolución — ${wizRes.label} · destino ${wizAlmacen}`, 'success', `Devolución autorizada · ${wizRes.label} → ${wizAlmacen}`)
    }
  }

  function confirmReject() {
    if (!rejectReason) return
    transition('rechazado', `rechazó la devolución — ${rejectReason}`, 'danger', `Devolución rechazada · ${rejectReason}`)
    setRejectOpen(false)
  }

  function send() {
    if (!draft.trim()) return
    setComments((c) => [
      ...c,
      { id: `c${c.length + 1}`, authorId: user.id, time: 'ahora', text: draft.trim() },
    ])
    setDraft('')
  }

  return (
    <div className="pb-10">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-4 lg:px-8">
          <BackLink to="/devoluciones" label={role === 'compras' ? 'Volver a la bandeja de trabajo' : role === 'tienda' ? 'Volver a Mis devoluciones' : 'Volver a Devoluciones'} />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-2xl font-semibold tracking-tight text-slate-900">{data.folio}</h1>
              <StatusBadge status={status} />
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

          {/* Barra de acciones — fija en el encabezado, siempre visible arriba */}
          {barActions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {barActions.map((a) => {
                const m = ACTION_META[a]!
                return (
                  <Button key={a} variant={m.variant} icon={m.icon} onClick={() => applyAction(a)}>
                    {m.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Aviso de resultado — fijo hasta la siguiente acción; se puede cerrar con la X */}
      {banner && (
        <div className="mx-auto max-w-[1400px] px-4 pt-4 lg:px-8">
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium',
              banner.kind === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
              banner.kind === 'danger' && 'border-rose-200 bg-rose-50 text-rose-700',
              banner.kind === 'info' && 'border-sky-200 bg-sky-50 text-sky-700',
            )}
          >
            {banner.kind === 'success' ? <Check className="h-4 w-4" /> : banner.kind === 'danger' ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            <span className="flex-1">{banner.text}</span>
            <button onClick={() => setBanner(null)} className="rounded-md p-1 hover:bg-black/5" aria-label="Cerrar aviso">
              <X className="h-4 w-4 opacity-60" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-4 lg:col-span-2">
            {/* Product */}
            <Card>
              <SectionTitle icon={<Package className="h-4 w-4" />}>Producto</SectionTitle>
              <div className="flex flex-col gap-4 sm:flex-row">
                <img src={data.product.image} alt="" className="h-40 w-full rounded-xl object-cover sm:h-40 sm:w-40" />
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-slate-900">{data.product.descripcion}</h4>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500">SKU</div>
                      <div className="font-mono text-sm text-slate-900">{data.product.sku}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Talla</div>
                      <div className="text-sm text-slate-900">{data.product.talla}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Color</div>
                      <div className="text-sm text-slate-900">{data.product.color}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Cantidad</div>
                      <div className="text-sm font-semibold text-slate-900">{data.product.cantidad}</div>
                    </div>
                    {showCost && (
                      <>
                        <div>
                          <div className="text-xs text-slate-500">Precio unitario</div>
                          <div className="text-sm text-slate-900">${data.product.precio.toLocaleString('es-MX')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Total</div>
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

            {/* Evidences (fotos y videos) */}
            <Card>
              <SectionTitle
                icon={<Images className="h-4 w-4" />}
                right={
                  <span className="text-xs text-slate-500">
                    {data.evidences.filter((e) => e.kind !== 'video').length} fotos · {data.evidences.filter((e) => e.kind === 'video').length} videos · {data.documents.length} docs
                  </span>
                }
              >
                Evidencias
              </SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {data.evidences.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setPreview(e)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img src={e.url} alt={e.label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    {e.kind === 'video' && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900">
                          <Play className="h-4 w-4 fill-current" />
                        </span>
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-left text-[11px] font-medium text-white">
                      {e.kind === 'video' && <Video className="h-3 w-3" />}
                      {e.label}
                    </span>
                  </button>
                ))}
                <button className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-500">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-center text-[11px] font-medium">Sube fotos o videos</span>
                </button>
              </div>
              {data.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <FileText className="h-4 w-4 text-brand-500" />
                      <span className="flex-1 text-sm text-slate-700">{d.name}</span>
                      <span className="text-xs text-slate-500">{d.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Subproductos — depuración masiva (cada producto con SKU, motivo y evidencia) */}
            {data.subproductos && data.subproductos.length > 0 && (
              <Card>
                <SectionTitle
                  icon={<Layers className="h-4 w-4" />}
                  right={<span className="text-xs text-slate-500">{data.subproductos.length} productos</span>}
                >
                  Productos del expediente
                </SectionTitle>
                <div className="space-y-2">
                  {data.subproductos.map((sp, i) => {
                    const completo = sp.sku && sp.motivo && sp.evidencia
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                        <img src={sp.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-900">{sp.sku}</span>
                            <span className="text-xs text-slate-500">·</span>
                            <span className="truncate text-sm text-slate-600">{sp.descripcion}</span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                            <span>Motivo: {sp.motivo}</span>
                            {sp.evidencia && <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {sp.evidencia}</span>}
                          </div>
                        </div>
                        {completo ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">Incompleto</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  El expediente no puede cerrarse mientras exista un producto sin SKU, motivo o evidencia fotográfica.
                </p>
              </Card>
            )}

            {/* Comments — internal chat */}
            <Card padded={false}>
              <div className="px-5 pt-5">
                <SectionTitle icon={<MessagesSquare className="h-4 w-4" />}>Comentarios internos</SectionTitle>
              </div>
              <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 pb-4">
                {comments.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-500">Aún no hay comentarios. Inicia la conversación del caso.</p>
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
                          <span className="text-[11px] text-slate-500">{c.time}</span>
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
                              {c.attachment.kind === 'image' ? <ImageIcon className="h-3.5 w-3.5" /> : c.attachment.kind === 'video' ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
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
                    <button title="Adjuntar foto, video o documento" aria-label="Adjuntar foto, video o documento" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><Paperclip className="h-4 w-4" /></button>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                      rows={1}
                      placeholder="Escribe un comentario… usa @ para mencionar"
                      className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-sm placeholder:text-slate-500 focus:outline-none"
                    />
                    <Button size="sm" variant="primary" icon={<Send className="h-4 w-4" />} onClick={send}>Enviar</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                    Tu rol no comenta en este expediente.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
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
                    <div className="text-[11px] text-slate-500">Fecha compromiso</div>
                    <div className="text-sm font-medium text-slate-900">{status === 'cerrado' || status === 'rechazado' ? '—' : '08 jul · 14:00'}</div>
                  </div>
                  <div className={cn('rounded-lg border px-3 py-2', data.outOfSla ? 'border-brand-100 bg-brand-50/50' : 'border-slate-100')}>
                    <div className="text-[11px] text-slate-500">SLA restante</div>
                    <div className={cn('flex items-center gap-1 text-sm font-semibold', data.outOfSla ? 'text-brand-600' : 'text-slate-900')}>
                      <Clock className="h-3.5 w-3.5" /> {data.slaDue}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Comprador responsable — asignación automática por marca/línea (compacto) */}
            {comprador && (
              <Card>
                <SectionTitle icon={<UserSquare2 className="h-4 w-4" />}>Comprador responsable</SectionTitle>
                <div className="flex items-center gap-3">
                  <Avatar person={comprador.comprador} size="md" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{comprador.comprador.name}</div>
                    <div className="truncate text-xs text-slate-500">
                      {comprador.linea} · {comprador.marca} · {comprador.proveedor}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Existencias — globales y por sucursal */}
            <Card>
              <SectionTitle icon={<Boxes className="h-4 w-4" />} right={<span className="font-mono text-xs text-slate-500">{data.lote}</span>}>
                Existencias
              </SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="text-[11px] text-slate-500">Total</div>
                  <div className="text-lg font-semibold text-slate-900">{existencias.total}</div>
                </div>
                <div className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="text-[11px] text-slate-500">Disponible</div>
                  <div className="text-lg font-semibold text-emerald-600">{existencias.disponible}</div>
                </div>
                <div className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="text-[11px] text-slate-500">En tránsito</div>
                  <div className="text-lg font-semibold text-indigo-600">{existencias.transito}</div>
                </div>
                <div className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="text-[11px] text-slate-500">Comprometida</div>
                  <div className="text-lg font-semibold text-amber-600">{existencias.comprometida}</div>
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                      <th className="px-3 py-2">Sucursal</th>
                      <th className="px-3 py-2 text-right">Existencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existencias.porSucursal.map((e) => (
                      <tr key={e.sucursal} className="border-b border-slate-50 last:border-0">
                        <td className="px-3 py-2 text-slate-600">{e.sucursal}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">{e.cantidad}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/60">
                      <td className="px-3 py-2 text-xs font-semibold text-slate-500">Total</td>
                      <td className="px-3 py-2 text-right text-xs font-semibold text-slate-900">{existencias.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Resolución y almacén destino — se definen al autorizar (solo lectura) */}
            {role === 'compras' && (
              <Card>
                <SectionTitle icon={<Gavel className="h-4 w-4" />}>Resolución y destino</SectionTitle>
                {resolucion || almacen ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      <Gavel className="h-4 w-4" /> {resolucion || '—'}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <Warehouse className="h-4 w-4 text-slate-400" /> {almacen || '—'}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Se define al <span className="font-medium text-slate-700">autorizar</span>: primero la resolución y luego el almacén destino.
                  </p>
                )}
              </Card>
            )}

            {/* Producto rechazado que permanece en tienda */}
            {data.bloqueadoEcommerce && (
              <Card>
                <SectionTitle icon={<Ban className="h-4 w-4 text-rose-500" />}>Disposición del producto</SectionTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                    <Ban className="h-4 w-4" /> Bloqueado para Ecommerce
                  </div>
                  {data.ventaFisica && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      <Store className="h-4 w-4" /> Disponible para venta física
                    </div>
                  )}
                  {data.resolucionRechazo && (
                    <p className="text-xs text-slate-500">{data.resolucionRechazo}</p>
                  )}
                </div>
              </Card>
            )}

            {/* AI insight — nota compacta */}
            <div className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/40 px-3 py-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <p className="text-xs leading-relaxed text-slate-600">
                El lote <span className="font-mono font-medium">{data.lote}</span> tiene incidencia sobre el promedio · <span className="font-medium text-brand-700">3 casos similares</span> este mes.
                <Link to="/reportes" className="ml-1 font-medium text-brand-600 hover:underline">Ver →</Link>
              </p>
            </div>

            {/* General info */}
            <Card>
              <SectionTitle icon={<Info className="h-4 w-4" />}>Información general</SectionTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Meta label="Cliente" value={data.cliente} />
                {data.tipo === 'ecommerce' ? (
                  <Meta label="ID de Venta" value={data.idVenta ?? data.factura} mono />
                ) : (
                  <Meta label="Factura" value={data.factura} mono />
                )}
                <Meta label="Fecha de compra" value={data.fechaCompra} />
                <Meta label="Sucursal" value={data.sucursal} />
                <Meta label="Marca" value={data.marca} />
                <Meta label="Proveedor" value={data.proveedor} />
                <Meta label="Categoría" value={data.categoria} />
                <Meta label="Lote" value={data.lote} mono />
                <Meta label="Motivo" value={data.motivo} />
                <Meta label="SLA" value={<span className={cn(data.outOfSla ? 'text-brand-600' : 'text-slate-900')}>{data.slaDue}</span>} />
                {data.clienteEmail && <Meta label="Correo" value={data.clienteEmail} />}
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
                {events.map((t, i) => (
                  <li key={i} className="relative">
                    <span className={cn('absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white', TIMELINE_DOT[t.kind])} />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-slate-500">{t.date}</span>
                      <span className="font-mono text-xs font-semibold text-slate-700">{t.time}</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{t.actor}</span> {t.text}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <UserCircle2 className="h-4 w-4" />
                Creado por {creador.name} · {creador.role}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Lightbox de evidencia (foto o video) */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-6" onClick={() => setPreview(null)}>
          {preview.kind === 'video' ? (
            <video
              src={VIDEO_SAMPLE}
              poster={preview.url}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[85vw] rounded-2xl bg-black shadow-pop"
            />
          ) : (
            <img src={preview.url} alt={preview.label} className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-pop" />
          )}
        </div>
      )}

      {/* Asistente de autorización: Paso 1 Resolución → Paso 2 Almacén destino */}
      {authStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6" onClick={() => setAuthStep(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">Autorizar devolución</h3>
            </div>
            {/* Indicador de pasos */}
            <div className="mt-3 flex items-center gap-2 text-xs font-medium">
              <span className={cn('rounded-full px-2 py-0.5', authStep === 'res' ? 'bg-brand-600 text-white' : 'bg-emerald-100 text-emerald-700')}>1 · Resolución</span>
              <span className="text-slate-300">→</span>
              <span className={cn('rounded-full px-2 py-0.5', authStep === 'alm' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')}>2 · Almacén destino</span>
            </div>

            {authStep === 'res' ? (
              <>
                <p className="mt-3 text-sm text-slate-500">Elige la resolución. El almacén destino se define después.</p>
                <div className="mt-3 space-y-2">
                  {resolucionesFor(data.tipo).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => chooseResolucion(opt)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      {opt.label}
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-slate-500">
                  Resolución: <span className="font-medium text-slate-800">{wizRes?.label}</span>. Selecciona el almacén destino.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <Warehouse className="h-4 w-4 text-slate-500" />
                  Línea de mercancía detectada: <span className="font-medium text-slate-800">{linea}</span>. Solo se muestran los almacenes válidos para esta línea.
                </div>

                {/* Almacenes válidos según la línea de mercancía */}
                <div className="mt-4 space-y-2">
                  {almacenesValidos.map((a) => (
                    <button
                      key={a.codigo}
                      onClick={() => setWizAlmacen(a.nombre)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm hover:border-brand-300 hover:bg-brand-50/40',
                        wizAlmacen === a.nombre ? 'border-brand-300 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 text-slate-700',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-slate-400" />
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">{a.codigo}</span>
                        <span>{a.nombre}</span>
                      </span>
                      {wizAlmacen === a.nombre && <Check className="h-4 w-4 text-brand-600" />}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex justify-between gap-2">
                  <Button variant="ghost" onClick={() => setAuthStep('res')}>Atrás</Button>
                  <Button variant="success" icon={<Check className="h-4 w-4" />} disabled={!wizAlmacen} onClick={confirmAuth}>
                    Confirmar autorización
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Motivo de rechazo */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6" onClick={() => setRejectOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-rose-600" />
              <h3 className="text-base font-semibold text-slate-900">Motivo del rechazo</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">Selecciona el motivo por el que se rechaza esta devolución.</p>
            <div className="mt-4 space-y-2">
              {REJECT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRejectReason(r)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm hover:border-rose-300 hover:bg-rose-50/40',
                    rejectReason === r ? 'border-rose-300 bg-rose-50 font-medium text-rose-700' : 'border-slate-200 text-slate-700',
                  )}
                >
                  {r}
                  {rejectReason === r && <Check className="h-4 w-4 text-rose-600" />}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancelar</Button>
              <Button variant="danger" icon={<X className="h-4 w-4" />} disabled={!rejectReason} onClick={confirmReject}>
                Rechazar devolución
              </Button>
            </div>
          </div>
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
