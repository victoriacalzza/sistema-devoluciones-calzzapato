// @tempo-home — Tempo home canvas (the workspace Run button opens this). Managed marker; do not remove.
import type { TempoCanvasConfig, TempoStoryboard, TempoRouteStoryboard } from 'tempo-sdk';

const config: TempoCanvasConfig = {
  name: "Sistema de Devoluciones",
};

export default config;

export const Dashboard: TempoRouteStoryboard = {
  route: "/?role=compras",
  name: "Dashboard · Compras",
  layout: { x: 0, y: 0, width: 1440, height: 1024 },
};

export const DashboardTienda: TempoRouteStoryboard = {
  route: "/?role=tienda",
  name: "Dashboard · Tienda",
  layout: { x: -1290, y: 0, width: 1200, height: 1024 },
};

export const Bandeja: TempoRouteStoryboard = {
  route: "/devoluciones",
  name: "Bandeja de devoluciones",
  layout: { x: 1490, y: 0, width: 1440, height: 1024 },
};

export const DetalleExpediente: TempoRouteStoryboard = {
  route: "/devoluciones/DEV-2026-000154",
  name: "Detalle del expediente",
  layout: { x: 0, y: 1074, width: 1440, height: 1280 },
};

export const NuevaDevolucion: TempoRouteStoryboard = {
  route: "/nueva",
  name: "Nueva devolución",
  layout: { x: 0, y: 2404, width: 1200, height: 900 },
};

export const MisPendientes: TempoRouteStoryboard = {
  route: "/pendientes",
  name: "Mis pendientes",
  layout: { x: 0, y: 3354, width: 1200, height: 900 },
};

export const DevolucionesMasivas: TempoRouteStoryboard = {
  route: "/masivas",
  name: "Devoluciones masivas",
  layout: { x: 0, y: 4304, width: 1200, height: 1000 },
};

export const Reportes: TempoRouteStoryboard = {
  route: "/reportes",
  name: "Reportes",
  layout: { x: 0, y: 5354, width: 1440, height: 1200 },
};
