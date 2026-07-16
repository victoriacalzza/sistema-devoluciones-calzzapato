import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area,
} from 'recharts'
import { SlidersHorizontal, RotateCcw, ChevronDown, Calendar, X, CalendarRange } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, SectionTitle, Button, Pill, BackLink, cn } from '../lib/ui'
import { ExportMenu } from '../components/ExportMenu'
import type { ExportColumn } from '../lib/export'
import {
  INCIDENCIAS,
  INCIDENCIA_STATUS,
  RETURNS,
  BLOQUEADOS_ECOMMERCE,
  ECOMMERCE_KPIS,
  MARCAS,
  PROVEEDORES,
  MOTIVOS_INCIDENCIA,
  SUCURSALES_ORIGEN,
  GERENTES,
  CHART_COLORS,
  HOY,
  fechaANumero,
  type IncidenciaStatus,
} from '../data/mock'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px -8px rgb(16 24 40 / 0.18)',
  fontSize: 12,
}

interface Datum { name: string; value: number; [k: string]: string | number }

function countBy<T>(items: T[], key: (t: T) => string | undefined): Datum[] {
  const map = new Map<string, number>()
  items.forEach((it) => {
    const k = key(it)
    if (!k) return
    map.set(k, (map.get(k) ?? 0) + 1)
  })
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

const EXPORT_COLS: ExportColumn[] = [
  { header: 'Categoría', key: 'name' },
  { header: 'Total', key: 'value' },
]

// ------------------------------ Gráficas -----------------------------------

function ReportCard({ title, data, children, filename }: { title: string; data: Datum[]; children: React.ReactNode; filename: string }) {
  return (
    <Card>
      <SectionTitle right={<ExportMenu filename={filename} title={title} columns={EXPORT_COLS} rows={data} />}>{title}</SectionTitle>
      <div className="h-56">
        {data.length > 0 ? children : <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin datos en el periodo seleccionado.</div>}
      </div>
    </Card>
  )
}

function VBars({ data, color }: { data: Datum[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={44} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} barSize={26} name="Incidencias" />
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieChartCard({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius="72%" paddingAngle={1}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function TrendArea({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="incTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#D32F2F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="#D32F2F" strokeWidth={2.5} fill="url(#incTrend)" name="Incidencias" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// -------- Widget "Productos con mayor incidencia" (Top 10 + Ver más) --------

function wrapTwoLines(text: string, max: number): string[] {
  if (text.length <= max) return [text]
  const words = text.split(' ')
  let l1 = ''
  let i = 0
  while (i < words.length && (l1 ? l1.length + 1 + words[i].length : words[i].length) <= max) {
    l1 = l1 ? `${l1} ${words[i]}` : words[i]
    i++
  }
  if (!l1) return [`${text.slice(0, max - 1)}…`]
  let l2 = words.slice(i).join(' ')
  if (l2.length > max) l2 = `${l2.slice(0, max - 1).trimEnd()}…`
  return l2 ? [l1, l2] : [l1]
}

const Y_LABEL_WIDTH = 200
const Y_CHARS_PER_LINE = 28

function ProductTick(props: { x?: number; y?: number; payload?: { value: string } }) {
  const { x = 0, y = 0, payload } = props
  const full = payload?.value ?? ''
  const lines = wrapTwoLines(full, Y_CHARS_PER_LINE)
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{full}</title>
      <text textAnchor="end" fill="#334155" fontSize={11}>
        {lines.map((ln, i) => (
          <tspan key={i} x={-8} dy={i === 0 ? (lines.length > 1 ? -2 : 4) : 13}>{ln}</tspan>
        ))}
      </text>
    </g>
  )
}

function ProductIncidenceCard({ data }: { data: Datum[] }) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? data : data.slice(0, 10)
  const chartHeight = Math.max(shown.length * 46, 160)
  return (
    <Card>
      <SectionTitle right={<ExportMenu filename="productos-mayor-incidencia" title="Productos con mayor incidencia" columns={EXPORT_COLS} rows={data} />}>
        Productos con mayor incidencia
      </SectionTitle>
      {data.length > 0 ? (
        <>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shown} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barCategoryGap="28%">
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="name" width={Y_LABEL_WIDTH} axisLine={false} tickLine={false} tick={<ProductTick />} interval={0} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={18} name="Incidencias" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {data.length > 10 && (
            <div className="mt-3 flex justify-center border-t border-slate-100 pt-3">
              <Button size="sm" variant="ghost" icon={<ChevronDown className={cn('h-4 w-4 transition-transform', showAll && 'rotate-180')} />} onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Ver menos' : `Ver más (${data.length - 10})`}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-slate-400">Sin datos en el periodo seleccionado.</div>
      )}
    </Card>
  )
}

// ------------------------------- Periodos ----------------------------------

const MES_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function parseHoy(hoy: string): Date {
  const m = hoy.match(/(\d{1,2})\s+([a-záéí]{3})\.?\s+(\d{4})/i)
  if (!m) return new Date(2026, 6, 15)
  return new Date(parseInt(m[3], 10), MES_ABBR.indexOf(m[2].toLowerCase().slice(0, 3)), parseInt(m[1], 10))
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function fmtISO(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}
function minusMonths(d: Date, n: number): Date { const x = new Date(d); x.setMonth(x.getMonth() - n); return x }
/** ¿La fecha (formato es o ISO) cae dentro del rango [desde, hasta]? */
function enRango(fecha: string, desde: string, hasta: string): boolean {
  const n = fechaANumero(fecha)
  if (n == null) return true
  const d = desde ? fechaANumero(desde) : null
  const h = hasta ? fechaANumero(hasta) : null
  if (d != null && n < d) return false
  if (h != null && n > h) return false
  return true
}

type PeriodKey = 'mes-actual' | 'mes-anterior' | '3m' | '6m' | '12m' | 'custom'

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'mes-actual', label: 'Mes actual' },
  { key: 'mes-anterior', label: 'Mes anterior' },
  { key: '3m', label: 'Últimos 3 meses' },
  { key: '6m', label: 'Últimos 6 meses' },
  { key: '12m', label: 'Últimos 12 meses' },
  { key: 'custom', label: 'Rango personalizado' },
]

function computeRange(key: PeriodKey, anchor: Date, custom: { desde: string; hasta: string }): { desde: string; hasta: string } {
  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  switch (key) {
    case 'mes-actual': return { desde: toISO(new Date(y, m, 1)), hasta: toISO(new Date(y, m + 1, 0)) }
    case 'mes-anterior': return { desde: toISO(new Date(y, m - 1, 1)), hasta: toISO(new Date(y, m, 0)) }
    case '3m': return { desde: toISO(minusMonths(anchor, 3)), hasta: toISO(anchor) }
    case '6m': return { desde: toISO(minusMonths(anchor, 6)), hasta: toISO(anchor) }
    case '12m': return { desde: toISO(minusMonths(anchor, 12)), hasta: toISO(anchor) }
    case 'custom': return { desde: custom.desde, hasta: custom.hasta }
  }
}

// Estado agrupado del filtro.
const ESTADOS: { key: string; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'abierta', label: 'Abierta' },
  { key: 'revision', label: 'En revisión' },
  { key: 'cerrada', label: 'Cerrada' },
]
function matchEstado(status: IncidenciaStatus, key: string): boolean {
  if (!key) return true
  if (key === 'abierta') return status === 'abierta'
  if (key === 'revision') return status === 'revision' || status === 'esperando'
  return status === 'cerrada' || status === 'resuelta'
}

// Tendencia mensual: agrupa por "mmm YYYY" y ordena cronológicamente.
function trendByMonth(items: { creada: string }[]): Datum[] {
  const map = new Map<string, { label: string; order: number; value: number }>()
  items.forEach((i) => {
    const order = fechaANumero(i.creada) ?? 0
    const label = i.creada.replace(/^\d{1,2}\s+/, '') // "jul 2026"
    const cur = map.get(label) ?? { label, order, value: 0 }
    cur.value += 1
    cur.order = Math.min(cur.order, order)
    map.set(label, cur)
  })
  return Array.from(map.values()).sort((a, b) => a.order - b.order).map((m) => ({ name: m.label, value: m.value }))
}

const CATEGORIAS_INCIDENCIA = Array.from(new Set(INCIDENCIAS.map((i) => i.categoria)))

export default function ReportsEcommerce() {
  const anchor = useMemo(() => parseHoy(HOY), [])
  const [period, setPeriod] = useState<PeriodKey>('6m')
  const [custom, setCustom] = useState({ desde: '', hasta: '' })
  const [marca, setMarca] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [motivo, setMotivo] = useState('')
  const [sucursal, setSucursal] = useState('')
  const [gerente, setGerente] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)

  const range = computeRange(period, anchor, custom)

  const filtered = useMemo(() => {
    const d = range.desde ? fechaANumero(range.desde) : null
    const h = range.hasta ? fechaANumero(range.hasta) : null
    return INCIDENCIAS.filter((i) => {
      const n = fechaANumero(i.creada)
      if (n != null) { if (d != null && n < d) return false; if (h != null && n > h) return false }
      if (marca && i.marca !== marca) return false
      if (proveedor && i.proveedor !== proveedor) return false
      if (motivo && i.motivo !== motivo) return false
      if (sucursal && i.sucursalOrigen !== sucursal) return false
      if (gerente && i.gerenteOrigen !== gerente) return false
      if (categoria && i.categoria !== categoria) return false
      if (!matchEstado(i.status, estado)) return false
      return true
    })
  }, [range.desde, range.hasta, marca, proveedor, motivo, sucursal, gerente, categoria, estado])

  const porMarca = useMemo(() => countBy(filtered, (i) => i.marca), [filtered])
  const porProveedor = useMemo(() => countBy(filtered, (i) => i.proveedor), [filtered])
  const porMotivo = useMemo(() => countBy(filtered, (i) => i.motivo), [filtered])
  const porProducto = useMemo(() => countBy(filtered, (i) => i.producto), [filtered])
  const tendencia = useMemo(() => trendByMonth(filtered), [filtered])

  // Productos bloqueados para Ecommerce en el periodo (respeta el rango).
  const bloqueados = useMemo(
    () => BLOQUEADOS_ECOMMERCE.filter((b) => enRango(b.fecha, range.desde, range.hasta)),
    [range.desde, range.hasta],
  )

  // KPIs del canal Ecommerce (todos dentro del periodo).
  const kpis = {
    total: filtered.length,
    // Devoluciones Ecommerce pendientes de resolución por Compras.
    pendientes: RETURNS.filter((r) => r.tipo === 'ecommerce' && ['nuevo', 'revision', 'esperando'].includes(r.status) && enRango(r.fechaCreacion, range.desde, range.hasta)).length,
    // Resoluciones emitidas por Compras que afectan el canal (incidencias resueltas/cerradas).
    resoluciones: filtered.filter((i) => i.status === 'resuelta' || i.status === 'cerrada').length,
    bloqueados: bloqueados.length,
  }

  const addFilters = [marca, proveedor, motivo, sucursal, gerente, categoria, estado].filter(Boolean).length
  const activeChips = [
    marca && { label: `Marca: ${marca}`, clear: () => setMarca('') },
    proveedor && { label: `Proveedor: ${proveedor}`, clear: () => setProveedor('') },
    motivo && { label: `Motivo: ${motivo}`, clear: () => setMotivo('') },
    sucursal && { label: `Sucursal: ${sucursal}`, clear: () => setSucursal('') },
    gerente && { label: `Gerente: ${gerente}`, clear: () => setGerente('') },
    categoria && { label: `Categoría: ${categoria}`, clear: () => setCategoria('') },
    estado && { label: `Estado: ${ESTADOS.find((e) => e.key === estado)?.label}`, clear: () => setEstado('') },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  function clearAll() {
    setPeriod('6m'); setCustom({ desde: '', hasta: '' })
    setMarca(''); setProveedor(''); setMotivo(''); setSucursal(''); setGerente(''); setCategoria(''); setEstado('')
  }

  const periodLabel = period === 'custom'
    ? (range.desde && range.hasta ? `${fmtISO(range.desde)} - ${fmtISO(range.hasta)}` : 'Personalizado — define fechas')
    : `${PERIODS.find((p) => p.key === period)?.label}${range.desde ? ` (${fmtISO(range.desde)} - ${fmtISO(range.hasta)})` : ''}`

  // Export: detalle de incidencias filtradas (respeta exactamente los filtros).
  const detalleRows = filtered.map((i) => ({
    folio: i.folio, fecha: i.creada, marca: i.marca, proveedor: i.proveedor, categoria: i.categoria,
    motivo: i.motivo, sucursalOrigen: i.sucursalOrigen, gerenteOrigen: i.gerenteOrigen,
    estado: INCIDENCIA_STATUS[i.status].label, producto: i.producto, sku: i.sku,
  }))

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <BackLink to="/" label="Volver al inicio" />
      <PageHeader
        title="Reportes Ecommerce"
        subtitle="Análisis operativo y ejecutivo de incidencias de redistribución"
        actions={
          <ExportMenu
            filename="reporte-incidencias-ecommerce"
            title={`Incidencias Ecommerce · ${periodLabel}`}
            columns={[
              { header: 'Folio', key: 'folio' },
              { header: 'Fecha', key: 'fecha' },
              { header: 'Marca', key: 'marca' },
              { header: 'Proveedor', key: 'proveedor' },
              { header: 'Categoría', key: 'categoria' },
              { header: 'Motivo', key: 'motivo' },
              { header: 'Sucursal origen', key: 'sucursalOrigen' },
              { header: 'Gerente origen', key: 'gerenteOrigen' },
              { header: 'Estado', key: 'estado' },
              { header: 'Producto', key: 'producto' },
              { header: 'SKU', key: 'sku' },
            ]}
            rows={detalleRows}
            label="Exportar datos"
          />
        }
      />

      {/* Barra de filtros fija */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-slate-50/95 px-4 pb-1 pt-1 backdrop-blur lg:-mx-8 lg:px-8">
        <Card>
          <div className="flex flex-col gap-4">
            {/* Encabezado + rango activo */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Filtros
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  <CalendarRange className="h-3.5 w-3.5" /> Mostrando información: {periodLabel}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{kpis.total} incidencias</span>
                <Button size="sm" variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={clearAll}>Limpiar</Button>
              </div>
            </div>

            {/* Periodo */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3.5 w-3.5" /> Periodo de consulta</div>
              <div className="flex flex-wrap gap-2">
                {PERIODS.map((p) => (
                  <Pill key={p.key} active={period === p.key} onClick={() => setPeriod(p.key)}>{p.label}</Pill>
                ))}
              </div>
              {period === 'custom' && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Fecha inicio</span>
                    <input type="date" value={custom.desde} onChange={(e) => setCustom((c) => ({ ...c, desde: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Fecha fin</span>
                    <input type="date" value={custom.hasta} onChange={(e) => setCustom((c) => ({ ...c, hasta: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                  </label>
                </div>
              )}
            </div>

            {/* Filtros adicionales (colapsables) */}
            <div className="border-t border-slate-100 pt-3">
              <button onClick={() => setMoreOpen((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900">
                <ChevronDown className={cn('h-4 w-4 transition-transform', moreOpen && 'rotate-180')} />
                Filtros adicionales{addFilters > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">{addFilters}</span>}
              </button>
              {moreOpen && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FilterSelect label="Marca" value={marca} onChange={setMarca} options={MARCAS} allLabel="Todas" />
                  <FilterSelect label="Proveedor" value={proveedor} onChange={setProveedor} options={PROVEEDORES} allLabel="Todos" />
                  <FilterSelect label="Motivo de incidencia" value={motivo} onChange={setMotivo} options={MOTIVOS_INCIDENCIA} allLabel="Todos" />
                  <FilterSelect label="Sucursal origen" value={sucursal} onChange={setSucursal} options={SUCURSALES_ORIGEN} allLabel="Todas" />
                  <FilterSelect label="Gerente de sucursal origen" value={gerente} onChange={setGerente} options={GERENTES} allLabel="Todos" />
                  <FilterSelect label="Categoría / línea" value={categoria} onChange={setCategoria} options={CATEGORIAS_INCIDENCIA} allLabel="Todas" />
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Estado de la incidencia</span>
                    <div className="relative">
                      <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100">
                        {ESTADOS.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </label>
                </div>
              )}
              {activeChips.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {activeChips.map((c) => (
                    <span key={c.label} className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 py-1 pl-2.5 pr-1 text-xs font-medium text-brand-700">
                      {c.label}
                      <button onClick={c.clear} className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-100" aria-label={`Quitar ${c.label}`}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* KPIs del canal Ecommerce */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiMini label="Incidencias de redistribución" value={kpis.total} tone="text-slate-900" />
        <KpiMini label="Devoluciones Ecommerce pendientes de resolución" value={kpis.pendientes} tone="text-amber-600" />
        <KpiMini label="Resoluciones de Compras (Ecommerce)" value={kpis.resoluciones} tone="text-emerald-600" />
        <KpiMini label="Tiempo prom. de resolución (Compras)" value={ECOMMERCE_KPIS.tiempoResolucion} tone="text-slate-900" />
      </div>

      {/* Gráficas — exclusivas del canal Ecommerce */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportCard title="Tendencia mensual de incidencias en Ecommerce" data={tendencia} filename="tendencia-mensual-incidencias">
          <TrendArea data={tendencia} />
        </ReportCard>
        <ReportCard title="Marcas con mayor incidencia en Ecommerce" data={porMarca} filename="marcas-mayor-incidencia">
          <VBars data={porMarca} color="#D32F2F" />
        </ReportCard>
        <ReportCard title="Proveedores con mayor incidencia en Ecommerce" data={porProveedor} filename="proveedores-mayor-incidencia">
          <VBars data={porProveedor} color="#6366f1" />
        </ReportCard>
        <ReportCard title="Motivos más frecuentes de incidencia" data={porMotivo} filename="motivos-mas-frecuentes">
          <PieChartCard data={porMotivo} />
        </ReportCard>
        <ProductIncidenceCard data={porProducto} />
        <BloqueadosCard rows={bloqueados} />
      </div>
    </div>
  )
}

// Widget "Productos bloqueados para Ecommerce" — lista compacta con exportación.
function BloqueadosCard({ rows }: { rows: typeof BLOQUEADOS_ECOMMERCE }) {
  return (
    <Card>
      <SectionTitle
        right={
          <ExportMenu
            filename="productos-bloqueados-ecommerce"
            title="Productos bloqueados para Ecommerce"
            columns={[
              { header: 'SKU', key: 'sku' },
              { header: 'Producto', key: 'producto' },
              { header: 'Sucursal', key: 'sucursal' },
              { header: 'Folio origen', key: 'folioOrigen' },
              { header: 'Motivo', key: 'motivo' },
              { header: 'Fecha', key: 'fecha' },
            ]}
            rows={rows.map((b) => ({ sku: b.sku, producto: b.producto, sucursal: b.sucursal, folioOrigen: b.folioOrigen, motivo: b.motivo, fecha: b.fecha }))}
          />
        }
      >
        Productos bloqueados para Ecommerce
      </SectionTitle>
      {rows.length > 0 ? (
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {rows.map((b) => (
            <div key={b.sku} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
              <img src={b.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">{b.producto}</div>
                <div className="truncate font-mono text-[11px] text-slate-500">{b.sku} · {b.sucursal}</div>
              </div>
              <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">Bloqueado</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Venta física</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-slate-400">Sin productos bloqueados en el periodo.</div>
      )}
    </Card>
  )
}

function FilterSelect({ label, value, onChange, options, allLabel }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; allLabel: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100">
          <option value="">{allLabel}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  )
}

function KpiMini({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={cn('text-2xl font-semibold tracking-tight', tone)}>{value}</span>
    </Card>
  )
}
