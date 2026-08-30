export interface DetalleEntradaInventarioResponse {
  id: number;
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  numeroLote: string | null;
  fechaVencimiento: string | null;
}