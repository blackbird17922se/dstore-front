import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/common/page-response.model';
import { crearPaginacionHttpParams } from '../shared/utils/paginacion-http-params';
import { ExistenciaProductoResponse } from '../models/existencia-producto-response.model';
import { AjusteBusquedaParams } from '../models/inventario/ajuste-inventario-busqueda-params.model';
import { AjusteInventarioRequest, AjusteInventarioResponse } from '../models/inventario/ajuste-inventario.model';

@Injectable({ providedIn: 'root' })
export class AjusteInventarioService {
  private readonly apiUrl = `${environment.apiUrl}/ajustes-inventario`;
  private readonly existenciasUrl = `${environment.apiUrl}/existencias`;
  constructor(private readonly http: HttpClient) {}

  // Se conserva el listado original por compatibilidad con otros posibles consumidores.
  listar(): Observable<AjusteInventarioResponse[]> {
    return this.http.get<AjusteInventarioResponse[]>(this.apiUrl);
  }

  listarPorProducto(idProducto: number): Observable<AjusteInventarioResponse[]> {
    return this.http.get<AjusteInventarioResponse[]>(`${this.apiUrl}/producto/${idProducto}`);
  }

  listarPorExistencia(idExistencia: number): Observable<AjusteInventarioResponse[]> {
    return this.http.get<AjusteInventarioResponse[]>(`${this.apiUrl}/existencia/${idExistencia}`);
  }

  obtenerPorId(id: number): Observable<AjusteInventarioResponse> {
    return this.http.get<AjusteInventarioResponse>(`${this.apiUrl}/${id}`);
  }

  registrar(request: AjusteInventarioRequest): Observable<AjusteInventarioResponse> {
    return this.http.post<AjusteInventarioResponse>(this.apiUrl, request);
  }

  // El historial se filtra y pagina en la base de datos.
  listarPaginados(filtros: AjusteBusquedaParams): Observable<PageResponse<AjusteInventarioResponse>> {
    let params: HttpParams = crearPaginacionHttpParams(filtros);
    if (filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.idProducto !== null) params = params.set('idProducto', filtros.idProducto);
    if (filtros.idExistencia !== null) params = params.set('idExistencia', filtros.idExistencia);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    return this.http.get<PageResponse<AjusteInventarioResponse>>(`${this.apiUrl}/paginados`, { params });
  }

  // Busca lotes específicos. Nunca ajustamos el stock agregado de un producto.
  buscarExistencias(texto: string, soloConStock: boolean): Observable<PageResponse<ExistenciaProductoResponse>> {
    let params = new HttpParams()
      .set('page', '0').set('size', '20').set('ordenarPor', 'producto.nombre').set('direccion', 'asc');
    if (texto.trim()) params = params.set('texto', texto.trim());
    if (soloConStock) params = params.set('conStock', 'true');
    return this.http.get<PageResponse<ExistenciaProductoResponse>>(`${this.existenciasUrl}/paginados`, { params });
  }

  consultarExistencia(id: number): Observable<ExistenciaProductoResponse> {
    return this.http.get<ExistenciaProductoResponse>(`${this.existenciasUrl}/${id}`);
  }
}
