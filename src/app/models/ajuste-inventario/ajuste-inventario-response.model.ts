import { TipoAjusteInventario } from './ajuste-inventario-request.model';

export interface AjusteInventarioResponse {
  id: number;

  idExistencia: number;

  idProducto: number;
  nombreProducto: string;

  numeroLote: string | null;
  fechaVencimiento: string | null;

  tipo: TipoAjusteInventario;
  cantidad: number;

  motivo: string;
  observacion: string | null;

  fechaAjuste: string;

  idUsuario: number;
  nombreUsuario: string;
}