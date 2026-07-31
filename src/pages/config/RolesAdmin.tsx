import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import { PageHeader } from '../../components/AppLayout'
import { Card, BackLink, Button } from '../../lib/ui'
import { PEOPLE } from '../../data/mock'

const ROLES = [
  { key: 'tienda', nombre: 'Tienda', desc: 'Sucursal · registra devoluciones, adjunta evidencias y da seguimiento.', match: (r: string, admin: boolean) => r === 'tienda' && !admin },
  { key: 'ecommerce', nombre: 'Ecommerce', desc: 'Almacén Ecommerce · registra incidencias y consulta expedientes.', match: (r: string) => r === 'ecommerce' },
  { key: 'compras', nombre: 'Compras', desc: 'Corporativo · revisa, autoriza/rechaza, gestiona masivas y cierra.', match: (r: string, admin: boolean) => r === 'compras' && !admin },
  { key: 'admin', nombre: 'Compras · Administrador', desc: 'Subrol de Compras · administra todos los permisos y catálogos.', match: (_r: string, admin: boolean) => admin },
] as const

export default function RolesAdmin() {
  const navigate = useNavigate()
  const count = (m: (r: string, admin: boolean) => boolean) => PEOPLE.filter((p) => m(p.roleKey, !!p.admin)).length

  return (
    <>
      <BackLink to="/configuracion" label="Volver a Configuración" />
      <PageHeader title="Roles" subtitle="Perfiles del sistema y sus permisos" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLES.map((r) => (
          <Card key={r.key} className="flex flex-col gap-3 transition-all duration-150 hover:border-brand-200 hover:shadow-card-hover">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Shield className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-slate-900">{r.nombre}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{r.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500"><span className="font-semibold text-slate-800">{count(r.match)}</span> usuario(s)</span>
              <Button size="sm" variant="secondary" icon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate(`/configuracion/rol/${r.key}`)}>Editar permisos</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
