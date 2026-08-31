import { VentaResponse } from "./venta-response.model";

export interface VentaDetalleResponse extends VentaResponse {
  items: DetalleVentaItemResponse[];
}

export interface DetalleVentaItemResponse {
  id: number;

  idProducto: number;
  nombreProducto: string;

  cantidad: number;

  precioUnitario: number;
  porcentajeIva: number;
  valorIva: number;

  subtotal: number;
  total: number;
}