import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EntradaInventarioRequest } from '../models/inventario/entrada-inventario-request.model';
import { EntradaInventarioResponse } from '../models/inventario/entrada-inventario-response.model';
import { EntradaInventarioListado } from '../models/inventario/entrada-inventario-listado.model';
import { EntradaInventarioBusquedaParams } from '../models/inventario/entrada-inventario-busqueda-params.model';
import { PageResponse } from '../models/common/page-response.model';
import { crearPaginacionHttpParams } from '../shared/utils/paginacion-http-params';

@Injectable({ providedIn: 'root' })
export class EntradaInventarioService {
  private apiUrl = `${environment.apiUrl}/entradas-inventario`;

  constructor(private http: HttpClient) {}

  /** Registra la entrada completa y devuelve los datos guardados (no el Request). */
  registrarEntrada(request: EntradaInventarioRequest): Observable<EntradaInventarioResponse> {
    return this.http.post<EntradaInventarioResponse>(this.apiUrl, request);
  }

  /** Compatibilidad: se conserva el endpoint original para otros posibles consumidores. */
  listar(): Observable<EntradaInventarioResponse[]> {
    return this.http.get<EntradaInventarioResponse[]>(this.apiUrl);
  }

  /** El detalle completo se solicita cuando el usuario abre una entrada. */
  obtenerPorId(id: number): Observable<EntradaInventarioResponse> {
    return this.http.get<EntradaInventarioResponse>(`${this.apiUrl}/${id}`);
  }

  /** Filtros del servidor antes de paginar: no se pagina en memoria. */
  listarPaginadas(filtros: EntradaInventarioBusquedaParams): Observable<PageResponse<EntradaInventarioListado>> {
    let params: HttpParams = crearPaginacionHttpParams(filtros);
    if (filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());
    if (filtros.numeroDocumento.trim()) params = params.set('numeroDocumento', filtros.numeroDocumento.trim());
    if (filtros.fechaEntradaDesde) params = params.set('fechaEntradaDesde', filtros.fechaEntradaDesde);
    if (filtros.fechaEntradaHasta) params = params.set('fechaEntradaHasta', filtros.fechaEntradaHasta);
    if (filtros.fechaRegistroDesde) params = params.set('fechaRegistroDesde', filtros.fechaRegistroDesde);
    if (filtros.fechaRegistroHasta) params = params.set('fechaRegistroHasta', filtros.fechaRegistroHasta);
    return this.http.get<PageResponse<EntradaInventarioListado>>(`${this.apiUrl}/paginados`, { params });
  }
}
