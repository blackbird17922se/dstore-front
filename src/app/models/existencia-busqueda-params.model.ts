import { PaginacionParams } from './common/paginacion-params';

/** Campos admitidos por el ordenamiento de Existencias en Spring Boot. */
export type CampoOrdenExistencia =
  | 'id'
  | 'producto.nombre'
  | 'cantidad'
  | 'numeroLote'
  | 'fechaVencimiento'
  | 'fechaIngreso';

/** Fechas ISO: YYYY-MM-DD. Todos los filtros adicionales son opcionales. */
export interface ExistenciaBusquedaParams extends PaginacionParams<CampoOrdenExistencia> {
  texto: string;
  idProducto: number | null;
  conStock: boolean | null;
  numeroLote: string;
  cantidadMin: number | null;
  cantidadMax: number | null;
  vencimientoDesde: string;
  vencimientoHasta: string;
  ingresoDesde: string;
  ingresoHasta: string;
}
