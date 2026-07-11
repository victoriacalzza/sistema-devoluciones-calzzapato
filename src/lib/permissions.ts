// ---------------------------------------------------------------------------
// Capa de roles y permisos — TRES roles + subrol Administrador (dentro de Compras).
// · Tienda: registra y da seguimiento a devoluciones (sucursal, portal simple).
// · Ecommerce: registra y da seguimiento a devoluciones del canal en línea.
// · Compras: revisa, autoriza, rechaza, gestiona y cierra (corporativo).
// · Administrador: subrol de Compras con acceso a la configuración maestra.
// ---------------------------------------------------------------------------
import type { RoleKey, StatusKey, ReturnTypeKey, ReturnCase } from '../data/mock'

// -------------------------- Acciones del expediente ------------------------

export type ActionKey =
  | 'tomar'
  | 'autorizar'
  | 'rechazar'
  | 'solicitar_info'
  | 'responder_info'
  | 'generar_traslado'
  | 'cerrar'
  | 'imprimir'
  | 'comentar'

// Qué roles pueden ejecutar cada acción.
const ACTION_ROLES: Record<ActionKey, RoleKey[]> = {
  tomar: ['tienda', 'ecommerce'], // registrar / enviar a revisión
  responder_info: ['tienda', 'ecommerce'], // responder solicitudes de información
  autorizar: ['compras'],
  rechazar: ['compras'],
  solicitar_info: ['compras'],
  generar_traslado: ['compras'], // devolución a proveedor
  cerrar: ['compras'],
  imprimir: ['tienda', 'ecommerce', 'compras'],
  comentar: ['tienda', 'ecommerce', 'compras'],
}

// Qué acciones habilita cada estado.
const STATUS_ACTIONS: Record<StatusKey, ActionKey[]> = {
  nuevo: ['tomar', 'solicitar_info', 'comentar', 'imprimir'],
  revision: ['autorizar', 'rechazar', 'solicitar_info', 'comentar', 'imprimir'],
  esperando: ['responder_info', 'solicitar_info', 'comentar', 'imprimir'],
  autorizado: ['generar_traslado', 'comentar', 'imprimir'],
  rechazado: ['comentar', 'imprimir'],
  pendiente_traslado: ['generar_traslado', 'comentar', 'imprimir'],
  transito: ['comentar', 'imprimir'],
  recibido: ['comentar', 'imprimir'],
  cerrado: ['imprimir'],
}

// Exclusiones por tipo.
function excludedByType(action: ActionKey, tipo: ReturnTypeKey): boolean {
  // Redistribución omite la autorización comercial.
  if (tipo === 'redistribucion' && (action === 'autorizar' || action === 'rechazar')) return true
  return false
}

/** Acciones visibles para (rol, estado, tipo) — intersección de las tres reglas. */
export function allowedActions(role: RoleKey, status: StatusKey, tipo: ReturnTypeKey): ActionKey[] {
  return STATUS_ACTIONS[status].filter(
    (a) => ACTION_ROLES[a].includes(role) && !excludedByType(a, tipo),
  )
}

export function canDo(role: RoleKey, action: ActionKey, status: StatusKey, tipo: ReturnTypeKey): boolean {
  return allowedActions(role, status, tipo).includes(action)
}

// -------------------------- Visibilidad de datos ---------------------------

/** Solo Compras ve costo y proveedor; Tienda y Ecommerce no. */
export function canSeeCost(role: RoleKey): boolean {
  return role === 'compras'
}

// -------------------------- Navegación por rol -----------------------------

export type NavKey =
  | 'dashboard'
  | 'devoluciones'
  | 'nueva'
  | 'pendientes'
  | 'masivas'
  | 'reportes'
  | 'catalogos'
  | 'configuracion'

const NAV_BY_ROLE: Record<RoleKey, NavKey[]> = {
  // Tienda: portal operativo simple — crear, consultar y dar seguimiento.
  tienda: ['dashboard', 'devoluciones', 'nueva', 'pendientes'],
  // Ecommerce: como Tienda pero para el canal en línea (sin masivas/reportes/catálogos).
  ecommerce: ['dashboard', 'devoluciones', 'nueva', 'pendientes'],
  // Compras: interfaz corporativa completa. "configuracion" es solo para Administrador.
  compras: ['dashboard', 'devoluciones', 'nueva', 'pendientes', 'masivas', 'reportes', 'catalogos', 'configuracion'],
}

/** Módulos que solo el subrol Administrador (dentro de Compras) puede ver. */
const ADMIN_ONLY: NavKey[] = ['configuracion']

export function canSeeNav(role: RoleKey, nav: NavKey, admin = false): boolean {
  if (ADMIN_ONLY.includes(nav) && !admin) return false
  return NAV_BY_ROLE[role].includes(nav)
}

// -------------------------- Resolución (cliente) ---------------------------

/** Las devoluciones de cliente requieren una resolución antes de cerrarse. */
export function needsResolution(tipo: ReturnTypeKey): boolean {
  return tipo === 'cliente'
}

// -------------------------- Ownership del expediente -----------------------

export interface Ownership {
  area: string
  nextAction: string
  areaColor: string
}

/** Área responsable + próxima acción, derivadas del estado. */
export function ownershipFor(status: StatusKey): Ownership {
  const map: Record<StatusKey, Ownership> = {
    nuevo: { area: 'Tienda', nextAction: 'Registrar y enviar a revisión', areaColor: 'bg-slate-100 text-slate-700' },
    revision: { area: 'Compras', nextAction: 'Autorizar o rechazar', areaColor: 'bg-emerald-50 text-emerald-700' },
    esperando: { area: 'Tienda', nextAction: 'Responder solicitud de información', areaColor: 'bg-amber-50 text-amber-700' },
    autorizado: { area: 'Compras', nextAction: 'Generar devolución a proveedor', areaColor: 'bg-violet-50 text-violet-700' },
    rechazado: { area: '—', nextAction: 'Expediente rechazado', areaColor: 'bg-rose-50 text-rose-700' },
    pendiente_traslado: { area: 'Compras', nextAction: 'Generar devolución a proveedor', areaColor: 'bg-violet-50 text-violet-700' },
    transito: { area: '—', nextAction: 'En tránsito a proveedor', areaColor: 'bg-indigo-50 text-indigo-700' },
    recibido: { area: '—', nextAction: 'Recepción confirmada', areaColor: 'bg-teal-50 text-teal-700' },
    cerrado: { area: '—', nextAction: 'Expediente cerrado', areaColor: 'bg-slate-100 text-slate-500' },
  }
  return map[status]
}

// -------------------------- Bandeja "mis pendientes" -----------------------

/** ¿Este caso está esperando una acción del rol dado? (para "Mis pendientes"). */
export function requiresActionFrom(role: RoleKey, c: ReturnCase): boolean {
  const area = ownershipFor(c.status).area
  // Tienda y Ecommerce comparten el lado "Tienda" del ownership (registran / responden).
  return role === 'compras' ? area === 'Compras' : area === 'Tienda'
}
