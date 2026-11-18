import { PaginacionParams } from "../common/paginacion-params";

export interface CategoriaBusquedaParams
  extends PaginacionParams<'nombre'> {
  nombre: string;
  activo: boolean | null;
}