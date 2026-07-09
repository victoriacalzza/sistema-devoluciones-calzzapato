// ---------------------------------------------------------------------------
// Capa de roles y permisos — modelo simplificado a DOS roles: Tienda y Compras.
// · Tienda: registra y da seguimiento a devoluciones (sucursal).
// · Compras: revisa, autoriza, rechaza, gestiona y cierra (corporativo).
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
  tomar: ['tienda'], // registrar / enviar a revisión
  responder_info: ['tienda'], // responder solicitudes de información
  autorizar: ['compras'],
  rechazar: ['compras'],
  solicitar_info: ['compras'],
  generar_traslado: ['compras'], // devolución a proveedor
  cerrar: ['compras'],
  imprimir: ['tienda', 'compras'],
  comentar: ['tienda', 'compras'],
}

// Qué acciones habilita cada estado.
const STATUS_ACTIONS: Record<StatusKey, ActionKey[]> = {
  nuevo: ['tomar', 'solicitar_info', 'comentar', 'imprimir'],
  revision: ['autorizar', 'rechazar', 'solicitar_info', 'comentar', 'imprimir'],
  esperando: ['responder_info', 'solicitar_info', 'comentar', 'imprimir'],
  autorizado: ['generar_traslado', 'comentar', 'imprimir'],
  rechazado: ['cerrar', 'comentar', 'imprimir'],
  pendiente_traslado: ['generar_traslado', 'comentar', 'imprimir'],
  transito: ['cerrar', 'comentar', 'imprimir'],
  recibido: ['cerrar', 'comentar', 'imprimir'],
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

/** Compras ve costo y proveedor; Tienda no. */
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
  // Tienda: registra y da seguimiento; ve masivas asignadas a su sucursal.
  tienda: ['dashboard', 'devoluciones', 'nueva', 'pendientes', 'masivas'],
  // Compras: además gestiona reportes, catálogos y configuración.
  compras: ['dashboard', 'devoluciones', 'nueva', 'pendientes', 'masivas', 'reportes', 'catalogos', 'configuracion'],
}

export function canSeeNav(role: RoleKey, nav: NavKey): boolean {
  return NAV_BY_ROLE[role].includes(nav)
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
    rechazado: { area: 'Compras', nextAction: 'Cerrar expediente', areaColor: 'bg-rose-50 text-rose-700' },
    pendiente_traslado: { area: 'Compras', nextAction: 'Generar devolución a proveedor', areaColor: 'bg-violet-50 text-violet-700' },
    transito: { area: 'Compras', nextAction: 'Dar seguimiento a la devolución', areaColor: 'bg-indigo-50 text-indigo-700' },
    recibido: { area: 'Compras', nextAction: 'Cerrar expediente', areaColor: 'bg-teal-50 text-teal-700' },
    cerrado: { area: '—', nextAction: 'Sin acciones pendientes', areaColor: 'bg-slate-100 text-slate-500' },
  }
  return map[status]
}

// -------------------------- Bandeja "mis pendientes" -----------------------

/** ¿Este caso está esperando una acción del rol dado? (para "Mis pendientes"). */
export function requiresActionFrom(role: RoleKey, c: ReturnCase): boolean {
  const area = ownershipFor(c.status).area
  return role === 'tienda' ? area === 'Tienda' : area === 'Compras'
}
