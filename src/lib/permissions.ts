// ---------------------------------------------------------------------------
// Capa de roles y permisos — TRES roles + subrol Administrador (dentro de Compras).
// · Tienda: registra y da seguimiento a devoluciones (sucursal, portal simple).
// · Ecommerce: NO genera devoluciones. Da seguimiento a expedientes de Ecommerce,
//   consulta resoluciones/responsables y registra incidencias de mercancía
//   recibida en mal estado en el almacén Ecommerce (vía redistribución).
// · Compras: revisa, autoriza, rechaza, gestiona, resuelve incidencias y cierra.
// · Administrador: subrol de Compras con acceso a la configuración maestra.
// ---------------------------------------------------------------------------
import type { RoleKey, StatusKey, ReturnTypeKey, ReturnCase, IncidenciaStatus } from '../data/mock'

// -------------------------- Acciones del expediente ------------------------

export type ActionKey =
  | 'tomar'
  | 'autorizar'
  | 'rechazar'
  | 'solicitar_info'
  | 'responder_info'
  | 'cerrar'
  | 'imprimir'
  | 'comentar'

// Qué roles pueden ejecutar cada acción.
// Ecommerce es SOLO seguimiento sobre las devoluciones: no registra ni responde
// (esas acciones son de Tienda); únicamente consulta, comenta e imprime.
const ACTION_ROLES: Record<ActionKey, RoleKey[]> = {
  tomar: ['tienda'], // registrar / enviar a revisión
  responder_info: ['tienda'], // responder solicitudes de información
  autorizar: ['compras'],
  rechazar: ['compras'],
  solicitar_info: ['compras'],
  cerrar: ['compras'],
  imprimir: ['tienda', 'ecommerce', 'compras'],
  comentar: ['tienda', 'ecommerce', 'compras'],
}

// Qué acciones habilita cada estado.
const STATUS_ACTIONS: Record<StatusKey, ActionKey[]> = {
  nuevo: ['tomar', 'solicitar_info', 'comentar', 'imprimir'],
  revision: ['autorizar', 'rechazar', 'solicitar_info', 'comentar', 'imprimir'],
  esperando: ['responder_info', 'solicitar_info', 'comentar', 'imprimir'],
  // Tras autorizar, el sistema genera el envío automáticamente: Compras ya no
  // ejecuta ninguna acción adicional (el siguiente actor es el almacén destino).
  autorizado: ['comentar', 'imprimir'],
  rechazado: ['comentar', 'imprimir'],
  pendiente_traslado: ['comentar', 'imprimir'],
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
  | 'incidencias'
  | 'nueva_incidencia'
  | 'bloqueados'
  | 'pendientes_resolucion'
  | 'reportes_ecommerce'

const NAV_BY_ROLE: Record<RoleKey, NavKey[]> = {
  // Tienda: portal operativo simple — crear, consultar y dar seguimiento.
  tienda: ['dashboard', 'devoluciones', 'nueva', 'pendientes'],
  // Ecommerce: NO crea devoluciones. Da seguimiento a devoluciones Ecommerce,
  // gestiona incidencias de redistribución, ve productos bloqueados y reportes.
  ecommerce: ['dashboard', 'pendientes_resolucion', 'incidencias', 'nueva_incidencia', 'devoluciones', 'bloqueados', 'reportes_ecommerce'],
  // Compras: interfaz corporativa. "configuracion" solo la ve el Administrador (ADMIN_ONLY).
  // Catálogos es operativo compartido (Compras + Administrador); Configuración es exclusivo del Administrador.
  compras: ['dashboard', 'devoluciones', 'pendientes', 'masivas', 'reportes', 'catalogos', 'configuracion'],
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
    autorizado: { area: 'Almacén destino', nextAction: 'Pendiente de recepción en almacén destino', areaColor: 'bg-violet-50 text-violet-700' },
    rechazado: { area: '—', nextAction: 'Expediente rechazado', areaColor: 'bg-rose-50 text-rose-700' },
    pendiente_traslado: { area: 'Almacén destino', nextAction: 'Pendiente de recepción en almacén destino', areaColor: 'bg-violet-50 text-violet-700' },
    transito: { area: 'Almacén destino', nextAction: 'En tránsito al almacén destino', areaColor: 'bg-indigo-50 text-indigo-700' },
    recibido: { area: 'Almacén destino', nextAction: 'Recibido en almacén destino', areaColor: 'bg-teal-50 text-teal-700' },
    cerrado: { area: '—', nextAction: 'Expediente concluido', areaColor: 'bg-slate-100 text-slate-500' },
  }
  return map[status]
}

// -------------------------- Bandeja "mis pendientes" -----------------------

/** ¿Este caso está esperando una acción del rol dado? (para "Mis pendientes"). */
export function requiresActionFrom(role: RoleKey, c: ReturnCase): boolean {
  const area = ownershipFor(c.status).area
  if (role === 'compras') return area === 'Compras'
  if (role === 'tienda') return area === 'Tienda'
  // Ecommerce no actúa sobre devoluciones (solo seguimiento); sus pendientes
  // se derivan de las incidencias, no de los expedientes de devolución.
  return false
}

// -------------------------- Incidencias (Ecommerce) ------------------------

/** La incidencia requiere respuesta de Ecommerce (Compras solicitó información). */
export function incidenciaRequiresEcommerce(status: IncidenciaStatus): boolean {
  return status === 'esperando'
}

/** La incidencia está pendiente de que Compras la revise o resuelva. */
export function incidenciaRequiresCompras(status: IncidenciaStatus): boolean {
  return status === 'abierta' || status === 'revision'
}
