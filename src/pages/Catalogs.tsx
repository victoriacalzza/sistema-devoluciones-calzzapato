import { useState } from 'react'
import { Building2, Tags, Truck, ListChecks, Plus, Search, UserSquare2, Warehouse } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, Avatar, Button, cn } from '../lib/ui'
import { SUCURSALES, MARCAS, PROVEEDORES, CATEGORIAS, MOTIVOS, AGRUPACIONES, ALMACENES, CATALOGO_CLM, personById } from '../data/mock'

const LIST_TABS = [
  { key: 'compradores', label: 'Agrupación · Línea · Marca', icon: UserSquare2, count: CATALOGO_CLM.length },
  { key: 'agrupaciones', label: 'Agrupaciones de línea', icon: ListChecks, data: AGRUPACIONES },
  { key: 'almacenes', label: 'Almacenes destino', icon: Warehouse, count: ALMACENES.length },
  { key: 'sucursales', label: 'Sucursales', icon: Building2, data: SUCURSALES },
  { key: 'marcas', label: 'Marcas', icon: Tags, data: MARCAS },
  { key: 'proveedores', label: 'Proveedores', icon: Truck, data: PROVEEDORES },
  { key: 'categorias', label: 'Categorías', icon: ListChecks, data: CATEGORIAS },
  { key: 'motivos', label: 'Motivos', icon: ListChecks, data: MOTIVOS },
] as const

type TabKey = (typeof LIST_TABS)[number]['key']

export default function Catalogs() {
  const [tab, setTab] = useState<TabKey>('compradores')
  const active = LIST_TABS.find((t) => t.key === tab)!
  const count = 'data' in active ? active.data.length : active.count

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Catálogos"
        subtitle="Administra las listas maestras del sistema"
        actions={<Button size="sm" variant="primary" icon={<Plus className="h-4 w-4" />}>Agregar</Button>}
      />

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col">
          {LIST_TABS.map((t) => {
            const Icon = t.icon
            const n = 'data' in t ? t.data.length : t.count
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
                <span className="ml-auto hidden text-xs text-slate-500 lg:inline">{n}</span>
              </button>
            )
          })}
        </div>

        <Card className="flex-1" padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input placeholder={`Buscar en ${active.label.toLowerCase()}…`} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <span className="text-xs text-slate-500">{count} registros</span>
          </div>

          {/* Catálogo Comprador · Línea · Marca — base de la asignación automática */}
          {tab === 'compradores' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                    <th className="px-4 py-2.5">Agrupación</th>
                    <th className="px-4 py-2.5">Línea</th>
                    <th className="px-4 py-2.5">Marca</th>
                    <th className="px-4 py-2.5">Proveedor</th>
                    <th className="px-4 py-2.5">Comprador responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {CATALOGO_CLM.map((r, i) => {
                    const c = personById(r.compradorId)
                    return (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{r.agrupacion}</span></td>
                        <td className="px-4 py-3 text-slate-700">{r.linea}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{r.marca}</td>
                        <td className="px-4 py-3 text-slate-500">{r.proveedor}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 text-slate-700"><Avatar person={c} size="sm" /> {c.name}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : tab === 'almacenes' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                    <th className="px-4 py-2.5">Tipo de almacén</th>
                    <th className="px-4 py-2.5">Línea de mercancía</th>
                    <th className="px-4 py-2.5">Nombre</th>
                    <th className="px-4 py-2.5">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {ALMACENES.map((a, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-medium text-slate-900"><Warehouse className="h-4 w-4 text-slate-400" /> {a.tipo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', a.linea === 'General' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700')}>{a.linea}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{a.nombre}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Activo</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {'data' in active &&
                active.data.map((item, i) => (
                  <li key={item} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">{i + 1}</span>
                    <span className="flex-1 text-sm text-slate-800">{item}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Activo</span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
