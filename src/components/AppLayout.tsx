import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Plus,
  ListChecks,
  Layers,
  BarChart3,
  BookOpen,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ArrowLeft,
  UserPlus,
  MessageSquareWarning,
  Truck,
  PackageCheck,
  ChevronDown,
} from 'lucide-react'
import { Avatar, Button, cn } from '../lib/ui'
import { KelderLogo } from './KelderLogo'
import { NOTIFICATIONS, DEMO_PERSONAS } from '../data/mock'
import { useRole } from '../lib/RoleContext'
import { canSeeNav, type NavKey } from '../lib/permissions'

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; key: NavKey; end?: boolean; highlight?: boolean }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard', end: true },
  { to: '/devoluciones', label: 'Devoluciones', icon: Inbox, key: 'devoluciones' },
  { to: '/nueva', label: 'Nueva devolución', icon: Plus, key: 'nueva', highlight: true },
  { to: '/pendientes', label: 'Mis pendientes', icon: ListChecks, key: 'pendientes' },
  { to: '/masivas', label: 'Devoluciones masivas', icon: Layers, key: 'masivas' },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, key: 'reportes' },
  { to: '/catalogos', label: 'Catálogos', icon: BookOpen, key: 'catalogos' },
  { to: '/configuracion', label: 'Configuración', icon: Settings, key: 'configuracion' },
]

const NOTIF_ICON = {
  assign: UserPlus,
  info: MessageSquareWarning,
  transfer: Truck,
  mass: PackageCheck,
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role, admin } = useRole()
  const visibleNav = NAV.filter((item) => canSeeNav(role, item.key, admin))
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <KelderLogo className="h-8 w-auto" />
        <div className="mt-1.5 text-[11px] font-medium text-slate-400">Sistema de Devoluciones</div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {visibleNav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  item.highlight && 'mt-1',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-[18px] w-[18px]', item.highlight && !isActive && 'text-brand-600')} />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <RoleSwitcher />
      </div>
    </div>
  )
}

function RoleSwitcher({ dropUp = true }: { dropUp?: boolean }) {
  const { user, setPersona } = useRole()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
      >
        <Avatar person={user} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-medium text-slate-900">{user.name}</div>
          <div className="truncate text-[11px] text-slate-400">{user.role}</div>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop',
              dropUp ? 'bottom-full left-0 mb-2 w-full' : 'right-0 top-full mt-2 w-64',
            )}
          >
            <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Cambiar de rol (demo)
            </div>
            {DEMO_PERSONAS.map((p) => {
              const activo = p.id === user.id
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPersona(p)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50',
                    activo && 'bg-brand-50',
                  )}
                >
                  <Avatar person={p} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-800">{p.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{p.role}</div>
                  </div>
                  {activo && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-12 z-40 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-sm font-semibold text-slate-900">Notificaciones</span>
          <button className="text-xs font-medium text-brand-600 hover:underline">Marcar todas leídas</button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {NOTIFICATIONS.map((n) => {
            const Icon = NOTIF_ICON[n.icon]
            return (
              <button
                key={n.id}
                onClick={() => {
                  if (n.folio) navigate(`/devoluciones/${n.folio}`)
                  onClose()
                }}
                className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    n.unread ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm', n.unread ? 'font-medium text-slate-900' : 'text-slate-600')}>{n.text}</p>
                  <span className="text-[11px] text-slate-400">{n.time}</span>
                </div>
                {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Portal de Tienda — SIN barra lateral. Un colaborador de sucursal entra a un
// portal de seguimiento: encabezado simple + contenido. La navegación vive en
// las tarjetas del portal, no en un menú ERP.
// ---------------------------------------------------------------------------

function PortalLayout({ children }: { children: React.ReactNode }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const unread = NOTIFICATIONS.filter((n) => n.unread).length
  const onHome = location.pathname === '/'

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50">
      <header className="relative z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <KelderLogo className="h-8 w-auto" />
          <span className="hidden text-[11px] font-medium text-slate-400 sm:inline">Portal de devoluciones</span>
        </button>

        {!onHome && (
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/')}>
            <span className="hidden sm:inline">Inicio</span>
          </Button>
        )}

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>
          <div className="w-52">
            <RoleSwitcher dropUp={false} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout ERP de Compras — barra lateral completa + topbar.
// ---------------------------------------------------------------------------

function ErpLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { user } = useRole()
  const unread = NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-pop">
            <button className="absolute right-3 top-4 text-slate-400" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
          <button className="text-slate-500 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar folio, cliente, SKU…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>
            <div className="lg:hidden">
              <Avatar person={user} size="sm" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { role } = useRole()
  // Canales operativos (Tienda y Ecommerce) usan el portal simple; Compras el ERP.
  return role === 'compras' ? <ErpLayout>{children}</ErpLayout> : <PortalLayout>{children}</PortalLayout>
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
