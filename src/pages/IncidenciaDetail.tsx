import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2,
  UserCircle2,
  Package,
  Images,
  MessagesSquare,
  History,
  Gavel,
  Send,
  Play,
  Video,
  Check,
  MessageSquarePlus,
  CheckCircle2,
  Info,
  Link2,
} from 'lucide-react'
import { Card, SectionTitle, Avatar, Button, PriorityBadge, BackLink, cn } from '../lib/ui'
import {
  findIncidencia,
  personById,
  INCIDENCIA_STATUS,
  VIDEO_SAMPLE,
  type IncidenciaStatus,
  type TimelineEvent,
  type Comment,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'

const TL_DOT: Record<TimelineEvent['kind'], string> = {
  create: 'bg-brand-600', attach: 'bg-sky-500', comment: 'bg-amber-500',
  status: 'bg-emerald-500', transfer: 'bg-violet-500', receive: 'bg-teal-500',
}

export default function IncidenciaDetail() {
  const { folio } = useParams()
  const navigate = useNavigate()
  const { user, role } = useRole()
  const data = folio ? findIncidencia(folio) : undefined

  const [status, setStatus] = useState<IncidenciaStatus>(data?.status ?? 'abierta')
  const [resolucion, setResolucion] = useState(data?.resolucion ?? '')
  const [events, setEvents] = useState<TimelineEvent[]>(data?.timeline ?? [])
  const [comments, setComments] = useState<Comment[]>(data?.comments ?? [])
  const [draft, setDraft] = useState('')
  const [banner, setBanner] = useState('')
  const [resOpen, setResOpen] = useState(false)
  const [resText, setResText] = useState('')
  const [lightbox, setLightbox] = useState<{ url: string; kind?: string } | null>(null)

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-slate-500">No se encontró la incidencia {folio}.</p>
        <Button className="mt-4" onClick={() => navigate('/incidencias')}>Volver a incidencias</Button>
      </div>
    )
  }

  const resp = personById(data.responsableId)
  const st = INCIDENCIA_STATUS[status]

  function logEvent(text: string, kind: TimelineEvent['kind']) {
    setEvents((e) => [...e, { date: 'Hoy', time: 'ahora', actor: user.name, text, kind }])
  }

  function solicitarInfo() {
    setStatus('esperando')
    logEvent('solicitó más información a Ecommerce', 'comment')
    setBanner('Se solicitó información. La incidencia queda a la espera de Ecommerce.')
  }
  function responder() {
    setStatus('revision')
    logEvent('respondió a la solicitud de información', 'comment')
    setBanner('Respuesta enviada. La incidencia vuelve a revisión de Compras.')
  }
  function confirmResolucion() {
    if (!resText.trim()) return
    setResolucion(resText.trim())
    setStatus('resuelta')
    logEvent(`registró la resolución — ${resText.trim()}`, 'status')
    setResOpen(false)
    setBanner('Resolución registrada.')
  }
  function cerrar() {
    setStatus('cerrada')
    logEvent('cerró la incidencia', 'status')
    setBanner('Incidencia cerrada.')
  }
  function send() {
    if (!draft.trim()) return
    setComments((c) => [...c, { id: `c${c.length + 1}`, authorId: user.id, time: 'ahora', text: draft.trim() }])
    logEvent('agregó un comentario', 'comment')
    setDraft('')
  }

  // Acciones por rol y estado.
  const isCompras = role === 'compras'
  const isEcommerce = role === 'ecommerce'
  const canResolver = isCompras && (status === 'abierta' || status === 'revision' || status === 'esperando')
  const canSolicitar = isCompras && (status === 'abierta' || status === 'revision')
  const canCerrar = isCompras && status === 'resuelta'
  const canResponder = isEcommerce && status === 'esperando'

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-4 lg:px-8">
          <BackLink to="/incidencias" label="Volver a Incidencias" />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-slate-900">{data.folio}</h1>
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', st.bg, st.text)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />{st.label}
            </span>
            <PriorityBadge priority={data.priority} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>Incidencia en redistribución</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> {data.relacionado}</span>
            <span className="text-slate-300">·</span>
            <span>Registrada {data.creada}</span>
          </div>

          {/* Barra de acciones */}
          <div className="mt-3 flex flex-wrap gap-2">
            {canSolicitar && <Button variant="secondary" icon={<MessageSquarePlus className="h-4 w-4" />} onClick={solicitarInfo}>Solicitar información</Button>}
            {canResolver && <Button variant="success" icon={<Gavel className="h-4 w-4" />} onClick={() => { setResText(''); setResOpen(true) }}>Registrar resolución</Button>}
            {canResponder && <Button variant="primary" icon={<Send className="h-4 w-4" />} onClick={responder}>Responder información</Button>}
            {canCerrar && <Button variant="secondary" icon={<CheckCircle2 className="h-4 w-4" />} onClick={cerrar}>Cerrar incidencia</Button>}
          </div>
          {banner && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> {banner}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3 lg:px-8">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Trazabilidad */}
          <Card>
            <SectionTitle icon={<Building2 className="h-4 w-4" />}>Trazabilidad del envío origen</SectionTitle>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Info2 label="Sucursal origen" value={data.sucursalOrigen} />
              <Info2 label="Gerente origen" value={data.gerenteOrigen} />
              <Info2 label="ID / folio relacionado" value={data.relacionado} mono />
              <Info2 label="Lote" value={data.lote} mono />
              <Info2 label="Motivo de la incidencia" value={data.motivo} />
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Este registro es para trazabilidad, seguimiento y reporteo. No genera consecuencias ni sanciones automáticas.
            </p>
          </Card>

          {/* Producto */}
          <Card>
            <SectionTitle icon={<Package className="h-4 w-4" />}>Producto</SectionTitle>
            <div className="flex items-center gap-4">
              <img src={data.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div>
                <div className="font-medium text-slate-900">{data.producto}</div>
                <div className="mt-0.5 font-mono text-xs text-slate-500">{data.sku}</div>
                <div className="mt-1 text-xs text-slate-500">Lote {data.lote}</div>
              </div>
            </div>
          </Card>

          {/* Evidencias */}
          <Card>
            <SectionTitle icon={<Images className="h-4 w-4" />}>Evidencias</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.evidencias.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox({ url: e.kind === 'video' ? VIDEO_SAMPLE : e.url, kind: e.kind })}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                >
                  <img src={e.url} alt={e.label} className="h-full w-full object-cover" />
                  {e.kind === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-600"><Play className="h-5 w-5" /></span>
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-slate-900/70 to-transparent px-2 py-1 text-[11px] font-medium text-white">
                    {e.kind === 'video' && <Video className="h-3 w-3" />}{e.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Comentarios */}
          <Card padded={false}>
            <div className="px-5 py-4"><SectionTitle icon={<MessagesSquare className="h-4 w-4" />}>Comentarios internos</SectionTitle></div>
            <div className="space-y-4 border-t border-slate-100 px-5 py-4">
              {comments.map((c) => {
                const author = personById(c.authorId)
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar person={author} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{author.name}</span>
                        <span className="text-[11px] text-slate-500">{c.time}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{c.text}</p>
                      {c.attachment && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                          {c.attachment.kind === 'video' ? <Video className="h-3.5 w-3.5" /> : <Images className="h-3.5 w-3.5" />}
                          {c.attachment.name}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {comments.length === 0 && <p className="text-sm text-slate-500">Aún no hay comentarios.</p>}
              <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send() }}
                  placeholder="Escribe un comentario…"
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm placeholder:text-slate-500 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <Button variant="primary" icon={<Send className="h-4 w-4" />} onClick={send}>Enviar</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Responsable */}
          <Card>
            <SectionTitle icon={<UserCircle2 className="h-4 w-4" />}>Responsable (Compras)</SectionTitle>
            <div className="flex items-center gap-3">
              <Avatar person={resp} size="lg" />
              <div>
                <div className="text-sm font-medium text-slate-900">{resp.name}</div>
                <div className="text-xs text-slate-500">{resp.role}</div>
              </div>
            </div>
          </Card>

          {/* Resolución */}
          <Card>
            <SectionTitle icon={<Gavel className="h-4 w-4" />}>Resolución</SectionTitle>
            {resolucion ? (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-sm text-emerald-800">{resolucion}</div>
            ) : (
              <p className="text-sm text-slate-500">Sin resolución registrada aún. La define Compras.</p>
            )}
          </Card>

          {/* Historial */}
          <Card padded={false}>
            <div className="px-5 py-4"><SectionTitle icon={<History className="h-4 w-4" />}>Historial</SectionTitle></div>
            <div className="border-t border-slate-100 px-5 py-4">
              <ol className="space-y-3">
                {events.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', TL_DOT[e.kind])} />
                    <div>
                      <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">{e.actor}</span> {e.text}</p>
                      <span className="text-[11px] text-slate-500">{e.date} · {e.time}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de resolución */}
      {resOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6" onClick={() => setResOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-emerald-600" /><h3 className="text-base font-semibold text-slate-900">Registrar resolución</h3></div>
            <p className="mt-1 text-sm text-slate-500">Describe la disposición de la mercancía (ej. merma, reetiquetado, devolución a proveedor).</p>
            <textarea
              autoFocus rows={3} value={resText} onChange={(e) => setResText(e.target.value)}
              placeholder="Resolución…"
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResOpen(false)}>Cancelar</Button>
              <Button variant="success" icon={<Check className="h-4 w-4" />} disabled={!resText.trim()} onClick={confirmResolucion}>Registrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-6" onClick={() => setLightbox(null)}>
          <div className="max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {lightbox.kind === 'video' ? (
              <video src={lightbox.url} controls autoPlay className="max-h-[85vh] rounded-xl" />
            ) : (
              <img src={lightbox.url} className="max-h-[85vh] rounded-xl" alt="" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Info2({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={cn('text-slate-800', mono && 'font-mono text-sm')}>{value}</div>
    </div>
  )
}
