import { PaginacionParams } from '../common/paginacion-params';

export interface PresentacionBusquedaParams
  extends PaginacionParams<'nombre'> {
  nombre: string;
  activo: boolean | null;
}