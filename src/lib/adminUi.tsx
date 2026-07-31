import { useEffect, useState, type ReactNode } from 'react'
import { X, Plus, AlertTriangle, CheckCircle2, Search } from 'lucide-react'
import { cn, Button } from './ui'

// ---------------------------------------------------------------------------
// Primitivos del módulo de Configuración — Drawer, Modal, Confirm, Toast, etc.
// Estilo: tarjetas blancas, borde #E5E7EB, radio 16px, transiciones de 150 ms.
// ---------------------------------------------------------------------------

/** Botón de creación destacado (rojo corporativo), para la esquina superior derecha. */
export function CreateButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onClick}>{label}</Button>
  )
}

/** Botón de acción por ícono, con tooltip nativo. */
export function IconAction({ icon, label, onClick, danger, disabled }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40',
        danger && 'hover:bg-rose-50 hover:text-rose-600',
      )}
    >
      {icon}
    </button>
  )
}

/** Barra de búsqueda. */
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Buscar…'}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 transition-all duration-150 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

/** Select compacto para filtros. */
export function FilterSelect({ value, onChange, options, allLabel }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; allLabel: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 transition-all duration-150 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
    >
      <option value="">{allLabel}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

/** Panel lateral (Drawer) que entra desde la derecha. */
export function Drawer({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 transition-opacity duration-150" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

/** Modal centrado. */
export function Modal({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        {children}
        {footer && <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

/** Confirmación de acción destructiva. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: { open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-6" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600"><AlertTriangle className="h-5 w-5" /></span>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel ?? 'Eliminar'}</Button>
        </div>
      </div>
    </div>
  )
}

/** Toast efímero (bottom-right). Se auto-descarta a los 2.5 s. */
export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [text, onDone])
  if (!text) return null
  return (
    <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-pop">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {text}
    </div>
  )
}

/** Hook de toast simple. */
export function useToast() {
  const [text, setText] = useState('')
  return { text, show: (t: string) => setText(t), clear: () => setText(''), node: <Toast text={text} onDone={() => setText('')} /> }
}

/** Estado vacío estándar. */
export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">{icon}</span>
      <div className="text-sm font-medium text-slate-700">{title}</div>
      {hint && <div className="max-w-sm text-xs text-slate-500">{hint}</div>}
    </div>
  )
}

/** Campo de formulario reutilizable. */
export const adminInputCls =
  'w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm placeholder:text-slate-400 transition-all duration-150 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100'

export function AdminField({ label, req, full, children }: { label: string; req?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <label className={cn('block', full && 'sm:col-span-2')}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}{req && <span className="ml-0.5 text-brand-600">*</span>}</span>
      {children}
    </label>
  )
}
