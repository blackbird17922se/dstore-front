import { PaginacionParams } from './common/paginacion-params';

/** Los tipos corresponden a EnumTipoMovimientoInventario y EnumTipoOrigenInventario. */
export type TipoMovimiento = '' | 'ENTRADA' | 'VENTA' | 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA';
export type TipoOrigenMovimiento = '' | 'ENTRADA_INVENTARIO' | 'VENTA' | 'AJUSTE_INVENTARIO';

/** Campos aceptados para ordenar el historial en el backend. */
export type CampoOrdenMovimiento =
  | 'id' | 'fechaMovimiento' | 'existencia.producto.nombre' | 'tipo'
  | 'cantidad' | 'tipoOrigen' | 'idOrigen' | 'existencia.id';

export interface MovimientoInventarioBusquedaParams extends PaginacionParams<CampoOrdenMovimiento> {
  texto: string;
  idProducto: number | null;
  idExistencia: number | null;
  tipo: TipoMovimiento;
  tipoOrigen: TipoOrigenMovimiento;
  fechaDesde: string;
  fechaHasta: string;
}
