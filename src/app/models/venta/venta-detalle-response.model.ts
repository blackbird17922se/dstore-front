import { DetalleVentaItemResponse } from "./detalle-venta-item-response.model";

export interface VentaDetalleResponse {

  id: number;
  fecha: string;
  cliente: string | null;
  total: number;
  vendedor: string;
  estado: string;
  fechaAnulacion: string | null;
  motivoAnulacion: string | null;

  items: DetalleVentaItemResponse[];
}