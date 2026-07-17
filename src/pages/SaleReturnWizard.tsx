import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  ShoppingBag,
  Package,
  ShieldCheck,
  Upload,
  Film,
  Play,
  X,
  TriangleAlert,
  CheckCircle2,
  MessageSquareLock,
  RotateCcw,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Button, BackLink, cn } from '../lib/ui'
import {
  buscarVenta,
  supervisorByCode,
  SUCURSALES,
  MOTIVOS,
  RETURN_TYPES,
  type BusquedaVenta,
  type TrasladoProducto,
} from '../data/mock'

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm placeholder:text-slate-500 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100'

// Texto de ayuda persistente bajo un campo: muestra el formato esperado con un
// ejemplo concreto y permanece visible aunque el usuario escriba.
function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-slate-500">{children}</p>
}

// -------------------------- Evidencia multimedia ---------------------------

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
function mmss(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const STEPS = [
  { n: 1, title: 'Identificar venta' },
  { n: 2, title: 'Seleccionar producto' },
  { n: 3, title: 'Información de la incidencia' },
  { n: 4, title: 'Evidencia y autorización' },
]

const SMS_TTL = 300 // 5 minutos de vigencia
const SMS_MAX_INTENTOS = 3

interface SaleReturnWizardProps {
  type: 'cliente' | 'ecommerce'
  allowMultipleTypes: boolean
  onChangeType: () => void
  back: { to: string; label: string }
}

export default function SaleReturnWizard({ type, allowMultipleTypes, onChangeType, back }: SaleReturnWizardProps) {
  const navigate = useNavigate()
  const isEcom = type === 'ecommerce'

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  // Paso 1 — identificar venta
  const [folio, setFolio] = useState('')
  const [cliente, setCliente] = useState('')
  const [sucursal, setSucursal] = useState('')
  const [busq, setBusq] = useState<BusquedaVenta | null>(null)
  const [buscado, setBuscado] = useState(false)

  // Paso 2 — producto
  const [selSku, setSelSku] = useState('')

  // Paso 3 — información de la incidencia (problema del producto)
  const [motivo, setMotivo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  // Paso 4 — SMS supervisor
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [smsLeft, setSmsLeft] = useState(0)
  const [smsIntentos, setSmsIntentos] = useState(0)
  const [smsError, setSmsError] = useState('')
  const [smsAuth, setSmsAuth] = useState<{ supervisor: string } | null>(null)

  // Paso 4 — evidencia
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({})
  const seq = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)

  const venta = busq?.venta
  const selProd: TrasladoProducto | undefined = venta?.productos.find((p) => p.sku === selSku)

  // Cuenta regresiva de vigencia del código SMS.
  useEffect(() => {
    if (!smsSent || smsAuth) return
    if (smsLeft <= 0) { setSmsSent(false); setSmsError('El código expiró. Solicita uno nuevo.'); return }
    const t = setInterval(() => setSmsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [smsSent, smsLeft, smsAuth])

  useEffect(() => {
    const active = timers.current
    return () => { Object.values(active).forEach((t) => clearInterval(t)) }
  }, [])

  function buscar() {
    const r = buscarVenta(type, folio)
    setBusq(r)
    setBuscado(true)
    setSelSku('')
  }

  function enviarSMS() {
    setSmsSent(true)
    setSmsLeft(SMS_TTL)
    setSmsIntentos(0)
    setSmsCode('')
    setSmsError('')
  }
  function verificarSMS() {
    if (!smsSent) return
    const sup = supervisorByCode(smsCode.trim())
    if (sup) { setSmsAuth({ supervisor: sup.name }); setSmsError(''); return }
    const intentos = smsIntentos + 1
    setSmsIntentos(intentos)
    setSmsCode('')
    if (intentos >= SMS_MAX_INTENTOS) { setSmsSent(false); setSmsError('Superaste los 3 intentos. Solicita un nuevo código.') }
    else setSmsError(`Código incorrecto. Intento ${intentos} de ${SMS_MAX_INTENTOS}.`)
  }

  // -------- Evidencia multimedia --------
  function startUpload(ef: EvidenceFile) {
    if (ef.kind === 'video') {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.onloadedmetadata = () => setFiles((prev) => prev.map((x) => (x.id === ef.id ? { ...x, duration: formatDuration(v.duration) } : x)))
      v.src = ef.url
    }
    timers.current[ef.id] = setInterval(() => {
      setFiles((prev) => prev.map((x) => {
        if (x.id !== ef.id) return x
        const next = Math.min(100, x.progress + 20)
        if (next >= 100) { clearInterval(timers.current[ef.id]); delete timers.current[ef.id]; return { ...x, progress: 100, status: 'done' } }
        return { ...x, progress: next }
      }))
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
      if (!isImage && !isVideo) { errs.push(`"${file.name}": formato no compatible. Usa JPG, PNG, MP4 o MOV.`); return }
      if (file.size > MAX_BYTES) { errs.push(`"${file.name}": ${formatSize(file.size)} supera el máximo de 50 MB.`); return }
      seq.current += 1
      accepted.push({ id: `f${seq.current}`, name: file.name, size: file.size, kind: isImage ? 'image' : 'video', url: URL.createObjectURL(file), progress: 0, status: 'uploading' })
    })
    setFileErrors(errs)
    if (accepted.length) { setFiles((f) => [...f, ...accepted]); accepted.forEach(startUpload) }
    if (fileInput.current) fileInput.current.value = ''
  }
  function removeFile(id: string) {
    if (timers.current[id]) { clearInterval(timers.current[id]); delete timers.current[id] }
    setFiles((prev) => {
      const target = prev.find((x) => x.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((x) => x.id !== id)
    })
    // El supervisor autoriza sobre la evidencia visible: si esta cambia, se
    // invalida cualquier solicitud o autorización previa.
    setSmsSent(false); setSmsAuth(null); setSmsCode(''); setSmsError(''); setSmsIntentos(0); setSmsLeft(0)
  }
  const uploading = files.some((f) => f.status === 'uploading')
  const ready = files.filter((f) => f.status === 'done')
  const fotos = ready.filter((f) => f.kind === 'image').length
  const videos = ready.filter((f) => f.kind === 'video').length

  const folioLabel = isEcom ? 'ID Venta' : 'Número de factura'
  const sucursalLabel = isEcom ? 'Sucursal donde se realiza el cambio físico' : 'Sucursal donde se realiza el cambio'

  const stepValid: Record<number, boolean> = {
    1: !!busq?.existe && !busq?.devolucionActiva && !!sucursal && (isEcom || !!cliente.trim()),
    2: !!selSku,
    3: !!motivo,
    4: fotos >= 1 && !uploading && !!smsAuth,
  }

  function resetAll() {
    files.forEach((f) => URL.revokeObjectURL(f.url))
    setStep(1); setDone(false); setFolio(''); setCliente(''); setSucursal(''); setBusq(null); setBuscado(false)
    setSelSku(''); setMotivo(''); setDescripcion(''); setSmsSent(false); setSmsCode(''); setSmsLeft(0); setSmsIntentos(0); setSmsError(''); setSmsAuth(null)
    setFiles([]); setFileErrors([])
  }

  // -------------------------------- Resultado --------------------------------
  if (done) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 lg:px-8">
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span>
          <h2 className="text-lg font-semibold text-slate-900">Expediente generado</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Enviado a revisión de Compras
          </span>
          <div className="mt-2 w-full max-w-md rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left text-sm">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <div><span className="text-slate-500">Folio:</span> <span className="font-mono font-semibold text-slate-800">DEV-2026-000155</span></div>
              <div><span className="text-slate-500">Tipo:</span> <span className="font-medium text-slate-800">{RETURN_TYPES[type].short}</span></div>
              <div><span className="text-slate-500">{folioLabel}:</span> <span className="font-mono font-medium text-slate-800">{folio}</span></div>
              <div><span className="text-slate-500">Cliente:</span> <span className="font-medium text-slate-800">{isEcom ? venta?.cliente : cliente}</span></div>
              <div className="sm:col-span-2"><span className="text-slate-500">Producto:</span> <span className="font-medium text-slate-800">{selProd?.descripcion}</span></div>
              <div><span className="text-slate-500">Motivo:</span> <span className="font-medium text-slate-800">{motivo}</span></div>
              <div><span className="text-slate-500">Sucursal:</span> <span className="font-medium text-slate-800">{sucursal}</span></div>
              <div><span className="text-slate-500">Autorizó:</span> <span className="font-medium text-slate-800">{smsAuth?.supervisor}</span></div>
              <div className="sm:col-span-2"><span className="text-slate-500">Evidencia:</span> <span className="font-medium text-slate-800">{fotos} fotografía(s){videos > 0 ? ` y ${videos} video(s)` : ''}</span></div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={() => navigate('/devoluciones')}>Ver devoluciones</Button>
            <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetAll}>Registrar otra</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 lg:px-8">
      {allowMultipleTypes ? (
        <button onClick={onChangeType} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Volver a tipos de devolución
        </button>
      ) : (
        <BackLink to={back.to} label={back.label} />
      )}
      <PageHeader title={RETURN_TYPES[type].label} subtitle={`Paso ${step} de 4 · ${STEPS[step - 1].title}`} />

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">{folioLabel}<span className="ml-0.5 text-brand-600">*</span></span>
                <div className="flex gap-2">
                  <input className={inputCls} placeholder={isEcom ? 'EC-99210' : 'FA-CUL-88231'} value={folio} onChange={(e) => { setFolio(e.target.value); setBusq(null); setBuscado(false) }} onKeyDown={(e) => { if (e.key === 'Enter') buscar() }} />
                  <Button variant="secondary" icon={<Search className="h-4 w-4" />} disabled={!folio.trim()} onClick={buscar}>Buscar</Button>
                </div>
                <Hint>Ejemplo: {isEcom ? 'EC-99210' : 'FA-CUL-88231'}</Hint>
              </label>
              {/* Ecommerce: el nombre del cliente se obtiene del pedido, no se captura. */}
              {!isEcom && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Nombre del cliente<span className="ml-0.5 text-brand-600">*</span></span>
                  <input className={inputCls} placeholder="Nombre del cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
                  <Hint>Ejemplo: María Fernanda López Hernández</Hint>
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">{sucursalLabel}<span className="ml-0.5 text-brand-600">*</span></span>
                <select className={inputCls} value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
                  <option value="">Selecciona una sucursal…</option>
                  {SUCURSALES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Hint>Ejemplo: Culiacán Centro</Hint>
              </label>
            </div>

            {buscado && !busq?.existe && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">No se encontró {isEcom ? 'el ID de venta' : 'la factura'} capturado.</div>
            )}
            {buscado && busq?.existe && busq.devolucionActiva && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <div className="flex items-center gap-1.5 font-medium"><TriangleAlert className="h-4 w-4" /> Ya existe una devolución activa</div>
                <p className="mt-1 text-xs">Solo puede existir una devolución activa por {isEcom ? 'ID de venta' : 'factura'}. No es posible continuar.</p>
              </div>
            )}
            {buscado && busq?.existe && !busq.devolucionActiva && busq.venta && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-800"><Check className="h-4 w-4" /> {isEcom ? 'Venta' : 'Factura'} válida · {busq.venta.productos.length} producto(s) encontrados</div>
                {/* Datos obtenidos automáticamente de la venta — solo informativos, no editables */}
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-lg border border-emerald-100 bg-white/70 p-3 text-xs sm:grid-cols-2">
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Cliente</span><span className="font-medium text-slate-700">{busq.venta.cliente}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Fecha de compra</span><span className="font-medium text-slate-700">{busq.venta.fecha}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Productos encontrados</span><span className="font-medium text-slate-700">{busq.venta.productos.length}</span></div>
                  {!isEcom && busq.venta.sucursalCompra && (
                    <div className="flex justify-between gap-2 sm:col-span-2">
                      <span className="text-slate-500">Sucursal de compra original</span>
                      <span className="font-medium text-slate-700">{busq.venta.sucursalCompra} <span className="font-normal text-slate-400">· solo informativo</span></span>
                    </div>
                  )}
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {busq.venta.productos.map((p) => (
                    <li key={p.sku} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" />{p.descripcion} <span className="font-mono text-slate-400">· {p.sku}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* PASO 2 — Seleccionar producto */}
        {step === 2 && venta && (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Package className="h-4 w-4 text-slate-500" /> Seleccionar producto</div>
            <p className="text-sm text-slate-500">Solo puedes elegir un producto de la {isEcom ? 'venta' : 'factura'} original. La información se toma automáticamente; no se captura SKU, descripción ni marca a mano.</p>
            <div className="space-y-2">
              {venta.productos.map((p) => (
                <button
                  key={p.sku}
                  onClick={() => setSelSku(p.sku)}
                  className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors', selSku === p.sku ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:bg-slate-50')}
                >
                  <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">{p.descripcion}</div>
                    <div className="truncate font-mono text-[11px] text-slate-500">{p.sku} · {p.marca}{p.linea ? ` · ${p.linea}` : ''}</div>
                    <div className="mt-0.5 text-xs text-slate-500">Talla {p.talla} · {p.color} · Lote {p.lote}</div>
                  </div>
                  {selSku === p.sku && <Check className="h-5 w-5 shrink-0 text-brand-600" />}
                </button>
              ))}
            </div>
          </>
        )}

        {/* PASO 3 — Información de la incidencia (problema del producto) */}
        {step === 3 && selProd && venta && (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Package className="h-4 w-4 text-slate-500" /> Producto seleccionado</div>
            {/* Ficha del producto — toda la información se obtiene automáticamente
                de la factura / ID Venta; es de solo lectura, sin captura manual. */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center gap-3">
                <img src={selProd.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">{selProd.descripcion}</div>
                  <div className="text-[11px] text-slate-400">Datos obtenidos automáticamente · solo lectura</div>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2">
                <div className="flex justify-between gap-2"><dt className="text-slate-500">SKU</dt><dd className="font-mono font-medium text-slate-700">{selProd.sku}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Marca</dt><dd className="font-medium text-slate-700">{selProd.marca}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Agrupación de línea</dt><dd className="font-medium text-slate-700">{selProd.linea ?? '—'}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Talla</dt><dd className="font-medium text-slate-700">{selProd.talla}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Color</dt><dd className="font-medium text-slate-700">{selProd.color}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Lote</dt><dd className="font-mono font-medium text-slate-700">{selProd.lote}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-slate-500">Fecha de compra</dt><dd className="font-medium text-slate-700">{venta.fecha}</dd></div>
                {!isEcom && venta.sucursalCompra && (
                  <div className="flex justify-between gap-2"><dt className="text-slate-500">Sucursal de compra</dt><dd className="font-medium text-slate-700">{venta.sucursalCompra}</dd></div>
                )}
              </dl>
            </div>

            <div className="flex items-center gap-2 pt-1 text-sm font-medium text-slate-700"><ShieldCheck className="h-4 w-4 text-slate-500" /> Información de la incidencia</div>
            <p className="text-sm text-slate-500">Tienda solo registra el caso. La resolución del producto la define Compras tras su revisión.</p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Motivo de devolución<span className="ml-0.5 text-brand-600">*</span></span>
              <select className={cn(inputCls, 'sm:max-w-md')} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                <option value="">Selecciona un motivo…</option>
                {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Descripción del problema <span className="text-slate-400">(opcional)</span></span>
              <textarea rows={3} className={inputCls} placeholder="Agrega contexto adicional del problema si lo consideras necesario…" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </label>
          </>
        )}

        {/* PASO 4 — Evidencia */}
        {step === 4 && (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Upload className="h-4 w-4 text-slate-500" /> Evidencia</div>
            <input ref={fileInput} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center hover:border-brand-300">
              <Upload className="h-8 w-8 text-slate-300" />
              <span className="text-sm font-medium text-slate-600">Haz clic para adjuntar evidencia</span>
              <span className="text-xs text-slate-500">Mínimo una fotografía (JPG, PNG). También videos (MP4, MOV) · máx. 50 MB c/u</span>
            </button>

            {fileErrors.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <div className="flex items-center gap-1.5 font-medium"><TriangleAlert className="h-4 w-4" /> No se pudieron adjuntar algunos archivos</div>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs">{fileErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            {files.length > 0 && (
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
            )}
            {fotos === 0 && <p className="text-xs text-slate-500">Se requiere al menos una fotografía para solicitar la autorización del supervisor.</p>}

            {/* Autorización por SMS del supervisor — solo con evidencia adjunta */}
            <div className={cn('rounded-xl border p-4', smsAuth ? 'border-emerald-200 bg-emerald-50/50' : fotos >= 1 ? 'border-brand-100 bg-brand-50/40' : 'border-slate-200 bg-slate-50/60')}>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><MessageSquareLock className="h-4 w-4 text-brand-600" /> Autorización del supervisor (SMS)</div>
              {smsAuth ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> Autorizado por <span className="font-medium">{smsAuth.supervisor}</span>.</div>
              ) : !smsSent ? (
                <>
                  <p className="mt-1 text-xs text-slate-600">El supervisor autoriza la devolución <span className="font-medium">con la evidencia ya adjunta</span>. Se enviará un código de 4 dígitos por SMS al supervisor autorizado de la sucursal. Vigencia 5 minutos · máximo 3 intentos.</p>
                  <Button className="mt-3" size="sm" variant="secondary" icon={<MessageSquareLock className="h-4 w-4" />} disabled={fotos < 1} onClick={enviarSMS}>Solicitar autorización del supervisor</Button>
                  {fotos < 1 && <p className="mt-2 text-[11px] text-slate-400">Adjunta al menos una fotografía para habilitar la solicitud.</p>}
                  {smsError && <p className="mt-2 text-xs font-medium text-rose-600">{smsError}</p>}
                </>
              ) : (
                <>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Ingresa el código enviado al supervisor.</span>
                    <span className={cn('font-medium', smsLeft <= 30 ? 'text-brand-600' : 'text-slate-500')}>Vigencia {mmss(smsLeft)}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus inputMode="numeric" maxLength={4} value={smsCode}
                      onChange={(e) => { setSmsCode(e.target.value.replace(/\D/g, '')); setSmsError('') }}
                      onKeyDown={(e) => { if (e.key === 'Enter') verificarSMS() }}
                      placeholder="••••"
                      className="w-28 rounded-lg border border-slate-200 bg-white py-2 px-3 text-center font-mono text-lg tracking-[0.4em] focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <Button size="sm" variant="primary" icon={<ShieldCheck className="h-4 w-4" />} disabled={smsCode.length !== 4} onClick={verificarSMS}>Validar</Button>
                    <Button size="sm" variant="ghost" onClick={enviarSMS}>Reenviar</Button>
                  </div>
                  <Hint>Ejemplo: 4832 (código SMS de 4 dígitos del supervisor)</Hint>
                  <p className="mt-2 text-[11px] text-slate-400">Demo: 4821 · 6238 · 3097 · 7410 · 5566</p>
                  {smsError && <p className="mt-1 text-xs font-medium text-rose-600">{smsError}</p>}
                </>
              )}
            </div>
            <p className="text-xs text-slate-500">No es posible generar el expediente sin evidencia ni sin la autorización exitosa del supervisor.</p>
          </>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button variant="ghost" icon={<ChevronLeft className="h-4 w-4" />} disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Anterior</Button>
          {step < 4 ? (
            <Button variant="primary" icon={<ChevronRight className="h-4 w-4" />} disabled={!stepValid[step]} onClick={() => setStep((s) => s + 1)}>Siguiente</Button>
          ) : (
            <Button variant="primary" icon={<Check className="h-4 w-4" />} disabled={!stepValid[4]} onClick={() => setDone(true)}>Generar expediente</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
