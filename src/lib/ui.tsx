import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import {
  STATUSES,
  PRIORITIES,
  type StatusKey,
  type PriorityKey,
  type Person,
} from '../data/mock'

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

/**
 * Única acción de regreso contextual de la pantalla. Se coloca arriba del título.
 * `label` es el texto completo (ej. "Volver a Mis devoluciones" / "Volver al inicio").
 */
export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mb-3 inline-flex items-center gap-1 rounded text-sm font-medium text-slate-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
    >
      <ChevronLeft className="h-4 w-4" /> {label}
    </Link>
  )
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-card',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  icon,
  children,
  right,
}: {
  icon?: ReactNode
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-500">{icon}</span>}
        <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
      </div>
      {right}
    </div>
  )
}

export function StatusBadge({ status, className }: { status: StatusKey; className?: string }) {
  const s = STATUSES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        s.bg,
        s.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: PriorityKey }) {
  const p = PRIORITIES[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        p.bg,
        p.text,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', p.dot)} />
      {p.label}
    </span>
  )
}

export function Avatar({ person, size = 'md' }: { person: Person; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        person.color,
        dims,
      )}
      title={`${person.name} · ${person.role}`}
    >
      {person.initials}
    </span>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  onClick,
  type = 'button',
  disabled,
}: {
  children?: ReactNode
  variant?: BtnVariant
  size?: 'sm' | 'md'
  icon?: ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, sizes, variants[variant], className)}
    >
      {icon}
      {children}
    </button>
  )
}

export function Pill({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-brand-200 bg-brand-50 text-brand-700'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  )
}

export function KpiCard({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string
  value: string | number
  hint?: string
  accent?: 'default' | 'danger' | 'success' | 'warning'
  icon?: ReactNode
}) {
  const accents = {
    default: 'text-slate-900',
    danger: 'text-brand-600',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
  }
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      <span className={cn('text-2xl font-semibold tracking-tight', accents[accent ?? 'default'])}>{value}</span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </Card>
  )
}
