export interface DashboardVentaReciente {
  id: number;
  fecha: string;
  cliente: string;
  total: number;
  estado: string;
}

export interface DashboardResumen {
  fechaReferencia: string;
  ventasHoy: number;
  cantidadVentasHoy: number;
  ventasSinCobertura: number;
  unidadesSinCobertura: number;
  // Null significa que el rol no puede consultar estas métricas.
  productosStockBajo: number | null;
  lotesProximosVencer: number | null;
  lotesVencidos: number | null;
  umbralStockBajo: number;
  ultimasVentas: DashboardVentaReciente[];
}
