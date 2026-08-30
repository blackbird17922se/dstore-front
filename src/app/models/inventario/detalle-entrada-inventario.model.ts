export interface DetalleEntradaInventarioRequest {
  idProducto: number;
  cantidad: number;
  numeroLote: string | null;
  fechaVencimiento: string | null;
  //nombreProducto: string;
}