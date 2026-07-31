import { useNavigate } from 'react-router-dom'
import {
  Users, Shield, KeyRound, Timer, UserCog, Settings2, History, ArrowRight,
} from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { cn } from '../lib/ui'

// ---------------------------------------------------------------------------
// Dashboard de Configuración — tarjetas grandes agrupadas por categoría.
// Estilo Linear / Shopify Admin / Notion. Cada tarjeta es completamente clickeable.
// ---------------------------------------------------------------------------

type CardDef = { key: string; icon: typeof Users; title: string; desc: string }

const GROUPS: { group: string; cards: CardDef[] }[] = [
  {
    group: 'Seguridad',
    cards: [
      { key: 'usuarios', icon: Users, title: 'Usuarios', desc: 'Administrar usuarios con acceso al sistema.' },
      { key: 'roles', icon: Shield, title: 'Roles', desc: 'Administrar roles y permisos.' },
      { key: 'permisos', icon: KeyRound, title: 'Permisos', desc: 'Configurar permisos por módulo.' },
    ],
  },
  {
    group: 'Operación',
    cards: [
      { key: 'sla', icon: Timer, title: 'SLA', desc: 'Administrar tiempos máximos por etapa.' },
      { key: 'compradores', icon: UserCog, title: 'Compradores y asignaciones', desc: 'Administrar compradores, agrupaciones, líneas, marcas y reasignaciones.' },
    ],
  },
  {
    group: 'Sistema',
    cards: [
      { key: 'parametros', icon: Settings2, title: 'Parámetros', desc: 'Configurar el comportamiento general del sistema.' },
    ],
  },
  {
    group: 'Auditoría',
    cards: [
      { key: 'historial', icon: History, title: 'Historial', desc: 'Historial de cambios realizados en la configuración.' },
    ],
  },
]

export default function Settings() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-8">
      <PageHeader title="Configuración" subtitle="Panel de Administrador · Compras · gestiona el sistema desde un solo lugar" />

      <div className="space-y-8">
        {GROUPS.map(({ group, cards }) => (
          <section key={group}>
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{group}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => {
                const Icon = c.icon
                return (
                  <button
                    key={c.key}
                    onClick={() => navigate(`/configuracion/modulo/${c.key}`)}
                    className={cn(
                      'group flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card',
                      'transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover',
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-150 group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{c.title}</h3>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand-500" />
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{c.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
