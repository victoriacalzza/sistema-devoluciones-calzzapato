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
  Package,
  Clock,
  CheckCircle2,
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
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, KpiCard, SectionTitle, StatusBadge, Avatar, Button, cn } from '../lib/ui'
import {
  KPIS,
  byType,
  bySucursal,
  byMotivo,
  trend,
  topLotes,
  CHART_COLORS,
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
      <SectionTitle right={hint ? <span className="text-xs text-slate-400">{hint}</span> : undefined}>{title}</SectionTitle>
      <div className="h-56">{children}</div>
    </Card>
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
          {icon && <span className="text-slate-400">{icon}</span>}
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
                  <span className="text-xs text-slate-400">{RETURN_TYPES[r.tipo].short}</span>
                  {r.outOfSla && (
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">Fuera de SLA</span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500">{r.product.descripcion}</p>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-xs text-slate-500">{r.sucursal}</div>
                <div className="text-[11px] text-slate-400">{r.motivo}</div>
              </div>
              <StatusBadge status={r.status} />
              <Avatar person={resp} size="sm" />
            </button>
          )
        })}
        {cases.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-400">{emptyText}</div>}
      </div>
    </Card>
  )
}

/** Tabla de lotes/proveedor con mayor incidencia (dato comercial). */
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

// --- Gráficas factorizadas ---

