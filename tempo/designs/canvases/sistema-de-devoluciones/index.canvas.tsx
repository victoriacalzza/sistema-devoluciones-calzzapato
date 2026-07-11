import { Canvas, RouteStoryboard } from "tempo-sdk/canvas";
// @tempo-home — Tempo home canvas (the workspace Run button opens this). Managed marker; do not remove.

export default function SistemaDeDevolucionesCanvas() {
  return (
    <Canvas name="Sistema de Devoluciones">
      <RouteStoryboard
        id="Dashboard"
        name="Dashboard · Compras"
        route="/?role=compras"
        layout={{ x: 0, y: 0, width: 1440, height: 1024 }}
      />
      <RouteStoryboard
        id="DashboardTienda"
        name="Dashboard · Tienda"
        route="/?role=tienda"
        layout={{ x: -1290, y: 0, width: 1200, height: 1024 }}
      />
      <RouteStoryboard
        id="Bandeja"
        name="Bandeja de devoluciones"
        route="/devoluciones"
        layout={{ x: 1490, y: 0, width: 1440, height: 1024 }}
      />
      <RouteStoryboard
        id="DetalleExpediente"
        name="Detalle del expediente"
        route="/devoluciones/DEV-2026-000154"
        layout={{ x: 0, y: 1074, width: 1440, height: 1280 }}
      />
      <RouteStoryboard
        id="NuevaDevolucion"
        name="Nueva devolución"
        route="/nueva"
        layout={{ x: 0, y: 2404, width: 1200, height: 900 }}
      />
      <RouteStoryboard
        id="MisPendientes"
        name="Mis pendientes"
        route="/pendientes"
        layout={{ x: 0, y: 3354, width: 1200, height: 900 }}
      />
      <RouteStoryboard
        id="DevolucionesMasivas"
        name="Devoluciones masivas"
        route="/masivas"
        layout={{ x: 0, y: 4304, width: 1200, height: 1000 }}
      />
      <RouteStoryboard
        id="Reportes"
        name="Reportes"
        route="/reportes"
        layout={{ x: 0, y: 5354, width: 1440, height: 1200 }}
      />
    </Canvas>
  );
}
