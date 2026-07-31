import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { PageHeader } from '../../components/AppLayout'
import { Card, BackLink, cn } from '../../lib/ui'
import { SearchBar, FilterSelect, EmptyState } from '../../lib/adminUi'

interface Cambio { id: string; usuario: string; accion: string; modulo: string; detalle: string; fecha: string; hora: string }

const HISTORIAL: Cambio[] = [
  { id: 'h1', usuario: 'Jorge Villa', accion: 'Agregó motivo', modulo: 'Motivos', detalle: '"Costura abierta"', fecha: 'Hoy', hora: '09:32' },
  { id: 'h2', usuario: 'Jorge Villa', accion: 'Editó permisos', modulo: 'Permisos', detalle: 'Rol Compras · habilitó "Autorizar"', fecha: 'Hoy', hora: '09:10' },
  { id: 'h3', usuario: 'Fernanda López', accion: 'Creó usuario', modulo: 'Usuarios', detalle: 'María Fernanda López · rol Compras', fecha: 'Ayer', hora: '17:45' },
  { id: 'h4', usuario: 'Jorge Villa', accion: 'Editó SLA', modulo: 'SLA', detalle: 'En revisión · 24 h → 20 h', fecha: 'Ayer', hora: '16:02' },
  { id: 'h5', usuario: 'Jorge Villa', accion: 'Agregó almacén', modulo: 'Catálogos', detalle: '"512 · Kelder Defectuosos textil"', fecha: '14 jul 2026', hora: '11:20' },
  { id: 'h6', usuario: 'Diana Quintero', accion: 'Desactivó usuario', modulo: 'Usuarios', detalle: 'Cuenta temporal de auditoría', fecha: '13 jul 2026', hora: '10:05' },
  { id: 'h7', usuario: 'Jorge Villa', accion: 'Eliminó resolución', modulo: 'Resoluciones', detalle: '"Nota de crédito" (obsoleta)', fecha: '12 jul 2026', hora: '15:38' },
]

const MODULOS = ['Usuarios', 'Roles', 'Permisos', 'Motivos', 'Resoluciones', 'SLA', 'Catálogos', 'Parámetros']

export default function HistorialAdmin() {
  const [q, setQ] = useState('')
  const [modulo, setModulo] = useState('')

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return HISTORIAL.filter((h) =>
      (!modulo || h.modulo === modulo) &&
      (!t || h.usuario.toLowerCase().includes(t) || h.accion.toLowerCase().includes(t) || h.detalle.toLowerCase().includes(t)),
    )
  }, [q, modulo])

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader title="Historial de cambios" subtitle="Auditoría de cambios realizados en la configuración" />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar por usuario, acción o detalle…" />
        <FilterSelect value={modulo} onChange={setModulo} allLabel="Todos los módulos" options={MODULOS.map((m) => ({ value: m, label: m }))} />
      </div>

      <Card padded={false} className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<History className="h-6 w-6" />} title="Sin registros" hint="No hay cambios que coincidan con la búsqueda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5">Usuario</th>
                  <th className="px-4 py-2.5">Acción</th>
                  <th className="px-4 py-2.5">Módulo</th>
                  <th className="px-4 py-2.5">Detalle</th>
                  <th className="px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Hora</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{h.usuario}</td>
                    <td className="px-4 py-3 text-slate-600">{h.accion}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{h.modulo}</span></td>
                    <td className={cn('px-4 py-3 text-slate-500')}>{h.detalle}</td>
                    <td className="px-4 py-3 text-slate-500">{h.fecha}</td>
                    <td className="px-4 py-3 text-slate-500">{h.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
