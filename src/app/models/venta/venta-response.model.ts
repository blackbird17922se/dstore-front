/** Cabecera del historial; el detalle de productos se obtiene por separado. */
export interface VentaResponse {
  id: number;
  fecha: string;
  idCliente: number | null;
  nombreCliente: string | null;
  subtotal: number;
  /** Coincide con VentaResponseDTO.ivaTotal del backend. */
  ivaTotal: number;
  /** Compatibilidad temporal con pantallas antiguas que usen el nombre previo. */
  valorIva?: number;
  total: number;
  idVendedor: number;
  vendedor: string;
  estado: string;
  fechaAnulacion: string | null;
  motivoAnulacion: string | null;
}
