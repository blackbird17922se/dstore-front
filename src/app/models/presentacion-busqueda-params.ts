import { PaginacionParams } from '../shared/models/paginacion-params';

export interface PresentacionBusquedaParams
  extends PaginacionParams<'nombre'> {
  nombre: string;
  activo: boolean | null;
}