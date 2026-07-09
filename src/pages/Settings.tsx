import { ShieldCheck, Bell, Users, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, SectionTitle, Avatar, cn } from '../lib/ui'
import { PEOPLE } from '../data/mock'

const ROLES = [
  { role: 'Tienda', perms: 'Registrar expedientes, adjuntar evidencias, dar seguimiento y responder solicitudes' },
  { role: 'Compras', perms: 'Revisar, autorizar/rechazar, gestionar masivas, devolver a proveedor y cerrar' },
]

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', on ? 'bg-brand-600' : 'bg-slate-200')}>
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', on ? 'translate-x-4' : 'translate-x-0.5')} />
    </span>
  )
}

export default function Settings() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-8">
      <PageHeader title="Configuración" subtitle="Preferencias del sistema, roles y notificaciones" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={<Users className="h-4 w-4" />}>Roles y permisos</SectionTitle>
          <ul className="divide-y divide-slate-50">
            {ROLES.map((r) => (
              <li key={r.role} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{r.role}</div>
                  <div className="text-xs text-slate-400">{r.perms}</div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Configurar</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle icon={<Users className="h-4 w-4" />}>Equipo</SectionTitle>
            <ul className="space-y-3">
              {PEOPLE.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <Avatar person={p} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">{p.name}</div>
                    <div className="truncate text-xs text-slate-400">{p.role}</div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Activo</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle icon={<Bell className="h-4 w-4" />}>Notificaciones</SectionTitle>
            <ul className="space-y-3 text-sm">
              {[
                ['Asignación de expedientes', true],
                ['Solicitudes de información', true],
                ['Traslados recibidos', true],
                ['Resumen diario por correo', false],
                ['Alertas de SLA', true],
              ].map(([label, on]) => (
                <li key={label as string} className="flex items-center justify-between">
                  <span className="text-slate-700">{label}</span>
                  <Toggle on={on as boolean} />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle icon={<SlidersHorizontal className="h-4 w-4" />}>Reglas de SLA</SectionTitle>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2 text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Resolución objetivo</span>
              <span className="font-semibold text-slate-900">48 horas</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
