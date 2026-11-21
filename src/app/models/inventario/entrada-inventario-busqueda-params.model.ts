import { PaginacionParams } from '../common/paginacion-params';

/** Campos autorizados por el endpoint paginado de entradas. */
export type CampoOrdenEntrada = 'id' | 'fechaEntrada' | 'fechaRegistro' | 'numeroDocumento' | 'observacion';

/** Fechas ISO YYYY-MM-DD; vacías cuando el filtro no está aplicado. */
export interface EntradaInventarioBusquedaParams extends PaginacionParams<CampoOrdenEntrada> {
  texto: string;
  numeroDocumento: string;
  fechaEntradaDesde: string;
  fechaEntradaHasta: string;
  fechaRegistroDesde: string;
  fechaRegistroHasta: string;
}
