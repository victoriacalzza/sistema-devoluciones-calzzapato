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
  esperando: { key: 'esperando', label: 'Esperando información', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
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

// -------------------- Catálogo Comprador · Línea · Marca -------------------
// Base para la asignación automática del comprador responsable de un expediente
// y para reportes / devoluciones masivas / identificación de responsables.

export interface CLMRow {
  linea: string
  marca: string
  proveedor: string
  compradorId: string
}

export const CATALOGO_CLM: CLMRow[] = [
  { linea: 'Calzado Deportivo', marca: 'Nike', proveedor: 'Nike México', compradorId: 'u3' },
  { linea: 'Calzado Deportivo', marca: 'Adidas', proveedor: 'Adidas México', compradorId: 'u3' },
  { linea: 'Calzado Deportivo', marca: 'Skechers', proveedor: 'VF Corp', compradorId: 'u3' },
  { linea: 'Calzado Confort', marca: 'Flexi', proveedor: 'Calzado Flexi S.A.', compradorId: 'u4' },
  { linea: 'Calzado Confort', marca: 'Andrea', proveedor: 'Grupo Andrea', compradorId: 'u4' },
  { linea: 'Accesorios', marca: 'Coach', proveedor: 'VF Corp', compradorId: 'u5' },
  { linea: 'Accesorios', marca: 'Puma', proveedor: 'Puma LATAM', compradorId: 'u5' },
  { linea: 'Accesorios', marca: 'Vans', proveedor: 'VF Corp', compradorId: 'u5' },
]

export interface CompradorInfo {
  comprador: Person
  linea: string
  marca: string
  proveedor: string
}

/** Asignación automática: identifica al comprador que gestiona esa marca/línea. */
export function compradorForMarca(marca: string): CompradorInfo | undefined {
  const row = CATALOGO_CLM.find((r) => r.marca === marca)
  if (!row) return undefined
  return { comprador: personById(row.compradorId), linea: row.linea, marca: row.marca, proveedor: row.proveedor }
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
  attachment?: { name: string; kind: 'image' | 'doc' }
}

export interface Transfer {
  numero: string
  origen: string
  destino: string
  estatus: string
  fecha: string
  responsable: string
}

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
  evidences: { url: string; label: string }[]
  documents: { name: string; size: string }[]
  comments: Comment[]
  timeline: TimelineEvent[]
  transfer?: Transfer
  /** Resolución elegida por Compras al autorizar (solo devoluciones de cliente). */
  resolucion?: ResolutionKey
  /** ID de venta (Ecommerce) — equivalente a la factura física de tienda. */
  idVenta?: string
  /** Subregistros de una depuración masiva (cada producto con SKU, motivo y evidencia). */
  subproductos?: SubProducto[]
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
      { url: IMG.sneakerRed, label: 'Vista general' },
      { url: IMG.boxShoes, label: 'Caja original' },
      { url: IMG.running, label: 'Detalle suela' },
    ],
    documents: [
      { name: 'Factura_FA-CUL-88231.pdf', size: '124 KB' },
      { name: 'Ticket_compra.jpg', size: '512 KB' },
    ],
    comments: [
      { id: 'c1', authorId: 'u1', time: '09:15', text: 'Cliente reporta que la suela se despegó a la semana de uso. Adjunto fotografías del defecto.', attachment: { name: 'suela_detalle.jpg', kind: 'image' } },
      { id: 'c2', authorId: 'u3', time: '10:05', text: '@Karen Ríos ¿puedes confirmar si el producto tiene el sello de garantía intacto? Necesitamos validar antes de autorizar.' },
      { id: 'c3', authorId: 'u1', time: '10:22', text: 'Confirmado, el sello está intacto. Producto sin uso aparente de mal trato.' },
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
  evidencias: { url: string; label: string }[]
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
      { sucursal: 'Mazatlán Marina', solicitado: 10, enviado: 6, recibido: 6, responsableId: 'u2', fechaCompromiso: '08 jul 2026', status: 'transito', evidencias: [{ url: IMG.sneakerRed, label: 'Producto' }], historial: [ev('07 jul', '10:00', 'Miguel Andrade', 'envió 6 de 10 uds.', 'transfer')] },
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
