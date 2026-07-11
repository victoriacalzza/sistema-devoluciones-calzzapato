import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  XCircle,
  Timer,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  Gauge,
  Plus,
  Inbox,
  Truck,
  MessageSquareReply,
  Search,
  Layers,
  History,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, KpiCard, SectionTitle, StatusBadge, Avatar, Button, cn } from '../lib/ui'
import {
  byProducto,
  byProveedor,
  byMarca,
  byMotivo,
  byComprador,
  autorizacionesTrend,
  topLotes,
  CHART_COLORS,
  COMPRAS_KPIS,
  RETURNS,
  personById,
  RETURN_TYPES,
  type ReturnCase,
} from '../data/mock'
import { useRole } from '../lib/RoleContext'
import { requiresActionFrom } from '../lib/permissions'

// ---------------------------------------------------------------------------
// Helpers de presentación reutilizables
// ---------------------------------------------------------------------------

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px -8px rgb(16 24 40 / 0.18)',
  fontSize: 12,
}

function ChartCard({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <Card>
      <SectionTitle right={hint ? <span className="text-xs text-slate-500">{hint}</span> : undefined}>{title}</SectionTitle>
      <div className="h-60">{children}</div>
    </Card>
  )
}

function HBarChart({ title, data, color, hint }: { title: string; data: { name: string; value: number }[]; color: string; hint?: string }) {
  return (
    <ChartCard title={title} hint={hint}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={14} name="Casos" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/** Barras verticales — para comparativos de categorías (proveedores, marcas). */
function VBarChart({ title, data, color, hint }: { title: string; data: { name: string; value: number }[]; color: string; hint?: string }) {
  return (
    <ChartCard title={title} hint={hint}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={44} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} barSize={26} name="Devoluciones" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/** Pastel (pie) — para composición (motivos más frecuentes). */
function PieChartCard({ title, data, hint }: { title: string; data: { name: string; value: number }[]; hint?: string }) {
  return (
    <ChartCard title={title} hint={hint}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius="72%" paddingAngle={1}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/** Área — serie temporal (autorizaciones por día). */
function AreaTrend({ title, data, hint }: { title: string; data: { name: string; value: number }[]; hint?: string }) {
  return (
    <ChartCard title={title} hint={hint}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="autoriz" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#autoriz)" name="Autorizaciones" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/** Lista compacta de expedientes — el widget accionable base de la operación. */
function CaseListCard({
  title,
  icon,
  cases,
  emptyText,
  onSeeAll,
}: {
  title: string
  icon?: React.ReactNode
  cases: ReturnCase[]
  emptyText: string
  onSeeAll?: () => void
}) {
  const navigate = useNavigate()
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-500">{icon}</span>}
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{cases.length}</span>
        </div>
        {onSeeAll && (
          <Button size="sm" variant="ghost" icon={<ArrowRight className="h-4 w-4" />} onClick={onSeeAll}>
            Ver todas
          </Button>
        )}
      </div>
      <div className="divide-y divide-slate-50 border-t border-slate-100">
        {cases.map((r) => {
          const resp = personById(r.responsableId)
          return (
            <button
              key={r.folio}
              onClick={() => navigate(`/devoluciones/${r.folio}`)}
              className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-slate-50"
            >
              <img src={r.product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-900">{r.folio}</span>
                  <span className="text-xs text-slate-500">{RETURN_TYPES[r.tipo].short}</span>
                  {r.outOfSla && (
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">Fuera de SLA</span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500">{r.product.descripcion}</p>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-xs text-slate-500">{r.sucursal}</div>
                <div className="text-[11px] text-slate-500">{r.motivo}</div>
              </div>
              <StatusBadge status={r.status} />
              <Avatar person={resp} size="sm" />
            </button>
          )
        })}
        {cases.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-500">{emptyText}</div>}
      </div>
    </Card>
  )
}

/** Tabla de lotes con mayor incidencia (análisis operativo de Compras). */
function LotesCard() {
  const navigate = useNavigate()
  return (
    <Card>
      <SectionTitle
        icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        right={<Button size="sm" variant="ghost" onClick={() => navigate('/reportes')}>Ver reporte</Button>}
      >
        Lotes con mayor incidencia
      </SectionTitle>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-3 py-2">Lote</th>
              <th className="px-3 py-2">Marca</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2 text-right">Incid.</th>
              <th className="px-3 py-2 text-right">Tasa</th>
            </tr>
          </thead>
          <tbody>
            {topLotes.map((l) => (
              <tr key={l.lote} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-mono text-xs font-medium text-slate-900">{l.lote}</td>
                <td className="px-3 py-2.5 text-slate-600">{l.marca}</td>
                <td className="px-3 py-2.5 text-slate-500">{l.proveedor}</td>
                <td className="px-3 py-2.5 text-right font-medium text-slate-900">{l.incidencias}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">{l.tasa}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/** Feed de actividad reciente — "lo que ha pasado" en los expedientes. */
const ACTIVITY_DOT: Record<string, string> = {
  create: 'bg-brand-600',
  attach: 'bg-sky-500',
  comment: 'bg-amber-500',
  status: 'bg-emerald-500',
  transfer: 'bg-violet-500',
  receive: 'bg-teal-500',
}

function RecentActivity({ cases }: { cases: ReturnCase[] }) {
  const navigate = useNavigate()
  const items = cases.slice(0, 7).map((r) => ({ ev: r.timeline[r.timeline.length - 1], folio: r.folio }))
  if (items.length === 0) return null
  return (
    <Card padded={false}>
      <div className="px-5 py-4">
        <SectionTitle icon={<History className="h-4 w-4" />}>Actividad reciente</SectionTitle>
      </div>
      <div className="divide-y divide-slate-50 border-t border-slate-100">
        {items.map(({ ev, folio }) => (
          <button
            key={folio}
            onClick={() => navigate(`/devoluciones/${folio}`)}
            className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-slate-50"
          >
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', ACTIVITY_DOT[ev.kind])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">{ev.actor}</span> {ev.text}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-mono font-medium text-slate-500">{folio}</span>
                <span>·</span>
                <span>{ev.date} · {ev.time}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}

/** Tarjeta de acción del portal de Tienda / Ecommerce — grande, con badge opcional. */
function ActionCard({
  title,
  desc,
  icon,
  onClick,
  primary,
  badge,
}: {
  title: string
  desc: string
  icon: React.ReactNode
  onClick: () => void
  primary?: boolean
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
        primary ? 'border-brand-200 bg-brand-50 hover:bg-brand-100' : 'border-slate-200 bg-white hover:bg-slate-50',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            primary ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600',
          )}
        >
          {icon}
        </span>
        {badge !== undefined && badge > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-600 px-2 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className={cn('text-base font-semibold', primary ? 'text-brand-700' : 'text-slate-900')}>{title}</div>
        <div className="mt-0.5 text-sm text-slate-500">{desc}</div>
      </div>
      <ArrowRight
        className={cn(
          'absolute bottom-5 right-5 h-4 w-4 transition-transform group-hover:translate-x-0.5',
          primary ? 'text-brand-500' : 'text-slate-300',
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Portal operativo de TIENDA / ECOMMERCE — sin ERP, enfocado en operación.
// Vistas: Nueva devolución · Mis devoluciones · Pendientes de información ·
// Casos en tránsito · Casos rechazados.
// ---------------------------------------------------------------------------

function OperationalPortal({ channel }: { channel: 'tienda' | 'ecommerce' }) {
  const navigate = useNavigate()
  const { user, role } = useRole()

  const sucursal = user.role.includes('·') ? user.role.split('·')[1].trim() : ''
  const firstName = user.name.split(' ')[0]
  // Ecommerce ve los expedientes del canal en línea; Tienda los de su sucursal.
  const mine =
    channel === 'ecommerce'
      ? RETURNS.filter((r) => r.tipo === 'ecommerce')
      : RETURNS.filter((r) => r.sucursal === sucursal || r.creadorId === user.id)

  const pendientes = mine.filter((r) => requiresActionFrom(role, r))
  const infoPend = mine.filter((r) => r.status === 'esperando')
  const enTransito = mine.filter((r) => r.status === 'transito' || r.status === 'recibido')
  const rechazadas = mine.filter((r) => r.status === 'rechazado')

  const scopeLabel = channel === 'ecommerce' ? 'canal Ecommerce' : sucursal || 'tu sucursal'

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hola, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Portal de devoluciones · {scopeLabel}</p>
      </div>

      {/* Vistas principales — cada tarjeta abre una pantalla con todos los casos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard primary title="Nueva devolución" desc="Registra un nuevo expediente" icon={<Plus className="h-6 w-6" />} onClick={() => navigate('/nueva')} />
        <ActionCard title="Mis devoluciones" desc="Todos tus expedientes" icon={<Search className="h-6 w-6" />} onClick={() => navigate('/devoluciones')} />
        <ActionCard title="Mis pendientes" desc="Requieren tu acción" icon={<Inbox className="h-6 w-6" />} badge={pendientes.length} onClick={() => navigate('/pendientes')} />
        <ActionCard title="Pendientes de información" desc="Compras te pidió datos" icon={<MessageSquareReply className="h-6 w-6" />} badge={infoPend.length} onClick={() => navigate('/devoluciones?status=esperando')} />
        <ActionCard title="Casos en tránsito" desc="Mercancía hacia CEDIS" icon={<Truck className="h-6 w-6" />} badge={enTransito.length} onClick={() => navigate('/devoluciones?status=transito')} />
        <ActionCard title="Casos rechazados" desc="Devoluciones no procedentes" icon={<XCircle className="h-6 w-6" />} badge={rechazadas.length} onClick={() => navigate('/devoluciones?status=rechazado')} />
      </div>

      {/* Lo que ha pasado en tus expedientes */}
      <div className="mt-8">
        <RecentActivity cases={mine} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard OPERATIVO de Compras — orientado a la toma de decisiones.
// KPIs de operación + análisis de incidencias. Sin comparativos por sucursal,
// KPIs financieros ni tendencias corporativas.
// ---------------------------------------------------------------------------

function ComprasDashboard() {
  const navigate = useNavigate()
  const porAutorizar = RETURNS.filter((r) => r.status === 'revision' && r.tipo !== 'redistribucion')

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Dashboard operativo"
        subtitle="Prioriza autorizaciones y detecta incidencias · Compras"
        actions={
          <Button size="sm" variant="ghost" icon={<Sparkles className="h-4 w-4 text-brand-600" />} onClick={() => navigate('/reportes')}>
            Ver reportes
          </Button>
        }
      />

      {/* KPIs operativos */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Pendientes de autorización" value={COMPRAS_KPIS.porAutorizar} accent="warning" icon={<ClipboardCheck className="h-4 w-4" />} />
        <KpiCard label="Solicitudes de información" value={COMPRAS_KPIS.solicitudesAbiertas} hint="Abiertas" icon={<MessageSquareReply className="h-4 w-4" />} />
        <KpiCard label="Críticos próximos a SLA" value={COMPRAS_KPIS.criticosSla} accent="danger" icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="Tiempo prom. autorización" value={COMPRAS_KPIS.tiempoAutorizacion} icon={<Timer className="h-4 w-4" />} />
        <KpiCard label="Cumplimiento SLA Compras" value={`${COMPRAS_KPIS.cumplimientoSla}%`} accent="success" icon={<Gauge className="h-4 w-4" />} />
        <KpiCard label="Devoluciones masivas activas" value={COMPRAS_KPIS.masivasActivas} icon={<Layers className="h-4 w-4" />} />
      </div>

      {/* Bandeja de autorización — lo más accionable, justo debajo de los KPIs */}
      <div className="mt-4">
        <CaseListCard
          title="Pendientes de tu autorización"
          icon={<ClipboardCheck className="h-4 w-4" />}
          cases={porAutorizar}
          emptyText="No hay casos esperando autorización. 🎉"
          onSeeAll={() => navigate('/pendientes')}
        />
      </div>

      {/* Análisis operativos — mezcla de gráficas según el tipo de dato */}
      <div className="mt-6 mb-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">Análisis operativos</div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <HBarChart title="Productos con mayor incidencia" data={byProducto} color="#D32F2F" hint="Ranking" />
        <PieChartCard title="Motivos más frecuentes" data={byMotivo} hint="Composición" />
        <AreaTrend title="Autorizaciones por día" data={autorizacionesTrend} hint="Últimos 7 días" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <VBarChart title="Proveedores con más devoluciones" data={byProveedor} color="#f59e0b" />
        <VBarChart title="Marcas con más devoluciones" data={byMarca} color="#0ea5e9" />
        <HBarChart title="Compradores con mayor carga" data={byComprador} color="#8b5cf6" hint="Expedientes abiertos" />
      </div>
      <div className="mt-4">
        <LotesCard />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { role } = useRole()
  if (role === 'tienda') return <OperationalPortal channel="tienda" />
  if (role === 'ecommerce') return <OperationalPortal channel="ecommerce" />
  return <ComprasDashboard />
}
