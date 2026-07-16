import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
  Check,
  TriangleAlert,
  Film,
  Play,
  X,
  CheckCircle2,
  ShoppingBag,
  Package,
  Building2,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Button, BackLink, cn } from '../lib/ui'
import {
  buscarTraslado,
  SUCURSALES_ORIGEN,
  GERENTES,
  type Traslado,
  type TrasladoProducto,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm placeholder:text-slate-500 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100'

// -------------------------- Evidencia multimedia ---------------------------

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB
const ACCEPT = 'image/jpeg,image/png,.jpg,.jpeg,.png,video/mp4,video/quicktime,.mp4,.mov'
const IMAGE_EXT = ['jpg', 'jpeg', 'png']
const VIDEO_EXT = ['mp4', 'mov']

interface EvidenceFile {
  id: string
  name: string
  size: number
  kind: 'image' | 'video'
  url: string
  duration?: string
  progress: number
  status: 'uploading' | 'done'
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function formatDuration(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** "2 fotografías y 1 video" a partir de conteos. */
function resumenEvidencia(fotos: number, videos: number): string {
  const parts: string[] = []
  if (fotos > 0) parts.push(`${fotos} ${fotos === 1 ? 'fotografía' : 'fotografías'}`)
  if (videos > 0) parts.push(`${videos} ${videos === 1 ? 'video' : 'videos'}`)
  return parts.join(' y ') || 'Sin evidencia'
}

const STEPS = [
  { n: 1, title: 'Identificar venta' },
  { n: 2, title: 'Seleccionar producto' },
  { n: 3, title: 'Información de la incidencia' },
  { n: 4, title: 'Adjuntar evidencia' },
]

export default function NewIncidencia() {
  const navigate = useNavigate()
  const { user } = useRole()

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  // Paso 1 — ID Venta
  const [idVenta, setIdVenta] = useState('')
  const [traslado, setTraslado] = useState<Traslado | null>(null)
  const [buscado, setBuscado] = useState(false)

  // Paso 2 — producto afectado
  const [selSku, setSelSku] = useState('')

  // Paso 3 — información obligatoria
  const [lote, setLote] = useState('')
  const [sucursalOrigen, setSucursalOrigen] = useState('')
  const [gerente, setGerente] = useState('')

  // Paso 4 — evidencia multimedia
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({})
  const seq = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const active = timers.current
    return () => { Object.values(active).forEach((t) => clearInterval(t)) }
  }, [])

  const selProd: TrasladoProducto | undefined = traslado?.productos.find((p) => p.sku === selSku)

  function buscar() {
    const t = buscarTraslado({ idVenta })
    setTraslado(t ?? null)
    setSelSku('')
    setBuscado(true)
  }

  // -------- Evidencia multimedia (paso 4) --------
  function startUpload(ef: EvidenceFile) {
    if (ef.kind === 'video') {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.onloadedmetadata = () => {
        const d = formatDuration(v.duration)
        setFiles((prev) => prev.map((x) => (x.id === ef.id ? { ...x, duration: d } : x)))
      }
      v.src = ef.url
    }
    timers.current[ef.id] = setInterval(() => {
      setFiles((prev) =>
        prev.map((x) => {
          if (x.id !== ef.id) return x
          const next = Math.min(100, x.progress + 20)
          if (next >= 100) {
            clearInterval(timers.current[ef.id])
            delete timers.current[ef.id]
            return { ...x, progress: 100, status: 'done' }
          }
          return { ...x, progress: next }
        }),
      )
    }, 160)
  }

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const errs: string[] = []
    const accepted: EvidenceFile[] = []
    Array.from(list).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const isImage = IMAGE_EXT.includes(ext) || file.type === 'image/jpeg' || file.type === 'image/png'
      const isVideo = VIDEO_EXT.includes(ext) || file.type === 'video/mp4' || file.type === 'video/quicktime'
      if (!isImage && !isVideo) {
        errs.push(`"${file.name}": formato no compatible. Usa JPG, PNG, MP4 o MOV.`)
        return
      }
      if (file.size > MAX_BYTES) {
        errs.push(`"${file.name}": ${formatSize(file.size)} supera el máximo de 50 MB por archivo.`)
        return
      }
      seq.current += 1
      accepted.push({
        id: `f${seq.current}`,
        name: file.name,
        size: file.size,
        kind: isImage ? 'image' : 'video',
        url: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading',
      })
    })
    setFileErrors(errs)
    if (accepted.length) {
      setFiles((f) => [...f, ...accepted])
      accepted.forEach(startUpload)
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  function removeFile(id: string) {
    if (timers.current[id]) { clearInterval(timers.current[id]); delete timers.current[id] }
    setFiles((prev) => {
      const target = prev.find((x) => x.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((x) => x.id !== id)
    })
  }

  const uploading = files.some((f) => f.status === 'uploading')
  const readyFiles = files.filter((f) => f.status === 'done')
  const fotos = readyFiles.filter((f) => f.kind === 'image').length
  const videos = readyFiles.filter((f) => f.kind === 'video').length

  // Validación por paso
  const stepValid: Record<number, boolean> = {
    1: !!traslado,
    2: !!selSku,
    3: !!lote.trim() && !!sucursalOrigen && !!gerente.trim(),
    4: readyFiles.length > 0 && !uploading,
  }

  function resetAll() {
    files.forEach((f) => URL.revokeObjectURL(f.url))
    setStep(1); setDone(false)
    setIdVenta(''); setTraslado(null); setBuscado(false)
    setSelSku(''); setLote(''); setSucursalOrigen(''); setGerente('')
    setFiles([]); setFileErrors([])
  }

  // -------------------------------- Resultado --------------------------------
  if (done) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 lg:px-8">
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span>
          <h2 className="text-lg font-semibold text-slate-900">Incidencia registrada</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Incidencia abierta
          </span>
          <div className="mt-2 w-full max-w-md rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left text-sm">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <div><span className="text-slate-500">Folio:</span> <span className="font-mono font-semibold text-slate-800">INC-EC-2026-0008</span></div>
              <div><span className="text-slate-500">Fecha y hora:</span> <span className="font-medium text-slate-800">15 jul 2026 · ahora</span></div>
              <div className="sm:col-span-2"><span className="text-slate-500">Operador Ecommerce:</span> <span className="font-medium text-slate-800">{user.name}</span></div>
              <div><span className="text-slate-500">ID Venta:</span> <span className="font-mono font-medium text-slate-800">{idVenta}</span></div>
              <div><span className="text-slate-500">Producto:</span> <span className="font-medium text-slate-800">{selProd?.descripcion}</span></div>
              <div><span className="text-slate-500">Lote:</span> <span className="font-mono font-medium text-slate-800">{lote}</span></div>
              <div><span className="text-slate-500">Sucursal origen:</span> <span className="font-medium text-slate-800">{sucursalOrigen}</span></div>
              <div><span className="text-slate-500">Gerente origen:</span> <span className="font-medium text-slate-800">{gerente}</span></div>
              <div className="sm:col-span-2"><span className="text-slate-500">Evidencias:</span> <span className="font-medium text-slate-800">{resumenEvidencia(fotos, videos)}</span></div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={() => navigate('/incidencias')}>Ver incidencias</Button>
            <Button variant="secondary" onClick={resetAll}>Registrar otra</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 lg:px-8">
      <BackLink to="/incidencias" label="Volver a Incidencias" />
      <PageHeader
        title="Registrar incidencia de redistribución"
        subtitle={`Paso ${step} de 4 · ${STEPS[step - 1].title}`}
      />

      {/* Barra de progreso + pasos */}
      <div className="mb-6">
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <div key={s.n} className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', s.n === step ? 'bg-brand-600 text-white' : s.n < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px]">{s.n < step ? <Check className="h-3 w-3" /> : s.n}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="space-y-5">
        {/* PASO 1 — Identificar venta */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><ShoppingBag className="h-4 w-4 text-slate-500" /> Identificar venta</div>
            <p className="text-sm text-slate-500">Captura el <span className="font-medium text-slate-700">ID Venta</span>. El sistema buscará automáticamente los productos relacionados con esa venta.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">ID Venta<span className="ml-0.5 text-brand-600">*</span></span>
                <input className={inputCls} placeholder="EC-99210" value={idVenta} onChange={(e) => setIdVenta(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') buscar() }} />
              </label>
              <Button variant="secondary" icon={<Search className="h-4 w-4" />} disabled={!idVenta.trim()} onClick={buscar}>Buscar productos</Button>
            </div>

            {buscado && traslado && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-800"><Check className="h-4 w-4" /> {traslado.productos.length} producto(s) encontrados para esta venta</div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {traslado.productos.map((p) => (
                    <li key={p.sku} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" />{p.descripcion} <span className="font-mono text-slate-400">· {p.sku}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {buscado && !traslado && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">No se encontraron productos para ese ID Venta.</div>
            )}
          </>
        )}

        {/* PASO 2 — Seleccionar producto */}
        {step === 2 && traslado && (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Package className="h-4 w-4 text-slate-500" /> Seleccionar producto afectado</div>
            <p className="text-sm text-slate-500">Selecciona el producto que llegó en mal estado o con alguna anomalía.</p>
            <div className="space-y-2">
              {traslado.productos.map((p) => (
                <button
                  key={p.sku}
                  onClick={() => setSelSku(p.sku)}
                  className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors', selSku === p.sku ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:bg-slate-50')}
                >
                  <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">{p.descripcion}</div>
                    <div className="truncate font-mono text-[11px] text-slate-500">{p.sku}</div>
                    {(p.talla || p.color) && <div className="mt-0.5 text-xs text-slate-500">Talla {p.talla} · {p.color}</div>}
                  </div>
                  {selSku === p.sku && <Check className="h-5 w-5 shrink-0 text-brand-600" />}
                </button>
              ))}
            </div>
          </>
        )}

        {/* PASO 3 — Información de la incidencia */}
        {step === 3 && selProd && (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Building2 className="h-4 w-4 text-slate-500" /> Información de la incidencia</div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <img src={selProd.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div><div className="text-sm font-medium text-slate-900">{selProd.descripcion}</div><div className="font-mono text-xs text-slate-500">{selProd.sku}</div></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Lote<span className="ml-0.5 text-brand-600">*</span></span>
                <input className={inputCls} placeholder="LT-AD-1180" value={lote} onChange={(e) => setLote(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Sucursal de origen<span className="ml-0.5 text-brand-600">*</span></span>
                <select className={inputCls} value={sucursalOrigen} onChange={(e) => setSucursalOrigen(e.target.value)}>
                  <option value="">Selecciona una sucursal…</option>
                  {SUCURSALES_ORIGEN.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Nombre del gerente de la sucursal origen<span className="ml-0.5 text-brand-600">*</span></span>
                <input className={inputCls} list="gerentes-origen" placeholder="Nombre del gerente" value={gerente} onChange={(e) => setGerente(e.target.value)} />
                <datalist id="gerentes-origen">{GERENTES.map((g) => <option key={g} value={g} />)}</datalist>
              </label>
            </div>
          </>
        )}

        {/* PASO 4 — Adjuntar evidencia */}
        {step === 4 && (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Upload className="h-4 w-4 text-slate-500" /> Adjuntar evidencia</div>
            <input ref={fileInput} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center hover:border-brand-300">
              <Upload className="h-8 w-8 text-slate-300" />
              <span className="text-sm font-medium text-slate-600">Haz clic para adjuntar evidencia</span>
              <span className="text-xs text-slate-500">Fotografías (JPG, PNG) o videos (MP4, MOV) · varios archivos · máx. 50 MB c/u</span>
            </button>

            {fileErrors.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <div className="flex items-center gap-1.5 font-medium"><TriangleAlert className="h-4 w-4" /> No se pudieron adjuntar algunos archivos</div>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs">{fileErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}

            {files.length > 0 && (
              <>
                {readyFiles.length > 0 && <div className="text-xs font-medium text-slate-600">{resumenEvidencia(fotos, videos)} cargada(s)</div>}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {files.map((f) => (
                    <div key={f.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <div className="relative aspect-video w-full bg-slate-900/5">
                        {f.kind === 'image' ? (
                          <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <video src={f.url} className="h-full w-full object-cover" muted preload="metadata" />
                            <span className="absolute inset-0 flex items-center justify-center bg-slate-900/30"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-600"><Play className="h-4 w-4" /></span></span>
                            {f.duration && <span className="absolute bottom-1 right-1 rounded bg-slate-900/75 px-1.5 py-0.5 text-[10px] font-medium text-white">{f.duration}</span>}
                          </>
                        )}
                        {f.status === 'uploading' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/50 px-3 text-white">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${f.progress}%` }} /></div>
                            <span className="text-[10px] font-medium">Cargando… {f.progress}%</span>
                          </div>
                        )}
                        <button onClick={() => removeFile(f.id)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900" aria-label={`Eliminar ${f.name}`}><X className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        {f.kind === 'video' ? <Film className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : null}
                        <span className="min-w-0 flex-1 truncate text-[11px] text-slate-600" title={f.name}>{f.name}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{formatSize(f.size)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {readyFiles.length === 0 && <p className="text-xs text-slate-500">Se requiere al menos una evidencia (fotografía o video) para finalizar.</p>}
          </>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button variant="ghost" icon={<ChevronLeft className="h-4 w-4" />} disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Anterior</Button>
          {step < 4 ? (
            <Button variant="primary" icon={<ChevronRight className="h-4 w-4" />} disabled={!stepValid[step]} onClick={() => setStep((s) => s + 1)}>Siguiente</Button>
          ) : (
            <Button variant="primary" icon={<Check className="h-4 w-4" />} disabled={!stepValid[4]} onClick={() => setDone(true)}>Registrar incidencia</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
