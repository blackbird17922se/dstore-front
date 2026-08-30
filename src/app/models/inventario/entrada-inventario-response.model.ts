import { DetalleEntradaInventarioResponse } from "./detalle-entrada-inventario-response.model";

export interface EntradaInventarioResponse {
  id: number | null,
  fechaEntrada: string;
  fechaRegistro: string
  numeroDocumento: string | null;
  observacion: string | null;
  detalles: DetalleEntradaInventarioResponse[];
}