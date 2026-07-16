import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Store,
  Globe,
  Boxes,
  Truck,
  Layers,
  ChevronLeft,
  ChevronRight,
  ScanLine,
  Search,
  Upload,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  Info,
  Image as ImageIcon,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Button, BackLink, cn } from '../lib/ui'
import {
  RETURN_TYPES,
  SUCURSALES,
  MOTIVOS,
  MARCAS,
  AGRUPACIONES_COMERCIALES,
  agrupacionComercialForMarca,
  buscarLote,
  supervisorByCode,
  type ReturnTypeKey,
  type AgrupacionComercial,
  type LoteInfo,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'

const TYPE_ICON: Record<ReturnTypeKey, typeof Store> = {
  cliente: Store,
  ecommerce: Globe,
  depuracion: Boxes,
  redistribucion: Truck,
  masiva: Layers,
}

const ORDER: ReturnTypeKey[] = ['cliente', 'ecommerce', 'depuracion', 'redistribucion', 'masiva']

// Marcas disponibles al escanear en depuración (incluye marcas fuera del catálogo CLM).
const DEP_MARCAS = Array.from(new Set([...MARCAS, 'Clarks']))

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm placeholder:text-slate-500 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100'

/** Campo de solo lectura (datos traídos automáticamente del ERP). */
function FieldRO({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 font-medium text-slate-800">{value}</div>
    </div>
  )
}

interface DepProd {
  sku: string
  marca: string
  motivo: string
  evidencia: boolean
  /** Agrupación comercial detectada automáticamente del SKU/catálogo maestro. */
  agrupacion: AgrupacionComercial
}

export default function NewReturn() {
  const navigate = useNavigate()
  const { role } = useRole()
  // Tipos permitidos por rol: Tienda todo menos masiva; Compras solo Masiva.
  // Ecommerce NO crea devoluciones (opera incidencias, no expedientes).
  const allowed = ORDER.filter((k) => {
    if (role === 'ecommerce') return false
    if (role === 'tienda') return k !== 'masiva'
    return k === 'masiva' // compras
  })
  const [type, setType] = useState<ReturnTypeKey | null>(allowed.length === 1 ? allowed[0] : null)
  const [step, setStep] = useState(0)
  const [depMode, setDepMode] = useState<'individual' | 'masiva'>('individual')
  const [prods, setProds] = useState<DepProd[]>([
    { sku: 'FX-DM-3301', marca: 'Flexi', motivo: 'Defecto de fábrica', evidencia: true, agrupacion: 'Calzado Dama' },
    { sku: 'AN-DM-5510', marca: 'Andrea', motivo: 'Costura abierta', evidencia: true, agrupacion: 'Calzado Dama' },
    { sku: 'CL-DM-7720', marca: 'Clarks', motivo: 'Suela despegada', evidencia: true, agrupacion: 'Calzado Dama' },
    { sku: 'NK-CB-2291', marca: 'Nike', motivo: 'Defecto de fábrica', evidencia: true, agrupacion: 'Calzado Caballero' },
    { sku: 'SK-CB-4410', marca: 'Skechers', motivo: 'Manchas / decoloración', evidencia: true, agrupacion: 'Calzado Caballero' },
    { sku: 'FX-CB-3390', marca: 'Flexi', motivo: 'Defecto de fábrica', evidencia: true, agrupacion: 'Calzado Caballero' },
    { sku: 'CH-AC-1200', marca: 'Coach', motivo: 'Producto incompleto', evidencia: false, agrupacion: 'Accesorios' },
  ])
  // Grupos comerciales expandidos en el resumen dinámico.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ 'Calzado Dama': true })
  // Devolución masiva (Compras): captura solo el lote; el ERP trae la ficha.
  const [mLote, setMLote] = useState('')
  const [mLoteInfo, setMLoteInfo] = useState<LoteInfo | null>(null)
  const [mBuscado, setMBuscado] = useState(false)
  const [selSuc, setSelSuc] = useState<string[]>([])
  // Autorización de supervisor (solo Tienda) previa a generar el folio.
  const [authOpen, setAuthOpen] = useState(false)
  const [authCode, setAuthCode] = useState('')
  const [authError, setAuthError] = useState('')

  // Destino de salida de la pantalla (una sola acción de regreso, según rol).
  const back = role === 'compras'
    ? { to: '/masivas', label: 'Volver a Devoluciones masivas' }
    : { to: '/', label: 'Volver al inicio' }

  if (!type) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
        <BackLink to={back.to} label={back.label} />
        <PageHeader title="Nueva devolución" subtitle="Selecciona el tipo de devolución para iniciar un nuevo expediente" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allowed.map((key, i) => {
            const t = RETURN_TYPES[key]
            const Icon = TYPE_ICON[key]
            return (
              <button
                key={key}
                onClick={() => { setType(key); setStep(0) }}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-xs font-medium text-slate-300">{i + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{t.label}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500">{t.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.requires.map((r) => (
                    <span key={r} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{r}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const t = RETURN_TYPES[type]
  const isDepMasiva = type === 'depuracion' && depMode === 'masiva'
  const steps =
    type === 'masiva'
      ? ['Datos del lote', 'Confirmación']
      : type === 'depuracion'
      ? isDepMasiva
        ? ['Modalidad', 'Productos', 'Confirmación']
        : ['Modalidad', 'Producto y motivo', 'Evidencias']
      : ['Origen', 'Producto y motivo', 'Evidencias']
  const isLast = step === steps.length - 1

  const allComplete = prods.every((p) => p.sku && p.motivo && p.evidencia)

  // --- Devolución masiva: existencias por sucursal y piezas a retirar ---
  const mSucursales = mLoteInfo?.existencias.porSucursal ?? []
  const mSelSucs = mSucursales.filter((e) => selSuc.includes(e.sucursal))
  const mSelCount = mSelSucs.length
  const mPiezas = mSelSucs.reduce((a, e) => a + e.cantidad, 0)

  function buscarLoteERP() {
    const info = buscarLote(mLote)
    setMLoteInfo(info ?? null)
    setSelSuc(info ? info.existencias.porSucursal.map((e) => e.sucursal) : [])
    setMBuscado(true)
  }

  // Depuración: el sistema agrupa automáticamente por agrupación comercial.
  // Un expediente puede mezclar agrupaciones; se organizan visualmente.
  const gruposComerciales = AGRUPACIONES_COMERCIALES.map((g) => {
    const items = prods.filter((p) => p.agrupacion === g)
    const porMarca = new Map<string, number>()
    items.forEach((p) => porMarca.set(p.marca, (porMarca.get(p.marca) ?? 0) + 1))
    return { grupo: g, count: items.length, marcas: Array.from(porMarca, ([marca, n]) => ({ marca, n })).sort((a, b) => b.n - a.n) }
  }).filter((x) => x.count > 0)
  const totalMarcas = new Set(prods.map((p) => p.marca)).size
  const totalMotivos = new Set(prods.map((p) => p.motivo)).size

  // ¿Se puede generar el folio en el paso final?
  const canGenerate =
    type === 'masiva'
      ? !!mLoteInfo && mSelCount > 0
      : isDepMasiva
      ? allComplete
      : true

  function toggleSuc(sucursal: string) {
    setSelSuc((cur) => (cur.includes(sucursal) ? cur.filter((s) => s !== sucursal) : [...cur, sucursal]))
  }

  // No permitir avanzar del paso que valida selección/completitud.
  const blockNext =
    (type === 'masiva' && step === 0 && (!mLoteInfo || mSelCount === 0)) ||
    (isDepMasiva && step === 1 && !allComplete)

  // Destino tras generar el folio (prototipo con datos de ejemplo).
  const destino =
    type === 'masiva' ? '/masivas' : type === 'depuracion' ? '/devoluciones/DEV-2026-000146' : '/devoluciones/DEV-2026-000154'

  // Tienda requiere autorización de supervisor antes de generar el folio.
  function onGenerar() {
    if (role === 'tienda') {
      setAuthCode('')
      setAuthError('')
      setAuthOpen(true)
      return
    }
    navigate(destino)
  }

  function confirmarAutorizacion() {
    const sup = supervisorByCode(authCode.trim())
    if (!sup) {
      setAuthError('Código no válido. Solicita el código de un supervisor autorizado.')
      return
    }
    setAuthOpen(false)
    // Pasa la autorización al expediente para registrarla en el historial.
    navigate(destino, {
      state: { auth: { supervisor: sup.name, sucursal: sup.sucursal, fecha: 'Hoy', hora: 'ahora' } },
    })
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 lg:px-8">
      {allowed.length > 1 ? (
        <button onClick={() => setType(null)} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Volver a tipos de devolución
        </button>
      ) : (
        <BackLink to={back.to} label={back.label} />
      )}
      <PageHeader title={t.label} subtitle={t.desc} />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold', i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('text-sm font-medium', i === step ? 'text-slate-900' : 'text-slate-500')}>{s}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      <Card className="space-y-5">
        {/* MASIVA — paso 0: buscar lote → ficha ERP + existencias + selección */}
        {type === 'masiva' && step === 0 && (
          <>
            {/* Buscar lote */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Número de lote<span className="ml-0.5 text-brand-600">*</span></span>
                <div className="relative">
                  <input className={inputCls} placeholder="LT-NK-2291" value={mLote} onChange={(e) => setMLote(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') buscarLoteERP() }} />
                  <ScanLine className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                </div>
              </label>
              <Button variant="secondary" icon={<Search className="h-4 w-4" />} disabled={!mLote.trim()} onClick={buscarLoteERP}>Buscar lote</Button>
            </div>
            {mBuscado && !mLoteInfo && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">No se encontró el lote en el ERP.</div>
            )}

            {mLoteInfo && (
              <>
                {/* Información del producto (automática desde ERP) */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Información del producto (ERP)
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                    <FieldRO label="Marca" value={mLoteInfo.marca} />
                    <FieldRO label="Modelo" value={mLoteInfo.modelo} />
                    <FieldRO label="Color" value={mLoteInfo.color} />
                    <FieldRO label="Línea" value={mLoteInfo.linea} />
                    <FieldRO label="Sub línea" value={mLoteInfo.subLinea} />
                    <FieldRO label="Agrupación comercial" value={mLoteInfo.agrupacionComercial} />
                  </div>
                </div>

                {/* Resumen de existencias */}
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-700">Resumen de existencias</div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-100 px-3 py-2"><div className="text-[11px] text-slate-500">Total</div><div className="text-lg font-semibold text-slate-900">{mLoteInfo.existencias.total}</div></div>
                    <div className="rounded-lg border border-slate-100 px-3 py-2"><div className="text-[11px] text-slate-500">Disponible</div><div className="text-lg font-semibold text-emerald-600">{mLoteInfo.existencias.disponible}</div></div>
                    <div className="rounded-lg border border-slate-100 px-3 py-2"><div className="text-[11px] text-slate-500">En tránsito</div><div className="text-lg font-semibold text-indigo-600">{mLoteInfo.existencias.transito}</div></div>
                    <div className="rounded-lg border border-slate-100 px-3 py-2"><div className="text-[11px] text-slate-500">Comprometida</div><div className="text-lg font-semibold text-amber-600">{mLoteInfo.existencias.comprometida}</div></div>
                  </div>
                </div>

                {/* Selección de sucursales para retiro */}
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-700">Sucursales con inventario del lote</div>
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                          <th className="px-3 py-2">Sucursal</th>
                          <th className="px-3 py-2 text-right">Existencia</th>
                          <th className="px-3 py-2 text-center">Seleccionar para retiro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mSucursales.map((e) => (
                          <tr key={e.sucursal} className="border-b border-slate-50 last:border-0">
                            <td className="px-3 py-2 text-slate-700">{e.sucursal}</td>
                            <td className="px-3 py-2 text-right font-medium text-slate-900">{e.cantidad}</td>
                            <td className="px-3 py-2 text-center">
                              <input type="checkbox" checked={selSuc.includes(e.sucursal)} onChange={() => toggleSuc(e.sucursal)} className="h-4 w-4 accent-brand-600" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resumen dinámico */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm">
                  <span className="text-slate-600">Sucursales seleccionadas: <span className="font-semibold text-slate-900">{mSelCount}</span></span>
                  <span className="text-slate-600">Piezas a retirar: <span className="font-semibold text-brand-700">{mPiezas}</span></span>
                </div>
              </>
            )}
          </>
        )}
        {type === 'masiva' && step === 1 && (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Layers className="h-7 w-7" /></div>
              <h4 className="mt-3 text-base font-semibold text-slate-900">Se generarán {mSelCount} expedientes por sucursal</h4>
              <p className="mt-1 text-sm text-slate-500">Lote {mLoteInfo?.lote} · {mLoteInfo?.marca} {mLoteInfo?.modelo}</p>
            </div>
            <div className="mx-auto mt-4 max-w-md space-y-3">
              <div className="rounded-xl border border-slate-100 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad por sucursal</div>
                {mSelSucs.map((e) => (
                  <div key={e.sucursal} className="flex items-baseline gap-2 py-0.5 text-sm">
                    <span className="text-slate-700">{e.sucursal}</span>
                    <span className="flex-1 translate-y-[-3px] border-b border-dotted border-slate-300" />
                    <span className="font-semibold text-slate-900">{e.cantidad}</span>
                  </div>
                ))}
                {mSelSucs.length === 0 && <p className="text-sm text-slate-400">Ninguna sucursal seleccionada.</p>}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">Total de piezas a retirar</span>
                <span className="text-xl font-semibold text-brand-700">{mPiezas}</span>
              </div>
            </div>
          </>
        )}

        {/* DEPURACIÓN — paso 0: modalidad */}
        {type === 'depuracion' && step === 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {([
                { k: 'individual', title: 'Individual', desc: 'Un solo producto en el expediente.' },
                { k: 'masiva', title: 'Masiva', desc: 'Varios productos con un mismo folio principal.' },
              ] as const).map((o) => (
                <button
                  key={o.k}
                  onClick={() => setDepMode(o.k)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                    depMode === o.k ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', depMode === o.k ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')}>
                    {o.k === 'individual' ? <Boxes className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{o.title}</div>
                    <div className="text-xs text-slate-500">{o.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Esta devolución <span className="font-medium text-slate-700">no requiere factura</span>. Escanea el producto en el siguiente paso.
            </div>
            <Field label="Sucursal">
              <select className={inputCls}>{SUCURSALES.map((s) => <option key={s}>{s}</option>)}</select>
            </Field>
          </>
        )}

        {/* DEPURACIÓN MASIVA — paso 1: captura + resumen dinámico agrupado */}
        {isDepMasiva && step === 1 && (
          <>
            {/* Resumen dinámico por agrupación comercial (tiempo real) */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Resumen por agrupación comercial</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{prods.length} artículos</span>
              </div>
              <div className="space-y-2">
                {gruposComerciales.map(({ grupo, count, marcas }) => (
                  <div key={grupo} className="overflow-hidden rounded-xl border border-slate-100">
                    <button
                      onClick={() => setOpenGroups((o) => ({ ...o, [grupo]: !o[grupo] }))}
                      className="flex w-full items-center justify-between px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <ChevronRight className={cn('h-4 w-4 text-slate-400 transition-transform', openGroups[grupo] && 'rotate-90')} />
                        {grupo}
                      </span>
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{count}</span>
                    </button>
                    {openGroups[grupo] && (
                      <ul className="divide-y divide-slate-50 border-t border-slate-100 bg-slate-50/50 px-3 py-1">
                        {marcas.map(({ marca, n }) => (
                          <li key={marca} className="flex items-center justify-between py-1 text-xs text-slate-600">
                            <span>{marca}</span>
                            <span className="font-medium text-slate-500">({n})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Captura de productos escaneados */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-medium text-slate-700">Productos escaneados</span>
              <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setProds((p) => [...p, { sku: '', marca: MARCAS[0], motivo: MOTIVOS[0], evidencia: false, agrupacion: agrupacionComercialForMarca(MARCAS[0]) }])}>
                Agregar producto
              </Button>
            </div>
            <div className="space-y-3">
              {prods.map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="relative">
                      <input
                        className={inputCls}
                        placeholder="SKU / código de barras"
                        value={p.sku}
                        onChange={(e) => setProds((arr) => arr.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))}
                      />
                      <ScanLine className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    </div>
                    <select
                      className={inputCls}
                      value={p.marca}
                      onChange={(e) => setProds((arr) => arr.map((x, j) => (j === i ? { ...x, marca: e.target.value, agrupacion: agrupacionComercialForMarca(e.target.value) } : x)))}
                    >
                      {DEP_MARCAS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <select
                      className={inputCls}
                      value={p.motivo}
                      onChange={(e) => setProds((arr) => arr.map((x, j) => (j === i ? { ...x, motivo: e.target.value } : x)))}
                    >
                      {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                    Agrupación detectada:
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">{p.agrupacion}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => setProds((arr) => arr.map((x, j) => (j === i ? { ...x, evidencia: !x.evidencia } : x)))}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium',
                        p.evidencia ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100',
                      )}
                    >
                      {p.evidencia ? <Check className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                      {p.evidencia ? 'Evidencia adjunta' : 'Adjuntar evidencia'}
                    </button>
                    <div className="flex items-center gap-2">
                      {!(p.sku && p.motivo && p.evidencia) && (
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">Incompleto</span>
                      )}
                      {prods.length > 1 && (
                        <button onClick={() => setProds((arr) => arr.filter((_, j) => j !== i))} className="text-slate-500 hover:text-brand-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={cn('rounded-lg border p-3 text-sm', allComplete ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700' : 'border-amber-100 bg-amber-50/50 text-amber-700')}>
              {allComplete
                ? 'Todos los productos tienen SKU, motivo y evidencia. El sistema los agrupó automáticamente por agrupación comercial. Listo para generar el folio principal.'
                : 'Cada producto debe tener SKU, marca, motivo y evidencia. El sistema agrupa automáticamente por agrupación comercial conforme escaneas.'}
            </div>
          </>
        )}
        {isDepMasiva && step === 2 && (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Layers className="h-7 w-7" /></div>
              <h4 className="mt-3 text-base font-semibold text-slate-900">Folio principal DEP-2026-00154</h4>
              <p className="mt-1 text-sm text-slate-500">{prods.length} artículos registrados</p>
            </div>
            <div className="mx-auto mt-4 max-w-sm space-y-3">
              <div className="rounded-xl border border-slate-100 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Por agrupación</div>
                {gruposComerciales.map(({ grupo, count }) => (
                  <div key={grupo} className="flex items-baseline gap-2 py-0.5 text-sm">
                    <span className="text-slate-700">{grupo}</span>
                    <span className="flex-1 translate-y-[-3px] border-b border-dotted border-slate-300" />
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl border border-slate-100 p-3 text-center">
                  <div className="text-2xl font-semibold text-slate-900">{totalMotivos}</div>
                  <div className="text-xs text-slate-500">motivos registrados</div>
                </div>
                <div className="flex-1 rounded-xl border border-slate-100 p-3 text-center">
                  <div className="text-2xl font-semibold text-slate-900">{totalMarcas}</div>
                  <div className="text-xs text-slate-500">marcas involucradas</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* NON-MASIVA / NON-DEPURACIÓN step 0: origin */}
        {type !== 'masiva' && type !== 'depuracion' && step === 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {type === 'cliente' && (
              <>
                <Field label="Factura" required><input className={inputCls} placeholder="FA-CUL-88231" /></Field>
                <Field label="Cliente" required><input className={inputCls} placeholder="Nombre del cliente" /></Field>
              </>
            )}
            {type === 'ecommerce' && (
              <>
                <Field label="ID de Venta" required>
                  <input className={inputCls} placeholder="EC-99120" />
                </Field>
                <Field label="Cliente" required><input className={inputCls} placeholder="Nombre del cliente" /></Field>
                <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                  El <span className="font-medium text-slate-700">ID de Venta</span> es obligatorio y funciona como el equivalente a la factura física utilizada en tienda. Al ser compra en línea no aplica "tienda origen"; se registra la <span className="font-medium text-slate-700">sucursal</span> que atiende la devolución.
                </div>
              </>
            )}
            {type === 'redistribucion' && (
              <>
                <Field label="Folio de traslado" required><input className={inputCls} placeholder="TR-44120" /></Field>
                <Field label="Tienda origen" required>
                  <select className={inputCls}>{SUCURSALES.map((s) => <option key={s}>{s}</option>)}</select>
                </Field>
              </>
            )}
            <Field label="Sucursal">
              <select className={inputCls}>{SUCURSALES.map((s) => <option key={s}>{s}</option>)}</select>
            </Field>
          </div>
        )}

        {/* NON-MASIVA single-product step 1 (cliente/ecommerce/redistribución + depuración individual) */}
        {type !== 'masiva' && !isDepMasiva && step === 1 && (
          <>
            <Field label="Escanear / capturar producto" required>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="SKU o código de barras" defaultValue="NK-AJ1-2291" />
                <Button variant="secondary" icon={<ScanLine className="h-4 w-4" />}>Escanear</Button>
              </div>
            </Field>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" className="h-14 w-14 rounded-lg object-cover" alt="" />
              <div className="text-sm">
                <div className="font-medium text-slate-900">Nike Air Jordan 1 Mid — Negro/Rojo</div>
                <div className="text-slate-500">Autocompletado desde catálogo · $3,299</div>
              </div>
              <Check className="ml-auto h-5 w-5 text-emerald-500" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Cantidad">
                {type === 'cliente' || type === 'ecommerce' ? (
                  <input type="number" className={cn(inputCls, 'bg-slate-50 text-slate-500')} value={1} readOnly />
                ) : (
                  <input type="number" className={inputCls} defaultValue={1} min={1} />
                )}
              </Field>
              <Field label="Motivo" required>
                <select className={inputCls}>{MOTIVOS.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
            </div>
            {(type === 'cliente' || type === 'ecommerce') && (
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  <span className="font-medium text-slate-700">1 artículo por devolución.</span> Si el mismo ticket tiene varios
                  artículos, genera un expediente por artículo (un folio distinto para cada uno).
                </span>
              </div>
            )}
            <Field label="Observaciones">
              <textarea rows={3} className={inputCls} placeholder="Describe el detalle del caso…" />
            </Field>
          </>
        )}

        {/* NON-MASIVA single-product step 2: evidences */}
        {type !== 'masiva' && !isDepMasiva && step === 2 && (
          <>
            <Field label="Fotografías o videos del producto" required>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center hover:border-brand-300">
                <Upload className="h-8 w-8 text-slate-300" />
                <span className="text-sm font-medium text-slate-600">Arrastra tus fotos o videos aquí</span>
                <span className="text-xs text-slate-500">o haz clic para seleccionar · PNG, JPG, MP4 hasta 50 MB</span>
              </div>
            </Field>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {['photo-1542291026-7eec264c27ff', 'photo-1549298916-b41d501d3772'].map((id) => (
                <div key={id} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                  <img src={`https://images.unsplash.com/${id}?w=200&q=80`} className="h-full w-full object-cover" alt="" />
                </div>
              ))}
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-500">
                <ImageIcon className="h-6 w-6" />
              </div>
            </div>
          </>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)} icon={<ChevronLeft className="h-4 w-4" />}>
            Anterior
          </Button>
          {isLast ? (
            <Button
              variant="primary"
              icon={<Check className="h-4 w-4" />}
              disabled={!canGenerate}
              onClick={onGenerar}
            >
              {type === 'masiva' ? 'Generar expedientes' : isDepMasiva ? 'Generar folio principal' : 'Crear expediente'}
            </Button>
          ) : (
            <Button variant="primary" icon={<ChevronRight className="h-4 w-4" />} disabled={blockNext} onClick={() => setStep((s) => s + 1)}>
              Siguiente
            </Button>
          )}
        </div>
      </Card>

      {/* Autorización de supervisor (solo Tienda) — previa a generar el folio */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6" onClick={() => setAuthOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              <h3 className="text-base font-semibold text-slate-900">Autorización de supervisor</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Antes de generar el folio, ingresa el código de 4 dígitos de un supervisor autorizado de la sucursal.
            </p>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Código de autorización</span>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={4}
                value={authCode}
                onChange={(e) => { setAuthCode(e.target.value.replace(/\D/g, '')); setAuthError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmarAutorizacion() }}
                placeholder="••••"
                className={cn(
                  'w-full rounded-lg border bg-white py-2.5 px-3 text-center font-mono text-2xl tracking-[0.5em] focus:outline-none focus:ring-2',
                  authError ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-300 focus:ring-brand-100',
                )}
              />
            </label>
            {authError && <p className="mt-2 text-xs font-medium text-rose-600">{authError}</p>}
            <p className="mt-2 text-[11px] text-slate-400">Demo: 4821 · 6238 · 3097 · 7410 · 5566</p>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAuthOpen(false)}>Cancelar</Button>
              <Button variant="primary" icon={<ShieldCheck className="h-4 w-4" />} disabled={authCode.length !== 4} onClick={confirmarAutorizacion}>
                Autorizar y generar folio
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
