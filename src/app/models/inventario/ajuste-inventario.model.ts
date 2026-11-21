/** Tipos de corrección del inventario; coinciden con EnumTipoAjusteInventario en Java. */
export type TipoAjusteInventario = 'ENTRADA' | 'SALIDA';

export interface AjusteInventarioRequest {
  idExistencia: number;
  tipo: TipoAjusteInventario;
  cantidad: number;
  motivo: string;
  observacion: string | null;
}

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
