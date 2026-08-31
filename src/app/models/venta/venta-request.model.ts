import { DetalleVentaRequest } from './detalle-venta-request.model';

export interface VentaRequest {
  idCliente: number | null;
  observacion: string | null;
  detalles: DetalleVentaRequest[];
}