function TrendChart() {
  return (
    <ChartCard title="Tendencia mensual" hint="Últimos 7 meses">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#D32F2F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="value" stroke="#D32F2F" strokeWidth={2.5} fill="url(#g1)" name="Devoluciones" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function TypePie() {
  return (
    <ChartCard title="Devoluciones por tipo">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
            {byType.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function HBarChart({ title, data, color, hint }: { title: string; data: { name: string; value: number }[]; color: string; hint?: string }) {
  return (
    <ChartCard title={title} hint={hint}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={110} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={14} name="Casos" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function SucursalChart() {
  return (
    <ChartCard title="Comparativo por sucursal">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bySucursal} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={44} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="value" fill="#D32F2F" radius={[6, 6, 0, 0]} barSize={26} name="Devoluciones" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/** Tarjeta de acción del portal de Tienda — grande, con icono, descripción y badge opcional. */
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
        primary
          ? 'border-brand-200 bg-brand-50 hover:bg-brand-100'
          : 'border-slate-200 bg-white hover:bg-slate-50',
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
// Portal de TIENDA (sucursal).
// NO es un dashboard tipo ERP: es un portal operativo simplificado, sin barra
// lateral. Las acciones principales viven en tarjetas grandes; debajo, el
// seguimiento de sus expedientes. Pensado para usarse sin capacitación.
// ---------------------------------------------------------------------------

function TiendaPortal() {
  const navigate = useNavigate()
  const { user } = useRole()

  // Alcance: expedientes de su sucursal o creados por él/ella.
  const sucursal = user.role.includes('·') ? user.role.split('·')[1].trim() : ''
  const firstName = user.name.split(' ')[0]
  const mine = RETURNS.filter((r) => r.sucursal === sucursal || r.creadorId === user.id)

  const pendientes = mine.filter((r) => requiresActionFrom('tienda', r))
  const solicitudes = mine.filter((r) => r.status === 'esperando')
  const autorizadas = mine.filter((r) => r.status === 'autorizado' || r.status === 'pendiente_traslado')
  const enTransito = mine.filter((r) => r.status === 'transito' || r.status === 'recibido')
  const rechazadas = mine.filter((r) => r.status === 'rechazado')

  const scrollToSolicitudes = () =>
    document.getElementById('solicitudes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8 lg:px-6">
      {/* Saludo */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hola, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Portal de devoluciones · {sucursal || 'tu sucursal'}</p>
      </div>

      {/* Acciones principales — el corazón del portal */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ActionCard
          primary
          title="Crear devolución"
          desc="Registra un nuevo expediente"
          icon={<Plus className="h-6 w-6" />}
          onClick={() => navigate('/nueva')}
        />
        <ActionCard
          title="Consultar devolución"
          desc="Busca y da seguimiento a tus expedientes"
          icon={<Search className="h-6 w-6" />}
          onClick={() => navigate('/devoluciones')}
        />
        <ActionCard
          title="Mis pendientes"
          desc="Casos que requieren tu acción"
          icon={<Inbox className="h-6 w-6" />}
          badge={pendientes.length}
          onClick={() => navigate('/pendientes')}
        />
        <ActionCard
          title="Responder solicitudes"
          desc="Información que Compras te pidió"
          icon={<MessageSquareReply className="h-6 w-6" />}
          badge={solicitudes.length}
          onClick={scrollToSolicitudes}
        />
      </div>

      {/* Resumen de seguimiento — compacto, sin datos corporativos */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <KpiCard label="Autorizadas" value={autorizadas.length} accent="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <KpiCard label="En tránsito" value={enTransito.length} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Rechazadas" value={rechazadas.length} icon={<XCircle className="h-4 w-4" />} />
      </div>

      {/* Solicitudes de información — donde Tienda responde a Compras */}
      <div id="solicitudes" className="mt-8 scroll-mt-24">
        <CaseListCard
          title="Solicitudes de información"
          icon={<MessageSquareReply className="h-4 w-4" />}
          cases={solicitudes}
          emptyText="No tienes solicitudes pendientes de responder. 🎉"
        />
      </div>

      {/* Mis pendientes */}
      <div className="mt-4">
        <CaseListCard
          title="Mis pendientes"
          icon={<Inbox className="h-4 w-4" />}
          cases={pendientes}
          emptyText="No tienes casos que requieran tu acción. 🎉"
          onSeeAll={() => navigate('/pendientes')}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard ejecutivo de COMPRAS (corporativo).
// KPIs globales, gráficas estratégicas y bandeja de autorización.
// ---------------------------------------------------------------------------

function ComprasDashboard() {
  const navigate = useNavigate()

  const porAutorizar = RETURNS.filter((r) => r.status === 'revision' && r.tipo !== 'redistribucion')
  const slaPct = Math.round(((KPIS.total - KPIS.fueraSla) / KPIS.total) * 100)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Dashboard ejecutivo"
        subtitle="Indicadores de devoluciones en tiempo real · Grupo Calzzapato"
        actions={
          <Button size="sm" variant="ghost" icon={<Sparkles className="h-4 w-4 text-brand-600" />} onClick={() => navigate('/reportes')}>
            Ver reportes
          </Button>
        }
      />

      {/* KPIs ejecutivos corporativos */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total de devoluciones" value={KPIS.total} hint="Julio 2026" icon={<Package className="h-4 w-4" />} />
        <KpiCard label="Pendientes" value={KPIS.pendientes} hint="En proceso" accent="warning" icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Autorizadas" value={KPIS.autorizadas} hint="53% del total" accent="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <KpiCard label="Rechazadas" value={KPIS.rechazadas} hint="9% del total" icon={<XCircle className="h-4 w-4" />} />
        <KpiCard label="Cumplimiento SLA" value={`${slaPct}%`} hint="Meta: 95%" accent="success" icon={<Gauge className="h-4 w-4" />} />
        <KpiCard label="Tiempo prom. resolución" value={KPIS.tiempoPromedio} hint="Meta: 2 días" icon={<Timer className="h-4 w-4" />} />
      </div>

      {/* Gráficas ejecutivas */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TrendChart />
        <TypePie />
        <HBarChart title="Devoluciones por motivo" data={byMotivo} color="#6366f1" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SucursalChart />
        <LotesCard />
      </div>

      {/* Bandeja de autorización */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Tu operación · Compras
        </div>
        <CaseListCard
          title="Pendientes de tu autorización"
          icon={<ClipboardCheck className="h-4 w-4" />}
          cases={porAutorizar}
          emptyText="No hay casos esperando autorización. 🎉"
          onSeeAll={() => navigate('/pendientes')}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { role } = useRole()
  return role === 'tienda' ? <TiendaPortal /> : <ComprasDashboard />
}
