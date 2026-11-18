import { PaginacionParams } from '../shared/models/paginacion-params';

export interface CategoriaBusquedaParams
  extends PaginacionParams<'nombre'> {
  nombre: string;
  activo: boolean | null;
}