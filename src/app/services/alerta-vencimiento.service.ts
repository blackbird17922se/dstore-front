import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PageResponse } from '../models/common/page-response.model';
import { AlertaVencimientoResponse, ResumenVencimientos } from '../models/vencimiento-alerta.model';
import { VencimientoBusquedaParams } from '../models/vencimiento-busqueda-params.model';

/**
 * Consultas de solo lectura para el panel de alertas.
 * Servicio independiente: NO cambia ExistenciaProductoService ni sus consumidores.
 */
@Injectable({ providedIn: 'root' })
export class AlertaVencimientoService {
  private readonly apiUrl = `${environment.apiUrl}/existencias/proximas-vencer`;

  constructor(private http: HttpClient) {}

  /** El filtrado y la paginación ocurren en el backend, no en el navegador. */
  listarPaginados(filtros: VencimientoBusquedaParams): Observable<PageResponse<AlertaVencimientoResponse>> {
    let params = new HttpParams()
      .set('dias', String(filtros.dias))
      .set('page', String(filtros.page))
      .set('size', String(filtros.size))
      .set('ordenarPor', filtros.ordenarPor)
      .set('direccion', filtros.direccion);

    if (filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());
    if (filtros.idProducto != null) params = params.set('idProducto', String(filtros.idProducto));
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.vencimientoDesde) params = params.set('vencimientoDesde', filtros.vencimientoDesde);
    if (filtros.vencimientoHasta) params = params.set('vencimientoHasta', filtros.vencimientoHasta);

    return this.http.get<PageResponse<AlertaVencimientoResponse>>(`${this.apiUrl}/paginados`, { params });
  }

  /** Resumen global por estado; respeta producto/búsqueda, no el horizonte 'dias'. */
  obtenerResumen(texto: string, idProducto: number | null): Observable<ResumenVencimientos> {
    let params = new HttpParams();
    if (texto.trim()) params = params.set('texto', texto.trim());
    if (idProducto != null) params = params.set('idProducto', String(idProducto));
    return this.http.get<ResumenVencimientos>(`${this.apiUrl}/resumen`, { params });
  }
}
