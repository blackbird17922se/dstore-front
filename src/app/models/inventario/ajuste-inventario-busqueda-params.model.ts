import { PaginacionParams } from '../common/paginacion-params';
import { TipoAjusteInventario } from './ajuste-inventario.model';

export type CampoOrdenAjuste = 'id' | 'fechaAjuste' | 'existencia.producto.nombre'
  | 'tipo' | 'cantidad' | 'existencia.id' | 'usuario.nombreUsuario' | 'motivo';

/** Las fechas se envían como YYYY-MM-DD y se filtran en Spring Boot antes de paginar. */
export interface AjusteBusquedaParams extends PaginacionParams<CampoOrdenAjuste> {
  texto: string;
  tipo: TipoAjusteInventario | '';
  idProducto: number | null;
  idExistencia: number | null;
  fechaDesde: string;
  fechaHasta: string;
}
