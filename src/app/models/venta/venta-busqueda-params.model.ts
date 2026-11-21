/** Filtros enviados al backend: la paginación se realiza en MySQL, no en el navegador. */
export type CampoOrdenVenta = 'id' | 'fecha' | 'total' | 'subtotal' | 'ivaTotal' | 'estado';

export interface VentaBusquedaParams {
  texto: string;
  estado: string;
  idCliente: number | null;
  idVendedor: number | null;
  fechaDesde: string;
  fechaHasta: string;
  totalMin: number | null;
  totalMax: number | null;
  page: number;
  size: number;
  ordenarPor: CampoOrdenVenta;
  direccion: 'asc' | 'desc';
}
