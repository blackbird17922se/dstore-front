import { PaginacionParams } from './common/paginacion-params';

/** Filtros y ordenamiento admitidos por GET /marcas/paginadas. */
export interface MarcaBusquedaParams extends PaginacionParams<'nombre'> {
  nombre: string;
  activo: boolean | null;
}
