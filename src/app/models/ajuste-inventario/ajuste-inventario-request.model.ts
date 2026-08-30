export type TipoAjusteInventario =
  | 'ENTRADA'
  | 'SALIDA';

export interface AjusteInventarioRequest {
  idExistencia: number;
  tipo: TipoAjusteInventario;
  cantidad: number;
  motivo: string;
  observacion: string | null;
}