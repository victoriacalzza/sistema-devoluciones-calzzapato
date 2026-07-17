import { useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layers,
  Package,
  ScanLine,
  Check,
  CheckCircle2,
  TriangleAlert,
  Upload,
  Film,
  Play,
  X,
  Send,
  Truck,
  Warehouse,
  Lock,
  History,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Button, BackLink, cn } from '../lib/ui'
import {
  findSolicitudMasivaTienda,
  MASS_TIENDA_STATUS,
  massTiendaNextAction,
  type MassTiendaStatus,
  type TimelineEvent,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'

// ------------------------------ Evidencia ---------------------------------

const MAX_BYTES = 50 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,.jpg,.jpeg,.png,video/mp4,video/quicktime,.mp4,.mov'
const IMAGE_EXT = ['jpg', 'jpeg', 'png']
const VIDEO_EXT = ['mp4', 'mov']

interface EvidenceFile {
  id: string
  name: string
  size: number
  kind: 'image' | 'video'
  url: string
  progress: number
  status: 'uploading' | 'done'
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

interface Comentario {
  id: string
  autor: string
  rol: 'Tienda' | 'Compras'
  time: string
  text: string
}

export default function MassReturnTiendaDetail() {
  const { folio = '' } = useParams()
  const navigate = useNavigate()
  const { role, user } = useRole()

  const sucursal = user.role.includes('·') ? user.role.split('·')[1].trim() : ''
  const data = useMemo(() => findSolicitudMasivaTienda(folio, sucursal), [folio, sucursal])

  // Estado local del seguimiento (prototipo, sin persistencia).
  const [status, setStatus] = useState<MassTiendaStatus>(data?.status ?? 'pendiente_atencion')
  // localizada = piezas escaneadas y validadas. null = preparación no iniciada.
  const [localizada, setLocalizada] = useState<number | null>(data?.sub.localizada ?? null)
  const [scanCode, setScanCode] = useState('')
  const [scannedSerials, setScannedSerials] = useState<string[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [faltanteReportado, setFaltanteReportado] = useState(false)
  const [motivo, setMotivo] = useState(data?.sub.motivoFaltante ?? '')
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [comentarios, setComentarios] = useState<Comentario[]>(() =>
    data
      ? [{ id: 'c0', autor: data.mass.responsable, rol: 'Compras', time: data.mass.creada, text: data.mass.instrucciones ?? 'Solicitud de retiro generada.' }]
      : [],
  )
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [historial, setHistorial] = useState<TimelineEvent[]>(data?.sub.historial ?? [])
  const [banner, setBanner] = useState('')
  const [error, setError] = useState('')

  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({})
  const seq = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)

  if (role !== 'tienda' || !data) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <p className="text-sm text-slate-500">
          {role !== 'tienda' ? 'Esta vista es exclusiva del rol Tienda.' : 'No se encontró la solicitud masiva para tu sucursal.'}
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/masivas-tienda')}>Volver a devoluciones masivas</Button>
      </div>
    )
  }

  const { mass, sub } = data
  const solicitada = sub.solicitado
  const loc = localizada ?? 0
  const faltante = localizada != null ? Math.max(0, solicitada - loc) : null
  const hayDiferencia = faltante != null && faltante > 0
  // Confirmada para envío = piezas escaneadas válidas (automático, sin captura manual).
  const confirmadaEnvio = localizada != null ? loc : null
  const completo = localizada != null && loc >= solicitada
  // Se puede enviar cuando se localizó todo, o cuando se reportó el faltante con motivo.
  const listaParaEnvio = completo || (faltanteReportado && !!motivo.trim())
  const st = MASS_TIENDA_STATUS[status]
  const editable = status === 'pendiente_atencion' || status === 'preparacion' || status === 'info_incompleta'

  function log(text: string, kind: TimelineEvent['kind']) {
    setHistorial((h) => [...h, { date: 'Hoy', time: 'ahora', actor: user.name, text, kind }])
  }

  // -------- Evidencia --------
  function startUpload(ef: EvidenceFile) {
    timers.current[ef.id] = setInterval(() => {
      setFiles((prev) => prev.map((x) => {
        if (x.id !== ef.id) return x
        const next = Math.min(100, x.progress + 25)
        if (next >= 100) { clearInterval(timers.current[ef.id]); delete timers.current[ef.id]; return { ...x, progress: 100, status: 'done' } }
        return { ...x, progress: next }
      }))
    }, 150)
  }
  function addFiles(list: FileList | null) {
    if (!list) return
    const accepted: EvidenceFile[] = []
    Array.from(list).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const isImage = IMAGE_EXT.includes(ext) || file.type.startsWith('image/')
      const isVideo = VIDEO_EXT.includes(ext) || file.type.startsWith('video/')
      if (!isImage && !isVideo) return
      if (file.size > MAX_BYTES) return
      seq.current += 1
      accepted.push({ id: `f${seq.current}`, name: file.name, size: file.size, kind: isImage ? 'image' : 'video', url: URL.createObjectURL(file), progress: 0, status: 'uploading' })
    })
    if (accepted.length) { setFiles((f) => [...f, ...accepted]); accepted.forEach(startUpload); log(`adjuntó ${accepted.length} archivo(s) de evidencia`, 'attach') }
    if (fileInput.current) fileInput.current.value = ''
  }
  function removeFile(id: string) {
    if (timers.current[id]) { clearInterval(timers.current[id]); delete timers.current[id] }
    setFiles((prev) => {
      const t = prev.find((x) => x.id === id)
      if (t) URL.revokeObjectURL(t.url)
      return prev.filter((x) => x.id !== id)
    })
  }

  // -------- Acciones --------
  function iniciarPreparacion() {
    setStatus('preparacion'); setLocalizada(0); setBanner('Preparación iniciada. Escanea los productos: el sistema cuenta y valida automáticamente.'); setError('')
    log('inició la preparación del retiro', 'status')
  }

  // Escaneo automático: valida SKU, lote, duplicado y exceso; si es válido
  // incrementa "localizada" (y con ello confirmada/faltante) sin captura manual.
  // Formato de código aceptado: "SKU", "SKU|LOTE" o "SKU|LOTE#SERIE".
  function escanear() {
    const raw = scanCode.trim() || `${mass.sku}|${mass.lote}` // botón sin código = unidad válida
    const [skuPart = '', rest = ''] = raw.split('|')
    const [lotePart, serie] = rest.split('#')
    const skuOk = skuPart.trim().toUpperCase() === mass.sku.toUpperCase()
    const loteOk = !lotePart || lotePart.trim().toUpperCase() === mass.lote.toUpperCase()

    if ((localizada ?? 0) >= solicitada) {
      setError(`Cantidad excedida: ya localizaste las ${solicitada} piezas solicitadas.`); return
    }
    if (!skuOk) { setError(`SKU incorrecto: "${skuPart.trim()}" no corresponde al producto solicitado (${mass.sku}).`); return }
    if (!loteOk) { setError(`El producto no pertenece al lote solicitado (${mass.lote}).`); return }
    if (serie && scannedSerials.includes(serie.trim())) { setError(`Producto duplicado: la serie ${serie.trim()} ya fue escaneada.`); return }

    if (serie) setScannedSerials((s) => [...s, serie.trim()])
    const next = (localizada ?? 0) + 1
    setLocalizada(next)
    setError('')
    setBanner(next >= solicitada ? '✓ Localizaste todas las piezas solicitadas. Ya puedes marcar como lista para envío.' : `Pieza válida escaneada · ${next} de ${solicitada}.`)
    setScanCode('')
    if (next >= solicitada) log(`completó el escaneo: ${next} de ${solicitada} uds. localizadas`, 'status')
  }

  function reportarFaltante() {
    if (!motivo.trim()) { setError('Indica el motivo del faltante para reportarlo.'); return }
    setFaltanteReportado(true); setReportOpen(false); setError('')
    setBanner(`Faltante de ${faltante} uds. reportado a Compras. Puedes marcar como lista para envío las ${loc} uds. localizadas.`)
    log(`reportó faltante de ${faltante} uds.: ${motivo.trim()}`, 'comment')
  }

  function marcarLista() {
    if (!listaParaEnvio) { setError('Escanea todas las piezas solicitadas o reporta el faltante antes de marcar como lista para envío.'); return }
    setStatus('lista_envio'); setError(''); setBanner('Mercancía marcada como lista para envío. Compras coordinará la recolección.')
    log(`marcó ${loc} uds. como listas para envío${hayDiferencia ? ` (faltante de ${faltante} reportado)` : ''}`, 'status')
  }
  function enviarComentario() {
    const t = nuevoComentario.trim()
    if (!t) return
    setComentarios((c) => [...c, { id: `c${c.length}`, autor: user.name, rol: 'Tienda', time: 'ahora', text: t }])
    setNuevoComentario('')
    log('respondió a Compras en la conversación', 'comment')
    if (status === 'info_incompleta') { setStatus('preparacion'); setBanner('Respuesta enviada a Compras.') }
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 lg:px-8">
      <BackLink to="/masivas-tienda" label="Volver a devoluciones masivas" />
      <PageHeader
        title={`Solicitud masiva · ${mass.folio}`}
        subtitle={`Retiro solicitado por Compras a ${sucursal}`}
        actions={
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium', st.bg, st.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />{st.label}
          </span>
        }
      />

      {banner && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> {banner}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <TriangleAlert className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-5 lg:col-span-2">
          {/* Datos del lote y producto (solo lectura) */}
          <Card>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><Package className="h-4 w-4 text-slate-500" /> Producto solicitado</div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <Ro label="Producto" value={mass.producto} full />
              <Ro label="Lote" value={mass.lote} />
              <Ro label="SKU" value={mass.sku} />
              <Ro label="Marca" value={mass.marca} />
              <Ro label="Agrupación de línea" value={mass.linea} />
              <Ro label="Cantidad a retirar" value={`${solicitada} uds.`} />
              <Ro label="Comprador responsable" value={mass.responsable} />
              <Ro label="Fecha de solicitud" value={mass.creada} />
              <Ro label="Fecha límite de atención" value={sub.fechaCompromiso} />
              {mass.almacenDestino && <Ro label="Almacén destino" value={mass.almacenDestino} icon={<Warehouse className="h-3.5 w-3.5" />} />}
            </div>
            {mass.instrucciones && (
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Instrucciones de Compras</div>
                <p className="mt-1 text-sm text-slate-600">{mass.instrucciones}</p>
              </div>
            )}
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Lote, cantidad solicitada, sucursales, resolución y almacén destino los define <span className="font-medium text-slate-700">Compras</span> y no pueden modificarse desde Tienda.</span>
            </div>
          </Card>

          {/* Resumen de cantidades */}
          <Card>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><Layers className="h-4 w-4 text-slate-500" /> Resumen de cantidades</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <QtyTile label="Solicitada" value={solicitada} tone="slate" />
              <QtyTile label="Localizada" value={localizada} tone="blue" />
              <QtyTile label="Faltante" value={faltante} tone={hayDiferencia ? 'rose' : 'slate'} />
              <QtyTile label="Confirmada para envío" value={confirmadaEnvio} tone="emerald" />
            </div>

            {editable && (
              <div className="mt-4 space-y-4">
                {status === 'pendiente_atencion' ? (
                  <Button variant="primary" icon={<ShieldCheck className="h-4 w-4" />} onClick={iniciarPreparacion}>Iniciar preparación</Button>
                ) : (
                  <>
                    {/* Escaneo automático — el sistema valida y cuenta; sin captura manual */}
                    <div>
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">Escanear productos localizados</span>
                      <p className="mb-2 text-xs text-slate-500">Escanea cada pieza. El sistema valida SKU y lote y actualiza automáticamente las cantidades localizada, confirmada y faltante.</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={scanCode}
                          onChange={(e) => { setScanCode(e.target.value); setError('') }}
                          onKeyDown={(e) => { if (e.key === 'Enter') escanear() }}
                          placeholder={`Escanea aquí — ${mass.sku}`}
                          disabled={completo}
                          className="w-56 rounded-lg border border-slate-200 bg-white py-2 px-3 font-mono text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                        <Button variant="primary" size="sm" icon={<ScanLine className="h-4 w-4" />} disabled={completo} onClick={escanear}>Escanear producto</Button>
                        <span className="text-xs font-medium text-slate-600">{loc} de {solicitada} uds.</span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400">Producto esperado: <span className="font-mono">{mass.sku}</span> · Lote <span className="font-mono">{mass.lote}</span>. Deja el campo vacío para simular el escaneo de una pieza válida.</p>
                    </div>

                    {/* Reportar faltantes — único botón cuando no se localizó todo */}
                    {hayDiferencia && !completo && (
                      <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-rose-700"><TriangleAlert className="h-4 w-4" /> Faltan {faltante} de {solicitada} uds.</div>
                          {!reportOpen && !faltanteReportado && (
                            <Button variant="danger" size="sm" onClick={() => { setReportOpen(true); setError('') }}>Reportar faltantes</Button>
                          )}
                          {faltanteReportado && <span className="text-xs font-medium text-emerald-700">Faltante reportado ✓</span>}
                        </div>
                        {reportOpen && (
                          <div className="mt-3 space-y-3 border-t border-rose-100 pt-3">
                            <Ro label="Cantidad no localizada" value={`${faltante} uds.`} />
                            <label className="block">
                              <span className="mb-1 block text-xs font-medium text-slate-600">Motivo del faltante<span className="ml-0.5 text-brand-600">*</span></span>
                              <textarea rows={2} className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="ej. no se localizaron 2 pares en bodega; posible merma…" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                            </label>
                            <p className="text-[11px] text-slate-500">Evidencia fotográfica opcional (según política) — puedes adjuntarla en la sección de evidencia.</p>
                            <Button variant="primary" size="sm" icon={<Check className="h-4 w-4" />} onClick={reportarFaltante}>Confirmar reporte de faltante</Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <Button variant="primary" icon={<Truck className="h-4 w-4" />} disabled={!listaParaEnvio} onClick={marcarLista}>Marcar como lista para envío</Button>
                      {!listaParaEnvio && <p className="mt-1.5 text-[11px] text-slate-500">Escanea las {solicitada} piezas solicitadas o reporta el faltante para habilitar el envío.</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            {!editable && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-600">
                <Truck className="h-4 w-4 text-slate-400" />
                <span>Seguimiento: <span className="font-medium text-slate-800">{massTiendaNextAction(status)}</span>. Compras coordina la recolección y confirmará la recepción en el almacén destino.</span>
              </div>
            )}
          </Card>

          {/* Evidencia */}
          <Card>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><Upload className="h-4 w-4 text-slate-500" /> Evidencia (fotos y videos)</div>
            {editable && (
              <>
                <input ref={fileInput} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 py-6 text-center hover:border-brand-300">
                  <Upload className="h-6 w-6 text-slate-300" />
                  <span className="text-sm font-medium text-slate-600">Adjuntar evidencia</span>
                  <span className="text-xs text-slate-500">JPG, PNG, MP4, MOV · máx. 50 MB c/u</span>
                </button>
              </>
            )}
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {files.map((f) => (
                  <div key={f.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <div className="relative aspect-video w-full bg-slate-900/5">
                      {f.kind === 'image' ? (
                        <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <video src={f.url} className="h-full w-full object-cover" muted preload="metadata" />
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/30"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-600"><Play className="h-4 w-4" /></span></span>
                        </>
                      )}
                      {f.status === 'uploading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/50 px-3 text-white">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${f.progress}%` }} /></div>
                          <span className="text-[10px] font-medium">Cargando… {f.progress}%</span>
                        </div>
                      )}
                      {editable && <button onClick={() => removeFile(f.id)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900" aria-label={`Eliminar ${f.name}`}><X className="h-3.5 w-3.5" /></button>}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      {f.kind === 'video' ? <Film className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : null}
                      <span className="min-w-0 flex-1 truncate text-[11px] text-slate-600" title={f.name}>{f.name}</span>
                      <span className="shrink-0 text-[10px] text-slate-400">{formatSize(f.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {files.length === 0 && !editable && <p className="text-sm text-slate-500">Sin evidencia adjunta.</p>}
          </Card>

          {/* Conversación con Compras */}
          <Card>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><Send className="h-4 w-4 text-slate-500" /> Conversación con Compras</div>
            <div className="space-y-3">
              {comentarios.map((c) => (
                <div key={c.id} className={cn('rounded-xl border p-3', c.rol === 'Compras' ? 'border-slate-100 bg-slate-50/60' : 'border-brand-100 bg-brand-50/40')}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-slate-800">{c.autor}</span>
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', c.rol === 'Compras' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-600')}>{c.rol}</span>
                    <span className="text-slate-400">{c.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') enviarComentario() }}
                placeholder="Responder a Compras…"
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <Button variant="secondary" icon={<Send className="h-4 w-4" />} disabled={!nuevoComentario.trim()} onClick={enviarComentario}>Enviar</Button>
            </div>
          </Card>
        </div>

        {/* Columna lateral — historial */}
        <div className="space-y-5">
          <Card>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><History className="h-4 w-4 text-slate-500" /> Historial de la solicitud</div>
            <ol className="space-y-3">
              {historial.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-800">{e.actor}</span> {e.text}</p>
                    <p className="text-[11px] text-slate-400">{e.date} · {e.time}</p>
                  </div>
                </li>
              ))}
              {historial.length === 0 && <li className="text-sm text-slate-500">Sin movimientos aún.</li>}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ------------------------------ Auxiliares ---------------------------------

function Ro({ label, value, full, icon }: { label: string; value: string; full?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={cn(full && 'sm:col-span-2')}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">{icon}{value}</div>
    </div>
  )
}

const QTY_TONE: Record<string, string> = {
  slate: 'text-slate-900',
  blue: 'text-blue-600',
  rose: 'text-rose-600',
  emerald: 'text-emerald-600',
}

function QtyTile({ label, value, tone }: { label: string; value: number | null; tone: keyof typeof QTY_TONE }) {
  return (
    <div className="rounded-lg border border-slate-100 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={cn('text-lg font-semibold', QTY_TONE[tone])}>{value == null ? '—' : value}</div>
    </div>
  )
}
