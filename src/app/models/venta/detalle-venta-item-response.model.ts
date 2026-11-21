/** El subtotal es la base SIN IVA, mientras que total incluye IVA. */
export interface DetalleVentaItemResponse {
  id: number;
  idVenta: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  total: number;
  valorIva: number;
  porcentajeIva: number;
  tipoIva: string;
  idProducto: number;
  /** null: dato histórico no reconstruido. No reemplazar por cero. */
  cantidadDescontada: number | null;
  /** null: dato histórico no registrado; cero significa sin faltantes. */
  cantidadSinStock: number | null;
}
