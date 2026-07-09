import { useState } from 'react'
import { Building2, Tags, Truck, ListChecks, Plus, Search } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Button, cn } from '../lib/ui'
import { SUCURSALES, MARCAS, PROVEEDORES, CATEGORIAS, MOTIVOS } from '../data/mock'

const TABS = [
  { key: 'sucursales', label: 'Sucursales', icon: Building2, data: SUCURSALES },
  { key: 'marcas', label: 'Marcas', icon: Tags, data: MARCAS },
  { key: 'proveedores', label: 'Proveedores', icon: Truck, data: PROVEEDORES },
  { key: 'categorias', label: 'Categorías', icon: ListChecks, data: CATEGORIAS },
  { key: 'motivos', label: 'Motivos', icon: ListChecks, data: MOTIVOS },
] as const

export default function Catalogs() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('sucursales')
  const active = TABS.find((t) => t.key === tab)!

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Catálogos"
        subtitle="Administra las listas maestras del sistema"
        actions={<Button size="sm" variant="primary" icon={<Plus className="h-4 w-4" />}>Agregar</Button>}
      />

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex gap-2 overflow-x-auto lg:w-52 lg:flex-col">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  tab === t.key ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
                <span className="ml-auto hidden text-xs text-slate-400 lg:inline">{t.data.length}</span>
              </button>
            )
          })}
        </div>

        <Card className="flex-1" padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder={`Buscar en ${active.label.toLowerCase()}…`} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <span className="text-xs text-slate-400">{active.data.length} registros</span>
          </div>
          <ul className="divide-y divide-slate-50">
            {active.data.map((item, i) => (
              <li key={item} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">{i + 1}</span>
                <span className="flex-1 text-sm text-slate-800">{item}</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Activo</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
