// ---------------------------------------------------------------------------
// Sistema de Devoluciones — datos de ejemplo (prototipo de alta fidelidad)
// ---------------------------------------------------------------------------

export type StatusKey =
  | 'nuevo'
  | 'revision'
  | 'esperando'
  | 'autorizado'
  | 'rechazado'
  | 'pendiente_traslado'
  | 'transito'
  | 'recibido'
  | 'cerrado'

export type PriorityKey = 'baja' | 'media' | 'alta' | 'urgente'

export type ReturnTypeKey =
  | 'cliente'
  | 'ecommerce'
  | 'depuracion'
  | 'redistribucion'
  | 'masiva'

export interface StatusMeta {
  key: StatusKey
  label: string
  /** tailwind text/bg/border tokens for the soft badge */
  text: string
  bg: string
  dot: string
}

export const STATUSES: Record<StatusKey, StatusMeta> = {
  nuevo: { key: 'nuevo', label: 'Nuevo', text: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  revision: { key: 'revision', label: 'En revisión', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  esperando: { key: 'esperando', label: 'Pendiente de información de Tienda', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  autorizado: { key: 'autorizado', label: 'Autorizado', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  rechazado: { key: 'rechazado', label: 'Rechazado', text: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500' },
  pendiente_traslado: { key: 'pendiente_traslado', label: 'Pendiente de traslado', text: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500' },
  transito: { key: 'transito', label: 'En tránsito', text: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-500' },
  recibido: { key: 'recibido', label: 'Recibido', text: 'text-teal-700', bg: 'bg-teal-50', dot: 'bg-teal-500' },
  cerrado: { key: 'cerrado', label: 'Cerrado', text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500' },
}

export const KANBAN_ORDER: StatusKey[] = [
  'nuevo',
  'revision',
  'esperando',
  'autorizado',
  'rechazado',
  'pendiente_traslado',
  'transito',
  'recibido',
  'cerrado',
]

export const PRIORITIES: Record<PriorityKey, { label: string; text: string; bg: string; dot: string }> = {
  baja: { label: 'Baja', text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  media: { label: 'Media', text: 'text-sky-700', bg: 'bg-sky-50', dot: 'bg-sky-500' },
  alta: { label: 'Alta', text: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  urgente: { label: 'Urgente', text: 'text-brand-700', bg: 'bg-brand-50', dot: 'bg-brand-600' },
}

export const RETURN_TYPES: Record<
  ReturnTypeKey,
  { key: ReturnTypeKey; label: string; short: string; desc: string; icon: string; requires: string[] }
> = {
  cliente: {
    key: 'cliente',
    label: 'Devolución de Cliente en Tienda',
    short: 'Cliente en Tienda',
    desc: 'Un cliente acude con un producto defectuoso.',
    icon: 'store',
    requires: ['Factura', 'Producto', 'Motivo', 'Fotografías'],
  },
  ecommerce: {
    key: 'ecommerce',
    label: 'Devolución por Ecommerce',
    short: 'Ecommerce',
    desc: 'Devolución originada por una compra en línea.',
    icon: 'globe',
    requires: ['ID de Venta', 'Tienda origen', 'Producto', 'Evidencias'],
  },
  depuracion: {
    key: 'depuracion',
    label: 'Depuración de Almacén en Tienda',
    short: 'Depuración de Almacén',
    desc: 'Producto sin factura, depurado del almacén.',
    icon: 'boxes',
    requires: ['Escanear producto', 'Motivo', 'Fotografías'],
  },
  redistribucion: {
    key: 'redistribucion',
    label: 'Incidencia en redistribución',
    short: 'Incidencia en redistribución',
    desc: 'Incidencia detectada en un movimiento de mercancía entre sucursales.',
    icon: 'truck',
    requires: ['Folio de traslado', 'Tienda origen', 'Escanear producto'],
  },
  masiva: {
    key: 'masiva',
    label: 'Devolución Masiva',
    short: 'Masiva',
    desc: 'Compras solicita devolver un lote completo.',
    icon: 'layers',
    requires: ['Número de lote'],
  },
}

// El sistema tiene TRES roles: Tienda (sucursal), Ecommerce (canal en línea) y
// Compras (corporativo). Administrador es un SUBROL dentro de Compras (flag admin).
export type RoleKey = 'tienda' | 'ecommerce' | 'compras'

export const ROLE_LABEL: Record<RoleKey, string> = {
  tienda: 'Tienda',
  ecommerce: 'Ecommerce',
  compras: 'Compras',
}

export interface Person {
  id: string
  name: string
  role: string
  roleKey: RoleKey
  initials: string
  color: string
  /** Subrol Administrador (solo aplica a Compras): acceso a configuración maestra. */
  admin?: boolean
  /** Datos de comprador (solo Compras): línea, marcas y proveedores que gestiona. */
  linea?: string
  marcas?: string[]
  proveedores?: string[]
}

export const PEOPLE: Person[] = [
  { id: 'u1', name: 'Karen Ríos', role: 'Tienda · Culiacán Centro', roleKey: 'tienda', initials: 'KR', color: 'bg-rose-500' },
  { id: 'u2', name: 'Miguel Andrade', role: 'Tienda · Guadalajara Andares', roleKey: 'tienda', initials: 'MA', color: 'bg-indigo-500' },
  {
    id: 'u3', name: 'Fernanda López', role: 'Compras · Calzado Deportivo', roleKey: 'compras', initials: 'FL', color: 'bg-emerald-500',
    linea: 'Calzado Deportivo', marcas: ['Nike', 'Adidas', 'Skechers'], proveedores: ['Nike México', 'Adidas México', 'VF Corp'],
  },
  {
    id: 'u4', name: 'Óscar Beltrán', role: 'Compras · Calzado Confort', roleKey: 'compras', initials: 'OB', color: 'bg-amber-500',
    linea: 'Calzado Confort', marcas: ['Flexi', 'Andrea'], proveedores: ['Calzado Flexi S.A.', 'Grupo Andrea'],
  },
  {
    id: 'u5', name: 'Diana Quintero', role: 'Compras · Accesorios', roleKey: 'compras', initials: 'DQ', color: 'bg-teal-500',
    linea: 'Accesorios', marcas: ['Coach', 'Puma', 'Vans'], proveedores: ['VF Corp', 'Puma LATAM'],
  },
  {
    id: 'u6', name: 'Jorge Villa', role: 'Compras · Administrador', roleKey: 'compras', initials: 'JV', color: 'bg-slate-700',
    admin: true, linea: 'Coordinación', marcas: [], proveedores: [],
  },
  { id: 'u7', name: 'Paola Ceballos', role: 'Ecommerce · Marketplace', roleKey: 'ecommerce', initials: 'PC', color: 'bg-fuchsia-500' },
]

/** Persona canónica que representa cada rol en el selector de demo. */
export const ROLE_USER: Record<RoleKey, Person> = {
  tienda: PEOPLE[0],
  ecommerce: PEOPLE[6],
  compras: PEOPLE[2],
}

export function personByRole(roleKey: RoleKey): Person {
  return ROLE_USER[roleKey] ?? PEOPLE[0]
}

/** Persona Administrador (subrol de Compras) para la demo. */
export const ADMIN_USER: Person = PEOPLE[5]

/** Personas del selector de demo (incluye el subrol Administrador de Compras). */
export const DEMO_PERSONAS: Person[] = [PEOPLE[0], PEOPLE[6], PEOPLE[2], PEOPLE[5]]

// -------------------- Supervisores de sucursal (autorización) --------------
// Regla de negocio (solo Tienda): antes de generar el folio del expediente se
// requiere el código de 4 dígitos de un supervisor autorizado de la sucursal.

export interface Supervisor {
  code: string
  name: string
  sucursal: string
}

export const SUPERVISORES: Supervisor[] = [
  { code: '4821', name: 'Laura Beltrán', sucursal: 'Culiacán Centro' },
  { code: '3097', name: 'Ramón Cázares', sucursal: 'Guadalajara Andares' },
  { code: '7410', name: 'Patricia Nava', sucursal: 'Los Mochis Plaza' },
  { code: '5566', name: 'Hugo Terán', sucursal: 'Mazatlán Marina' },
  { code: '6238', name: 'Elena Ruvalcaba', sucursal: 'Culiacán Forum' },
]

/** Valida el código de autorización y devuelve al supervisor, si existe. */
export function supervisorByCode(code: string): Supervisor | undefined {
  return SUPERVISORES.find((s) => s.code === code)
}

export const SUCURSALES = [
  'Culiacán Centro',
  'Culiacán Forum',
  'Mazatlán Marina',
  'Los Mochis Plaza',
  'Guadalajara Andares',
  'Guasave Centro',
  'Hermosillo Sur',
  'CEDIS Culiacán',
]

export const MARCAS = ['Nike', 'Adidas', 'Flexi', 'Andrea', 'Vans', 'Puma', 'Coach', 'Skechers']
export const PROVEEDORES = ['Calzado Flexi S.A.', 'Nike México', 'Adidas México', 'Grupo Andrea', 'VF Corp', 'Puma LATAM']
export const CATEGORIAS = ['Calzado dama', 'Calzado caballero', 'Calzado infantil', 'Ropa', 'Accesorios', 'Deportivo']
export const LINEAS = ['Calzado Deportivo', 'Calzado Confort', 'Accesorios']
export const MOTIVOS = [
  'Costura abierta',
  'Suela despegada',
  'Talla incorrecta',
  'Defecto de fábrica',
  'Color distinto',
  'Producto incompleto',
  'Manchas / decoloración',
  'Daño en transporte',
]

// ------------ Catálogo Agrupación · Línea · Marca · Comprador --------------
// Base para: asignación automática del comprador, devoluciones masivas,
// validaciones operativas (no mezclar agrupaciones) y ownership.

export interface CLMRow {
  agrupacion: string
  linea: string
  marca: string
  proveedor: string
  compradorId: string
}

export const CATALOGO_CLM: CLMRow[] = [
  { agrupacion: 'Deportivo', linea: 'Basketball', marca: 'Nike', proveedor: 'Nike México', compradorId: 'u3' },
  { agrupacion: 'Deportivo', linea: 'Running', marca: 'Adidas', proveedor: 'Adidas México', compradorId: 'u3' },
  { agrupacion: 'Deportivo', linea: 'Walking', marca: 'Skechers', proveedor: 'VF Corp', compradorId: 'u3' },
  { agrupacion: 'Confort', linea: 'Confort dama', marca: 'Flexi', proveedor: 'Calzado Flexi S.A.', compradorId: 'u4' },
  { agrupacion: 'Confort', linea: 'Confort dama', marca: 'Andrea', proveedor: 'Grupo Andrea', compradorId: 'u4' },
  { agrupacion: 'Casual', linea: 'Lifestyle', marca: 'Vans', proveedor: 'VF Corp', compradorId: 'u5' },
  { agrupacion: 'Accesorios', linea: 'Bolsos', marca: 'Coach', proveedor: 'VF Corp', compradorId: 'u5' },
  { agrupacion: 'Accesorios', linea: 'Deportivo', marca: 'Puma', proveedor: 'Puma LATAM', compradorId: 'u5' },
]

/** Agrupaciones de línea (definidas con Compras). */
export const AGRUPACIONES = Array.from(new Set(CATALOGO_CLM.map((r) => r.agrupacion)))

export interface CompradorInfo {
  comprador: Person
  agrupacion: string
  linea: string
  marca: string
  proveedor: string
}

/** Asignación automática: identifica al comprador que gestiona esa marca/línea. */
export function compradorForMarca(marca: string): CompradorInfo | undefined {
  const row = CATALOGO_CLM.find((r) => r.marca === marca)
  if (!row) return undefined
  return { comprador: personById(row.compradorId), agrupacion: row.agrupacion, linea: row.linea, marca: row.marca, proveedor: row.proveedor }
}

/** Agrupación de línea a la que pertenece una marca (para validar mezclas). */
export function agrupacionForMarca(marca: string): string | undefined {
  return CATALOGO_CLM.find((r) => r.marca === marca)?.agrupacion
}

// ------------------- Agrupación comercial (depuración) ---------------------
// En Depuración de Almacén el sistema clasifica automáticamente cada artículo
// escaneado en una agrupación comercial derivada de línea/sublínea/género del
// catálogo maestro (a partir del SKU). Un expediente puede mezclar agrupaciones
// y el sistema las organiza visualmente.

export type AgrupacionComercial =
  | 'Calzado Dama'
  | 'Calzado Caballero'
  | 'Calzado Niño'
  | 'Accesorios'
  | 'Textil'
  | 'Otros'

export const AGRUPACIONES_COMERCIALES: AgrupacionComercial[] = [
  'Calzado Dama',
  'Calzado Caballero',
  'Calzado Niño',
  'Accesorios',
  'Textil',
  'Otros',
]

/**
 * Clasificación comercial por defecto de una marca (para artículos recién
 * escaneados). El género real proviene del SKU/catálogo; aquí se usa una
 * aproximación por marca cuando no hay dato de género en el prototipo.
 */
export function agrupacionComercialForMarca(marca: string): AgrupacionComercial {
  const dama = ['Andrea', 'Flexi', 'Clarks']
  const caballero = ['Nike', 'Adidas', 'Skechers', 'Vans']
  const accesorios = ['Coach', 'Puma']
  if (dama.includes(marca)) return 'Calzado Dama'
  if (caballero.includes(marca)) return 'Calzado Caballero'
  if (accesorios.includes(marca)) return 'Accesorios'
  return 'Otros'
}

// ------------------------- Almacenes destino -------------------------------
// Compras elige obligatoriamente un almacén destino al autorizar (configurable).

// -------------------- Catálogo de almacenes destino ------------------------
// Catálogo real de almacenes. Cada uno aplica a una o más LÍNEAS de mercancía
// (calzado / textil / accesorios). Al autorizar y elegir resolución, el sistema
// detecta la línea del producto y muestra SOLO los almacenes válidos.
// Administrable por Compras · Administrador.

export type LineaMercancia = 'Calzado' | 'Accesorios' | 'Textil'

export interface Almacen {
  /** Código del almacén (ej. "25", "281", "GL"). */
  codigo: string
  nombre: string
  /** Líneas de mercancía para las que el almacén es válido. */
  lineas: LineaMercancia[]
}

export const ALMACENES: Almacen[] = [
  { codigo: '25', nombre: 'Devolución de fábrica', lineas: ['Calzado'] },
  { codigo: '512', nombre: 'Kelder Defectuosos textil', lineas: ['Textil'] },
  { codigo: '24', nombre: 'Accesorios defectuosos', lineas: ['Accesorios'] },
  { codigo: '281', nombre: 'Devoluciones Masivas', lineas: ['Calzado', 'Textil'] },
  { codigo: '262', nombre: 'Venta outlet', lineas: ['Calzado', 'Textil', 'Accesorios'] },
  { codigo: 'GL', nombre: 'Almacén Donaciones', lineas: ['Calzado', 'Textil', 'Accesorios'] },
]

/** Identifica la línea de mercancía del producto (por marca/categoría). */
export function lineaMercancia(marca: string, categoria: string): LineaMercancia {
  if (agrupacionForMarca(marca) === 'Accesorios' || categoria === 'Accesorios') return 'Accesorios'
  if (categoria === 'Ropa' || categoria === 'Textil') return 'Textil'
  return 'Calzado'
}

/** Almacenes válidos para la línea de mercancía detectada. */
export function almacenesFor(linea: LineaMercancia): Almacen[] {
  return ALMACENES.filter((a) => a.lineas.includes(linea))
}

// -------------------- Resoluciones de autorización -------------------------
// Al AUTORIZAR, Compras elige primero una resolución y luego el almacén destino.
// La lista de almacenes depende de la resolución (catálogo configurable).

export interface ResolucionOption {
  key: string
  label: string
}

/** Resoluciones para devoluciones de cliente (outcome hacia el cliente). */
export const RESOLUCIONES_CLIENTE: ResolucionOption[] = [
  { key: 'cambio_fisico', label: 'Cambio físico' },
  { key: 'vale', label: 'Vale de compra' },
  { key: 'reembolso', label: 'Reembolso' },
  { key: 'bonificacion', label: 'Bonificación' },
  { key: 'sustitucion', label: 'Sustitución por producto equivalente' },
  { key: 'reparacion', label: 'Reparación' },
]

/** Resoluciones (disposición del producto) para el resto de tipos. */
export const RESOLUCIONES_DESTINO: ResolucionOption[] = [
  { key: 'proveedor', label: 'Devolución a proveedor' },
  { key: 'donacion', label: 'Donación' },
  { key: 'masiva', label: 'Devolución masiva' },
  { key: 'redistribucion', label: 'Redistribución' },
  { key: 'liquidacion', label: 'Liquidación' },
]

/** Resoluciones disponibles al autorizar, según el tipo de devolución. */
export function resolucionesFor(tipo: ReturnTypeKey): ResolucionOption[] {
  return tipo === 'cliente' ? RESOLUCIONES_CLIENTE : RESOLUCIONES_DESTINO
}

// ----------------------- Resoluciones (cliente) ----------------------------
// Al autorizar una devolución de cliente, Compras debe elegir una resolución.

export type ResolutionKey =
  | 'cambio_fisico'
  | 'vale'
  | 'reembolso'
  | 'bonificacion'
  | 'sustitucion'
  | 'reparacion'

export const RESOLUTIONS: Record<ResolutionKey, string> = {
  cambio_fisico: 'Cambio físico',
  vale: 'Vale de compra',
  reembolso: 'Reembolso',
  bonificacion: 'Bonificación',
  sustitucion: 'Sustitución por producto equivalente',
  reparacion: 'Reparación',
}

// -------------------------- Existencias por producto -----------------------
// Existencias globales y por sucursal para el SKU/lote asociado al expediente.

export interface ExistenciaSucursal {
  sucursal: string
  cantidad: number
}

export interface Existencias {
  total: number
  disponible: number
  transito: number
  comprometida: number
  porSucursal: ExistenciaSucursal[]
}

const EXISTENCIAS_BY_LOTE: Record<string, Existencias> = {
  'LT-NK-2291': {
    total: 28, disponible: 19, transito: 6, comprometida: 3,
    porSucursal: [
      { sucursal: 'Culiacán Centro', cantidad: 12 },
      { sucursal: 'Culiacán Forum', cantidad: 8 },
      { sucursal: 'Los Mochis Plaza', cantidad: 5 },
      { sucursal: 'Hermosillo Sur', cantidad: 3 },
    ],
  },
  'LT-AD-1180': {
    total: 21, disponible: 16, transito: 3, comprometida: 2,
    porSucursal: [
      { sucursal: 'Culiacán Centro', cantidad: 9 },
      { sucursal: 'Guadalajara Andares', cantidad: 7 },
      { sucursal: 'Guasave Centro', cantidad: 5 },
    ],
  },
}

const EXISTENCIAS_DEFAULT: Existencias = {
  total: 14, disponible: 9, transito: 3, comprometida: 2,
  porSucursal: [
    { sucursal: 'Culiacán Centro', cantidad: 6 },
    { sucursal: 'Mazatlán Marina', cantidad: 4 },
    { sucursal: 'Los Mochis Plaza', cantidad: 4 },
  ],
}

/** Existencias del producto/lote — total, disponible, tránsito, comprometida y por sucursal. */
export function existenciasFor(lote: string): Existencias {
  return EXISTENCIAS_BY_LOTE[lote] ?? EXISTENCIAS_DEFAULT
}

// ------------------------------ Detalle de lote ----------------------------

export interface LoteDetalle {
  lote: string
  marca: string
  linea: string
  proveedor: string
  compradorId: string
  existencias: Existencias
}

/** Ficha de lote: marca, línea, proveedor, comprador responsable y existencias. */
export function loteDetalle(lote: string): LoteDetalle | undefined {
  const ret = RETURNS.find((r) => r.lote === lote)
  const marca = ret?.marca ?? topLotes.find((l) => l.lote === lote)?.marca ?? '—'
  const clm = CATALOGO_CLM.find((r) => r.marca === marca)
  return {
    lote,
    marca,
    linea: clm?.linea ?? '—',
    proveedor: clm?.proveedor ?? ret?.proveedor ?? '—',
    compradorId: clm?.compradorId ?? 'u3',
    existencias: existenciasFor(lote),
  }
}

// ------------------- Búsqueda de lote en ERP (devolución masiva) ------------
// Compras captura solo el número de lote; el ERP devuelve automáticamente la
// ficha del producto (marca, modelo, color, línea, sublínea, agrupación) y las
// existencias por sucursal.

export interface LoteInfo {
  lote: string
  marca: string
  modelo: string
  color: string
  linea: string
  subLinea: string
  agrupacionComercial: AgrupacionComercial
  existencias: Existencias
}

const LOTES_ERP: Record<string, Omit<LoteInfo, 'lote' | 'existencias'>> = {
  'LT-NK-2291': { marca: 'Nike', modelo: 'Air Jordan 1 Mid', color: 'Negro / Rojo', linea: 'Deportivo', subLinea: 'Basketball', agrupacionComercial: 'Calzado Caballero' },
  'LT-AD-1180': { marca: 'Adidas', modelo: 'Ultraboost Light', color: 'Blanco', linea: 'Deportivo', subLinea: 'Running', agrupacionComercial: 'Calzado Caballero' },
  'LT-FX-7781': { marca: 'Flexi', modelo: 'Confort dama', color: 'Café', linea: 'Confort', subLinea: 'Confort dama', agrupacionComercial: 'Calzado Dama' },
  'LT-CH-1200': { marca: 'Coach', modelo: 'Willow', color: 'Café', linea: 'Accesorios', subLinea: 'Bolsos', agrupacionComercial: 'Accesorios' },
}

const LOTE_ERP_DEFAULT: Omit<LoteInfo, 'lote' | 'existencias'> = {
  marca: 'Nike', modelo: 'Air Jordan 1 Mid', color: 'Negro / Rojo', linea: 'Deportivo', subLinea: 'Basketball', agrupacionComercial: 'Calzado Caballero',
}

/** Busca un lote en el ERP y devuelve la ficha + existencias. */
export function buscarLote(lote: string): LoteInfo | undefined {
  const q = lote.trim()
  if (!q) return undefined
  const info = LOTES_ERP[q] ?? LOTE_ERP_DEFAULT
  return { lote: q, ...info, existencias: existenciasFor(q) }
}

export interface TimelineEvent {
  time: string
  date: string
  actor: string
  text: string
  kind: 'create' | 'attach' | 'comment' | 'status' | 'transfer' | 'receive'
}

export interface Comment {
  id: string
  authorId: string
  time: string
  text: string
  attachment?: { name: string; kind: 'image' | 'doc' | 'video' }
}

export interface Transfer {
  numero: string
  origen: string
  destino: string
  estatus: string
  fecha: string
  responsable: string
}

/** Evidencia adjunta a un expediente: foto o video. */
export interface Evidence {
  url: string
  label: string
  kind?: 'image' | 'video'
}

/** Video de muestra para evidencias tipo video (prototipo). */
export const VIDEO_SAMPLE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

export interface ReturnCase {
  folio: string
  tipo: ReturnTypeKey
  status: StatusKey
  priority: PriorityKey
  sucursal: string
  cliente: string
  clienteEmail?: string
  factura: string
  fechaCompra: string
  fechaCreacion: string
  marca: string
  proveedor: string
  categoria: string
  lote: string
  motivo: string
  responsableId: string
  creadorId: string
  slaDue: string
  outOfSla: boolean
  product: {
    sku: string
    descripcion: string
    cantidad: number
    precio: number
    talla: string
    color: string
    image: string
  }
  evidences: Evidence[]
  documents: { name: string; size: string }[]
  comments: Comment[]
  timeline: TimelineEvent[]
  transfer?: Transfer
  /** Resolución elegida por Compras al autorizar (solo devoluciones de cliente). */
  resolucion?: ResolutionKey
  /** ID de venta (Ecommerce) — equivalente a la factura física de tienda. */
  idVenta?: string
  /** Almacén destino elegido por Compras al autorizar (obligatorio para autorizar). */
  almacen?: string
  /** Subregistros de una depuración masiva (cada producto con SKU, motivo y evidencia). */
  subproductos?: SubProducto[]
  /**
   * Producto rechazado que permanece en la tienda: se bloquea para Ecommerce
   * pero sigue disponible para venta física. Lo determina Compras al rechazar.
   */
  bloqueadoEcommerce?: boolean
  ventaFisica?: boolean
  /** Resolución textual registrada al rechazar y determinar el destino del producto. */
  resolucionRechazo?: string
}

export interface SubProducto {
  sku: string
  descripcion: string
  motivo: string
  evidencia?: string
  image: string
}

// Small deterministic image pool (Unsplash — shoes / product)
const IMG = {
  sneakerRed: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  sneakerWhite: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
  bootBrown: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
  heels: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
  sandal: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
  running: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  bag: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  boxShoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
}

function ev(date: string, time: string, actor: string, text: string, kind: TimelineEvent['kind']): TimelineEvent {
  return { date, time, actor, text, kind }
}

export const RETURNS: ReturnCase[] = [
  {
    folio: 'DEV-2026-000154',
    tipo: 'cliente',
    status: 'revision',
    priority: 'alta',
    sucursal: 'Culiacán Centro',
    cliente: 'Laura Sánchez Medina',
    clienteEmail: 'laura.sanchez@gmail.com',
    factura: 'FA-CUL-88231',
    fechaCompra: '28 jun 2026',
    fechaCreacion: '05 jul 2026',
    marca: 'Nike',
    proveedor: 'Nike México',
    categoria: 'Deportivo',
    lote: 'LT-NK-2291',
    motivo: 'Suela despegada',
    responsableId: 'u3',
    creadorId: 'u1',
    slaDue: 'Vence en 6 h',
    outOfSla: false,
    product: {
      sku: 'NK-AJ1-2291',
      descripcion: 'Tenis Nike Air Jordan 1 Mid — Negro/Rojo',
      cantidad: 1,
      precio: 3299,
      talla: '27 MX',
      color: 'Negro / Rojo',
      image: IMG.sneakerRed,
    },
    evidences: [
      { url: IMG.sneakerRed, label: 'Vista general', kind: 'image' },
      { url: IMG.boxShoes, label: 'Caja original', kind: 'image' },
      { url: IMG.running, label: 'Video del defecto', kind: 'video' },
    ],
    documents: [
      { name: 'Factura_FA-CUL-88231.pdf', size: '124 KB' },
      { name: 'Ticket_compra.jpg', size: '512 KB' },
    ],
    comments: [
      { id: 'c1', authorId: 'u1', time: '09:15', text: 'Cliente reporta que la suela se despegó a la semana de uso. Adjunto fotografías del defecto.', attachment: { name: 'suela_detalle.jpg', kind: 'image' } },
      { id: 'c2', authorId: 'u3', time: '10:05', text: '@Karen Ríos ¿puedes confirmar si el producto tiene el sello de garantía intacto? Necesitamos validar antes de autorizar.' },
      { id: 'c3', authorId: 'u1', time: '10:22', text: 'Confirmado, el sello está intacto. Adjunto un video mostrando el defecto en movimiento.', attachment: { name: 'video_sello.mp4', kind: 'video' } },
    ],
    timeline: [
      ev('05 jul', '09:12', 'Karen Ríos', 'creó el expediente', 'create'),
      ev('05 jul', '09:15', 'Karen Ríos', 'adjuntó 3 fotografías', 'attach'),
      ev('05 jul', '09:40', 'Sistema', 'asignó el caso a Fernanda López (Compras)', 'status'),
      ev('05 jul', '10:05', 'Fernanda López', 'solicitó más información', 'comment'),
      ev('05 jul', '10:22', 'Karen Ríos', 'respondió a la solicitud', 'comment'),
    ],
  },
  {
    folio: 'DEV-2026-000153',
    tipo: 'ecommerce',
    status: 'autorizado',
    priority: 'media',
    sucursal: 'Guadalajara Andares',
    cliente: 'Roberto Gil',
    clienteEmail: 'rgil@outlook.com',
    factura: 'EC-99120',
    fechaCompra: '22 jun 2026',
    fechaCreacion: '04 jul 2026',
    marca: 'Adidas',
    proveedor: 'Adidas México',
    categoria: 'Deportivo',
    lote: 'LT-AD-1180',
    motivo: 'Talla incorrecta',
    responsableId: 'u3',
    creadorId: 'u2',
    idVenta: 'EC-99120',
    almacen: 'Almacén devolución proveedor',
    slaDue: 'Resuelto',
    outOfSla: false,
    product: {
      sku: 'AD-UB-1180',
      descripcion: 'Tenis Adidas Ultraboost Light — Blanco',
      cantidad: 1,
      precio: 3899,
      talla: '28 MX',
      color: 'Blanco',
      image: IMG.sneakerWhite,
    },
    evidences: [
      { url: IMG.sneakerWhite, label: 'Producto recibido' },
      { url: IMG.boxShoes, label: 'Empaque' },
    ],
    documents: [{ name: 'Orden_EC-99120.pdf', size: '98 KB' }],
    comments: [
      { id: 'c1', authorId: 'u2', time: '11:02', text: 'Venta de ecommerce, el cliente pidió talla 28 pero requiere 27. Autorizado el cambio.' },
    ],
    timeline: [
      ev('04 jul', '10:50', 'Miguel Andrade', 'creó el expediente', 'create'),
      ev('04 jul', '11:02', 'Miguel Andrade', 'adjuntó evidencias', 'attach'),
      ev('04 jul', '13:20', 'Fernanda López', 'autorizó la devolución', 'status'),
    ],
  },
  {
    folio: 'DEV-2026-000152',
    tipo: 'redistribucion',
    status: 'transito',
    priority: 'media',
    sucursal: 'Mazatlán Marina',
    cliente: '—',
    factura: 'TR-44120',
    fechaCompra: '—',
    fechaCreacion: '03 jul 2026',
    marca: 'Flexi',
    proveedor: 'Calzado Flexi S.A.',
    categoria: 'Calzado dama',
    lote: 'LT-FX-7781',
    motivo: 'Redistribución de inventario',
    responsableId: 'u4',
    creadorId: 'u2',
    slaDue: 'Vence en 2 días',
    outOfSla: false,
    product: {
      sku: 'FX-CM-7781',
      descripcion: 'Zapato confort Flexi dama — Café',
      cantidad: 24,
      precio: 899,
      talla: 'Surtido',
      color: 'Café',
      image: IMG.heels,
    },
    evidences: [{ url: IMG.heels, label: 'Lote' }],
    documents: [{ name: 'Traslado_TR-44120.pdf', size: '156 KB' }],
    comments: [
      { id: 'c1', authorId: 'u4', time: '08:30', text: 'Traslado en ruta hacia CEDIS Culiacán. ETA hoy 14:30.' },
    ],
    timeline: [
      ev('03 jul', '08:10', 'Miguel Andrade', 'creó el expediente', 'create'),
      ev('03 jul', '08:30', 'Fernanda López', 'autorizó la redistribución', 'status'),
      ev('03 jul', '09:00', 'Óscar Beltrán', 'generó el traslado TR-44120', 'transfer'),
    ],
    transfer: {
      numero: 'TR-44120',
      origen: 'Mazatlán Marina',
      destino: 'CEDIS Culiacán',
      estatus: 'En tránsito',
      fecha: '03 jul 2026 · 09:00',
      responsable: 'Óscar Beltrán',
    },
  },
  {
    folio: 'DEV-2026-000151',
    tipo: 'depuracion',
    status: 'esperando',
    priority: 'baja',
    sucursal: 'Los Mochis Plaza',
    cliente: '—',
    factura: 'Sin factura',
    fechaCompra: '—',
    fechaCreacion: '03 jul 2026',
    marca: 'Vans',
    proveedor: 'VF Corp',
    categoria: 'Calzado caballero',
    lote: 'LT-VN-3320',
    motivo: 'Manchas / decoloración',
    responsableId: 'u5',
    creadorId: 'u1',
    slaDue: 'Vence en 1 día',
    outOfSla: false,
    product: {
      sku: 'VN-OS-3320',
      descripcion: 'Vans Old Skool — Negro/Blanco',
      cantidad: 3,
      precio: 1499,
      talla: '26 MX',
      color: 'Negro / Blanco',
      image: IMG.running,
    },
    evidences: [{ url: IMG.running, label: 'Producto' }],
    documents: [],
    comments: [
      { id: 'c1', authorId: 'u5', time: '12:00', text: 'Necesito fotografías adicionales de la decoloración con mejor iluminación.' },
    ],
    timeline: [
      ev('03 jul', '11:40', 'Karen Ríos', 'creó el expediente', 'create'),
      ev('03 jul', '12:00', 'Diana Quintero', 'solicitó más información', 'comment'),
    ],
  },
  {
    folio: 'DEV-2026-000150',
    tipo: 'cliente',
    status: 'cerrado',
    priority: 'media',
    sucursal: 'Culiacán Forum',
    cliente: 'Patricia Vega',
    clienteEmail: 'pativega@gmail.com',
    factura: 'FA-FOR-77120',
    fechaCompra: '15 jun 2026',
    fechaCreacion: '02 jul 2026',
    marca: 'Andrea',
    proveedor: 'Grupo Andrea',
    categoria: 'Calzado dama',
    lote: 'LT-AN-5510',
    motivo: 'Costura abierta',
    responsableId: 'u5',
    creadorId: 'u1',
    resolucion: 'cambio_fisico',
    slaDue: 'Resuelto',
    outOfSla: false,
    product: {
      sku: 'AN-ZP-5510',
      descripcion: 'Zapatilla Andrea tacón medio — Nude',
      cantidad: 1,
      precio: 1299,
      talla: '24 MX',
      color: 'Nude',
      image: IMG.heels,
    },
    evidences: [{ url: IMG.heels, label: 'Producto' }, { url: IMG.boxShoes, label: 'Caja' }],
    documents: [{ name: 'Factura_FA-FOR-77120.pdf', size: '110 KB' }],
    comments: [],
    timeline: [
      ev('02 jul', '10:00', 'Karen Ríos', 'creó el expediente', 'create'),
      ev('02 jul', '11:10', 'Fernanda López', 'autorizó la devolución', 'status'),
      ev('02 jul', '11:20', 'Óscar Beltrán', 'generó traslado TR-44098', 'transfer'),
      ev('02 jul', '14:30', 'CEDIS Culiacán', 'recibió la mercancía', 'receive'),
    ],
    transfer: {
      numero: 'TR-44098',
      origen: 'Culiacán Forum',
      destino: 'CEDIS Culiacán',
      estatus: 'Recibido',
      fecha: '02 jul 2026 · 14:30',
      responsable: 'Óscar Beltrán',
    },
  },
  {
    folio: 'DEV-2026-000149',
    tipo: 'cliente',
    status: 'rechazado',
    priority: 'baja',
    sucursal: 'Hermosillo Sur',
    cliente: 'Jorge Ramírez',
    factura: 'FA-HMO-22001',
    fechaCompra: '01 may 2026',
    fechaCreacion: '01 jul 2026',
    marca: 'Puma',
    proveedor: 'Puma LATAM',
    categoria: 'Deportivo',
    lote: 'LT-PM-9910',
    motivo: 'Daño por mal uso',
    responsableId: 'u3',
    creadorId: 'u1',
    slaDue: 'Resuelto',
    outOfSla: false,
    bloqueadoEcommerce: true,
    ventaFisica: true,
    resolucionRechazo: 'Producto permanece en tienda para venta física · bloqueado para Ecommerce',
    product: {
      sku: 'PM-RS-9910',
      descripcion: 'Puma RS-X — Gris',
      cantidad: 1,
      precio: 2199,
      talla: '28 MX',
      color: 'Gris',
      image: IMG.running,
    },
    evidences: [{ url: IMG.running, label: 'Producto' }],
    documents: [{ name: 'Factura_FA-HMO-22001.pdf', size: '101 KB' }],
    comments: [
      { id: 'c1', authorId: 'u3', time: '15:00', text: 'El daño corresponde a mal uso, fuera de política de devolución. Se rechaza.' },
    ],
    timeline: [
      ev('01 jul', '14:30', 'Karen Ríos', 'creó el expediente', 'create'),
      ev('01 jul', '15:00', 'Fernanda López', 'rechazó la devolución', 'status'),
    ],
  },
  {
    folio: 'DEV-2026-000148',
    tipo: 'ecommerce',
    status: 'pendiente_traslado',
    priority: 'urgente',
    sucursal: 'Guasave Centro',
    cliente: 'Sofía Torres',
    clienteEmail: 'sofiat@gmail.com',
    factura: 'EC-98004',
    fechaCompra: '20 jun 2026',
    fechaCreacion: '01 jul 2026',
    marca: 'Coach',
    proveedor: 'VF Corp',
    categoria: 'Accesorios',
    lote: 'LT-CH-1200',
    motivo: 'Defecto de fábrica',
    responsableId: 'u4',
    creadorId: 'u2',
    idVenta: 'EC-98004',
    almacen: 'Almacén devolución proveedor',
    slaDue: 'Fuera de SLA',
    outOfSla: true,
    product: {
      sku: 'CH-BG-1200',
      descripcion: 'Bolsa Coach Willow — Café',
      cantidad: 1,
      precio: 7499,
      talla: 'Única',
      color: 'Café',
      image: IMG.bag,
    },
    evidences: [{ url: IMG.bag, label: 'Producto' }],
    documents: [{ name: 'Orden_EC-98004.pdf', size: '92 KB' }],
    comments: [
      { id: 'c1', authorId: 'u3', time: '09:00', text: 'Autorizado. @Óscar Beltrán favor de generar traslado urgente.' },
    ],
    timeline: [
      ev('01 jul', '08:30', 'Miguel Andrade', 'creó el expediente', 'create'),
      ev('01 jul', '09:00', 'Fernanda López', 'autorizó la devolución', 'status'),
    ],
  },
  {
    folio: 'DEV-2026-000147',
    tipo: 'cliente',
    status: 'nuevo',
    priority: 'media',
    sucursal: 'Culiacán Centro',
    cliente: 'Andrés Castillo',
    factura: 'FA-CUL-88190',
    fechaCompra: '02 jul 2026',
    fechaCreacion: '06 jul 2026',
    marca: 'Skechers',
    proveedor: 'VF Corp',
    categoria: 'Calzado caballero',
    lote: 'LT-SK-4410',
    motivo: 'Producto incompleto',
    responsableId: 'u1',
    creadorId: 'u1',
    slaDue: 'Vence en 8 h',
    outOfSla: false,
    product: {
      sku: 'SK-GW-4410',
      descripcion: 'Skechers Go Walk — Azul marino',
      cantidad: 1,
      precio: 1399,
      talla: '27 MX',
      color: 'Azul marino',
      image: IMG.sneakerWhite,
    },
    evidences: [{ url: IMG.sneakerWhite, label: 'Producto' }],
    documents: [],
    comments: [],
    timeline: [ev('06 jul', '08:05', 'Karen Ríos', 'creó el expediente', 'create')],
  },
  {
    folio: 'DEV-2026-000146',
    tipo: 'depuracion',
    status: 'cerrado',
    priority: 'baja',
    sucursal: 'Los Mochis Plaza',
    cliente: '—',
    factura: 'Sin factura',
    fechaCompra: '—',
    fechaCreacion: '28 jun 2026',
    marca: 'Flexi',
    proveedor: 'Calzado Flexi S.A.',
    categoria: 'Calzado infantil',
    lote: 'LT-FX-3301',
    motivo: 'Defecto de fábrica',
    responsableId: 'u5',
    creadorId: 'u1',
    slaDue: 'Resuelto',
    outOfSla: false,
    product: {
      sku: 'FX-IN-3301',
      descripcion: 'Zapato escolar Flexi niño — Negro',
      cantidad: 8,
      precio: 649,
      talla: 'Surtido',
      color: 'Negro',
      image: IMG.boxShoes,
    },
    evidences: [{ url: IMG.boxShoes, label: 'Lote' }],
    documents: [],
    comments: [],
    subproductos: [
      { sku: 'FX-IN-3301', descripcion: 'Zapato escolar Flexi niño — Negro', motivo: 'Defecto de fábrica', evidencia: 'defecto_01.jpg', image: IMG.boxShoes },
      { sku: 'FX-IN-3302', descripcion: 'Zapato escolar Flexi niño — Café', motivo: 'Costura abierta', evidencia: 'defecto_02.jpg', image: IMG.bootBrown },
      { sku: 'FX-IN-3303', descripcion: 'Tenis escolar Flexi niño — Blanco', motivo: 'Suela despegada', evidencia: 'defecto_03.jpg', image: IMG.sneakerWhite },
    ],
    timeline: [
      ev('28 jun', '10:00', 'Karen Ríos', 'creó el expediente', 'create'),
      ev('29 jun', '11:00', 'Diana Quintero', 'validó calidad', 'status'),
      ev('30 jun', '16:00', 'Sistema', 'cerró el expediente', 'status'),
    ],
  },
]

export function findReturn(folio: string): ReturnCase | undefined {
  return RETURNS.find((r) => r.folio === folio)
}

export function personById(id: string): Person {
  return PEOPLE.find((p) => p.id === id) ?? PEOPLE[0]
}

// --------------------------- Devoluciones masivas --------------------------

export interface MassSub {
  sucursal: string
  solicitado: number
  enviado: number
  recibido: number
  responsableId: string
  fechaCompromiso: string
  status: StatusKey
  evidencias: Evidence[]
  historial: TimelineEvent[]
}

export interface MassReturn {
  folio: string
  lote: string
  linea: string
  marca: string
  proveedor: string
  producto: string
  creada: string
  responsable: string
  subs: MassSub[]
}

/** Unidades pendientes de una sucursal (solicitado − enviado). */
export function subPendiente(s: MassSub): number {
  return Math.max(0, s.solicitado - s.enviado)
}

export const MASS_RETURNS: MassReturn[] = [
  {
    folio: 'DEV-M-2026-0042',
    lote: 'LT-NK-2291',
    linea: 'Calzado Deportivo',
    marca: 'Nike',
    proveedor: 'Nike México',
    producto: 'Nike Air Jordan 1 Mid — Lote defectuoso',
    creada: '04 jul 2026',
    responsable: 'Fernanda López',
    subs: [
      { sucursal: 'Culiacán Centro', solicitado: 12, enviado: 12, recibido: 12, responsableId: 'u1', fechaCompromiso: '06 jul 2026', status: 'recibido', evidencias: [{ url: IMG.boxShoes, label: 'Empaque de envío' }], historial: [ev('05 jul', '09:00', 'Karen Ríos', 'preparó el envío', 'attach'), ev('06 jul', '14:00', 'CEDIS Culiacán', 'recibió 12 uds.', 'receive')] },
      { sucursal: 'Culiacán Forum', solicitado: 8, enviado: 8, recibido: 8, responsableId: 'u1', fechaCompromiso: '06 jul 2026', status: 'recibido', evidencias: [{ url: IMG.boxShoes, label: 'Empaque' }], historial: [ev('06 jul', '15:30', 'CEDIS Culiacán', 'recibió 8 uds.', 'receive')] },
      { sucursal: 'Mazatlán Marina', solicitado: 10, enviado: 6, recibido: 6, responsableId: 'u2', fechaCompromiso: '08 jul 2026', status: 'transito', evidencias: [{ url: IMG.sneakerRed, label: 'Video del lote', kind: 'video' }], historial: [ev('07 jul', '10:00', 'Miguel Andrade', 'envió 6 de 10 uds.', 'transfer')] },
      { sucursal: 'Guadalajara Andares', solicitado: 15, enviado: 0, recibido: 0, responsableId: 'u2', fechaCompromiso: '09 jul 2026', status: 'pendiente_traslado', evidencias: [], historial: [ev('05 jul', '09:00', 'Sistema', 'generó el subexpediente', 'create')] },
      { sucursal: 'Los Mochis Plaza', solicitado: 6, enviado: 6, recibido: 6, responsableId: 'u1', fechaCompromiso: '06 jul 2026', status: 'recibido', evidencias: [{ url: IMG.boxShoes, label: 'Empaque' }], historial: [ev('06 jul', '12:00', 'CEDIS Culiacán', 'recibió 6 uds.', 'receive')] },
      { sucursal: 'Hermosillo Sur', solicitado: 9, enviado: 0, recibido: 0, responsableId: 'u1', fechaCompromiso: '09 jul 2026', status: 'nuevo', evidencias: [], historial: [ev('05 jul', '09:00', 'Sistema', 'generó el subexpediente', 'create')] },
    ],
  },
  {
    folio: 'DEV-M-2026-0041',
    lote: 'LT-AD-1180',
    linea: 'Calzado Deportivo',
    marca: 'Adidas',
    proveedor: 'Adidas México',
    producto: 'Adidas Ultraboost Light — Retiro de lote',
    creada: '01 jul 2026',
    responsable: 'Fernanda López',
    subs: [
      { sucursal: 'Culiacán Centro', solicitado: 5, enviado: 5, recibido: 5, responsableId: 'u1', fechaCompromiso: '03 jul 2026', status: 'recibido', evidencias: [{ url: IMG.sneakerWhite, label: 'Producto' }], historial: [ev('03 jul', '11:00', 'CEDIS Culiacán', 'recibió 5 uds.', 'receive')] },
      { sucursal: 'Guadalajara Andares', solicitado: 7, enviado: 7, recibido: 7, responsableId: 'u2', fechaCompromiso: '03 jul 2026', status: 'recibido', evidencias: [{ url: IMG.sneakerWhite, label: 'Producto' }], historial: [ev('03 jul', '13:00', 'CEDIS Culiacán', 'recibió 7 uds.', 'receive')] },
      { sucursal: 'Guasave Centro', solicitado: 4, enviado: 4, recibido: 4, responsableId: 'u1', fechaCompromiso: '03 jul 2026', status: 'recibido', evidencias: [], historial: [ev('03 jul', '14:00', 'CEDIS Culiacán', 'recibió 4 uds.', 'receive')] },
    ],
  },
]

export function findMassReturn(folio: string): MassReturn | undefined {
  return MASS_RETURNS.find((m) => m.folio === folio)
}

// --------------------------- Notificaciones --------------------------------

export interface Notif {
  id: string
  icon: 'assign' | 'info' | 'transfer' | 'mass'
  text: string
  time: string
  folio?: string
  unread: boolean
}

export const NOTIFICATIONS: Notif[] = [
  { id: 'n1', icon: 'assign', text: 'Se te asignó la devolución DEV-2026-000154', time: 'hace 20 min', folio: 'DEV-2026-000154', unread: true },
  { id: 'n2', icon: 'info', text: 'Compras solicitó información adicional en DEV-2026-000151', time: 'hace 1 h', folio: 'DEV-2026-000151', unread: true },
  { id: 'n3', icon: 'transfer', text: 'El traslado TR-44098 fue recibido en CEDIS Culiacán', time: 'hace 3 h', folio: 'DEV-2026-000150', unread: true },
  { id: 'n4', icon: 'mass', text: 'Devolución masiva DEV-M-2026-0042 pendiente de cumplimiento', time: 'ayer', unread: false },
  { id: 'n5', icon: 'transfer', text: 'Traslado urgente pendiente en DEV-2026-000148', time: 'ayer', folio: 'DEV-2026-000148', unread: false },
]

// --------------------------- KPIs y gráficas -------------------------------

export const KPIS = {
  total: 154,
  pendientes: 38,
  autorizadas: 82,
  rechazadas: 14,
  tiempoPromedio: '1.8 días',
  fueraSla: 6,
}

export const byType = [
  { name: 'Cliente', value: 64 },
  { name: 'Ecommerce', value: 38 },
  { name: 'Depuración', value: 27 },
  { name: 'Redistribución', value: 15 },
  { name: 'Masiva', value: 10 },
]

export const bySucursal = [
  { name: 'Culiacán Centro', value: 42 },
  { name: 'Guadalajara', value: 31 },
  { name: 'Mazatlán', value: 24 },
  { name: 'Los Mochis', value: 21 },
  { name: 'Hermosillo', value: 18 },
  { name: 'Guasave', value: 18 },
]

export const byProveedor = [
  { name: 'Nike México', value: 34 },
  { name: 'Flexi S.A.', value: 29 },
  { name: 'Adidas México', value: 27 },
  { name: 'Grupo Andrea', value: 22 },
  { name: 'VF Corp', value: 25 },
  { name: 'Puma LATAM', value: 17 },
]

export const byMarca = [
  { name: 'Nike', value: 34 },
  { name: 'Flexi', value: 29 },
  { name: 'Adidas', value: 27 },
  { name: 'Andrea', value: 22 },
  { name: 'Vans', value: 16 },
  { name: 'Puma', value: 17 },
]

export const byMotivo = [
  { name: 'Defecto de fábrica', value: 48 },
  { name: 'Talla incorrecta', value: 31 },
  { name: 'Suela despegada', value: 26 },
  { name: 'Costura abierta', value: 19 },
  { name: 'Manchas', value: 16 },
  { name: 'Otros', value: 14 },
]

export const trend = [
  { name: 'Ene', value: 88 },
  { name: 'Feb', value: 96 },
  { name: 'Mar', value: 110 },
  { name: 'Abr', value: 104 },
  { name: 'May', value: 132 },
  { name: 'Jun', value: 148 },
  { name: 'Jul', value: 154 },
]

export const topLotes = [
  { lote: 'LT-NK-2291', marca: 'Nike', proveedor: 'Nike México', incidencias: 24, tasa: '8.2%' },
  { lote: 'LT-AD-1180', marca: 'Adidas', proveedor: 'Adidas México', incidencias: 18, tasa: '6.1%' },
  { lote: 'LT-FX-7781', marca: 'Flexi', proveedor: 'Calzado Flexi S.A.', incidencias: 15, tasa: '5.4%' },
  { lote: 'LT-VN-3320', marca: 'Vans', proveedor: 'VF Corp', incidencias: 11, tasa: '4.0%' },
  { lote: 'LT-PM-9910', marca: 'Puma', proveedor: 'Puma LATAM', incidencias: 9, tasa: '3.3%' },
]

// Productos con mayor incidencia (análisis operativo de Compras).
export const byProducto = [
  { name: 'Nike Air Jordan 1 Mid', value: 24 },
  { name: 'Adidas Ultraboost Light', value: 18 },
  { name: 'Flexi confort dama', value: 15 },
  { name: 'Vans Old Skool', value: 11 },
  { name: 'Puma RS-X', value: 9 },
]

// Compradores con mayor carga operativa (expedientes abiertos asignados).
export const byComprador = [
  { name: 'Fernanda López', value: 21 },
  { name: 'Diana Quintero', value: 14 },
  { name: 'Óscar Beltrán', value: 9 },
]

// Autorizaciones resueltas por día (serie temporal para Compras).
export const autorizacionesTrend = [
  { name: 'Lun', value: 9 },
  { name: 'Mar', value: 14 },
  { name: 'Mié', value: 11 },
  { name: 'Jue', value: 17 },
  { name: 'Vie', value: 15 },
  { name: 'Sáb', value: 6 },
  { name: 'Dom', value: 3 },
]

// KPIs operativos de Compras (dashboard orientado a decisión, no ejecutivo).
export const COMPRAS_KPIS = {
  porAutorizar: 12,
  solicitudesAbiertas: 5,
  criticosSla: 3,
  tiempoAutorizacion: '4.2 h',
  cumplimientoSla: 94,
  masivasActivas: 2,
}

export const CHART_COLORS = ['#D32F2F', '#f59e0b', '#6366f1', '#10b981', '#0ea5e9', '#8b5cf6']

// ===========================================================================
// INCIDENCIAS DE ECOMMERCE
// ---------------------------------------------------------------------------
// El rol Ecommerce NO genera devoluciones. Su operación es recibir e
// inspeccionar la mercancía que una sucursal envía al almacén Ecommerce vía
// redistribución y, cuando llega en mal estado, registrar una
// "Incidencia en redistribución". El objetivo es registro, seguimiento y
// reporteo — sin automatizar consecuencias ni sanciones.
// ===========================================================================

export type IncidenciaStatus = 'abierta' | 'revision' | 'esperando' | 'resuelta' | 'cerrada'

export const INCIDENCIA_STATUS: Record<IncidenciaStatus, { label: string; text: string; bg: string; dot: string }> = {
  abierta: { label: 'Abierta', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  revision: { label: 'En revisión de Compras', text: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500' },
  esperando: { label: 'Esperando información', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  resuelta: { label: 'Resuelta', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  cerrada: { label: 'Cerrada', text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500' },
}

/** Motivos de incidencia al recibir mercancía en mal estado en el almacén Ecommerce. */
export const MOTIVOS_INCIDENCIA = [
  'Empaque dañado',
  'Producto manchado / sucio',
  'Producto incompleto',
  'Modelo o talla incorrecta',
  'Daño en transporte',
  'Sello de seguridad violado',
  'Mercancía mojada',
  'Faltante de piezas',
]

export interface Incidencia {
  folio: string
  /** ID o folio relacionado (traslado / redistribución de origen). */
  relacionado: string
  sku: string
  producto: string
  lote: string
  marca: string
  proveedor: string
  categoria: string
  /** Trazabilidad del envío que originó la incidencia. */
  sucursalOrigen: string
  gerenteOrigen: string
  motivo: string
  status: IncidenciaStatus
  priority: PriorityKey
  /** Comprador responsable de la línea/marca (consulta de responsables). */
  responsableId: string
  /** Resolución registrada por Compras (consulta de resoluciones). */
  resolucion?: string
  creada: string
  image: string
  evidencias: Evidence[]
  comments: Comment[]
  timeline: TimelineEvent[]
}

export const INCIDENCIAS: Incidencia[] = [
  {
    folio: 'INC-EC-2026-0007',
    relacionado: 'TR-45012',
    sku: 'NK-AJ1-2291',
    producto: 'Tenis Nike Air Jordan 1 Mid — Negro/Rojo',
    lote: 'LT-NK-2291',
    marca: 'Nike',
    proveedor: 'Nike México',
    categoria: 'Deportivo',
    sucursalOrigen: 'Culiacán Centro',
    gerenteOrigen: 'Laura Beltrán',
    motivo: 'Empaque dañado',
    status: 'abierta',
    priority: 'alta',
    responsableId: 'u3',
    creada: '14 jul 2026',
    image: IMG.sneakerRed,
    evidencias: [
      { url: IMG.boxShoes, label: 'Caja aplastada', kind: 'image' },
      { url: IMG.sneakerRed, label: 'Video de la inspección', kind: 'video' },
    ],
    comments: [
      { id: 'c1', authorId: 'u7', time: '10:20', text: 'Al recibir el traslado TR-45012 detecté 3 cajas aplastadas. Adjunto evidencia fotográfica y video de la inspección.', attachment: { name: 'caja_aplastada.jpg', kind: 'image' } },
    ],
    timeline: [
      ev('14 jul', '10:15', 'Paola Ceballos', 'registró la incidencia', 'create'),
      ev('14 jul', '10:20', 'Paola Ceballos', 'adjuntó evidencias', 'attach'),
      ev('14 jul', '10:40', 'Sistema', 'asignó la incidencia a Fernanda López (Compras)', 'status'),
    ],
  },
  {
    folio: 'INC-EC-2026-0006',
    relacionado: 'TR-44980',
    sku: 'AD-UB-1180',
    producto: 'Tenis Adidas Ultraboost Light — Blanco',
    lote: 'LT-AD-1180',
    marca: 'Adidas',
    proveedor: 'Adidas México',
    categoria: 'Deportivo',
    sucursalOrigen: 'Guadalajara Andares',
    gerenteOrigen: 'Ramón Cázares',
    motivo: 'Producto manchado / sucio',
    status: 'esperando',
    priority: 'media',
    responsableId: 'u3',
    creada: '12 jul 2026',
    image: IMG.sneakerWhite,
    evidencias: [{ url: IMG.sneakerWhite, label: 'Mancha en tela', kind: 'image' }],
    comments: [
      { id: 'c1', authorId: 'u7', time: '09:10', text: 'Par blanco recibido con manchas de suela. No apto para venta en línea.' },
      { id: 'c2', authorId: 'u3', time: '11:30', text: '@Paola Ceballos ¿puedes confirmar cuántos pares del lote presentan la mancha? Necesito el dato para la resolución.' },
    ],
    timeline: [
      ev('12 jul', '09:05', 'Paola Ceballos', 'registró la incidencia', 'create'),
      ev('12 jul', '11:30', 'Fernanda López', 'solicitó más información', 'comment'),
    ],
  },
  {
    folio: 'INC-EC-2026-0005',
    relacionado: 'TR-44905',
    sku: 'CH-BG-1200',
    producto: 'Bolsa Coach Willow — Café',
    lote: 'LT-CH-1200',
    marca: 'Coach',
    proveedor: 'VF Corp',
    categoria: 'Accesorios',
    sucursalOrigen: 'Guasave Centro',
    gerenteOrigen: 'Patricia Nava',
    motivo: 'Faltante de piezas',
    status: 'revision',
    priority: 'urgente',
    responsableId: 'u5',
    creada: '11 jul 2026',
    image: IMG.bag,
    evidencias: [{ url: IMG.bag, label: 'Contenido incompleto', kind: 'image' }],
    comments: [
      { id: 'c1', authorId: 'u7', time: '16:40', text: 'El envío indica 4 piezas pero solo llegaron 3. Falta 1 bolsa Coach Willow.' },
    ],
    timeline: [
      ev('11 jul', '16:35', 'Paola Ceballos', 'registró la incidencia', 'create'),
      ev('11 jul', '17:00', 'Sistema', 'asignó la incidencia a Diana Quintero (Compras)', 'status'),
    ],
  },
  {
    folio: 'INC-EC-2026-0004',
    relacionado: 'TR-44870',
    sku: 'VN-OS-3320',
    producto: 'Vans Old Skool — Negro/Blanco',
    lote: 'LT-VN-3320',
    marca: 'Vans',
    proveedor: 'VF Corp',
    categoria: 'Casual',
    sucursalOrigen: 'Los Mochis Plaza',
    gerenteOrigen: 'Patricia Nava',
    motivo: 'Daño en transporte',
    status: 'resuelta',
    priority: 'baja',
    responsableId: 'u5',
    resolucion: 'Producto enviado a Almacén de merma · no recuperable',
    creada: '08 jul 2026',
    image: IMG.running,
    evidencias: [{ url: IMG.running, label: 'Daño en caja' }],
    comments: [
      { id: 'c1', authorId: 'u5', time: '10:00', text: 'Confirmado daño irreversible. Se envía a merma. Resolución registrada.' },
    ],
    timeline: [
      ev('08 jul', '09:20', 'Paola Ceballos', 'registró la incidencia', 'create'),
      ev('08 jul', '10:00', 'Diana Quintero', 'resolvió la incidencia', 'status'),
    ],
  },
  {
    folio: 'INC-EC-2026-0003',
    relacionado: 'TR-44810',
    sku: 'AN-ZP-5510',
    producto: 'Zapatilla Andrea tacón medio — Nude',
    lote: 'LT-AN-5510',
    marca: 'Andrea',
    proveedor: 'Grupo Andrea',
    categoria: 'Calzado dama',
    sucursalOrigen: 'Culiacán Forum',
    gerenteOrigen: 'Elena Ruvalcaba',
    motivo: 'Modelo o talla incorrecta',
    status: 'cerrada',
    priority: 'media',
    responsableId: 'u4',
    resolucion: 'Reetiquetado y reingreso a inventario Ecommerce',
    creada: '05 jul 2026',
    image: IMG.heels,
    evidencias: [{ url: IMG.heels, label: 'Etiqueta incorrecta' }],
    comments: [],
    timeline: [
      ev('05 jul', '12:00', 'Paola Ceballos', 'registró la incidencia', 'create'),
      ev('06 jul', '09:00', 'Óscar Beltrán', 'resolvió y cerró la incidencia', 'status'),
    ],
  },
  // -------- Historial (para tendencia mensual y filtros por periodo) --------
  ...([
    ['INC-EC-2026-0002', 'AD-UB-1180', 'Tenis Adidas Ultraboost Light — Blanco', 'LT-AD-1180', 'Adidas', 'Adidas México', 'Deportivo', 'Guadalajara Andares', 'Ramón Cázares', 'Producto manchado / sucio', 'cerrada', 'media', 'u3', '28 jun 2026', 'sneakerWhite'],
    ['INC-EC-2026-0001', 'NK-AJ1-2291', 'Tenis Nike Air Jordan 1 Mid — Negro/Rojo', 'LT-NK-2291', 'Nike', 'Nike México', 'Deportivo', 'Culiacán Centro', 'Laura Beltrán', 'Empaque dañado', 'resuelta', 'alta', 'u3', '19 jun 2026', 'sneakerRed'],
    ['INC-EC-2026-0000', 'PM-RS-9910', 'Puma RS-X — Gris', 'LT-PM-9910', 'Puma', 'Puma LATAM', 'Accesorios', 'Hermosillo Sur', 'Mónica Salazar', 'Faltante de piezas', 'cerrada', 'baja', 'u5', '09 jun 2026', 'running'],
    ['INC-EC-2025-0142', 'CH-BG-1200', 'Bolsa Coach Willow — Café', 'LT-CH-1200', 'Coach', 'VF Corp', 'Accesorios', 'Guasave Centro', 'Sergio Padilla', 'Daño en transporte', 'cerrada', 'media', 'u5', '22 may 2026', 'bag'],
    ['INC-EC-2025-0141', 'FX-CM-7781', 'Zapato confort Flexi dama — Café', 'LT-FX-7781', 'Flexi', 'Calzado Flexi S.A.', 'Calzado dama', 'Mazatlán Marina', 'Hugo Terán', 'Mercancía mojada', 'resuelta', 'media', 'u4', '07 may 2026', 'heels'],
    ['INC-EC-2025-0140', 'VN-OS-3320', 'Vans Old Skool — Negro/Blanco', 'LT-VN-3320', 'Vans', 'VF Corp', 'Casual', 'Tijuana Río', 'Carlos Fuentes', 'Modelo o talla incorrecta', 'cerrada', 'baja', 'u5', '24 abr 2026', 'running'],
    ['INC-EC-2025-0139', 'SK-GW-4410', 'Skechers Go Walk — Azul marino', 'LT-SK-4410', 'Skechers', 'VF Corp', 'Deportivo', 'Guadalajara Patria', 'Adriana Michel', 'Sello de seguridad violado', 'cerrada', 'media', 'u3', '11 abr 2026', 'sneakerWhite'],
    ['INC-EC-2025-0138', 'AN-ZP-5510', 'Zapatilla Andrea tacón medio — Nude', 'LT-AN-5510', 'Andrea', 'Grupo Andrea', 'Calzado dama', 'Culiacán Forum', 'Elena Ruvalcaba', 'Producto incompleto', 'resuelta', 'baja', 'u4', '20 mar 2026', 'heels'],
    ['INC-EC-2025-0137', 'NK-AJ1-2291', 'Tenis Nike Air Jordan 1 Mid — Negro/Rojo', 'LT-NK-2291', 'Nike', 'Nike México', 'Deportivo', 'Los Mochis Plaza', 'Patricia Nava', 'Empaque dañado', 'cerrada', 'media', 'u3', '06 mar 2026', 'sneakerRed'],
    ['INC-EC-2025-0136', 'CH-BG-1200', 'Bolsa Coach Willow — Café', 'LT-CH-1200', 'Coach', 'VF Corp', 'Accesorios', 'Hermosillo Morelos', 'Néstor Padrón', 'Daño en transporte', 'cerrada', 'alta', 'u5', '14 feb 2026', 'bag'],
  ] as const).map(([folio, sku, producto, lote, marca, proveedor, categoria, sucursalOrigen, gerenteOrigen, motivo, status, priority, responsableId, creada, img]) => ({
    folio,
    relacionado: `TR-${folio.slice(-4)}`,
    sku,
    producto,
    lote,
    marca,
    proveedor,
    categoria,
    sucursalOrigen,
    gerenteOrigen,
    motivo,
    status: status as IncidenciaStatus,
    priority: priority as PriorityKey,
    responsableId,
    resolucion: status === 'cerrada' || status === 'resuelta' ? 'Resolución registrada por Compras' : undefined,
    creada,
    image: (IMG as Record<string, string>)[img],
    evidencias: [{ url: (IMG as Record<string, string>)[img], label: 'Evidencia' }],
    comments: [],
    timeline: [ev(creada.slice(0, 6), '10:00', 'Paola Ceballos', 'registró la incidencia', 'create')],
  })),
]

export function findIncidencia(folio: string): Incidencia | undefined {
  return INCIDENCIAS.find((i) => i.folio === folio)
}

// --------------------------- Productos bloqueados --------------------------
// Cuando Compras rechaza una devolución y el producto permanece en la tienda,
// el producto se bloquea para Ecommerce pero sigue disponible para venta física.

export interface ProductoBloqueado {
  sku: string
  producto: string
  sucursal: string
  folioOrigen: string
  motivo: string
  fecha: string
  image: string
  ventaFisica: boolean
}

export const BLOQUEADOS_ECOMMERCE: ProductoBloqueado[] = [
  { sku: 'PM-RS-9910', producto: 'Puma RS-X — Gris', sucursal: 'Hermosillo Sur', folioOrigen: 'DEV-2026-000149', motivo: 'Devolución rechazada · daño por mal uso', fecha: '01 jul 2026', image: IMG.running, ventaFisica: true },
  { sku: 'SK-GW-4410', producto: 'Skechers Go Walk — Azul marino', sucursal: 'Culiacán Centro', folioOrigen: 'DEV-2026-000144', motivo: 'Producto sin defecto detectado · permanece en tienda', fecha: '28 jun 2026', image: IMG.sneakerWhite, ventaFisica: true },
  { sku: 'FX-CM-7781', producto: 'Zapato confort Flexi dama — Café', sucursal: 'Mazatlán Marina', folioOrigen: 'DEV-2026-000139', motivo: 'Fuera de política de devolución', fecha: '24 jun 2026', image: IMG.heels, ventaFisica: true },
]

// -------------------- KPIs operativos del portal Ecommerce -----------------
// Derivados de las incidencias y de los productos bloqueados.

export const ECOMMERCE_KPIS = {
  abiertas: INCIDENCIAS.filter((i) => i.status === 'abierta' || i.status === 'revision' || i.status === 'esperando').length,
  pendientesRevision: INCIDENCIAS.filter((i) => i.status === 'abierta').length,
  resueltas: INCIDENCIAS.filter((i) => i.status === 'resuelta' || i.status === 'cerrada').length,
  bloqueados: BLOQUEADOS_ECOMMERCE.length,
  tiempoResolucion: '2.1 días',
}

// Análisis para reporte de incidencias Ecommerce.
export const incidenciasPorMotivo = MOTIVOS_INCIDENCIA.map((m) => ({
  name: m,
  value: INCIDENCIAS.filter((i) => i.motivo === m).length,
})).filter((d) => d.value > 0)

// ------------------------- Fechas (demo determinista) ----------------------
// El prototipo usa fechas fijas de julio 2026; "HOY" ancla los cálculos
// relativos (tiempo transcurrido, SLA) para que sean deterministas.

export const HOY = '15 jul 2026'

const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Convierte "DD mmm YYYY" (es) a un número de días absoluto aproximado. */
function fechaADias(fecha: string): number | null {
  const m = fecha.trim().match(/^(\d{1,2})\s+([a-záéí]{3})\.?\s+(\d{4})$/i)
  if (!m) return null
  const dia = parseInt(m[1], 10)
  const mes = MESES_ES.indexOf(m[2].toLowerCase().slice(0, 3))
  const anio = parseInt(m[3], 10)
  if (mes < 0) return null
  return anio * 365 + mes * 30 + dia
}

/** Número comparable de días desde fechas "DD mmm YYYY" (es) o "YYYY-MM-DD" (ISO). */
export function fechaANumero(str: string): number | null {
  if (!str) return null
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return parseInt(iso[1], 10) * 365 + (parseInt(iso[2], 10) - 1) * 30 + parseInt(iso[3], 10)
  return fechaADias(str)
}

/** Días transcurridos entre una fecha y HOY (para "tiempo transcurrido"). */
export function diasTranscurridos(fecha: string): number {
  const a = fechaADias(fecha)
  const b = fechaADias(HOY)
  if (a == null || b == null) return 0
  return Math.max(0, b - a)
}

/** Texto "hace X días / horas" a partir de la fecha de creación. */
export function tiempoTranscurrido(fecha: string): string {
  const d = diasTranscurridos(fecha)
  if (d <= 0) return 'Hoy'
  if (d === 1) return '1 día'
  return `${d} días`
}

/** ¿La fecha "DD mmm YYYY" cae dentro del rango [desde, hasta] (mismo formato)? */
export function fechaEnRango(fecha: string, desde: string, hasta: string): boolean {
  const f = fechaADias(fecha)
  if (f == null) return true
  const d = desde ? fechaADias(desde) : null
  const h = hasta ? fechaADias(hasta) : null
  if (d != null && f < d) return false
  if (h != null && f > h) return false
  return true
}

// ---------------------------- Gerentes por sucursal ------------------------
// Responsable de cada sucursal origen (para trazabilidad de incidencias).

export const GERENTES_SUCURSAL: Record<string, string> = {
  'Culiacán Centro': 'Laura Beltrán',
  'Culiacán Forum': 'Elena Ruvalcaba',
  'Mazatlán Marina': 'Hugo Terán',
  'Los Mochis Plaza': 'Patricia Nava',
  'Guadalajara Andares': 'Ramón Cázares',
  'Guasave Centro': 'Sergio Padilla',
  'Hermosillo Sur': 'Mónica Salazar',
  'CEDIS Culiacán': 'Raúl Espinoza',
  'Tijuana Río': 'Carlos Fuentes',
  'Guadalajara Patria': 'Adriana Michel',
  'Hermosillo Morelos': 'Néstor Padrón',
}

export function gerenteDeSucursal(sucursal: string): string {
  return GERENTES_SUCURSAL[sucursal] ?? '—'
}

/** Sucursales que pueden ser origen de una redistribución (captura manual). */
export const SUCURSALES_ORIGEN = Array.from(new Set([...SUCURSALES, 'Tijuana Río', 'Guadalajara Patria', 'Hermosillo Morelos']))

/** Gerentes para autocompletado al capturar la trazabilidad de la incidencia. */
export const GERENTES = Array.from(new Set(Object.values(GERENTES_SUCURSAL)))

/** Severidad de una incidencia de redistribución (para priorizar y reportar). */
export const SEVERIDADES = ['Baja', 'Media', 'Alta', 'Crítica']

// ------------------- Traslados de redistribución (wizard) ------------------
// El wizard de incidencias busca un traslado por ID de venta / traslado /
// folio de redistribución y trae sus productos para seleccionar el afectado.

export interface TrasladoProducto {
  sku: string
  descripcion: string
  marca: string
  proveedor: string
  lote: string
  talla: string
  color: string
  image: string
}

export interface Traslado {
  folioRedistribucion: string
  idTraslado: string
  idVenta: string
  sucursalOrigen: string
  fecha: string
  productos: TrasladoProducto[]
}

export const TRASLADOS: Traslado[] = [
  {
    folioRedistribucion: 'RD-2026-0091',
    idTraslado: 'TR-45012',
    idVenta: 'EC-99210',
    sucursalOrigen: 'Culiacán Centro',
    fecha: '12 jul 2026',
    productos: [
      { sku: 'NK-AJ1-2291', descripcion: 'Tenis Nike Air Jordan 1 Mid — Negro/Rojo', marca: 'Nike', proveedor: 'Nike México', lote: 'LT-NK-2291', talla: '27 MX', color: 'Negro / Rojo', image: IMG.sneakerRed },
      { sku: 'AD-UB-1180', descripcion: 'Tenis Adidas Ultraboost Light — Blanco', marca: 'Adidas', proveedor: 'Adidas México', lote: 'LT-AD-1180', talla: '28 MX', color: 'Blanco', image: IMG.sneakerWhite },
      { sku: 'CH-BG-1200', descripcion: 'Bolsa Coach Willow — Café', marca: 'Coach', proveedor: 'VF Corp', lote: 'LT-CH-1200', talla: 'Única', color: 'Café', image: IMG.bag },
    ],
  },
  {
    folioRedistribucion: 'RD-2026-0088',
    idTraslado: 'TR-44980',
    idVenta: 'EC-99120',
    sucursalOrigen: 'Guadalajara Andares',
    fecha: '10 jul 2026',
    productos: [
      { sku: 'SK-GW-4410', descripcion: 'Skechers Go Walk — Azul marino', marca: 'Skechers', proveedor: 'VF Corp', lote: 'LT-SK-4410', talla: '27 MX', color: 'Azul marino', image: IMG.sneakerWhite },
      { sku: 'VN-OS-3320', descripcion: 'Vans Old Skool — Negro/Blanco', marca: 'Vans', proveedor: 'VF Corp', lote: 'LT-VN-3320', talla: '26 MX', color: 'Negro / Blanco', image: IMG.running },
    ],
  },
]

/** Busca un traslado por ID de venta, ID de traslado, folio de redistribución o SKU. */
export function buscarTraslado(q: { idVenta?: string; idTraslado?: string; folioRedistribucion?: string; sku?: string }): Traslado | undefined {
  const norm = (s?: string) => (s ?? '').trim().toLowerCase()
  const anyInput = norm(q.idVenta) || norm(q.idTraslado) || norm(q.folioRedistribucion) || norm(q.sku)
  const found = TRASLADOS.find(
    (t) =>
      (norm(q.idVenta) && norm(t.idVenta) === norm(q.idVenta)) ||
      (norm(q.idTraslado) && norm(t.idTraslado) === norm(q.idTraslado)) ||
      (norm(q.folioRedistribucion) && norm(t.folioRedistribucion) === norm(q.folioRedistribucion)) ||
      (norm(q.sku) && t.productos.some((p) => norm(p.sku) === norm(q.sku))),
  )
  // En el prototipo, si no hay coincidencia exacta pero se capturó algún dato,
  // se devuelve el primer traslado de ejemplo para poder continuar el flujo.
  if (found) return found
  if (anyInput) return TRASLADOS[0]
  return undefined
}

// ------------------- Ventas / facturas (wizard Tienda) ---------------------
// Cliente en Tienda: se busca por factura. Ecommerce: se busca por ID de venta.
// El sistema trae los productos de la venta y valida que no exista una
// devolución activa asociada (regla: una devolución activa por factura/venta).

export interface Venta {
  folio: string
  tipo: 'cliente' | 'ecommerce'
  cliente: string
  sucursal: string
  fecha: string
  productos: TrasladoProducto[]
}

const VENTAS: Venta[] = [
  {
    folio: 'FA-CUL-88231', tipo: 'cliente', cliente: 'Laura Sánchez Medina', sucursal: 'Culiacán Centro', fecha: '28 jun 2026',
    productos: [
      { sku: 'NK-AJ1-2291', descripcion: 'Tenis Nike Air Jordan 1 Mid — Negro/Rojo', marca: 'Nike', proveedor: 'Nike México', lote: 'LT-NK-2291', talla: '27 MX', color: 'Negro / Rojo', image: IMG.sneakerRed },
      { sku: 'NK-CALC-01', descripcion: 'Calcetas Nike Everyday (3 pares)', marca: 'Nike', proveedor: 'Nike México', lote: 'LT-NK-CALC', talla: 'Única', color: 'Blanco', image: IMG.boxShoes },
    ],
  },
  {
    folio: 'FA-FOR-77120', tipo: 'cliente', cliente: 'Patricia Vega', sucursal: 'Culiacán Forum', fecha: '15 jun 2026',
    productos: [
      { sku: 'AN-ZP-5510', descripcion: 'Zapatilla Andrea tacón medio — Nude', marca: 'Andrea', proveedor: 'Grupo Andrea', lote: 'LT-AN-5510', talla: '24 MX', color: 'Nude', image: IMG.heels },
    ],
  },
  {
    folio: 'EC-99120', tipo: 'ecommerce', cliente: 'Roberto Gil', sucursal: 'Guadalajara Andares', fecha: '22 jun 2026',
    productos: [
      { sku: 'AD-UB-1180', descripcion: 'Tenis Adidas Ultraboost Light — Blanco', marca: 'Adidas', proveedor: 'Adidas México', lote: 'LT-AD-1180', talla: '28 MX', color: 'Blanco', image: IMG.sneakerWhite },
    ],
  },
  {
    folio: 'EC-98004', tipo: 'ecommerce', cliente: 'Sofía Torres', sucursal: 'Guasave Centro', fecha: '20 jun 2026',
    productos: [
      { sku: 'CH-BG-1200', descripcion: 'Bolsa Coach Willow — Café', marca: 'Coach', proveedor: 'VF Corp', lote: 'LT-CH-1200', talla: 'Única', color: 'Café', image: IMG.bag },
    ],
  },
]

// Folios con una devolución activa (para validar la regla de no duplicar).
const DEVOLUCIONES_ACTIVAS = ['FA-FOR-77120', 'EC-98004']

const VENTA_DEFAULT_PRODUCTOS: TrasladoProducto[] = [
  { sku: 'NK-AJ1-2291', descripcion: 'Tenis Nike Air Jordan 1 Mid — Negro/Rojo', marca: 'Nike', proveedor: 'Nike México', lote: 'LT-NK-2291', talla: '27 MX', color: 'Negro / Rojo', image: IMG.sneakerRed },
  { sku: 'SK-GW-4410', descripcion: 'Skechers Go Walk — Azul marino', marca: 'Skechers', proveedor: 'VF Corp', lote: 'LT-SK-4410', talla: '27 MX', color: 'Azul marino', image: IMG.sneakerWhite },
]

export interface BusquedaVenta {
  venta?: Venta
  existe: boolean
  devolucionActiva: boolean
}

/** Busca una venta por factura (cliente) o ID de venta (ecommerce). */
export function buscarVenta(tipo: 'cliente' | 'ecommerce', folio: string): BusquedaVenta {
  const q = folio.trim()
  if (!q) return { existe: false, devolucionActiva: false }
  const found = VENTAS.find((v) => v.tipo === tipo && v.folio.toLowerCase() === q.toLowerCase())
  const devolucionActiva = DEVOLUCIONES_ACTIVAS.some((f) => f.toLowerCase() === q.toLowerCase())
  // Prototipo: cualquier folio no vacío "existe"; si no está en el catálogo se
  // devuelve una venta genérica para poder continuar el flujo.
  const venta: Venta = found ?? {
    folio: q, tipo, cliente: '—', sucursal: SUCURSALES[0], fecha: '—', productos: VENTA_DEFAULT_PRODUCTOS,
  }
  return { venta, existe: true, devolucionActiva }
}

/** Motivos sugeridos en el wizard de incidencia (paso Registrar incidencia detectada). */
export const MOTIVOS_INCIDENCIA_WIZARD = [
  'Producto dañado',
  'Mal embalaje',
  'Producto usado',
  'Producto incompleto',
  'Error de surtido',
  'Producto diferente al solicitado',
  'Otro',
]

// Devoluciones pendientes de resolución por Compras que impactan inventario
// Ecommerce (productos devueltos en tienda física aún sin resolución).
const PENDIENTE_RESOLUCION: StatusKey[] = ['nuevo', 'revision', 'esperando']
export const devolucionesPendientesResolucion = () =>
  RETURNS.filter((r) => PENDIENTE_RESOLUCION.includes(r.status))
