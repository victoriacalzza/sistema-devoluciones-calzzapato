import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Inbox from './pages/Inbox'
import ReturnDetail from './pages/ReturnDetail'
import NewReturn from './pages/NewReturn'
import MyPending from './pages/MyPending'
import MassReturns from './pages/MassReturns'
import MassReturnDetail from './pages/MassReturnDetail'
import Reports from './pages/Reports'
import Catalogs from './pages/Catalogs'
import Settings from './pages/Settings'
import Incidencias from './pages/Incidencias'
import NewIncidencia from './pages/NewIncidencia'
import IncidenciaDetail from './pages/IncidenciaDetail'
import BlockedProducts from './pages/BlockedProducts'
import PendingResolution from './pages/PendingResolution'
import ReportsEcommerce from './pages/ReportsEcommerce'
import { useRole } from './lib/RoleContext'
import { canSeeNav, type NavKey } from './lib/permissions'

/** Renderiza el elemento solo si el rol activo tiene acceso al módulo; si no, redirige al Dashboard. */
function Guard({ nav, children }: { nav: NavKey; children: React.ReactNode }) {
  const { role, admin } = useRole()
  return canSeeNav(role, nav, admin) ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devoluciones" element={<Guard nav="devoluciones"><Inbox /></Guard>} />
        <Route path="/devoluciones/:folio" element={<Guard nav="devoluciones"><ReturnDetail /></Guard>} />
        <Route path="/nueva" element={<Guard nav="nueva"><NewReturn /></Guard>} />
        <Route path="/pendientes" element={<Guard nav="pendientes"><MyPending /></Guard>} />
        <Route path="/masivas" element={<Guard nav="masivas"><MassReturns /></Guard>} />
        <Route path="/masivas/:folio" element={<Guard nav="masivas"><MassReturnDetail /></Guard>} />
        <Route path="/incidencias" element={<Guard nav="incidencias"><Incidencias /></Guard>} />
        <Route path="/incidencias/nueva" element={<Guard nav="nueva_incidencia"><NewIncidencia /></Guard>} />
        <Route path="/incidencias/:folio" element={<Guard nav="incidencias"><IncidenciaDetail /></Guard>} />
        <Route path="/bloqueados" element={<Guard nav="bloqueados"><BlockedProducts /></Guard>} />
        <Route path="/pendientes-resolucion" element={<Guard nav="pendientes_resolucion"><PendingResolution /></Guard>} />
        <Route path="/reportes-ecommerce" element={<Guard nav="reportes_ecommerce"><ReportsEcommerce /></Guard>} />
        <Route path="/reportes" element={<Guard nav="reportes"><Reports /></Guard>} />
        <Route path="/catalogos" element={<Guard nav="catalogos"><Catalogs /></Guard>} />
        <Route path="/configuracion" element={<Guard nav="configuracion"><Settings /></Guard>} />
      </Routes>
    </AppLayout>
  )
}
