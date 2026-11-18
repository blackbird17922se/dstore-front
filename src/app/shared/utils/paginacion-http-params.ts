import { HttpParams } from '@angular/common/http';
import { PaginacionParams } from '../../models/common/paginacion-params'; 

export function crearPaginacionHttpParams(
  filtros: PaginacionParams
): HttpParams {
  return new HttpParams()
    .set('page', filtros.page)
    .set('size', filtros.size)
    .set('ordenarPor', filtros.ordenarPor)
    .set('direccion', filtros.direccion);
}