import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button, cn } from '../lib/ui'
import { exportExcel, exportPDF, type ExportColumn } from '../lib/export'

interface ExportMenuProps {
  filename: string
  title: string
  columns: ExportColumn[]
  rows: Record<string, string | number>[]
  label?: string
  size?: 'sm' | 'md'
}

/** Botón "Exportar" con menú de formatos (Excel .xlsx / PDF .pdf). */
export function ExportMenu({ filename, title, columns, rows, label = 'Exportar', size = 'sm' }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'excel' | 'pdf' | null>(null)

  async function run(fmt: 'excel' | 'pdf') {
    setBusy(fmt)
    try {
      const opts = { filename, title, columns, rows }
      if (fmt === 'excel') await exportExcel(opts)
      else await exportPDF(opts)
    } finally {
      setBusy(null)
      setOpen(false)
    }
  }

  const disabled = rows.length === 0

  return (
    <div className="relative">
      <Button
        size={size}
        variant="secondary"
        icon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || busy !== null}
      >
        {label}
      </Button>
      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
            <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Exportar {rows.length} registros
            </div>
            {([
              { fmt: 'excel', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> },
              { fmt: 'pdf', label: 'PDF (.pdf)', icon: <FileText className="h-4 w-4 text-brand-600" /> },
            ] as const).map((o) => (
              <button
                key={o.fmt}
                onClick={() => run(o.fmt)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50',
                  busy === o.fmt && 'opacity-60',
                )}
              >
                {busy === o.fmt ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : o.icon}
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
