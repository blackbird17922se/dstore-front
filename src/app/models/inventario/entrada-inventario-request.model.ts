import { DetalleEntradaInventarioRequest } from "./detalle-entrada-inventario.model";

export interface EntradaInventarioRequest {
  fechaEntrada: string;
  numeroDocumento: string | null;
  observacion: string | null;
  detalles: DetalleEntradaInventarioRequest[];
}