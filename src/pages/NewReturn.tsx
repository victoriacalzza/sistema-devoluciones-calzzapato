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
  Upload,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Button, cn } from '../lib/ui'
import { RETURN_TYPES, SUCURSALES, MOTIVOS, MARCAS, LINEAS, type ReturnTypeKey } from '../data/mock'
import { useRole } from '../lib/RoleContext'

const TYPE_ICON: Record<ReturnTypeKey, typeof Store> = {
  cliente: Store,
  ecommerce: Globe,
  depuracion: Boxes,
  redistribucion: Truck,
  masiva: Layers,
}

const ORDER: ReturnTypeKey[] = ['cliente', 'ecommerce', 'depuracion', 'redistribucion', 'masiva']

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

interface DepProd {
  sku: string
  motivo: string
  evidencia: boolean
}

export default function NewReturn() {
  const navigate = useNavigate()
  const { role } = useRole()
  // Tipos permitidos por rol: Ecommerce solo Ecommerce; Tienda todo menos masiva; Compras todo.
  const allowed = ORDER.filter((k) => {
    if (role === 'ecommerce') return k === 'ecommerce'
    if (role === 'tienda') return k !== 'masiva'
    return true
  })
  const [type, setType] = useState<ReturnTypeKey | null>(allowed.length === 1 ? allowed[0] : null)
  const [step, setStep] = useState(0)
  const [depMode, setDepMode] = useState<'individual' | 'masiva'>('individual')
  const [prods, setProds] = useState<DepProd[]>([
    { sku: 'FX-IN-3301', motivo: 'Defecto de fábrica', evidencia: true },
    { sku: 'FX-IN-3302', motivo: 'Costura abierta', evidencia: false },
  ])

  if (!type) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
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

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 lg:px-8">
      {allowed.length > 1 && (
        <button onClick={() => setType(null)} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Cambiar tipo
        </button>
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
        {/* MASIVA — alta por lote / línea / marca */}
        {type === 'masiva' && step === 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Número de lote" required>
                <div className="relative">
                  <input className={inputCls} placeholder="LT-NK-2291" defaultValue="LT-NK-2291" />
                  <ScanLine className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                </div>
              </Field>
              <Field label="Línea" required>
                <select className={inputCls}>{LINEAS.map((l) => <option key={l}>{l}</option>)}</select>
              </Field>
              <Field label="Marca" required>
                <select className={inputCls}>{MARCAS.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
            </div>
            <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-4 text-sm text-slate-600">
              Al confirmar, el sistema creará <span className="font-semibold text-brand-700">expedientes individuales por sucursal</span> con existencias del lote y mostrará el avance de cumplimiento de cada una.
            </div>
          </>
        )}
        {type === 'masiva' && step === 1 && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Layers className="h-7 w-7" /></div>
            <h4 className="mt-3 text-base font-semibold text-slate-900">Se generarán 6 expedientes por sucursal</h4>
            <p className="mt-1 text-sm text-slate-500">Culiacán Centro, Culiacán Forum, Mazatlán, Guadalajara, Los Mochis y Hermosillo.</p>
          </div>
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

        {/* DEPURACIÓN MASIVA — paso 1: lista de productos */}
        {isDepMasiva && step === 1 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Productos del expediente</span>
              <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setProds((p) => [...p, { sku: '', motivo: MOTIVOS[0], evidencia: false }])}>
                Agregar producto
              </Button>
            </div>
            <div className="space-y-3">
              {prods.map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      value={p.motivo}
                      onChange={(e) => setProds((arr) => arr.map((x, j) => (j === i ? { ...x, motivo: e.target.value } : x)))}
                    >
                      {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
                    </select>
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
                ? 'Todos los productos tienen SKU, motivo y evidencia. Listo para generar el folio principal.'
                : 'Cada producto debe tener SKU, motivo y evidencia fotográfica para poder cerrar el expediente.'}
            </div>
          </>
        )}
        {isDepMasiva && step === 2 && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Layers className="h-7 w-7" /></div>
            <h4 className="mt-3 text-base font-semibold text-slate-900">Folio principal DEP-2026-00154</h4>
            <p className="mt-1 text-sm text-slate-500">{prods.length} subregistros compartirán este folio.</p>
          </div>
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
                <Field label="Tienda origen" required>
                  <select className={inputCls}>{SUCURSALES.map((s) => <option key={s}>{s}</option>)}</select>
                </Field>
                <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                  El <span className="font-medium text-slate-700">ID de Venta</span> es obligatorio y funciona como el equivalente a la factura física utilizada en tienda.
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
              <Field label="Cantidad"><input type="number" className={inputCls} defaultValue={1} /></Field>
              <Field label="Motivo" required>
                <select className={inputCls}>{MOTIVOS.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
            </div>
            <Field label="Observaciones">
              <textarea rows={3} className={inputCls} placeholder="Describe el detalle del caso…" />
            </Field>
          </>
        )}

        {/* NON-MASIVA single-product step 2: evidences */}
        {type !== 'masiva' && !isDepMasiva && step === 2 && (
          <>
            <Field label="Fotografías del producto" required>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center hover:border-brand-300">
                <Upload className="h-8 w-8 text-slate-300" />
                <span className="text-sm font-medium text-slate-600">Arrastra tus fotos aquí</span>
                <span className="text-xs text-slate-500">o haz clic para seleccionar · PNG, JPG hasta 10 MB</span>
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
              disabled={isDepMasiva && !allComplete}
              onClick={() =>
                navigate(
                  type === 'masiva'
                    ? '/masivas'
                    : type === 'depuracion'
                    ? '/devoluciones/DEV-2026-000146'
                    : '/devoluciones/DEV-2026-000154',
                )
              }
            >
              {type === 'masiva' ? 'Generar expedientes' : isDepMasiva ? 'Generar folio principal' : 'Crear expediente'}
            </Button>
          ) : (
            <Button variant="primary" icon={<ChevronRight className="h-4 w-4" />} onClick={() => setStep((s) => s + 1)}>
              Siguiente
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
