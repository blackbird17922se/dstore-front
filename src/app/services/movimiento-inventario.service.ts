import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { MovimientoInventarioResponse } from '../models/movimiento-inventario.model';
import { MovimientoInventarioBusquedaParams } from '../models/movimiento-inventario-busqueda-params.model';
import { PageResponse } from '../models/common/page-response.model';
import { crearPaginacionHttpParams } from '../shared/utils/paginacion-http-params';

@Injectable({ providedIn: 'root' })
export class MovimientoInventarioService {
  private apiUrl = `${environment.apiUrl}/movimientos-inventario`;

  constructor(private http: HttpClient) {}

  /** Se conserva para otras pantallas que consulten el historial por producto. */
  listarPorProducto(id: number): Observable<MovimientoInventarioResponse[]> {
    return this.http.get<MovimientoInventarioResponse[]>(`${this.apiUrl}/producto/${id}`);
  }

  /** Historial general: los filtros se aplican en Spring Boot ANTES de paginar. */
  listarPaginados(filtros: MovimientoInventarioBusquedaParams): Observable<PageResponse<MovimientoInventarioResponse>> {
    let params: HttpParams = crearPaginacionHttpParams(filtros);
    if (filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());
    if (filtros.idProducto !== null) params = params.set('idProducto', String(filtros.idProducto));
    if (filtros.idExistencia !== null) params = params.set('idExistencia', String(filtros.idExistencia));
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.tipoOrigen) params = params.set('tipoOrigen', filtros.tipoOrigen);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    return this.http.get<PageResponse<MovimientoInventarioResponse>>(`${this.apiUrl}/paginados`, { params });
  }
}
