/** Estados calculados por el backend para cada existencia con vencimiento y stock. */
export type EstadoVencimiento = 'VENCIDO' | 'CRITICO' | 'PROXIMO' | 'SEGUIMIENTO' | 'SIN_ALERTA';

/** Una alerta representa un lote/existencia, no el inventario total del producto. */
export interface AlertaVencimientoResponse {
  idExistencia: number;
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  numeroLote: string | null;
  fechaVencimiento: string;
  diasRestantes: number;
  estado: EstadoVencimiento;
}

/** Los contadores indican lotes con stock; abarcan TODAS las fechas de vencimiento. */
export interface ResumenVencimientos {
  vencidos: number;
  criticos: number;
  proximos: number;
  seguimiento: number;
  sinAlerta: number;
}
